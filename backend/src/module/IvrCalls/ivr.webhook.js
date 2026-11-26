import crypto from "node:crypto";
import { Router } from "express";
import { pool } from "../../config/mySqlDB.js";
import { formatIST, normalizePhone, nowIST } from "./ivr.utils.js";
import {
  findContactByPhone,
  getAgentByPhone,
  getLoginStaffIds,
  insertCallFromWebhook,
  setAgentPhone,
  setCallVia,
} from "./ivr.model.js";

// MyOperator calls these URLs from their servers, so they sit OUTSIDE the
// login check. Protection: a secret `key` in the URL (IVR_WEBHOOK_KEY in .env).
//   In-Call webhook : https://<your-domain>/api/v1/ivr/webhook/in-call?key=<secret>
//   Webhooks v2     : https://<your-domain>/api/v1/ivr/webhook/events?key=<secret>
//
// Step 1 (this file): store every payload exactly as received so the real
// field layout can be checked. Step 2 uses it for the ring pop-up.

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/* ---------------- ring pop-up (Socket.IO) ----------------
   call.dial_begin  (incoming, agent leg "dialing")  -> "ivr:incoming" to that agent's logins
   call.answered    (agent leg "answered")           -> "ivr:answered" to everyone who was rung
   call.end                                          -> "ivr:ended"
   call.summary                                      -> learns agent phone + department names
   Rooms follow the existing pattern: user_<staffId>.                              */

let getIO = null;
// routes/index.js: setIvrSocketGetter(getIO)  (getIO from your socket file)
export const setIvrSocketGetter = (fn) => {
  getIO = fn;
};

const sessions = new Map(); // call id -> { rooms:Set, contact, startedAt }
const deptNames = new Map(); // department id -> name (learned from call.summary)
const warned = new Set();

const emitTo = (rooms, event, data) => {
  try {
    const io = getIO?.();
    if (!io) return;
    for (const r of rooms) io.to(r).emit(event, data);
  } catch (e) {
    console.error("IVR socket emit failed:", e.message);
  }
};

const cleanSessions = () => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, v] of sessions) if (v.startedAt < cutoff) sessions.delete(id);
};

// call.end -> a row in ivr_call_logs straight away (the API sync stays as the
// authoritative copy and corrects it within minutes).
const logCallEnd = async (body) => {
  const p = body.payload ?? {};
  const uid = p.id || body.session_id;
  const started = p.started_at ? new Date(p.started_at) : null;
  const phone = normalizePhone(p.customer_number || body.customer_identifier);
  if (!uid || !phone || !started || Number.isNaN(started.getTime())) return;

  const direction = String(p.direction || body.direction || "").toLowerCase();
  const status = String(p.status ?? "").toLowerCase();
  const response = status === "bridged" ? "connected" : status === "missed" ? "missed" : status || "unknown";

  const receivedAgents = [];
  const missedAgents = [];
  for (const leg of agentLegs(body)) {
    const agent = await getAgentByPhone(leg.phone_number);
    if (!agent) continue;
    const picked = direction === "incoming" ? leg.result === "answered" : response === "connected";
    (picked ? receivedAgents : missedAgents).push(agent.ivrName);
  }

  await insertCallFromWebhook({
    uid: String(uid),
    phone,
    callTime: formatIST(started),
    via: null, // department name arrives with call.summary
    direction,
    response,
    durationSec: Number(p.duration ?? 0),
    recordingFile: p.recording_filename || null,
    rawJson: JSON.stringify(body),
    receivedAgents: [...new Set(receivedAgents)],
    missedAgents: [...new Set(missedAgents)],
  });
};

const agentLegs = (body) => (body?.payload?.legs ?? []).filter((l) => l?.type === "agent");

export const handleCallEvent = async (body) => {
  const type = body?.event_type;
  const callId = body?.session_id;
  if (!type || !callId) return;

  if (type === "call.end") {
    try {
      await logCallEnd(body);
    } catch (e) {
      console.error("IVR instant log failed:", e.message); // never blocks the pop-up
    }
  }

  if (type === "call.summary") {
    const dept = (body.payload?.legs ?? []).map((l) => l?.department?.name).find(Boolean);
    if (dept && body.payload?.id) await setCallVia(String(body.payload.id), dept);
    for (const leg of body.payload?.legs ?? []) {
      if (leg?.agent?.contact) await setAgentPhone({ uuid: leg.agent.uuid, name: leg.agent.name, phone: leg.agent.contact });
      if (leg?.department?.id) deptNames.set(leg.department.id, leg.department.name);
    }
    return;
  }

  if (body.direction !== "incoming") return; // pop-ups are for customer calls only
  cleanSessions();

  if (type === "call.dial_begin") {
    let session = sessions.get(callId);
    if (!session) {
      session = { rooms: new Set(), contact: await findContactByPhone(body.customer_identifier), startedAt: Date.now() };
      sessions.set(callId, session);
    }
    for (const leg of agentLegs(body)) {
      if (leg.result !== "dialing") continue;
      const agent = await getAgentByPhone(leg.phone_number);
      if (!agent) {
        if (!warned.has(leg.phone_number)) {
          warned.add(leg.phone_number);
          console.warn(`IVR pop-up: no agent has phone ${leg.phone_number} (run POST /ivr/debug/learn-agent-phones)`);
        }
        continue;
      }
      const rooms = [...new Set((await getLoginStaffIds(agent.id)).map((id) => `user_${id}`))];
      rooms.forEach((r) => session.rooms.add(r));
      emitTo(rooms, "ivr:incoming", {
        callId,
        phone: String(body.customer_identifier ?? ""),
        contact: session.contact,
        department: deptNames.get(leg.dept_id) ?? null,
        agentId: agent.id,
        agentName: agent.ivrName,
        startedAt: leg.started_at ?? body.timestamp,
      });
    }
    return;
  }

  const session = sessions.get(callId);
  if (!session) return;

  if (type === "call.answered") {
    const leg = agentLegs(body).find((l) => l.result === "answered");
    const agent = leg ? await getAgentByPhone(leg.phone_number) : null;
    emitTo(session.rooms, "ivr:answered", {
      callId,
      agentId: agent?.id ?? null,
      agentName: agent?.ivrName ?? null,
      answeredAt: leg?.answered_at ?? body.timestamp,
    });
    return;
  }

  if (type === "call.end") {
    emitTo(session.rooms, "ivr:ended", {
      callId,
      status: body.payload?.status ?? null, // bridged | missed | ...
      duration: Number(body.payload?.duration ?? 0),
    });
    sessions.delete(callId);
  }
};

const receive = (kind) => async (req, res) => {
  const secret = process.env.IVR_WEBHOOK_KEY;
  if (!secret) return res.status(503).json({ message: "Webhook not configured" });
  if (!safeEqual(req.query.key, secret)) return res.status(401).json({ message: "Unauthorized" });

  // answer MyOperator first (needs a 2xx within 5 seconds), save afterwards
  res.status(200).json({ ok: true });

  try {
    await pool.query(
      `INSERT INTO ivr_webhook_events (received_at, kind, body_json, source_ip) VALUES (?, ?, ?, ?)`,
      [nowIST(), kind, JSON.stringify(req.body ?? {}).slice(0, 60000), req.ip ?? null],
    );
  } catch (e) {
    console.error("IVR webhook save failed:", e.message);
  }

  handleCallEvent(req.body).catch((e) => console.error("IVR webhook handling failed:", e.message));
};

export const listWebhookEvents = async (limit = 20) => {
  const [rows] = await pool.query(
    `SELECT id, received_at AS receivedAt, kind, body_json AS body FROM ivr_webhook_events ORDER BY id DESC LIMIT ?`,
    [Math.min(Number(limit) || 20, 100)],
  );
  return rows.map((r) => {
    let body = r.body;
    try {
      body = typeof body === "string" ? JSON.parse(body) : body;
    } catch {
      /* keep raw */
    }
    return { ...r, body };
  });
};

export const receiveInCall = receive("in-call");
export const receiveEvent = receive("event");

const router = Router();
router.post("/in-call", receiveInCall);
router.post("/events", receiveEvent);
export default router;
