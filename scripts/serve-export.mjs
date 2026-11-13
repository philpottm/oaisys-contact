/**
 * Serves the static export in out/ so Playwright can test what actually ships.
 *
 * `next start` refuses an `output: "export"` build, and `npx serve` would add a
 * network dependency to every CI run. This is the small part of a static host
 * the suites need: extensionless routes resolve to `<route>.html`, directories
 * resolve to their `index.html`, unknown paths return out/404.html with a 404
 * so the not-found assertions see the page and the status the host would give.
 *
 * Run: node scripts/serve-export.mjs --dir out --port 3000
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const TYPES = new Map(
  Object.entries({
    ".html": "text/html; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".webmanifest": "application/manifest+json",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".xml": "application/xml; charset=utf-8",
    ".pdf": "application/pdf",
    ".vcf": "text/vcard",
  }),
);

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const root = resolve(arg("dir", "out"));
const port = Number(arg("port", 3000));

if (!existsSync(join(root, "index.html"))) {
  console.error(`No export at ${root} — run the build first`);
  process.exit(1);
}

/** The file the request maps to, or undefined when none exists. */
function candidate(pathname) {
  // decodeURIComponent throws on malformed input; a bad URL is a 404, not a crash.
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }

  const relative = normalize(decoded)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const target = join(root, relative);

  // A path that escapes the export directory is never served.
  if (target !== root && !target.startsWith(root + sep)) return undefined;

  if (existsSync(target)) {
    const stats = statSync(target);
    if (stats.isFile()) return target;
    if (stats.isDirectory()) {
      const index = join(target, "index.html");
      if (existsSync(index)) return index;
    }
  }

  // Next writes extensionless routes as `<route>.html`.
  const asHtml = `${target}.html`;
  if (existsSync(asHtml) && statSync(asHtml).isFile()) return asHtml;

  return undefined;
}

function send(response, status, file, method) {
  const type =
    TYPES.get(extname(file).toLowerCase()) ?? "application/octet-stream";
  response.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
  });
  if (method === "HEAD") return response.end();
  createReadStream(file)
    .on("error", () => response.destroy())
    .pipe(response);
}

createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" }).end();
    return;
  }

  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  const file = candidate(pathname);
  if (file) return send(response, 200, file, request.method);

  const notFound = candidate("/404.html");
  if (notFound) return send(response, 404, notFound, request.method);

  response
    .writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    .end("Not found");
}).listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}`);
});
