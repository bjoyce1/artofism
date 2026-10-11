import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:8080', viewport: { width: 1280, height: 1800 } },
});
