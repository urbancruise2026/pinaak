import crypto from "node:crypto";
import { Router } from "express";
import { pool } from "../../config/mySqlDB.js";
import { nowIST } from "./ivr.utils.js";

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
