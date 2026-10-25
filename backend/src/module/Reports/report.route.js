import express from "express";
import {
  getAgingReportController,
  getLeadCountByAdviserForMonthController,
  getMonthlyDateWiseStatusReportController,
  getMonthlyStatusWiseReportController,
  getWebsiteToLeadAgingReportController,
  longWeekendReport,
  monthlyEnquiryReport,
  monthlyreporttwo,
  timeEnquiryReport,
} from "./report.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.get("/monthly-enquiry", monthlyEnquiryReport);

router.get(
  "/adviser-report",

  getLeadCountByAdviserForMonthController,
);
router.get(
  "/status-wise-report",

  getMonthlyStatusWiseReportController,
);

router.get(
  "/status-wise-date-report",

  getMonthlyDateWiseStatusReportController,
);

router.get("/time-enquiry", timeEnquiryReport);
router.get("/longweekend", longWeekendReport);
router.get("/monthlyreporttwo", monthlyreporttwo);

router.get("/aging-report", verifyJWT, getAgingReportController);

router.get(
  "/website-to-lead-aging-report",
  getWebsiteToLeadAgingReportController,
);
export default router;
