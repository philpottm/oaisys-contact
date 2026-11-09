/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: this deployment is a link-in-bio page served from GitHub
  // Pages — one HTML file and its assets, no server.
  output: "export",
  // The site lives under a project Pages subpath, so every asset URL the
  // build emits must carry it. Keep in sync with the repo name and with
  // NEXT_APP_URL in .github/workflows/deploy.yml. `next/image` with
  // `unoptimized` does not inherit `basePath`, so image paths in
  // `config/user.config.ts` carry the subpath explicitly.
  basePath: "/oaisys-helexpo-2026",
  reactCompiler: true,
  experimental: {
    // The React Compiler's native port, run inside Turbopack rather than
    // through Babel on Node. Build-time only — the emitted code is the same.
    turbopackRustReactCompiler: true,
  },
  images: {
    // `next/image` needs a loader on static hosts; unoptimized serves the
    // original file and keeps the export fully self-contained.
    unoptimized: true,
    qualities: [90, 100],
  },
};

module.exports = nextConfig;
