import { Router } from "express";
import {
  getTravelAdvisorsByCityId,
  assignTravelAdvisor,
  getMyAssignedLeads,
  LeadStatusCountByPresalesId,
  swapTravelAdvisor,
  getcityByZoneId,
  getMySwapLeads,
  getHighPaxAssignedLeads,
  getLongDurationAssignedLeads,
} from "../Assign/assign.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/travel-advisors/:cityId").get(getTravelAdvisorsByCityId);
router.route("/assign-travel-advisor/:leadId").patch(assignTravelAdvisor);
router.route("/myleads").get(verifyJWT, getMyAssignedLeads);
router.route("/swap-leads").get(verifyJWT, getMySwapLeads);
router.get("/cities-by-zone", verifyJWT, getcityByZoneId);
router.route("/maxpax").get(verifyJWT, getHighPaxAssignedLeads);
router.get("/long-duration", verifyJWT, getLongDurationAssignedLeads);
router.get(
  "/leads/status-count-by-presales",
  verifyJWT,
  LeadStatusCountByPresalesId,
);
router
  .route("/swap-travel-advisor/:leadId")
  .patch(verifyJWT, swapTravelAdvisor);

export default router;
