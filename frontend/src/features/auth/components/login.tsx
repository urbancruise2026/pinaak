"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginUserThunk } from "../../user/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import Image from "next/image";
import pinaakLogo from "@/assets/images/Pinaak final.png";
import urbanlogo from "@/assets/images/urbanlogo.png";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type LoginFormValues = {
  username: string;
  password: string;
  loginType: "employee" | "vendor" | "driver" | "customer";
};

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export function Login() {
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); 
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      loginType: "employee",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");
    try {
      const result = await dispatch(loginUserThunk(values)).unwrap();
      if (result) router.push("/dashboard");
    } catch (err: any) {
      setServerError(err || "Network Error");
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="relative w-full min-h-[75vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl flex">
          {/* LEFT SECTION */}
          <section className="w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 text-white flex flex-col justify-between relative overflow-hidden p-12 rounded-l-3xl">
            <div className="absolute inset-0 opacity-10">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern
                    id="grid"
                    patternUnits="userSpaceOnUse"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
            </div>

            <div className="relative z-10 flex flex-col h-full gap-8">
              <div className="flex-1 flex items-center justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div
                    className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-white transform group-hover:scale-105 transition-all duration-500 animate-float"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={pinaakLogo}
                      alt="Pinaak Logo"
                      priority
                      className="w-full h-full object-contain p-6 drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Sparkles size={16} />
                    <p className="text-white text-md font-medium">
                      Sales and Operational System
                    </p>
                  </div>
                  <div className="inline-flex bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <p className="text-sm text-white font-light tracking-wide">
                      Urban Cruise
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Leads",
                    "Booking",
                    "Trip",
                    "Feedback",
                    "Vendors",
                    "Drivers",
                  ].map((tag, index) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-center pt-8">
                  <p className="text-sm text-white font-light tracking-wide">
                    © 2026 PINAAK. All rights reserved.
                  </p>
                  <p className="text-sm text-white mt-1">
                    Powered by{" "}
                    <span className="font-bold text-md">Urban Cruise</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SECTION */}
          <section className="w-1/2 flex items-center justify-center bg-white rounded-r-3xl relative overflow-visible">
            <div className="w-full max-w-md space-y-3 pt-48">
              <div className="flex justify-center items-center">
                <div className="absolute top-16 left-2/4 -translate-x-2/4 -translate-y-2/4 w-full max-w-md">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0px_0px_25px_10px_rgba(0,0,0,0.1)] p-5">
                    <Image
                      src={urbanlogo}
                      alt="Urban Cruise"
                      className=" h-56 w-full object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Welcome to Pinaak
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base flex items-center gap-2">
                  <span>Sign in to your workspace</span>
                  <ArrowRight
                    size={16}
                    className="text-green-600 animate-bounce-x"
                  />
                </p>
              </div>

              {serverError && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur-xl transition-all group-hover:blur-2xl" />
                  <div className="relative flex items-center gap-3 rounded-xl px-4 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-red-200 dark:border-red-900/50 shadow-lg">
                    <AlertCircle
                      size={18}
                      className="text-red-500 flex-shrink-0"
                    />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {serverError}
                    </p>
                  </div>
                </div>
              )}

              <form
                method="post"
                action="javascript:void(0);"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* LOGIN TYPE */}
                <div className="space-y-1">
                  <label className="text-md font-semibold text-black ml-1">
                    Login As
                  </label>

                  <select
                    {...register("loginType", {
                      required: "Please select login type",
                    })}
                    disabled={isSubmitting}
                    className="w-full pl-11 pr-4 h-12 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="employee">Employee</option>
                    <option value="vendor">Vendor</option>
                    <option value="driver">Driver</option>
                    <option value="customer">Customer</option>
                  </select>

                  {errors.loginType && (
                    <p className="text-xs text-red-500 mt-1 ml-1">
                      {errors.loginType.message}
                    </p>
                  )}
                </div>
                {/* USERNAME FIELD */}
                <div className="space-y-1">
                  <label className="text-md font-semibold text-black ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-xl blur-xl transition-all duration-500",
                        focusedField === "username"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50",
                      )}
                    />
                    <div className="relative flex items-center">
                      <User
                        size={18}
                        className={cn(
                          "absolute left-4 transition-all duration-300",
                          focusedField === "username"
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      />
                      <input
                        type="text"
                        {...register("username", {
                          required: "Username is required",
                        })}
                        onFocus={() => setFocusedField("username")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your username"
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 h-12 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* PASSWORD FIELD */}
                <div className="space-y-1">
                  <label className="text-md font-semibold text-black ml-1">
                    Password
                  </label>
                  <div className="relative group" suppressHydrationWarning>
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-500/20 rounded-xl blur-xl transition-all duration-500",
                        focusedField === "password"
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50",
                      )}
                    />
                    <div className="relative flex items-center">
                      <Lock
                        size={18}
                        className={cn(
                          "absolute left-4 transition-all duration-300",
                          focusedField === "password"
                            ? "text-green-600"
                            : "text-gray-400",
                        )}
                      />
                      <input
                        type={showPw ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                        })}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="w-full pl-11 pr-4 h-12 rounded-xl border bg-white text-gray-900  placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        disabled={isSubmitting}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1 ml-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <p className="text-sm text-green-600 font-medium">
                    Please contact HR to reset your password.
                  </p>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative w-full group"
                >
                  <div className="relative h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold text-sm overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-2 h-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-bounce-x { animation: bounce-x 1.5s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </main>
  );
}
