"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { createUserThunk } from "../../user/userSlice";
import { toast } from "react-toastify";

type UserRole =
  | "user"
  | "admin"
  | "presale"
  | "bdm"
  | "sales"
  | "city manager"
  | "team leader";

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  city: string;
  role: UserRole;
};

export function Admin() {
  const [serverError, setServerError] = useState<string>("");
  const [serverSuccess, setServerSuccess] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormValues>({
    defaultValues: {
      city: "",
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      const result = await dispatch(createUserThunk(values)).unwrap();

      toast.success("✅ User created successfully!");

      reset();
    } catch (error: any) {
      toast.error(error || "❌ Failed to create user");
    }
  };

  const availableRoles: UserRole[] = [
    "user",
    "admin",
    "presale",
    "bdm",
    "sales",
    "city manager",
    "team leader",
  ];

  // ✅ Display names for UI (for better readability)
  const roleDisplayNames: Record<UserRole, string> = {
    user: "User",
    admin: "Admin",
    presale: "Presales",
    bdm: "BDM",
    sales: "Sales",
    "city manager": "City Manager",
    "team leader": "Team Leader",
  };

  return (
    <div className="p-6 w-[60%] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage users and system settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Create New User
        </h2>

        {serverError && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 mb-4">
            {serverError}
          </div>
        )}

        {serverSuccess && (
          <div className="rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-200 mb-4">
            {serverSuccess}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-semibold text-gray-900"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter full name"
                className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.name ? "border-red-400 focus:ring-red-400" : ""
                }`}
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-900"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@company.com"
                className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.email ? "border-red-400 focus:ring-red-400" : ""
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-900"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.password ? "border-red-400 focus:ring-red-400" : ""
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="city"
                className="text-sm font-semibold text-gray-900"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="Enter city name"
                className={`w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black placeholder:text-gray-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.city ? "border-red-400 focus:ring-red-400" : ""
                }`}
                {...register("city", {
                  required: "City is required",
                  minLength: {
                    value: 2,
                    message: "City must be at least 2 characters",
                  },
                })}
              />
              {errors.city && (
                <p className="text-xs font-medium text-red-600">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-semibold text-gray-900"
              >
                Role
              </label>
              <select
                id="role"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                {...register("role", {
                  required: "Role is required",
                })}
              >
                {availableRoles.map((roleValue) => (
                  <option key={roleValue} value={roleValue}>
                    {roleDisplayNames[roleValue]}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-xs font-medium text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating User…" : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}