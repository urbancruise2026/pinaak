// RateQuotation.routes.js

import express from "express";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
  createQuotation,
  getAllChargeTemplates,
  getAllNoteTemplates,
  getRateQuotationByLeadIdController,
} from "./RateQuotation.controller.js";

const router = express.Router();

// router.use(verifyJWT);
router.post("/", createQuotation);
router.get("/notes", getAllNoteTemplates);

router.get("/charges", getAllChargeTemplates);
router.get("/:leadId", getRateQuotationByLeadIdController);

export default router;
