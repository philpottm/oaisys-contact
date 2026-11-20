/**
 * Chatwoot settings for the house instance, read at build time. The website
 * token and inbox identifier are public identifiers (they ship in any
 * Chatwoot embed), not secrets, but they are still kept out of the source:
 * set them as repository Actions variables (see README). With no token the
 * chat icon is not rendered; with no inbox identifier the contact form is
 * not rendered and the card keeps its plain email, phone and WhatsApp links.
 */
export const chatwootConfig = {
  // `||`, not `??`: an unset Actions variable reaches the build as "".
  baseUrl: (
    process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://chat-oaisys.oaisys.gr"
  ).replace(/\/+$/, ""),
  websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN ?? "",
  inboxIdentifier: process.env.NEXT_PUBLIC_CHATWOOT_INBOX_IDENTIFIER ?? "",
};
