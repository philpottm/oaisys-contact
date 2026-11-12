import { expect, test, vi } from "vitest";
import {
  CONSENT_TEXT,
  CONSENT_VERSION,
  HONEYPOT_FIELD,
  PRESENCE_ENDPOINT,
  attemptSubmit,
  buildPayload,
  submitRequest,
  validateFields,
} from "../../app/lib/presenceCheck";

const GOOD = {
  name: "Eleni Papadopoulou",
  phone: "+30 694 162 0276",
  email: "eleni@example.gr",
  website: "www.blue-bay.example.gr",
};

test("the opt-in wording and its key are the ones the audit server carries", () => {
  // Pinned on purpose: the server (tools/presales-audit/web/presence.mjs in the
  // oaisys repo) accepts only this exact pair. Changing the words means a NEW key
  // in both places, never an edit.
  expect(CONSENT_VERSION).toBe("presence-check-consent-2026-11-12.1");
  expect(CONSENT_TEXT).toBe(
    "I agree that Oaisys may email me, including to process my request and send me my free Digital Presence Check report, and to follow up about its services. I can withdraw this at any time by replying to any email or writing to info@oaisys.gr.",
  );
  expect(CONSENT_TEXT).not.toMatch(/terms|conditions/i);
});

test("the form posts to the audit desk's public intake route", () => {
  expect(PRESENCE_ENDPOINT).toBe(
    "https://audit.oaisys.eu/api/public/presence-requests",
  );
});

test("a complete form has no errors", () => {
  expect(validateFields(GOOD)).toEqual({});
});

test("each field is checked and named", () => {
  const errors = validateFields({
    name: " ",
    phone: "12",
    email: "nope",
    website: "localhost",
  });
  expect(Object.keys(errors).toSorted()).toEqual([
    "email",
    "name",
    "phone",
    "website",
  ]);
});

const websiteOk = (website: string) =>
  !validateFields({ ...GOOD, website }).website;

test("websites may be typed without a scheme but must be a public name", () => {
  expect(websiteOk("example.gr")).toBe(true);
  expect(websiteOk("https://www.example.gr/about")).toBe(true);
  for (const bad of [
    "",
    "example",
    "127.0.0.1",
    "http://localhost:3000",
    "javascript:alert(1)",
    "https://user:pw@example.gr",
    "exa mple.gr",
  ]) {
    expect(websiteOk(bad), bad).toBe(false);
  }
});

test("the payload carries the opt-in, the wording key and the honeypot", () => {
  const payload = buildPayload({ ...GOOD, name: "  Eleni  " }, true, "");
  expect(payload).toMatchObject({
    name: "Eleni",
    phone: GOOD.phone,
    email: GOOD.email,
    website: GOOD.website,
    consent: true,
    consentVersion: CONSENT_VERSION,
    consentText: CONSENT_TEXT,
    [HONEYPOT_FIELD]: "",
  });
});

test("without the opt-in nothing is sent", async () => {
  const fetchImpl = vi.fn<typeof fetch>();
  const result = await submitRequest(GOOD, false, "", { fetchImpl });
  expect(result.ok).toBe(false);
  expect(fetchImpl).not.toHaveBeenCalled();
});

test("a successful send posts JSON once", async () => {
  const fetchImpl = vi.fn<typeof fetch>(
    async () => new Response('{"ok":true}', { status: 200 }),
  );
  const result = await submitRequest(GOOD, true, "", { fetchImpl });
  expect(result).toEqual({ ok: true });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
  expect(url).toBe(PRESENCE_ENDPOINT);
  expect(init.method).toBe("POST");
  expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
    "application/json",
  );
  expect(JSON.parse(init.body as string).consent).toBe(true);
});

const reply = (status: number, body = "{}") =>
  vi.fn<typeof fetch>(async () => new Response(body, { status }));

test("server answers map to what the person sees", async () => {
  expect(
    await submitRequest(GOOD, true, "", {
      fetchImpl: reply(
        400,
        '{"fields":{"email":"Please enter a valid email address.","x":"ignored"}}',
      ),
    }),
  ).toEqual({
    ok: false,
    kind: "invalid",
    fields: { email: "Please enter a valid email address." },
  });
  expect(
    await submitRequest(GOOD, true, "", { fetchImpl: reply(429) }),
  ).toEqual({ ok: false, kind: "busy" });
  expect(
    await submitRequest(GOOD, true, "", { fetchImpl: reply(500) }),
  ).toEqual({ ok: false, kind: "server" });
  const down = vi.fn<typeof fetch>(async () => {
    throw new TypeError("Failed to fetch");
  });
  expect(await submitRequest(GOOD, true, "", { fetchImpl: down })).toEqual({
    ok: false,
    kind: "network",
  });
});

test("pressing send validates first, then reports what to fix and where", async () => {
  const fetchImpl = vi.fn<typeof fetch>();
  const invalid = await attemptSubmit({ ...GOOD, email: "nope" }, true, "", {
    fetchImpl,
  });
  expect(invalid).toMatchObject({ focus: "email", problem: null });
  expect(fetchImpl).not.toHaveBeenCalled();

  const sent = await attemptSubmit(GOOD, true, "", {
    fetchImpl: vi.fn<typeof fetch>(
      async () => new Response("{}", { status: 200 }),
    ),
  });
  expect(sent).toEqual({ sentTo: "eleni@example.gr" });

  const busy = await attemptSubmit(GOOD, true, "", {
    fetchImpl: vi.fn<typeof fetch>(
      async () => new Response("{}", { status: 429 }),
    ),
  });
  expect(busy).toMatchObject({ problem: expect.stringContaining("Too many") });

  const refused = await attemptSubmit(GOOD, true, "", {
    fetchImpl: vi.fn<typeof fetch>(
      async () => new Response('{"fields":{"consent":"x"}}', { status: 400 }),
    ),
  });
  expect(refused).toMatchObject({
    problem: expect.stringContaining("tick the box"),
  });
});
