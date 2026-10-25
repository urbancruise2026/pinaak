// controllers/websiteGac.controller.js

import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { verifyMathCaptcha } from "../../utils/mathCaptcha.js"; // 🆕
import { createWebsiteGac, getAllWebsiteGac } from "./website.model.js";
import {
  createTripBooking,
  getTripBookings,
  markTripBookingRead,
  markWebsiteGacRead,
} from "./website.service.js";

// ================= CREATE WEBSITE GAC =================
export const createWebsiteGacController = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    country_code = "+91",
    city,
    captcha_id, // 🆕
    captcha_answer, // 🆕
  } = req.body;

  if (!name || !phone || !city) {
    throw new ApiError(400, "Name, Phone and City are required");
  }

  // 🆕 CAPTCHA verification
  const isValid = verifyMathCaptcha(captcha_id, captcha_answer);
  if (!isValid) {
    throw new ApiError(
      400,
      "Captcha is incorrect or expired. Please try again.",
    );
  }

  const data = await createWebsiteGac({
    name,
    phone,
    country_code,
    city,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, data, "Website GAC submitted successfully"));
});

export const getWebsiteGacController = asyncHandler(async (req, res) => {
  const { city } = req.query;

  const data = await getAllWebsiteGac(city);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Website GAC fetched successfully"));
});

// ================= CREATE TRIP BOOKING =================

export const createTripBookingController = asyncHandler(async (req, res) => {
  const {
    pickup_address,
    pickup_date,
    drop_address,
    drop_date,
    travel_itinerary,
    passengers,
    baggages,
    vehicle_category,
    vehicle_model,
    full_name,
    phone,
    email,
    country_code,
    trip_message,
    city,
    captcha_id, // 🆕
    captcha_answer, // 🆕
  } = req.body;

  if (
    !pickup_address ||
    !pickup_date ||
    !drop_address ||
    !drop_date ||
    !travel_itinerary ||
    !passengers ||
    !baggages ||
    !vehicle_category ||
    !vehicle_model ||
    !full_name ||
    !phone ||
    !city
  ) {
    throw new ApiError(400, "Please fill all required fields");
  }

  // 🆕 CAPTCHA verification
  const isValid = verifyMathCaptcha(captcha_id, captcha_answer);
  if (!isValid) {
    throw new ApiError(
      400,
      "Captcha is incorrect or expired. Please try again.",
    );
  }

  const booking = await createTripBooking(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Trip booking created successfully"));
});

// ================= GET ALL TRIP BOOKINGS =================

export const getTripBookingsController = asyncHandler(async (req, res) => {
  const { city } = req.query;

  const bookings = await getTripBookings(city);

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Trip bookings fetched successfully"));
});

export const markWebsiteGacReadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await markWebsiteGacRead(id);

  return res.status(200).json(new ApiResponse(200, {}, "Lead marked as read"));
});

export const markTripBookingReadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await markTripBookingRead(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Trip booking marked as read"));
});
