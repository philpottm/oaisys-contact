import React from "react";
import Image from "next/image";
import type { UserProfileProps } from "@/types";

/**
 * Oaisys profile header: the brand mark avatar and the coloured wordmark in
 * place of the plain-text name. Mirrors the template's UserProfile rhythm —
 * avatar, name (an h1 carrying the wordmark image plus screen-reader text),
 * alias, accent line — with the same fade-in delays.
 */
const OaisysProfile: React.FC<UserProfileProps> = ({ userConfig }) => {
  return (
    <header className="profile mt-2 text-center mb-(--lf-profile-margin-bottom)">
      <Image
        src="/assets/avatar-mark.png"
        alt={userConfig.avatarAlt ?? "Oaisys"}
        width={120}
        height={120}
        className="lf-avatar avatar rounded-full mb-6 mx-auto fade-in"
        style={{ animationDelay: "0.05s" }}
        priority
      />

      <h1
        className="lf-name fullname fade-in font-(family-name:--lf-name-font-family) text-(length:--lf-name-font-size) font-(--lf-name-font-weight)"
        style={{ animationDelay: "0.15s" }}
      >
        <span className="sr-only">{userConfig.fullName ?? "Oaisys"}</span>
        <Image
          src="/assets/wordmark.png"
          alt=""
          width={194}
          height={77}
          className="wordmark wordmark-light mx-auto"
        />
        <Image
          src="/assets/wordmark-dark.png"
          alt=""
          width={194}
          height={77}
          className="wordmark wordmark-dark mx-auto"
        />
      </h1>

      {userConfig.alias && (
        <p
          className="lf-alias alias mt-2 text-base font-semibold fade-in text-(--lf-alias-color)"
          style={{ animationDelay: "0.25s" }}
        >
          {userConfig.alias}
        </p>
      )}

      <div
        className="lf-accent-line origin-center reveal-line w-(--lf-accent-line-width) h-0.5 bg-(--lf-accent-line-color) opacity-(--lf-accent-line-opacity) mt-4 mx-auto"
        style={{ animationDelay: "0.35s" }}
        role="presentation"
      />
    </header>
  );
};

export default OaisysProfile;
