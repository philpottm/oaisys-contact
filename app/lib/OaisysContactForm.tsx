"use client";

import React, { useId, useRef, useState } from "react";
import { chatwootConfig } from "./chatwoot";

const EMAIL = "info@oaisys.gr";
const MAILTO = `mailto:${EMAIL}?subject=Message%20for%20Oaisys`;
const PRIVACY_URL = "https://oaisys.gr/privacy.html";
const CONSENT_VERSION = "2026-11-contact-card-v1";
const RATE_LIMIT_KEY = "oaisys-contact-last-sent";
const RATE_LIMIT_MS = 30_000;
const OTHER = "Another kind of business";
const BUSINESS_TYPES = [
  "Accommodation",
  "Rentals",
  "Tours & experiences",
  "Flavours",
  OTHER,
];

type Field =
  | "name"
  | "email"
  | "businessName"
  | "businessType"
  | "businessTypeOther"
  | "message"
  | "consent";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "failed" | "limited" | "done";

const EmailLink: React.FC = () => (
  <a className="oc-link" href={MAILTO}>
    {EMAIL}
  </a>
);

function validate(data: FormData): Errors {
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const errors: Errors = {};
  if (text("name").length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(text("email"))) {
    errors.email = "Please enter a valid email address.";
  }
  if (!text("businessType")) {
    errors.businessType = "Please choose the kind of business.";
  } else if (text("businessType") === OTHER && !text("businessTypeOther")) {
    errors.businessTypeOther = "Please tell us what kind of business.";
  }
  if (text("message").length < 10) {
    errors.message = "Please tell us a little about what you need.";
  }
  if (data.get("consent") !== "on") {
    errors.consent = "Please tick the box to agree to be contacted.";
  }
  return errors;
}

function rateLimited(): boolean {
  try {
    const last = Number.parseInt(
      localStorage.getItem(RATE_LIMIT_KEY) ?? "0",
      10,
    );
    return Date.now() - last < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

function markSent() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* private mode: no rate limit, the honeypot still applies */
  }
}

async function post(url: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`chatwoot ${res.status}`);
  return json;
}

/** Chatwoot's public client API: contact, then conversation, then message. */
async function sendToChatwoot(data: FormData): Promise<void> {
  const { baseUrl, inboxIdentifier } = chatwootConfig;
  const text = (name: string) => String(data.get(name) ?? "").trim();
  const type =
    text("businessType") === OTHER
      ? text("businessTypeOther")
      : text("businessType");
  const inbox = `${baseUrl}/public/api/v1/inboxes/${encodeURIComponent(inboxIdentifier)}`;

  const contact = await post(`${inbox}/contacts`, {
    name: text("name"),
    email: text("email"),
    custom_attributes: {
      business_name: text("businessName"),
      business_type: type,
      consent_version: CONSENT_VERSION,
      source: "contact.oaisys.gr",
    },
  });
  const sourceId = contact.source_id;
  if (typeof sourceId !== "string") throw new Error("no source_id");

  const conversation = await post(
    `${inbox}/contacts/${encodeURIComponent(sourceId)}/conversations`,
    {},
  );
  if (typeof conversation.id !== "number") throw new Error("no conversation");

  let content = text("message");
  if (text("businessName")) content += `\n\nBusiness: ${text("businessName")}`;
  content += `\nBusiness type: ${type}`;
  await post(
    `${inbox}/contacts/${encodeURIComponent(sourceId)}/conversations/${conversation.id}/messages`,
    { content },
  );
}

/** Honeypot, rate limit, then the send; resolves to the status to show. */
async function submit(data: FormData): Promise<Status> {
  if (String(data.get("website") ?? "")) return "done"; // a bot filled the hidden field: say nothing
  if (rateLimited()) return "limited";
  try {
    await sendToChatwoot(data);
    markSent();
    return "done";
  } catch {
    return "failed";
  }
}

/**
 * "Send us a message": a row in the card's action list that opens a short
 * form. A submission becomes a conversation in the house Chatwoot. Spam
 * control is a hidden honeypot plus a 30 second client-side rate limit; the
 * visitor sees nothing different when the honeypot is filled. Hidden entirely
 * until an inbox identifier is configured.
 */
const OaisysContactForm: React.FC = () => {
  const baseId = useId();
  const id = (name: string) => `${baseId}-${name}`;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [other, setOther] = useState(false);
  const doneRef = useRef<HTMLOutputElement>(null);

  if (!chatwootConfig.inboxIdentifier) return null;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const found = String(data.get("website") ?? "") ? {} : validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStatus("sending");
    const outcome = await submit(data);
    setStatus(outcome);
    if (outcome === "done") queueMicrotask(() => doneRef.current?.focus());
  };

  const errorProps = (name: Field) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id(`${name}-error`) : undefined,
  });
  const errorSlot = (name: Field) => (
    <span className="oc-error" id={id(`${name}-error`)}>
      {errors[name]}
    </span>
  );

  return (
    <div className="oc-contact">
      <button
        type="button"
        className="oc-row oc-row-button"
        aria-expanded={open}
        aria-controls={id("panel")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="oc-chip">
          <svg viewBox="0 0 24 24" className="oc-icon" aria-hidden="true">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16v11H9l-5 4Z" />
              <path d="M8 9h8M8 12.5h5" />
            </g>
          </svg>
        </span>
        <span className="oc-row-text">
          <span className="oc-tile-title">Send us a message</span>
          <span className="oc-tile-detail">Tell us about your business</span>
        </span>
        <span className="oc-chevron" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      <div id={id("panel")} hidden={!open} className="oc-panel">
        {status === "done" ? (
          <output ref={doneRef} tabIndex={-1} className="oc-done">
            <p className="oc-tile-title">Thank you.</p>
            <p className="oc-tile-detail">
              We have your message and will reply by email.
            </p>
          </output>
        ) : (
          <form className="oc-form" noValidate onSubmit={onSubmit}>
            <div className="oc-field">
              <label htmlFor={id("name")}>Your name</label>
              <input id={id("name")} name="name" autoComplete="name" required {...errorProps("name")} />
              {errorSlot("name")}
            </div>
            <div className="oc-field">
              <label htmlFor={id("email")}>Email</label>
              <input id={id("email")} name="email" type="email" autoComplete="email" required {...errorProps("email")} />
              {errorSlot("email")}
            </div>
            <div className="oc-field">
              <label htmlFor={id("businessName")}>Business name</label>
              <input id={id("businessName")} name="businessName" autoComplete="organization" {...errorProps("businessName")} />
              {errorSlot("businessName")}
            </div>
            <div className="oc-field">
              <label htmlFor={id("businessType")}>Kind of business</label>
              <select
                id={id("businessType")}
                name="businessType"
                defaultValue=""
                required
                onChange={(e) => setOther(e.target.value === OTHER)}
                {...errorProps("businessType")}
              >
                <option value="" disabled>
                  Choose one
                </option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {errorSlot("businessType")}
            </div>
            {other && (
              <div className="oc-field">
                <label htmlFor={id("businessTypeOther")}>What kind of business?</label>
                <input id={id("businessTypeOther")} name="businessTypeOther" {...errorProps("businessTypeOther")} />
                {errorSlot("businessTypeOther")}
              </div>
            )}
            <div className="oc-field">
              <label htmlFor={id("message")}>What do you need help with?</label>
              <textarea id={id("message")} name="message" rows={4} required {...errorProps("message")} />
              {errorSlot("message")}
            </div>

            {/* Honeypot: invisible and unreachable for people, tempting to bots. */}
            <div className="oc-hp" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="oc-field oc-consent">
              <label>
                <input
                  type="checkbox"
                  name="consent"
                  {...errorProps("consent")}
                  aria-describedby={`${id("consent-text")}${errors.consent ? ` ${id("consent-error")}` : ""}`}
                />
                <span id={id("consent-text")}>
                  I agree that Oaisys may use these details to reply to me, as
                  described in the{" "}
                  <a className="oc-link" href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
                    privacy notice
                  </a>
                  .
                </span>
              </label>
              {errorSlot("consent")}
            </div>

            <button type="submit" className="oc-submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            <output className="oc-status">
              {status === "failed" && (
                <>
                  We could not send your message. Please email <EmailLink /> instead.
                </>
              )}
              {status === "limited" && (
                <>
                  You just sent a message. Please wait a moment, or write to <EmailLink />.
                </>
              )}
            </output>
          </form>
        )}
      </div>
    </div>
  );
};

export default OaisysContactForm;
