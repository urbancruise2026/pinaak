import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update path to point to src folder
const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json"); // Path updated

let messaging;
let isInitialized = false;

try {
  console.log("🔍 Looking for service account at:", serviceAccountPath);

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase initialized with service account file");
    console.log("📁 Project ID:", serviceAccount.project_id);
    isInitialized = true;
  } else {
    console.warn("⚠️ Service account file not found at:", serviceAccountPath);
  }

  if (isInitialized) {
    messaging = admin.messaging();
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
}

export { admin, messaging, isInitialized };
