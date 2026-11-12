/**
 * "Request Digital Presence Check": the form's rules and its one network
 * call. This page is static (GitHub Pages), so the browser sends the request to
 * the Oaisys audit desk's public intake route, which validates it again, stores
 * it and emails info@oaisys.gr. Pure functions only; the component owns the UI.
 */

export const PRESENCE_ENDPOINT =
  process.env.NEXT_PUBLIC_PRESENCE_ENDPOINT ||
  "https://audit.oaisys.eu/api/public/presence-requests";

/**
 * The opt-in wording shown beside the checkbox, and the key that names it. The
 * server only accepts a (key, text) pair it carries, and stores both with the
 * time the box was ticked. Change the words => add a NEW key here and on the
 * server (never edit an old one): requests keep the key of what was shown.
 */
export const CONSENT_VERSION = "presence-check-consent-2026-11-12.2";
export const CONSENT_TEXT =
  "I agree that Oaisys may email me, including to process this request and send me the Digital Presence Check, and to follow up about its services. I can withdraw this at any time by replying to any email or writing to info@oaisys.gr.";

/** The honeypot's field name: hidden from people, tempting to bots. */
export const HONEYPOT_FIELD = "company";

/** How a visitor heard about Oaisys; the server carries the same list. */
export const HEARD_FROM_OPTIONS = [
  "Instagram",
  "Facebook",
  "Website",
  "Conference",
  "Word of mouth",
  "Other",
] as const;

export type PresenceFields = {
  name: string;
  phone: string;
  email: string;
  website: string;
  heardFrom: string;
  heardFromOther: string;
};
export type FieldErrors = Partial<Record<keyof PresenceFields, string>>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

/** Same rules as the server's, so a person sees a mistake before sending. */
export function validateFields(fields: PresenceFields): FieldErrors {
  const errors: FieldErrors = {};
  const name = fields.name.trim();
  const phone = fields.phone.trim();
  const digits = phone.replaceAll(/\D/g, "");
  const email = fields.email.trim();
  const website = fields.website.trim();

  if (name.length < 2 || name.length > 120 || !/\p{L}/u.test(name)) {
    errors.name = "Please enter your name.";
  }
  if (
    !/^\+?[\d\s().-]{6,30}$/.test(phone) ||
    digits.length < 7 ||
    digits.length > 15
  ) {
    errors.phone = "Please enter a telephone number we can reach you on.";
  }
  if (email.length > 254 || !EMAIL.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!looksLikeWebsite(website)) {
    errors.website = "Please enter your website, for example www.example.gr.";
  }
  if (!HEARD_FROM_OPTIONS.includes(fields.heardFrom as (typeof HEARD_FROM_OPTIONS)[number])) {
    errors.heardFrom = "Please choose how you heard about us.";
  } else if (fields.heardFrom === "Other") {
    const other = fields.heardFromOther.trim();
    if (!other || other.length > 120) {
      errors.heardFromOther = "Please tell us how you heard about us.";
    }
  }
  return errors;
}

function looksLikeWebsite(value: string): boolean {
  if (!value || value.length > 300 || /\s/.test(value)) return false;
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    const host = url.hostname;
    return (
      /^https?:$/.test(url.protocol) &&
      !url.username &&
      !url.password &&
      host.includes(".") &&
      !/^[\d.]+$/.test(host) &&
      !host.includes(":") &&
      /\.([a-z]{2,}|xn--[a-z0-9-]+)$/i.test(host)
    );
  } catch {
    return false;
  }
}

export function buildPayload(
  fields: PresenceFields,
  consent: boolean,
  company = "",
) {
  return {
    name: fields.name.trim(),
    phone: fields.phone.trim(),
    email: fields.email.trim(),
    website: fields.website.trim(),
    heardFrom: fields.heardFrom,
    heardFromOther: fields.heardFrom === "Other" ? fields.heardFromOther.trim() : "",
    consent,
    consentVersion: CONSENT_VERSION,
    consentText: CONSENT_TEXT,
    [HONEYPOT_FIELD]: company,
  };
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: "invalid"; fields: FieldErrors }
  | { ok: false; kind: "busy" | "server" | "network" };

const FIELD_KEYS = ["name", "phone", "email", "website", "heardFrom", "heardFromOther"] as const;

async function readOutcome(response: Response): Promise<SubmitResult> {
  if (response.ok) return { ok: true };
  if (response.status === 429) return { ok: false, kind: "busy" };
  if (response.status !== 400) return { ok: false, kind: "server" };
  const body = (await response.json().catch(() => ({}))) as {
    fields?: Record<string, unknown>;
  };
  const errors: FieldErrors = {};
  for (const key of FIELD_KEYS) {
    const message = body.fields?.[key];
    if (typeof message === "string") errors[key] = message;
  }
  return { ok: false, kind: "invalid", fields: errors };
}

export async function submitRequest(
  fields: PresenceFields,
  consent: boolean,
  company = "",
  { fetchImpl = fetch, timeoutMs = 20000 } = {},
): Promise<SubmitResult> {
  if (!consent) return { ok: false, kind: "invalid", fields: {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await readOutcome(
      await fetchImpl(PRESENCE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(fields, consent, company)),
        signal: controller.signal,
      }),
    );
  } catch {
    return { ok: false, kind: "network" };
  } finally {
    clearTimeout(timer);
  }
}

const GENERIC_INVALID =
  "Please check the details and tick the box to agree to be emailed.";
const PROBLEMS = {
  busy: "Too many requests just now. Please try again in a little while, or email info@oaisys.gr.",
  server:
    "We could not send your request. Please try again, or email info@oaisys.gr.",
  network:
    "We could not reach the server. Check your connection and try again, or email info@oaisys.gr.",
} as const;

const firstKey = (errors: FieldErrors) =>
  FIELD_KEYS.find((key) => errors[key] !== undefined);

/** What one press of the send button leads to; the component only paints it. */
export type Attempt =
  | { sentTo: string }
  | {
      errors: FieldErrors;
      problem: string | null;
      focus?: keyof PresenceFields;
    };

export async function attemptSubmit(
  fields: PresenceFields,
  consent: boolean,
  company: string,
  options?: Parameters<typeof submitRequest>[3],
): Promise<Attempt> {
  const found = validateFields(fields);
  const first = firstKey(found);
  if (first) return { errors: found, problem: null, focus: first };

  const result = await submitRequest(fields, consent, company, options);
  if (result.ok) return { sentTo: fields.email.trim() };
  if (result.kind === "invalid") {
    const focus = firstKey(result.fields);
    return {
      errors: result.fields,
      problem: focus ? null : GENERIC_INVALID,
      focus,
    };
  }
  return { errors: {}, problem: PROBLEMS[result.kind] };
}
