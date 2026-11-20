"use client";

import React, { useState } from "react";
import { chatwootConfig } from "./chatwoot";

type ChatwootWindow = Window & {
  chatwootSettings?: Record<string, unknown>;
  chatwootSDK?: { run: (options: { websiteToken: string; baseUrl: string }) => void };
  $chatwoot?: { toggle: (state?: "open" | "close") => void };
};

/**
 * The discreet live-chat entry: a round icon in the social row, the same
 * size and style as the other social icons, with no floating launcher. The
 * Chatwoot SDK is fetched only on the first click, so a visitor who never
 * chats loads nothing from Chatwoot.
 */
const OaisysChat: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { websiteToken, baseUrl } = chatwootConfig;
  if (!websiteToken) return null;

  const open = () => {
    const w = globalThis as unknown as ChatwootWindow;
    if (w.$chatwoot) {
      w.$chatwoot.toggle();
      return;
    }
    if (loading) return;
    setLoading(true);
    w.chatwootSettings = {
      hideMessageBubble: true,
      position: "right",
      type: "standard",
    };
    globalThis.addEventListener(
      "chatwoot:ready",
      () => {
        setLoading(false);
        w.$chatwoot?.toggle("open");
      },
      { once: true },
    );
    const script = document.createElement("script");
    script.src = `${baseUrl}/packs/js/sdk.js`;
    script.async = true;
    script.addEventListener("load", () =>
      w.chatwootSDK?.run({ websiteToken, baseUrl }),
    );
    script.addEventListener("error", () => setLoading(false));
    document.body.append(script);
  };

  return (
    <button
      type="button"
      className="oc-social"
      aria-label="Chat with Oaisys"
      aria-busy={loading}
      onClick={open}
    >
      <svg viewBox="0 0 24 24" className="oc-icon" aria-hidden="true">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7.2L7 20.2v-3.7H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5Z" />
          <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
        </g>
      </svg>
    </button>
  );
};

export default OaisysChat;
