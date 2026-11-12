import { defineConfig, devices } from "@playwright/test";

/**
 * Covers the "Request Free Digital Presence Check" form on the contact page.
 *
 * This site is a static export (`output: "export"`), which `next start` refuses
 * to serve, so unlike the template's own configs this one builds the deployed
 * page exactly as deploy.yml does and serves `out/` with a plain file server.
 * The audit desk's intake route is stubbed in the tests; nothing leaves the
 * machine.
 */
const port = Number(process.env.PLAYWRIGHT_PRESENCE_PORT ?? 3200);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/presence",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: `LINKFOLIO_SHOWCASE=0 LINKFOLIO_LAYOUT=bento NEXT_APP_URL=https://contact.oaisys.gr pnpm build && python3 -m http.server ${port} --bind 127.0.0.1 --directory out`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
