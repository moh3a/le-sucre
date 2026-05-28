module.exports = {
  apps: [
    {
      name: "le-sucre-web",
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
      name: "le-sucre-worker-shipping",
      script: "tsx",
      args: "src/lib/queue/workers/shipping.worker.ts",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      env_production: { NODE_ENV: "production" },
    },
    {
      name: "le-sucre-worker-reservations",
      script: "tsx",
      args: "src/lib/queue/workers/reservation-expiry.worker.ts",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "300M",
      env_production: { NODE_ENV: "production" },
    },
  ],
};
