import { expect, test, type Page } from "@playwright/test";

const CHATWOOT = "https://chat-oaisys.oaisys.gr";
const INBOX = `${CHATWOOT}/public/api/v1/inboxes/test-inbox`;

/** Fills the form with valid values and ticks consent. */
async function fillForm(page: Page) {
  await page.getByRole("button", { name: /Send us a message/ }).click();
  await page.getByLabel("Your name").fill("Maria Papadopoulou");
  await page.getByLabel("Email").fill("maria@example.com");
  await page.getByLabel("Business name").fill("Blue Door Rooms");
  await page.getByLabel("Kind of business").selectOption("Accommodation");
  await page.getByLabel("What do you need help with?").fill("We miss enquiries at night.");
  await page.getByRole("checkbox").check();
}

test("the chat icon is a social icon: same size, last in the row, right of X", async ({
  page,
}) => {
  await page.goto("/");
  const labels = await page
    .locator(".oc-socials > *")
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));
  expect(labels).toEqual([
    "Instagram",
    "Facebook",
    "YouTube",
    "X",
    "Chat with Oaisys",
  ]);

  const x = await page.getByRole("link", { name: "X", exact: true }).boundingBox();
  const chat = await page.getByRole("button", { name: "Chat with Oaisys" }).boundingBox();
  expect(x).not.toBeNull();
  expect(chat).not.toBeNull();
  expect(chat!.width).toBeCloseTo(x!.width, 0);
  expect(chat!.height).toBeCloseTo(x!.height, 0);
  expect(chat!.y).toBeCloseTo(x!.y, 0);
  expect(chat!.x).toBeGreaterThan(x!.x);
});

test("nothing is fetched from Chatwoot until the icon is clicked, then the SDK runs with no floating bubble", async ({
  page,
}) => {
  const requested: string[] = [];
  await page.route(`${CHATWOOT}/**`, async (route) => {
    requested.push(route.request().url());
    await route.fulfill({
      contentType: "application/javascript",
      body: `window.chatwootSDK = { run(options) {
        window.chatwootRunOptions = options;
        window.$chatwoot = { toggle(state) { window.chatwootToggleCall = state || "toggle"; } };
        window.dispatchEvent(new Event("chatwoot:ready"));
      } };`,
    });
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(requested).toEqual([]);

  await page.getByRole("button", { name: "Chat with Oaisys" }).click();
  await expect.poll(() => requested).toEqual([`${CHATWOOT}/packs/js/sdk.js`]);
  await expect
    .poll(() => page.evaluate(() => (globalThis as { chatwootToggleCall?: string }).chatwootToggleCall))
    .toBe("open");
  const state = await page.evaluate(() => ({
    run: (globalThis as { chatwootRunOptions?: unknown }).chatwootRunOptions,
    settings: (globalThis as { chatwootSettings?: { hideMessageBubble?: boolean } }).chatwootSettings,
  }));
  expect(state.run).toEqual({ websiteToken: "test-token", baseUrl: CHATWOOT });
  expect(state.settings?.hideMessageBubble).toBe(true);
});

test("the form has its fields, a privacy-linked consent box and a hidden honeypot", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /Send us a message/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  for (const label of [
    "Your name",
    "Email",
    "Business name",
    "Kind of business",
    "What do you need help with?",
  ]) {
    await expect(page.getByLabel(label)).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "privacy notice" })).toHaveAttribute(
    "href",
    "https://oaisys.gr/privacy.html",
  );
  const honeypot = page.locator('input[name="website"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toHaveAttribute("tabindex", "-1");
  expect(await honeypot.evaluate((el) => el.closest(".oc-hp")?.getAttribute("aria-hidden"))).toBe("true");
});

test("an empty submit shows errors and sends nothing", async ({ page }) => {
  let posts = 0;
  await page.route(`${INBOX}/**`, (route) => {
    posts += 1;
    return route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: /Send us a message/ }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(page.getByText("Please tick the box to agree to be contacted.")).toBeVisible();
  expect(posts).toBe(0);
});

test("a valid submit creates the contact, conversation and first message", async ({
  page,
}) => {
  const bodies: Record<string, unknown> = {};
  await page.route(`${INBOX}/**`, async (route) => {
    const url = route.request().url().replace(INBOX, "");
    bodies[url] = route.request().postDataJSON();
    const reply =
      url === "/contacts"
        ? { source_id: "src-1" }
        : url.endsWith("/conversations")
          ? { id: 42 }
          : {};
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(reply) });
  });
  await page.goto("/");
  await fillForm(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you.")).toBeVisible();

  expect(Object.keys(bodies)).toEqual([
    "/contacts",
    "/contacts/src-1/conversations",
    "/contacts/src-1/conversations/42/messages",
  ]);
  expect(bodies["/contacts"]).toMatchObject({
    name: "Maria Papadopoulou",
    email: "maria@example.com",
    custom_attributes: { business_name: "Blue Door Rooms", business_type: "Accommodation" },
  });
  expect(
    (bodies["/contacts/src-1/conversations/42/messages"] as { content: string }).content,
  ).toContain("We miss enquiries at night.");
});

test("a failed send says so and offers a clickable email link", async ({ page }) => {
  await page.route(`${INBOX}/**`, (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.goto("/");
  await fillForm(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("We could not send your message.")).toBeVisible();
  await expect(
    page.locator(".oc-status").getByRole("link", { name: "info@oaisys.gr" }),
  ).toHaveAttribute("href", /^mailto:info@oaisys\.gr/);
});

test("a filled honeypot looks like success but sends nothing", async ({ page }) => {
  let posts = 0;
  await page.route(`${INBOX}/**`, (route) => {
    posts += 1;
    return route.abort();
  });
  await page.goto("/");
  await fillForm(page);
  await page.locator('input[name="website"]').evaluate((el: HTMLInputElement) => {
    el.value = "https://spam.example";
  });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Thank you.")).toBeVisible();
  expect(posts).toBe(0);
});
