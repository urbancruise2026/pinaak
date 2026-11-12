import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import * as c from "./ivr.controller.js";

const router = Router();

// Normalise role text: "Pre-Sales Executive" / "PRESALE" -> "presalesexecutive" / "presale"
const roleKey = (u) =>
  String(u?.role_name ?? u?.role ?? u?.access_role ?? "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isSuperAdmin = (u) => roleKey(u) === "superadmin";
const isAdmin = (u) => roleKey(u) === "admin";
const isPresales = (u) => roleKey(u).includes("presale");
// Matches "Team Leader" and "Team Leader-Sales". Narrow this if only the
// presales team leader should have access.
const isTeamLeader = (u) => roleKey(u).includes("teamleader");

// Presales (sees everything), Admin, Team Leader and Super Admin.
const requirePresales = (req, res, next) => {
  const u = req.user;
  const allowed = isPresales(u) || isAdmin(u) || isTeamLeader(u) || isSuperAdmin(u);
  if (u?.loginType !== "employee" || !allowed) {
    return res.status(403).json({ message: "You do not have access to IVR reports" });
  }
  next();
};

const requireSuperAdmin = (req, res, next) => {
  if (!isSuperAdmin(req.user)) return res.status(403).json({ message: "Super admin only" });
  next();
};

router.use(verifyJWT, requirePresales);

// Reports
router.get("/calls", c.getCalls);
router.get("/summary", c.getSummary);

// Missed calls + manual follow-up (green / red / orange)
router.get("/missed", c.getMissedCalls);
router.patch("/missed/:uid/status", c.updateMissedStatus);
router.post("/missed/:uid/attempt", c.addMissedAttempt);
router.get("/missed/:uid/attempts", c.getMissedAttempts);

// Breaks
router.get("/breaks/me", c.getMyBreak);
router.post("/breaks/start", c.startMyBreak);
router.post("/breaks/end", c.endMyBreak);
router.get("/breaks", c.getBreakReport);

// MyOperator agent <-> staff mapping
router.get("/agents", c.getAgents);
router.put("/agents/:id", c.updateAgent);

// Sync
router.post("/sync", c.syncNow);
router.get("/debug/sample", requireSuperAdmin, c.debugSample);

export default router;
