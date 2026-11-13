import { readFileSync } from "node:fs";
import { test, expect } from "vitest";
import userConfig from "../../config/user.config";

// Current Oaisys positioning (oaisys.gr leave-behind v11 copy, 12 Nov 2026): the retired
// "AI booking assistant for Greek tourism operators" line, "operators" and "AI" do not
// appear in the page metadata, structured data or the contact cards.
const RETIRED = [
  /booking assistant/i,
  /\boperators?\b/i,
  /\bAI\b/,
  /GuestPilot/i,
  /OaiSYS|OaiSys/,
];

/* The homepage one-liner on oaisys.gr, verbatim. It is the site link's subtitle, not the
   lockup tagline: the tagline already sits under the logo, so it appears only there. */
const ONE_LINER =
  "Access modern technology to solve the problems costing you time and bookings.";
const TAGLINE = "Your Business, Better.";

test("metadata carries the current positioning and brand string", () => {
  expect(userConfig.metaTitle).toBe("Oaisys — Your Business, Better.");
  const text = JSON.stringify(userConfig);
  for (const pattern of RETIRED) expect(text).not.toMatch(pattern);
});

test("the oaisys.gr card describes the site with its homepage one-liner", () => {
  const website = userConfig.socialNetworks?.find(
    (link) => link.url === "https://oaisys.gr",
  );
  expect(website?.description).toBe(ONE_LINER);
});

test("the contact cards no longer use the retired line", () => {
  const page = readFileSync("app/lib/OaisysContact.tsx", "utf8");
  for (const pattern of [/booking assistant/i, /tourism operators/i]) {
    expect(page).not.toMatch(pattern);
  }
  expect(page).toContain(ONE_LINER);
});

test("the tagline is not duplicated below the logo", () => {
  const page = readFileSync("app/lib/OaisysContact.tsx", "utf8");
  expect(page.split(TAGLINE)).toHaveLength(2);
});
