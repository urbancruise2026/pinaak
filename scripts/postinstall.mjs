#!/usr/bin/env node
/**
 * Post-install hook for the Pinaak monorepo.
 * Cross-platform (Windows/macOS/Linux). Runs automatically after `npm install`.
 *
 * Steps:
 *   1. Install backend dependencies
 *   2. Install frontend dependencies (including devDependencies)
 *   3. Create .env.local files from .env.example if missing
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

// Guard: skip this script when it is being run recursively by a child install
if (process.env.PINAAK_POSTINSTALL === "1") {
  process.exit(0);
}

const runNpmInstall = (dir, extraArgs = []) => {
  const label = path.relative(repoRoot, dir).replace(/\\/g, "/") || ".";
  console.log(`\n📦 Installing dependencies in ${label}/ ...`);
  const result = spawnSync(
    npmCmd,
    ["install", "--no-audit", "--no-fund", ...extraArgs],
    {
      cwd: dir,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PINAAK_POSTINSTALL: "1",
        npm_config_ignore_scripts: "false",
      },
    },
  );
  if (result.error) {
    console.error(`❌ Failed to spawn npm: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ npm install failed in ${label}/ (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
};

// Step 1 + 2: sub-package installs
runNpmInstall(path.join(repoRoot, "backend"));
runNpmInstall(path.join(repoRoot, "frontend"), [
  "--include=dev",
  "--production=false",
]);

// Step 3: .env.local files
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

console.log("");
let created = 0;
for (const { example, local, label } of targets) {
  if (fs.existsSync(local)) continue;
  if (!fs.existsSync(example)) {
    console.warn(`⚠️  ${label}: skipped — ${example} not found`);
    continue;
  }
  fs.copyFileSync(example, local);
  console.log(`✅ Created ${label} from .env.example`);
  created += 1;
}

if (created === 0) {
  console.log("✓ .env.local files already exist — nothing to do");
}

console.log("\n🎉 Setup complete. Run `npm run dev` to start Pinaak.");
