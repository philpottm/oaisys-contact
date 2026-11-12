import { expect, test, type Page, type Route } from "@playwright/test";
import { join } from "node:path";

/**
 * "Request Free Digital Presence Check" on the contact page (the default,
 * non-showcase build, which is what contact.oaisys.gr serves). The audit
 * desk's intake route is stubbed with page.route, so nothing leaves the test.
 */

const ENDPOINT = "https://audit.oaisys.eu/api/public/presence-requests";
const axePath = join(process.cwd(), "node_modules/axe-core/axe.min.js");

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Content-Type",
};

type Sent = { method: string; body: Record<string, unknown> };

async function stub(page: Page, respond: (route: Route) => Promise<void>) {
  const sent: Sent[] = [];
  await page.route(ENDPOINT, async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }
    sent.push({
      method: request.method(),
      body: request.postDataJSON() as Record<string, unknown>,
    });
    await respond(route);
  });
  return sent;
}

const ok = (route: Route) =>
  route.fulfill({
    status: 200,
    headers: { ...CORS, "content-type": "application/json" },
    body: '{"ok":true}',
  });

async function openForm(page: Page) {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Request Free Digital Presence Check/ })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

async function fillValid(page: Page) {
  await page.getByLabel("Your name").fill("Eleni Papadopoulou");
  await page.getByLabel("Telephone number").fill("+30 694 162 0276");
  await page.getByLabel("Email address").fill("eleni@example.gr");
  await page.getByLabel("Your website").fill("www.blue-bay.example.gr");
}

test("the request card sits directly under Book a meeting", async ({
  page,
}) => {
  await page.goto("/");
  const order = await page.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLElement>(".oc-back > a")];
    return links.slice(0, 2).map((a) => a.textContent ?? "");
  });
  expect(order[0]).toContain("Book a meeting");
  expect(order[1]).toContain("Request Free Digital Presence Check");
  // Book a meeting is untouched.
  await expect(
    page.getByRole("link", { name: /Book a meeting/ }),
  ).toHaveAttribute("href", "https://book.oaisys.gr/");
});

test("the card is a pre-addressed email link until the form takes over", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Request Free Digital Presence Check/ }),
  ).toHaveAttribute("href", /^mailto:info@oaisys\.gr\?subject=/);
});

test("the send button stays disabled until the email opt-in is ticked", async ({
  page,
}) => {
  const sent = await stub(page, ok);
  await openForm(page);
  await fillValid(page);

  const send = page.getByRole("button", { name: "Request my free check" });
  const consent = page.getByRole("checkbox");
  await expect(consent).not.toBeChecked();
  await expect(send).toBeDisabled();

  await consent.check();
  await expect(send).toBeEnabled();
  await consent.uncheck();
  await expect(send).toBeDisabled();
  expect(sent).toHaveLength(0);
});

test("the opt-in is plain wording, not terms and conditions", async ({
  page,
}) => {
  await openForm(page);
  const label = page.locator(".oc-consent label");
  await expect(label).toContainText("Oaisys may email me");
  await expect(label).toContainText("Digital Presence Check report");
  await expect(label).not.toContainText(/terms|conditions/i);
});

test("a valid request posts once with the opt-in and shows the thank-you", async ({
  page,
}) => {
  const sent = await stub(page, ok);
  await openForm(page);
  await fillValid(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request my free check" }).click();

  await expect(page.getByText("Thank you, your request is in.")).toBeVisible();
  await expect(page.getByText("eleni@example.gr")).toBeVisible();
  expect(sent).toHaveLength(1);
  expect(sent[0].method).toBe("POST");
  expect(sent[0].body).toMatchObject({
    name: "Eleni Papadopoulou",
    phone: "+30 694 162 0276",
    email: "eleni@example.gr",
    website: "www.blue-bay.example.gr",
    consent: true,
    consentVersion: "presence-check-consent-2026-11-12.1",
    company: "",
  });
  expect(String(sent[0].body.consentText)).toContain("Oaisys may email me");

  // Closing and reopening gives a fresh form.
  await page.getByRole("button", { name: "Close" }).first().click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await page
    .getByRole("link", { name: /Request Free Digital Presence Check/ })
    .click();
  await expect(page.getByLabel("Your name")).toHaveValue("");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
});

test("mistakes are shown by field and nothing is sent", async ({ page }) => {
  const sent = await stub(page, ok);
  await openForm(page);
  await page.getByLabel("Your name").fill("Eleni");
  await page.getByLabel("Telephone number").fill("12");
  await page.getByLabel("Email address").fill("nope");
  await page.getByLabel("Your website").fill("localhost");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request my free check" }).click();

  await expect(
    page.getByText("Please enter a valid email address."),
  ).toBeVisible();
  await expect(page.getByText(/telephone number we can reach/)).toBeVisible();
  await expect(page.getByText(/Please enter your website/)).toBeVisible();
  await expect(page.getByLabel("Telephone number")).toBeFocused();
  expect(sent).toHaveLength(0);
});

test("the honeypot is out of sight, out of the tab order and hidden from assistive tech", async ({
  page,
}) => {
  await openForm(page);
  const trap = page.locator(".oc-trap");
  await expect(trap).toHaveAttribute("aria-hidden", "true");
  await expect(trap.locator("input")).toHaveAttribute("tabindex", "-1");
  const box = await trap.boundingBox();
  expect(box === null || box.x < -1000).toBe(true);
});

test("a busy or failing server shows a calm message and keeps the form", async ({
  page,
}) => {
  let status = 429;
  await stub(page, (route) =>
    route.fulfill({
      status,
      headers: { ...CORS, "content-type": "application/json" },
      body: "{}",
    }),
  );
  await openForm(page);
  await fillValid(page);
  await page.getByRole("checkbox").check();
  const send = page.getByRole("button", { name: "Request my free check" });

  await send.click();
  await expect(page.locator(".oc-problem")).toContainText("Too many requests");
  await expect(page.getByLabel("Your name")).toHaveValue("Eleni Papadopoulou");

  status = 500;
  await send.click();
  await expect(page.locator(".oc-problem")).toContainText("info@oaisys.gr");
});

test("the open form has no axe violations", async ({ page }) => {
  await openForm(page);
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => {
    const axe = (
      globalThis as unknown as {
        axe: {
          run: (
            c: Document,
          ) => Promise<{ violations: { id: string; help: string }[] }>;
        };
      }
    ).axe;
    return (await axe.run(document)).violations.map(
      (v) => `${v.id}: ${v.help}`,
    );
  });
  expect(violations).toEqual([]);
});

test("Escape closes the form", async ({ page }) => {
  await openForm(page);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
