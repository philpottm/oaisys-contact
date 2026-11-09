import React from "react";
import type { FooterProps } from "../types";

/**
 * Oaisys deployment footer: the page is the company's event profile, so it
 * signs itself rather than the template.
 */
const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="lf-footer mx-auto mt-10 px-6 py-2 text-xs">
      <div className="flex flex-col items-center justify-center">
        <div className="text-xs">
          © 2026 Oaisys · HELEXPO Thessaloniki
        </div>
      </div>
    </footer>
  );
};

export default Footer;
