import { Router } from "express";
import {
  createLeads,
  listLeads,
  updateLeadByIdController,
  updateLeadUnwantedStatusController,
  getAllUnwantedLeadsController,
  checkCustomerPhoneController,
  getAdvisorFollowupDetailsController,
  getAdvisorFollowupStatsController,
  getLeadRfqTimeController,
} from "./lead.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

router.route("/").post(verifyJWT, createLeads);
router.route("/").get(verifyJWT, listLeads);
router.route("/unwanted/:id").patch(updateLeadUnwantedStatusController);
router.route("/unwanted/all").get(getAllUnwantedLeadsController);
router.route("/updatelead/:leadId").put(updateLeadByIdController);
router.post("/check-phone", checkCustomerPhoneController);
router.get(
  "/followups/advisor-stats",
  verifyJWT,
  getAdvisorFollowupStatsController,
);
router.get(
  "/followups/advisor-stats/:advisorId/details",
  verifyJWT,
  getAdvisorFollowupDetailsController,
);
router.get("/leads/:leadId/rfq-time", getLeadRfqTimeController);
export default router;
