module.exports = {
  apps: [
    {
      name: "pinaak",
      cwd: "./backend",
      script: "src/server.js",
      node_args: "--env-file=.env.production",
      env: { NODE_ENV: "production" },
    },
  ],
};