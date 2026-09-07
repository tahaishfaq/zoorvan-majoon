import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "store.spec.js",
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    channel: "chrome",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "STORE_PREVIEW=true npm run dev -- --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
