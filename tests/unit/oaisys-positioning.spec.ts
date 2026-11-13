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

test("metadata carries the current positioning and brand string", () => {
  expect(userConfig.metaTitle).toBe("Oaisys — Your Business, Better.");
  const text = JSON.stringify(userConfig);
  for (const pattern of RETIRED) expect(text).not.toMatch(pattern);
});

test("the contact cards no longer use the retired line", () => {
  const page = readFileSync("app/lib/OaisysContact.tsx", "utf8");
  for (const pattern of [/booking assistant/i, /tourism operators/i]) {
    expect(page).not.toMatch(pattern);
  }
});
