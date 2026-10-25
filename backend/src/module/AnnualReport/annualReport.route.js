// E:\Pinnak\PINAK_BACKEND\src\module\AnnualReport\annualReport.route.js
import express from "express";
import { getAnnualReport } from "./annualReport.controller.js";

const router = express.Router();

router.get("/annual-report", getAnnualReport);

export default router;