module.exports = {
  apps: [
    {
      name: "orla-web",
      script: "node",
      args: "server.js",
      cwd: "./",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "900M",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "orla-worker",
      script: "tsx",
      args: "src/worker.ts",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      env_production: { NODE_ENV: "production" },
    },
    {
      name: "orla-worker-blacklist-expiry",
      script: "tsx",
      args: "src/features/ip_blacklist/scripts/expire-blacklist.ts",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 * * * *",
      autorestart: false,
      max_memory_restart: "200M",
      env_production: { NODE_ENV: "production" },
    },
  ],
};
