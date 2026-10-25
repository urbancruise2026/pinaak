import axiosInstance from "@/lib/axioInstance";

export interface WebsiteGacRecord {
  id: number;
  name: string;
  country_code: string;
  phone: string;
  city: string;
  created_at: string;
  is_read: number;
}

export interface TripBookingRecord {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  customerPhone: string;
  country_code: string;
  customerEmail: string;
  message: string;
  pickupAddress: string;
  pickup_date: string;
  dropAddress: string;
  drop_date: string;
  itinerary: string;
  passengerTotal: number;
  baggageTotal: number;
  vehicle_model: string;
  city: string;
  vehicle_category: string;
  created_at: string;
  is_read: number; // 🆕 mark-read feature ke liye add kiya
}

export interface CreateTripBookingPayload {
  pickup_address: string;
  pickup_date: string;
  drop_address: string;
  drop_date: string;
  travel_itinerary: string;
  passengers: string;
  baggages: string;
  vehicle_category: string;
  vehicle_model: string;
  full_name: string;
  country_code: string;
  phone: string;
  email?: string;
  trip_message?: string;
}

export interface CreateWebsiteGacPayload {
  name: string;
  phone: string;
  country_code: string;
  city: string;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}
// ─── CREATE WEBSITE GAC ──────────────────────────────────────

export const createWebsiteGacApi = async (
  payload: CreateWebsiteGacPayload,
): Promise<WebsiteGacRecord> => {
  try {
    const response = await axiosInstance.post<ApiResponse<WebsiteGacRecord>>(
      "/website-gac/gac",
      payload,
    );

    console.log("✅ Create Website GAC:", response.data);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "❌ Create Website GAC Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create Website GAC",
    );
  }
};

// ─────────────────────────────────────────────
// GET ALL WEBSITE GAC
// ─────────────────────────────────────────────

export const getWebsiteGacApi = async (
  city?: string,
): Promise<{
  data: WebsiteGacRecord[];
  count: number;
}> => {
  try {
    const response = await axiosInstance.get<ApiResponse<WebsiteGacRecord[]>>(
      "/website-gac/gac",
      {
        params: city && city !== "all" ? { city } : {},
      },
    );

    return {
      data: response.data.data ?? [],
      count: response.data.count ?? response.data.data.length ?? 0,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch Website GAC",
    );
  }
};

export const createTripBookingApi = async (
  payload: CreateTripBookingPayload,
): Promise<TripBookingRecord> => {
  try {
    const response = await axiosInstance.post<ApiResponse<TripBookingRecord>>(
      "/website-gac/trip-bookings",
      payload,
    );

    console.log("✅ Create Trip Booking:", response.data);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "❌ Create Trip Booking Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create trip booking",
    );
  }
};

// ─────────────────────────────────────────────
// GET ALL TRIP BOOKINGS
// ─────────────────────────────────────────────

export const getTripBookingsApi = async (
  city?: string,
): Promise<{
  data: TripBookingRecord[];
  count: number;
}> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TripBookingRecord[]>>(
      "/website-gac/trip-bookings",
      {
        params: city && city !== "all" ? { city } : {},
      },
    );

    console.log("✅ Get Trip Bookings:", response.data);

    return {
      data: response.data.data ?? [],
      count: response.data.count ?? response.data.data?.length ?? 0,
    };
  } catch (error: any) {
    console.error(
      "❌ Get Trip Bookings Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch trip bookings",
    );
  }
};

// ─── GET TRIP BOOKING BY ID ─────────────────────────────

export const getTripBookingByIdApi = async (
  id: string | number,
): Promise<TripBookingRecord> => {
  try {
    const response = await axiosInstance.get<ApiResponse<TripBookingRecord>>(
      `/website-gac/trip-bookings/${id}`,
    );

    console.log("✅ Get Trip Booking By Id:", response.data);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "❌ Get Trip Booking By Id Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch trip booking",
    );
  }
};

// ─── MARK WEBSITE GAC AS READ ─────────────────────────────

export const markWebsiteGacReadApi = async (id: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/website-gac/gac/${id}/read`);
  } catch (error: any) {
    console.error(
      "❌ Mark Website GAC Read Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to mark lead as read",
    );
  }
};

// 🆕 ─── MARK TRIP BOOKING AS READ ─────────────────────────────

export const markTripBookingReadApi = async (id: number): Promise<void> => {
  try {
    await axiosInstance.patch(`/website-gac/trip-bookings/${id}/read`);
  } catch (error: any) {
    console.error(
      "❌ Mark Trip Booking Read Error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to mark trip booking as read",
    );
  }
};
