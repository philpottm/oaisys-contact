"use client";

import React, { useId, useRef, useState } from "react";
import {
  CONSENT_TEXT,
  HONEYPOT_FIELD,
  attemptSubmit,
  type FieldErrors,
  type PresenceFields,
} from "./presenceCheck";

/**
 * The "Request Free Digital Presence Check" control and its form. The control
 * is an ordinary link to a pre-addressed email, so a click that arrives before
 * the page has loaded still reaches Oaisys; once the page is live it opens a
 * modal dialog with the form instead. The send button stays disabled until the
 * email opt-in is ticked.
 */

const FALLBACK_MAIL =
  "mailto:info@oaisys.gr?subject=Free%20Digital%20Presence%20Check";

const EMPTY: PresenceFields = { name: "", phone: "", email: "", website: "" };

const FIELDS: {
  key: keyof PresenceFields;
  label: string;
  type: string;
  autoComplete: string;
  inputMode?: "tel" | "email" | "url" | "text";
  placeholder?: string;
}[] = [
  { key: "name", label: "Your name", type: "text", autoComplete: "name" },
  {
    key: "phone",
    label: "Telephone number",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    key: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
  },
  {
    key: "website",
    label: "Your website",
    type: "text",
    autoComplete: "url",
    inputMode: "url",
    placeholder: "www.example.gr",
  },
];

const SearchIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="oc-icon" aria-hidden="true">
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 10.7l1.8 1.8L13.2 9" />
    </g>
  </svg>
);

const RequestPanel: React.FC<{ onClose: () => void; onSent: () => void }> = ({
  onClose,
  onSent,
}) => {
  const [fields, setFields] = useState<PresenceFields>(EMPTY);
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent || sending) return;
    setSending(true);
    const outcome = await attemptSubmit(fields, consent, company);
    setSending(false);
    if ("sentTo" in outcome) {
      setSentTo(outcome.sentTo);
      onSent();
      return;
    }
    setErrors(outcome.errors);
    setProblem(outcome.problem);
    if (outcome.focus) document.getElementById(id(outcome.focus))?.focus();
  };

  if (sentTo) {
    return (
      <output className="oc-thanks">
        <span className="oc-thanks-title">Thank you, your request is in.</span>
        <span>
          We will be in touch at <strong>{sentTo}</strong> with your free
          Digital Presence Check.
        </span>
        <button type="button" className="oc-submit" onClick={onClose}>
          Close
        </button>
      </output>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="oc-form">
      <p className="oc-form-lede">
        Tell us where to send it and we will look at how your business shows up
        online.
      </p>
      {FIELDS.map((f) => (
        <div className="oc-field" key={f.key}>
          <label htmlFor={id(f.key)}>{f.label}</label>
          <input
            id={id(f.key)}
            name={f.key}
            type={f.type}
            inputMode={f.inputMode}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            autoCapitalize={f.key === "name" ? "words" : "none"}
            spellCheck={false}
            value={fields[f.key]}
            aria-invalid={errors[f.key] ? true : undefined}
            aria-describedby={errors[f.key] ? id(`${f.key}-err`) : undefined}
            onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
          />
          {errors[f.key] ? (
            <p className="oc-error" id={id(`${f.key}-err`)}>
              {errors[f.key]}
            </p>
          ) : null}
        </div>
      ))}

      {/* Honeypot: off-screen, out of the tab order and hidden from assistive
          tech. People never see it; form-filling bots do. */}
      <div className="oc-trap" aria-hidden="true">
        <label htmlFor={id(HONEYPOT_FIELD)}>Company</label>
        <input
          id={id(HONEYPOT_FIELD)}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="oc-consent">
        <input
          id={id("consent")}
          name="consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <label htmlFor={id("consent")}>{CONSENT_TEXT}</label>
      </div>

      {problem ? (
        <p className="oc-error oc-problem" role="alert">
          {problem}
        </p>
      ) : null}

      <button
        type="submit"
        className="oc-submit"
        disabled={!consent || sending}
        aria-describedby={consent ? undefined : id("hint")}
      >
        {sending ? "Sending…" : "Request my free check"}
      </button>
      {consent ? null : (
        <p className="oc-hint" id={id("hint")}>
          Tick the box above to send your request.
        </p>
      )}
      <p className="oc-hint">
        We use these details only to prepare your check and to contact you about
        it.
      </p>
    </form>
  );
};

const PresenceCheckRequest: React.FC = () => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState(0);
  const sent = useRef(false);
  const title = useId();

  // Only runs once the page is live; before that the link is a mailto and the
  // browser follows it.
  const open = (event: React.MouseEvent) => {
    if (!dialog.current) return;
    event.preventDefault();
    dialog.current.showModal();
  };

  return (
    <>
      <a href={FALLBACK_MAIL} className="oc-check-cta" onClick={open}>
        <span className="oc-check-icon">
          <SearchIcon />
        </span>
        <span className="oc-primary-text">
          <span className="oc-check-title">
            Request Free Digital Presence Check
          </span>
          <span className="oc-check-detail">
            See how your business shows up online
          </span>
        </span>
        <span className="oc-chevron" aria-hidden="true">
          →
        </span>
      </a>

      {/* A half-typed form survives an accidental close; once a request has been
          sent, closing (the button or Escape) starts the next visit fresh. */}
      <dialog
        ref={dialog}
        className="oc-dialog"
        aria-labelledby={title}
        onClose={() => {
          if (!sent.current) return;
          sent.current = false;
          setSession((n) => n + 1);
        }}
      >
        <div className="oc-dialog-bar">
          <h2 id={title} className="oc-dialog-title">
            Free Digital Presence Check
          </h2>
          <button
            type="button"
            className="oc-dialog-close"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <RequestPanel
          key={session}
          onClose={() => dialog.current?.close()}
          onSent={() => {
            sent.current = true;
          }}
        />
      </dialog>
    </>
  );
};

export default PresenceCheckRequest;
