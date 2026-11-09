# Oaisys — HELEXPO 2026 event page

Link-in-bio page for Oaisys at HELEXPO Thessaloniki, Friday 13 November 2026,
where three fairs open the same day: Philoxenia–Hotelia 2026 (tourism + hotel
equipment) and Food & Drinks by Detrop 2026 (food & beverage).

Built on [Linkfolio](https://github.com/heristop/linkfolio) (MIT), statically
exported and served from GitHub Pages at https://contact.oaisys.gr (public/CNAME).

## Pages

- `/` — Oaisys profile with links to the catalogues, the website, booking and email.
- `/catalogues.html` — the two official exhibitor catalogues:
  230 Philoxenia–Hotelia exhibitors (name, pavilion/stand, country, category,
  website, email) from the HELEXPO e-catalogue, and 242 Food & Drinks brands
  from the official Eventora web app. Data as of 2026-11-09; counts may grow
  before the fair opens.

## Deploy

Push to `main` — the `deploy.yml` workflow builds the static export and
publishes it to GitHub Pages. The site URL lives in two places that must stay
in sync: `NEXT_APP_URL` in `.github/workflows/deploy.yml` and `siteUrl` in
`config/user.config.ts` (also the catalogue link in the same file).
