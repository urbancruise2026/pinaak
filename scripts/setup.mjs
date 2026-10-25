#!/usr/bin/env node
/**
 * Auto-creates .env.local files from .env.example on first install.
 * Runs as part of `npm install` via the root postinstall hook.
 * Existing .env.local files are never overwritten.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const targets = [
  {
    example: path.join(repoRoot, "backend", ".env.example"),
    local: path.join(repoRoot, "backend", ".env.local"),
    label: "backend/.env.local",
  },
  {
    example: path.join(repoRoot, "frontend", ".env.example"),
    local: path.join(repoRoot, "frontend", ".env.local"),
    label: "frontend/.env.local",
  },
];

let created = 0;
let skipped = 0;

for (const { example, local, label } of targets) {
  if (fs.existsSync(local)) {
    skipped += 1;
    continue;
  }
  if (!fs.existsSync(example)) {
    console.warn(`⚠️  ${label}: skipped — ${example} not found`);
    continue;
  }
  fs.copyFileSync(example, local);
  console.log(`✅ Created ${label} from .env.example`);
  created += 1;
}

if (created === 0 && skipped === targets.length) {
  console.log("✓ .env.local files already exist — nothing to do");
} else if (created > 0) {
  console.log(
    `\n📝 ${created} env file(s) created. Edit them if you need non-default values, then run: npm run dev`,
  );
}
