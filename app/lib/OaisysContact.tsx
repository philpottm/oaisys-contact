import React from "react";
import userConfig from "~/user.config";
import PresenceCheckRequest from "./PresenceCheckRequest";

/**
 * Oaisys contact page, drawn from the printed business card: the front (brand
 * blue, reversed mark, "Oaisys" with a sky "ai", tagline, address) is the
 * hero; the back (white, a blue edge, sand labels) sets the action list.
 * Plain links only. The one exception is the "Request Digital Presence
 * Check" form, a small client island whose control is a mailto link until the
 * page is live.
 */

type IconName =
  | "calendar"
  | "mail"
  | "phone"
  | "whatsapp"
  | "pin"
  | "card"
  | "globe"
  | "instagram"
  | "facebook"
  | "youtube"
  | "x";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icon: React.FC<{ name: IconName; className?: string }> = ({
  name,
  className = "oc-icon",
}) => {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: (
      <g {...stroke}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
      </g>
    ),
    mail: (
      <g {...stroke}>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="m3.8 7 8.2 6 8.2-6" />
      </g>
    ),
    phone: (
      <path
        {...stroke}
        d="M6.6 3.5h2.6l1.6 4.2-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4.2 1.6v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
      />
    ),
    whatsapp: (
      <g {...stroke}>
        <path d="M4 20l1.3-4.1A8.3 8.3 0 1 1 8.4 19Z" />
        <path d="M9.2 8.6c.2-.4.5-.5.8-.5h.5l.8 1.9-.6.8c.5 1.1 1.4 2 2.5 2.5l.8-.6 1.9.8v.5c0 .3-.1.6-.5.8-.6.4-1.5.5-2.6 0a7 7 0 0 1-3.3-3.3c-.5-1.1-.4-2 0-2.6Z" />
      </g>
    ),
    pin: (
      <g {...stroke}>
        <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
        <circle cx="12" cy="10" r="2.4" />
      </g>
    ),
    card: (
      <g {...stroke}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="9" cy="10.5" r="2" />
        <path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M15 10h3M15 13.5h3" />
      </g>
    ),
    globe: (
      <g {...stroke}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5s1.1-6.1 3.4-8.5Z" />
      </g>
    ),
    instagram: (
      <g {...stroke}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </g>
    ),
    facebook: (
      <path
        fill="currentColor"
        d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21Z"
      />
    ),
    youtube: (
      <g>
        <path
          fill="currentColor"
          d="M21.6 7.6a2.6 2.6 0 0 0-1.8-1.8C18.2 5.3 12 5.3 12 5.3s-6.2 0-7.8.5a2.6 2.6 0 0 0-1.8 1.8C2 9.2 2 12 2 12s0 2.8.4 4.4a2.6 2.6 0 0 0 1.8 1.8c1.6.5 7.8.5 7.8.5s6.2 0 7.8-.5a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.4.4-4.4s0-2.8-.4-4.4Z"
        />
        <path fill="var(--oc-icon-cut, #fff)" d="m10 15 5.2-3L10 9Z" />
      </g>
    ),
    x: (
      <path
        fill="currentColor"
        d="M17.5 3.5h3l-6.6 7.5 7.7 9.5h-6l-4.7-6-5.4 6h-3l7-8L2.4 3.5h6.2l4.3 5.5Zm-1 15.3h1.7L7.6 5.1H5.8Z"
      />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

type Action = {
  href: string;
  icon: IconName;
  title: string;
  detail: string;
  external?: boolean;
  download?: boolean;
};

const PHONE_DISPLAY = "+30 694 162 0276";
const PHONE_E164 = "+306941620276";
const ADDRESS = "Agriteli, Kalamaria, Thessaloniki 551 32";
const MAPS_URL =
  "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a83f749778655b:0x649b3306ae046387?sa=X&ved=1t:8290&hl=en-GB&ictx=111";

const contactActions: Action[] = [
  {
    href: "mailto:info@oaisys.gr",
    icon: "mail",
    title: "Email us",
    detail: "info@oaisys.gr",
  },
  {
    href: `tel:${PHONE_E164}`,
    icon: "phone",
    title: "Call us",
    detail: PHONE_DISPLAY,
  },
  {
    href: `https://wa.me/${PHONE_E164.slice(1)}`,
    icon: "whatsapp",
    title: "WhatsApp",
    detail: "Message us",
    external: true,
  },
  {
    href: MAPS_URL,
    icon: "pin",
    title: "Find us",
    detail: "Kalamaria",
    external: true,
  },
];

const moreActions: Action[] = [
  {
    href: "/oaisys.vcf",
    icon: "card",
    title: "Save our contact",
    detail: "Add Oaisys to your phone",
    download: true,
  },
  {
    href: "https://oaisys.gr",
    icon: "globe",
    title: "Visit oaisys.gr",
    detail: "AI booking assistant for Greek tourism operators",
    external: true,
  },
];

const socials: { href: string; icon: IconName; label: string }[] = [
  {
    href: "https://www.instagram.com/oaisys.gr/",
    icon: "instagram",
    label: "Instagram",
  },
  {
    href: "https://www.facebook.com/Oaisys.gr",
    icon: "facebook",
    label: "Facebook",
  },
  {
    href: "https://www.youtube.com/@OaisysGR",
    icon: "youtube",
    label: "YouTube",
  },
  { href: "https://x.com/OaisysGR", icon: "x", label: "X" },
];

const linkProps = (a: { external?: boolean; download?: boolean }) =>
  a.external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : a.download
      ? { download: "Oaisys.vcf" }
      : {};

const Wordmark: React.FC = () => (
  <span className="oc-wordmark" aria-label="Oaisys">
    <span aria-hidden="true">O</span>
    <span aria-hidden="true" className="oc-sky">
      ai
    </span>
    <span aria-hidden="true">sys</span>
  </span>
);

const OaisysContact: React.FC = () => (
  <div className="oc-page">
    <main className="oc-sheet">
      <header className="oc-front">
        <div className="oc-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/mark-reversed.png"
            alt=""
            width={88}
            height={88}
            className="oc-mark"
          />
          <h1 className="oc-title">
            <Wordmark />
          </h1>
        </div>
        <p className="oc-tagline">Your Business, Better.</p>
        <p className="oc-address">{ADDRESS}</p>
      </header>

      <section className="oc-back" aria-label="Contact Oaisys">
        <a
          href="https://book.oaisys.gr/"
          target="_blank"
          rel="noopener noreferrer"
          className="oc-primary"
        >
          <span className="oc-primary-icon">
            <Icon name="calendar" />
          </span>
          <span className="oc-primary-text">
            <span className="oc-primary-title">Book a meeting</span>
            <span className="oc-primary-detail">
              20 minutes, no obligation
            </span>
          </span>
          <span className="oc-chevron" aria-hidden="true">
            →
          </span>
        </a>

        <PresenceCheckRequest />

        <div className="oc-grid">
          {contactActions.map((a) => (
            <a key={a.title} href={a.href} className="oc-tile" {...linkProps(a)}>
              <span className="oc-chip">
                <Icon name={a.icon} />
              </span>
              <span className="oc-tile-title">{a.title}</span>
              <span className="oc-tile-detail">{a.detail}</span>
            </a>
          ))}
        </div>

        <div className="oc-list">
          {moreActions.map((a) => (
            <a key={a.title} href={a.href} className="oc-row" {...linkProps(a)}>
              <span className="oc-chip">
                <Icon name={a.icon} />
              </span>
              <span className="oc-row-text">
                <span className="oc-tile-title">{a.title}</span>
                <span className="oc-tile-detail">{a.detail}</span>
              </span>
              <span className="oc-chevron" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>

        <nav className="oc-socials" aria-label="Oaisys on social media">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="oc-social"
              aria-label={s.label}
            >
              <Icon name={s.icon} />
            </a>
          ))}
        </nav>

        <footer className="oc-footer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/mark.png" alt="" width={20} height={20} />
          <span>© {new Date().getFullYear()} {userConfig.fullName}</span>
        </footer>
      </section>
    </main>
  </div>
);

export default OaisysContact;
