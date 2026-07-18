import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
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
