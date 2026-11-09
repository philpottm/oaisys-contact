/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: this deployment is a link-in-bio page served from GitHub
  // Pages — one HTML file and its assets, no server.
  output: "export",
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
