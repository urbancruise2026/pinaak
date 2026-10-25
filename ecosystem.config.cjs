const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "pinaak",
      cwd: path.join(__dirname, "backend"), // absolute, works from any directory
      script: "src/server.js",
      node_args: "--env-file=.env.production",
      env: { NODE_ENV: "production" },

      // Socket.IO: keep a single fork-mode process. Cluster mode needs
      // sticky sessions + a Redis adapter, or sockets will break.
      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      min_uptime: "10s",       // crashed within 10s = failed start
      max_restarts: 10,        // stop crash-looping forever
      restart_delay: 2000,
      max_memory_restart: "500M", // adjust to your VPS RAM

      // IMPORTANT: PM2 default is 1600ms, then SIGKILL. Your shutdown
      // handler waits 5s to drain and may take up to 15s.
      kill_timeout: 20000,

      time: true,              // timestamps in logs
    },
  ],
};