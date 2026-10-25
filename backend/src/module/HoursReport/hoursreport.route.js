import express from "express";
import { monthlyEnquiryReport } from "./hoursreport.controller.js";

const router = express.Router();

router.get("/", monthlyEnquiryReport);

export default router;