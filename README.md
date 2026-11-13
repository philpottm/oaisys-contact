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

## Upstream template (Linkfolio)

Everything below describes [Linkfolio](https://github.com/heristop/linkfolio),
the MIT template this page is built from — not the Oaisys contact page. The
blocks are generated from `app/lib/projectContent.ts` by `pnpm gen:readme`;
`tests/unit/readme-sync.spec.ts` fails if they drift.

### Why self-host instead of using Linktree?

<!-- generated:comparison -->

|                       | Linkfolio                | Linktree                                      | LinkStack                               | Bio.link                               |
| --------------------- | ------------------------ | --------------------------------------------- | --------------------------------------- | -------------------------------------- |
| Cost                  | Free, MIT licensed       | Free tier; paid from €4.50/mo billed annually | Free and open source; hosted from $1/mo | One plan at $7.49/mo, 7-day free trial |
| Account required      | None                     | Yes, a Linktree account                       | Yes, an account on the instance         | Yes, a Bio Link account                |
| Open source           | Yes, MIT                 | —                                             | Yes, AGPL-3.0                           | —                                      |
| Your own domain       | Yes, you deploy it       | No, pages live at linktr.ee/username          | Yes, self-hosted or on the $5/mo plan   | Yes, on the paid plan                  |
| Where your data lives | Your infrastructure      | —                                             | Your own web server when self-hosted    | —                                      |
| Built with            | Next.js and Tailwind CSS | —                                             | PHP and Laravel                         | —                                      |

<!-- /generated:comparison -->

<!-- generated:sources -->

"—" means the vendor does not publish that information. Competitor details checked 2026-08-17.

- Linktree: https://linktr.ee/s/pricing
- Linktree: https://linktr.ee/help/en/articles/6571689-can-i-change-the-linktree-url-to-a-custom-domain
- LinkStack: https://linkstack.org/
- LinkStack: https://github.com/LinkStackOrg/LinkStack
- Bio.link: https://bio.link/

<!-- /generated:sources -->

### Frequently asked questions

<!-- generated:faq -->

### Is Linkfolio free?

Yes. Linkfolio is open source under the MIT licence. You host it yourself, so there is no subscription and no usage limit.

### How is it different from Linktree?

Linkfolio runs on your own domain and infrastructure. You have full access to the source, can inject your own React components, and no third party sits between you and your visitors.

### Do I need to know Next.js to use it?

No. You can deploy the template to Vercel in one click and personalise it by editing a single configuration file. Knowing Next.js helps if you want to customise components.

### Can I add it to an existing Next.js project?

Yes. Install the linkfolio package and render the LinkFolio component with your own config object.

### Can I use Google Analytics with Linkfolio?

Yes, and it is not the only option. Set analytics: { provider: "ga", id: "G-…" } in your config and Linkfolio loads the tag and reports which link each visitor clicked. Google Tag Manager, Plausible and Umami ship as built-in providers too, you can register your own, and every link card emits a linkfolio:analytics DOM event you can listen to without configuring any provider at all.

<!-- /generated:faq -->
