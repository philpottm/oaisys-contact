# Oaisys — contact page

Link-in-bio page for Oaisys, handed out on business cards. Built on
[Linkfolio](https://github.com/heristop/linkfolio) (MIT), statically exported
and served from GitHub Pages at https://contact.oaisys.gr (public/CNAME).

## Pages

- `/` — Oaisys profile: book a meeting, website, email, phone, Instagram,
  Facebook, YouTube, X, Google Maps and a downloadable vCard.
- `/oaisys.vcf` — the vCard the "Save contact" card links to.
- `/catalogues.html` — unlinked, noindexed working copy of the HELEXPO fair
  catalogues (own use at the fair; not part of the public page).

## Deploy

Push to `main` — the `deploy.yml` workflow builds the static export and
publishes it to GitHub Pages. The site URL lives in two places that must stay
in sync: `NEXT_APP_URL` in `.github/workflows/deploy.yml` and `siteUrl` in
`config/user.config.ts` (also the vCard link in the same file).
