// routes/websiteGac.routes.js

import express from "express";
import { getCaptchaController } from "./captcha.controller.js"; // 🆕

import {
  createTripBookingController,
  createWebsiteGacController,
  getTripBookingsController,
  getWebsiteGacController,
  markTripBookingReadController,
  markWebsiteGacReadController,
} from "./website.controller.js";

const router = express.Router();

router.get("/captcha", getCaptchaController); // 🆕 naya endpoint

router.post("/gac", createWebsiteGacController);
router.get("/gac", getWebsiteGacController);

router.post("/trip-bookings", createTripBookingController);
router.get("/trip-bookings", getTripBookingsController);
router.patch("/gac/:id/read", markWebsiteGacReadController);

router.patch("/trip-bookings/:id/read", markTripBookingReadController);

export default router;
