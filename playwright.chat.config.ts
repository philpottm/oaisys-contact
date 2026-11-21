import { defineConfig, devices } from "@playwright/test";

/**
 * Tests the contact card built WITH the Chatwoot build variables set (to
 * placeholder values, never real ones), which is how the live site is built.
 * The default build, with the variables unset, is covered by
 * tests/profile/profile.spec.ts. Chatwoot itself is never contacted: the
 * specs route every request to it.
 */
const port = Number(process.env.PLAYWRIGHT_CHAT_PORT ?? 3200);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/chat",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: { baseURL },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `LINKFOLIO_SHOWCASE=0 LINKFOLIO_LAYOUT=bento NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=test-token NEXT_PUBLIC_CHATWOOT_INBOX_IDENTIFIER=test-inbox npm run build && node scripts/serve-export.mjs --dir out --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
