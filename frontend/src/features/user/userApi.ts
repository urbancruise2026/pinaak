import axiosInstance from "@/lib/axioInstance";
import type { User } from "@/types/types";

interface LoginData {
  username: string;
  password: string;
}

// ✅ LOGIN USER
export const loginUser = async (data: LoginData): Promise<User> => {
  try {
    const response = await axiosInstance.post<User>("/user/login", data);

    return response.data.data;
  } catch (error: any) {
    console.error(
      "Login Error:",
      error.response?.data || error.message || error,
    );
    throw new Error(
      error.response?.data?.message || error.message || "Login failed",
    );
  }
};

// ✅ CURRENT USER
export const currentUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<User>("/user/current-user");
    console.log("Current User Response:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 401) {
      const detail =
        error?.response?.data?.message ??
        error?.message ??
        JSON.stringify(error);
      console.warn("Current user check failed:", detail);
    }
    throw new Error(
      error?.response?.data?.message ?? error?.message ?? "Unauthorized",
    );
  }
};

// ✅ CREATE USER
export const createUser = async (formData: Partial<User>): Promise<User> => {
  try {
    const response = await axiosInstance.post<User>("/user", formData);

    return response.data;
  } catch (error: any) {
    console.error("Create User Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "User creation failed");
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await axiosInstance.post(`/user/logout`);
  } catch (error: any) {
    console.error("Logout Error:", error.response?.data || error.message);
  }
};
