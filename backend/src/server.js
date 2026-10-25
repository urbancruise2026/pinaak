import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";

import { app } from "./app.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { connectHRMSMySQL, connectMySQL } from "./config/mySqlDB.js";
import { admin } from "./config/firebase.js";
import { initSocket } from "./socket/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// `npm run build` in frontend writes the static site here
const frontendOutDir = path.resolve(__dirname, "../../frontend/out");

const PORT = process.env.PORT || 4000;

const start = async () => {
  connectMySQL();
  connectHRMSMySQL();

  if (admin.apps.length) {
    console.log("✅ Firebase connected successfully");
  } else {
    console.log("⚠️ Firebase not connected");
  }

  // Serve the static frontend. API routes are registered in app.js before this, so /api wins.
  const hasFrontend = fs.existsSync(path.join(frontendOutDir, "index.html"));

  if (hasFrontend) {
    app.use(
      express.static(frontendOutDir, {
        setHeaders(res, filePath) {
          // Hashed build files never change, so browsers can cache them for a year
          if (
            filePath.includes(`${path.sep}_next${path.sep}static${path.sep}`)
          ) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=31536000, immutable",
            );
          }
        },
      }),
    );

    // Any other page URL -> Next's generated 404 page
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      if (req.path.startsWith("/api/") || req.path.startsWith("/socket.io/")) {
        return next();
      }
      const notFoundPage = path.join(frontendOutDir, "404.html");
      if (fs.existsSync(notFoundPage)) {
        return res.status(404).sendFile(notFoundPage);
      }
      return next();
    });

    console.log("✅ Serving static frontend from frontend/out");
  } else {
    console.log(
      "ℹ️  frontend/out not found - run `npm run build`. Serving API only.",
    );
  }

  app.use(errorMiddleware);

  // One HTTP server so Socket.IO shares the same port
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/v1/`);
    if (hasFrontend) {
      console.log(`   Frontend: http://localhost:${PORT}/`);
    }
  });
};

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
