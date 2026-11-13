import { test, expect } from "@playwright/test";

/**
 * Visual regression for the card this deployment actually serves — the Oaisys
 * contact page, not the template's Linkfolio card. Runs under
 * playwright.profile.config.ts against a build made WITHOUT LINKFOLIO_SHOWCASE,
 * which is what `deploy.yml` publishes.
 *
 * Baselines are per-platform (text rasterises differently on macOS and Linux)
 * and CI compares against the Linux set, which is why a deliberate visual
 * change is followed by the Update Visual Baselines workflow rather than a
 * locally recorded PNG.
 */
test("the contact card renders as expected", async ({ page }) => {
  await page.goto("/");

  // Every card tile painted before the frame is captured. The page has no
  // scroll-triggered reveal, so visibility is the whole wait.
  await expect(page.locator(".oc-tile")).toHaveCount(4);
  await expect(page.locator(".oc-row")).toHaveCount(2);
  await expect(page.locator(".oc-primary")).toBeVisible();
  await expect(page.locator(".oc-tagline")).toBeVisible();

  // A visible element is not a painted one: images resolve asynchronously, and
  // both a blank and a painted frame hold still long enough to look settled, so
  // `toHaveScreenshot` would otherwise record whichever it found.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll("img")].filter(
              // `complete` alone is also true for an image that failed, which
              // would wait out the timeout and then compare against a broken
              // frame instead of failing on the cause.
              (image) => !(image.complete && image.naturalWidth > 0),
            ).length,
        ),
      { timeout: 10_000 },
    )
    .toBe(0);

  // Both schemes from one page: the palette is CSS-variable driven, so
  // emulating the media query re-themes without a reload.
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await expect(page).toHaveScreenshot(`${colorScheme}.png`);
  }
});
