import { OG_SIZE, avatarCard, avatarCardAlt } from "../lib/ogCards";

// Static export: the route must be prerendered at build time.
export const dynamic = "force-static";

export const alt = avatarCardAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OGImage() {
  return avatarCard();
}
