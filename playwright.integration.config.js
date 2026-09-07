import { defineConfig } from "@playwright/test";
const databaseURL = "postgresql://zoorvan_test@127.0.0.1:54329/postgres";
process.env.DATABASE_URL = databaseURL;
export default defineConfig({
  testDir: "./tests/integration",
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://localhost:3002", headless: true, channel: "chrome" },
  webServer: {
    command: "npm run dev -- --port 3002",
    url: "http://localhost:3002",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_URL: databaseURL,
      AUTH_URL: "http://localhost:3002",
      STORE_PREVIEW: "false",
      COMMERCE_ENABLED: "true",
      AUTH_SECRET: "isolated-integration-test-secret-not-for-production",
      NEXT_DIST_DIR: ".next-integration",
    },
  },
});
