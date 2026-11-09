import type { UserConfigType } from "@/types";

/**
 * Oaisys at HELEXPO Thessaloniki, 13 November 2026.
 *
 * Event link-in-bio: the two official exhibitor catalogues (Philoxenia–Hotelia
 * and Food & Drinks by Detrop) plus the Oaisys website, booking and email.
 * Public origin is set by NEXT_APP_URL at build time; siteUrl here keeps the
 * SEO/structured-data metadata correct when the build has no env.
 */
const userConfig: UserConfigType = {
  siteUrl: "https://event.oaisys.gr",
  avatarSrc: "/assets/oaisys-mark.png",
  avatarAlt: "Oaisys",
  fullName: "Oaisys",
  alias: "HELEXPO · 13 November 2026",
  metaTitle: "Oaisys at HELEXPO 2026 — exhibitor catalogues",
  metaDescription:
    "Meet Oaisys at HELEXPO Thessaloniki, 13 November 2026. AI booking assistant for Greek tourism operators — with the full exhibitor catalogues for Philoxenia–Hotelia and Food & Drinks by Detrop.",
  keywords: [
    "Oaisys",
    "HELEXPO",
    "Philoxenia",
    "Hotelia",
    "Detrop",
    "Thessaloniki",
    "AI booking assistant",
  ],
  jobTitle: "AI booking assistant for Greek tourism operators",
  worksFor: "Oaisys",
  locale: "en_GB",
  lang: "en",
  themeColor: "#1868A0",
  themePreset: "ocean",
  theme: {
    "color-primary": "#1868A0",
  },
  enableTypingAlias: false,
  socialNetworks: [
    {
      url: "https://event.oaisys.gr/catalogues.html",
      iconSrc: "/assets/tile-catalogue.png",
      title: "Exhibitor catalogues",
      description:
        "230 Philoxenia–Hotelia exhibitors · 242 Food & Drinks brands",
      group: "project",
      span: "2x2",
    },
    {
      url: "https://oaisys.gr",
      iconSrc: "/assets/tile-website.png",
      title: "Oaisys",
      description: "AI booking assistant for Greek tourism operators",
      group: "website",
    },
    {
      url: "https://book.oaisys.gr/",
      iconSrc: "/assets/tile-book.png",
      title: "Book a meeting",
      description: "20 minutes, no obligation",
      group: "website",
    },
    {
      url: "mailto:info@oaisys.gr",
      iconSrc: "/assets/tile-email.png",
      title: "Email us",
      description: "info@oaisys.gr",
      group: "socialnetwork",
    },
  ],
};

export default userConfig;
