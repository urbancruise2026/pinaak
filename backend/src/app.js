import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import allRoutes from "./routes/index.js";
import healthRouter from "./module/Health/health.route.js";

dotenv.config();
const app = express();
// Behind nginx: lets Express see the real client IP and https
app.set("trust proxy", 1);

// Health first: no CORS/helmet/body-parsing/auth overhead for probes
app.use(["/health", "/api/v1/health"], healthRouter);

app.use(helmet({ contentSecurityPolicy: false }));

// Pages embedded via <iframe> on urbancruise.in need frame-ancestors test
// of helmet's default X-Frame-Options: SAMEORIGIN, and need
// Cross-Origin-Resource-Policy relaxed too — CORP: same-origin (helmet's
// default) blocks cross-origin embedding independently of X-Frame-Options/CSP.
const EMBEDDABLE_ROUTES = ["/gac-form", "/rate-quotation-form"];
app.use((req, res, next) => {
  const pathname = req.path.replace(/\/+$/, "") || "/";
  if (EMBEDDABLE_ROUTES.includes(pathname)) {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://urbancruise.in https://www.urbancruise.in;",
    );
  } else if (req.path.startsWith("/_next/")) {
    // Next.js build assets (images, JS, CSS) — safe to load cross-origin,
    // needed so <img> tags on urbancruise.in can reference these directly.
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
});

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      // Don't throw (that becomes a 500); just omit CORS headers.
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static("public"));

app.use(cookieParser());

// ✅ NO-CACHE MIDDLEWARE — routes se pehle add karo
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  next();
});

allRoutes(app);

export { app };
