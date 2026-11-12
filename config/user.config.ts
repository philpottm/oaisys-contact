import type { UserConfigType } from "@/types";
import {
  facebookIcon,
  instagramIcon,
  xIcon,
  youtubeIcon,
} from "@/assets";

/**
 * Oaisys contact page — the link-in-bio handed out on business cards.
 *
 * Website, booking, email, phone, Google Maps and the company socials, plus a
 * downloadable vCard. The page itself is app/lib/OaisysContact.tsx; these
 * links feed the SEO structured data. Public origin is set by NEXT_APP_URL;
 * siteUrl here keeps the SEO/structured-data metadata correct when the build
 * has no env.
 */
const userConfig: UserConfigType = {
  siteUrl: "https://contact.oaisys.gr",
  avatarSrc: "/assets/avatar-mark.png",
  avatarAlt: "Oaisys",
  fullName: "Oaisys",
  alias: "@oaisys",
  metaTitle: "Oaisys — Your Business, Better.",
  metaDescription:
    "Access modern technology to solve the problems costing you time and bookings. For tourism businesses in Greece: accommodation, rentals, tours and food.",
  keywords: [
    "Oaisys",
    "tourism businesses",
    "Greece",
    "hospitality",
    "Thessaloniki",
  ],
  jobTitle: "Technology for tourism businesses in Greece",
  worksFor: "Oaisys",
  locale: "en_GB",
  lang: "en",
  themeColor: "#356FA1",
  themePreset: "ocean",
  theme: {
    "color-primary": "#356FA1",
  },
  enableTypingAlias: false,
  socialNetworks: [
    {
      url: "https://book.oaisys.gr/",
      iconSrc: "/assets/mark.png",
      title: "Book a meeting",
      description: "20 minutes, no obligation",
      group: "website",
      span: "2x2",
    },
    {
      url: "https://oaisys.gr",
      iconSrc: "/assets/mark.png",
      title: "Oaisys",
      description: "Your Business, Better.",
      group: "website",
    },
    {
      url: "mailto:info@oaisys.gr",
      iconSrc: "/assets/mark.png",
      title: "Email us",
      description: "info@oaisys.gr",
      group: "socialnetwork",
    },
    {
      url: "tel:+306941620276",
      iconSrc: "/assets/mark.png",
      title: "Call us",
      description: "+30 694 1620276",
      group: "socialnetwork",
    },
    {
      url: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x14a83f749778655b:0x649b3306ae046387?sa=X&ved=1t:8290&hl=en-GB&ictx=111",
      iconSrc: "/assets/mark.png",
      title: "Find us",
      description: "Agriteli, Kalamaria, Thessaloniki 551 32",
      group: "socialnetwork",
    },
    {
      url: "https://contact.oaisys.gr/oaisys.vcf",
      iconSrc: "/assets/mark.png",
      title: "Save contact",
      description: "Download Oaisys vCard",
      group: "socialnetwork",
    },
    {
      url: "https://www.instagram.com/oaisys.gr/",
      iconSrc: instagramIcon,
      title: "Instagram",
      description: "@oaisys.gr",
      group: "socialnetwork",
    },
    {
      url: "https://www.facebook.com/Oaisys.gr",
      iconSrc: facebookIcon,
      title: "Facebook",
      description: "Oaisys.gr",
      group: "socialnetwork",
    },
    {
      url: "https://www.youtube.com/@OaisysGR",
      iconSrc: youtubeIcon,
      title: "YouTube",
      description: "@OaisysGR",
      group: "socialnetwork",
    },
    {
      url: "https://x.com/OaisysGR",
      iconSrc: xIcon,
      title: "X",
      description: "@OaisysGR",
      group: "socialnetwork",
    },
  ],
};

export default userConfig;
