import { ApiError } from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (!(err instanceof ApiError)) {
    console.error("🔥 Unhandled error:", err);
    statusCode = 500;
    message = "Something went wrong";
  }

  const response = {
    success: false,
    statusCode,
    message,
    errors: err.error || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  res.status(statusCode).json(response);
};

export { errorMiddleware };
