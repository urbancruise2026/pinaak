import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { requireAccess, requireFull, requireManage, requireSuperAdmin } from "./ivr.access.js";
import * as c from "./ivr.controller.js";

const router = Router();

router.use(verifyJWT, requireAccess);

// Who am I (canManage etc.)
router.get("/access", c.getAccess);

// Reports
router.get("/calls", c.getCalls);
router.get("/summary", requireFull, c.getSummary);

// Missed calls (status is automatic; manual override kept)
router.get("/missed", c.getMissedCalls);
router.patch("/missed/:uid/status", c.updateMissedStatus);
router.post("/missed/:uid/attempt", c.addMissedAttempt);
router.get("/missed/:uid/attempts", c.getMissedAttempts);

// Breaks (per MyOperator agent)
router.get("/breaks/me", c.getMyBreak);
router.post("/breaks/start", c.startMyBreak);
router.post("/breaks/end", c.endMyBreak);
router.get("/breaks", requireFull, c.getBreakReport);

// Agents (read for everyone with access; changes for IVR admins only)
router.get("/agents", c.getAgents);
router.put("/agents/:id", requireManage, c.updateAgent);
router.post("/agents/sync-myoperator", requireManage, c.syncMyOperatorUsersCtl);
router.put("/agents/:id/receive-calls", requireManage, c.testReceiveCalls);

// Which Pinaak login controls which MyOperator agent
router.get("/access-map", requireManage, c.getAccessMap);
router.put("/agents/:id/logins", requireManage, c.putAgentLogins);
router.get("/staff-search", requireManage, c.searchStaff);

// Sync + debug
router.post("/sync", requireFull, c.syncNow);
router.get("/debug/sample", requireSuperAdmin, c.debugSample);
router.get("/debug/codes", requireSuperAdmin, c.debugCodes);
router.get("/debug/myoperator-users", requireSuperAdmin, c.debugMyOperatorUsers);

export default router;
