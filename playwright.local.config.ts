import { defineConfig } from "/dev-server/node_modules/@playwright/test/index.mjs";

export default defineConfig({
  testDir: "/dev-server/tests",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    launchOptions: {
      executablePath: "/chromium_headless_shell-1194/chrome-linux/headless_shell",
    },
  },
});
