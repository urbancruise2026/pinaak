import axios from "axios";

export const baseApi =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const axiosInstance = axios.create({
  baseURL: baseApi,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

export const baseApi1 =
  process.env.NEXT_PUBLIC_HRMS_API_URL || "https://saarthi.urbancruise.org/api/v1";

export const axiosInstance_hrms = axios.create({
  baseURL: baseApi1,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
