import {
  createTripBookingModel,
  getAllTripBookings,
  markTripBookingAsRead,
  markWebsiteGacAsRead,
} from "./website.model.js";

export const createTripBooking = async (data) => {
  const id = await createTripBookingModel(data);

  return {
    id,
    ...data,
  };
};

// ================= GET ALL TRIP BOOKINGS =================

export const getTripBookings = async (city) => {
  return await getAllTripBookings(city);
};

export const markWebsiteGacRead = async (id) => {
  return await markWebsiteGacAsRead(id);
};

export const markTripBookingRead = async (id) => {
  return await markTripBookingAsRead(id);
};
