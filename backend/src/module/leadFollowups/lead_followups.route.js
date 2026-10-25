import { Router } from "express";
import {
  getAllLeadsController,
  getFollowupsByLeadIdController,
  getTodayFollowupCount,
} from "./lead_followups.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();
router.route("/").get(getAllLeadsController);
router.route("/today").get(verifyJWT, getTodayFollowupCount);
router.route("/:id").get(getFollowupsByLeadIdController);

export default router;
