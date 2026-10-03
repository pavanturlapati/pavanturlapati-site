# pt-site

Personal website for Pavan Turlapati: articles, short notes, a curated link
feed, a Letterboxd film log, and a résumé. Built with [Astro](https://astro.build)
as a fully static site, hosted free on GitHub Pages at
<https://pavanturlapati.com>.

The Vedanta study notes are a separate MkDocs site in the
`my-journey-through-vedanta` repo, served from
<https://vedanta.pavanturlapati.com>.

## Run it

Needs Node 22.12 or newer.

```sh
npm install
npm run dev      # http://localhost:4321, drafts are visible here
npm run check    # type-check
npm run build    # production build into dist/
```

## Add content

Everything is a Markdown file. Commit and push to `main`, and the site
redeploys itself.

| What | Where | Frontmatter |
|---|---|---|
| Article | `src/content/articles/<slug>.md` | `title`, `description`, `date`, `tags`, optional `linkedin`, `draft` |
| Note | `src/content/notes/YYYY-MM-DD-<slug>.md` | `date`, optional `x`, `draft` |
| Feed link | `src/content/links/YYYY-MM-DD-<slug>.md` | `title`, `url`, `date`, `draft` |
| Weekly edition | `src/content/weekly/YYYY-MM-DD.md` | `title`, `description`, `date`, optional `linkedin`, `draft` |

- A note has no title. Its text is the body of the file.
- A feed link's body is your one-line comment (optional).
- `tags` must come from the list in `src/config.ts` (`articleTags`). Add a tag
  there first. A typo fails the build rather than silently creating a new tag.
- Unknown frontmatter keys also fail the build, so a typo like `drafft: true`
  can't publish a draft by accident.
- `draft: true` entries show in `npm run dev` but never in a production build.
- After sharing on LinkedIn or X, paste the post URL into `linkedin:` (articles)
  or `x:` (notes) and the site links to it.

Example note:

```md
---
date: 2026-10-01
---

A test that never fails is not a safety net. It's decoration.
```

Example feed link:

```md
---
title: Title of the article
url: https://example.com/article
date: 2026-10-02
---

One line on why it is worth reading.
```

The feed is a hand-curated list at `/feed`. There are no feed links yet, so
the page shows "Nothing here yet."

## Weekly Mashup

A weekly bulletin on AI, QSR technology and software testing, at `/weekly/`.
Each edition is dated the Tuesday it goes out. It is AI-assisted: a script
drafts it, and a human reviews it before anything is published.

**How it works**

1. `scripts/weekly-collect.mjs` fetches the feeds listed in
   `scripts/weekly-sources.mjs`, keeps items from the last 7 days, removes
   duplicates and writes `.weekly/collected.json`. No AI is involved.
2. `scripts/weekly-generate.mjs` makes two Claude calls. The first picks 8 to
   10 items from titles and snippets. The script then fetches the full text of
   only those articles. The second call writes the edition and a LinkedIn
   version, using only what the articles say.
3. It writes `src/content/weekly/YYYY-MM-DD.md`, plus `.weekly/linkedin.txt`
   and `.weekly/review.md` (checks and things to verify). `.weekly/` is not
   committed.
4. The GitHub Action `weekly.yml` runs the two scripts and opens a draft pull
   request. The PR description holds the review checklist and the LinkedIn
   text. Merging to `main` publishes the edition through the normal deploy.

**Weekly routine:** the draft PR arrives Monday morning ET. Review and edit
it Monday evening, then merge and post to LinkedIn (can be scheduled for
Tuesday 12:00am ET).

**Run it by hand**

```sh
npm run weekly:collect      # fetch candidates only, no API calls
npm run weekly              # collect, then write the edition (needs the key)
node scripts/weekly-generate.mjs --dry-run   # show prompt sizes, no API call
node scripts/weekly-generate.mjs --date 2026-10-13
```

**Setup**

- Add the key as the repository secret `ANTHROPIC_API_KEY` (Settings >
  Secrets and variables > Actions, or `gh secret set ANTHROPIC_API_KEY`).
  Locally, set it as an environment variable. Never commit it.
- Settings > Actions > General > Workflow permissions: enable "Allow GitHub
  Actions to create and approve pull requests".
- The Anthropic API is billed separately from a Claude.ai plan. Set a spend
  cap in the Anthropic console.
- The model is `claude-sonnet-5-5` (override with `WEEKLY_MODEL`). A run is
  two calls, about $0.10 to $0.20, so roughly $0.50 to $0.80 a month.
- `weekly.yml` is manual (`workflow_dispatch`) until the schedule line is
  uncommented.

**Editing the sources:** change `scripts/weekly-sources.mjs`. Check any new
feed with `curl` first, since some sites return 403 or HTML instead of RSS.
`scripts/weekly-example.md` is the format example given to the model.

**Truth rules:** the prompt tells the model to state only what the supplied
text says, to attribute company claims, and to say less when it only has a
snippet. The script also checks that every link was supplied, section order,
length and the LinkedIn character limit. These checks help but do not replace
reading the edition.

The Weekly tab is not in the navigation yet. Add `{ label: "Weekly", href:
"/weekly/" }` in `src/config.ts` when the first real edition is ready.

## Letterboxd

`scripts/sync-letterboxd.mjs` reads the public feed for `infi56` and merges it
into `data/letterboxd.json`. Letterboxd only publishes the latest ~50 entries,
so the script keeps everything already saved. The GitHub Action
`sync-letterboxd.yml` runs it daily, commits any change, and triggers a deploy.
Run it by hand with `npm run sync:letterboxd`.

## Export résumé image

For LinkedIn's Featured section, the résumé page can be exported as a PNG:

```sh
npm run build
npm run export:resume   # full résumé, about 3200 x 4700 px
npm run export:hero     # shorter card for the Featured tile, about 3200 x 2200 px
```

The build must run first, because the scripts serve `dist/`. They use
headless Chrome, so Chrome (or Edge) needs to be installed. Output goes to
`exports/pavan-turlapati-resume.png` and `exports/pavan-turlapati-hero.png`.
`exports/` is git-ignored.

The hero export hides panels by position (`:nth-child(n+2)`). If you add or
move panels in the first two columns of the résumé, check the hero image again.

### Social preview image

`public/og-image.png` (1200 x 628) is the image LinkedIn, X and other sites
show when the site is shared. It is the top 1675 px of the hero export, scaled
down. It does not update itself. After a visible change to the résumé header,
stats or first panels, re-export the hero and regenerate it:

```sh
node -e "const s=require('sharp');s('exports/pavan-turlapati-hero.png').extract({left:0,top:0,width:3200,height:1675}).resize(2400,1256).png({compressionLevel:9}).toFile('exports/pavan-turlapati-card.png').then(()=>s('exports/pavan-turlapati-card.png').resize(1200,628).png({compressionLevel:9}).toFile('public/og-image.png'))"
```

`sharp` comes with Astro. `exports/pavan-turlapati-card.png` is the same crop
at 2400 x 1256, used as the LinkedIn Featured card. After a change, LinkedIn
caches the old preview. Refresh it with the Post Inspector at
<https://www.linkedin.com/post-inspector/>.

## Settings you may want to change

`src/config.ts` holds the name, tagline, email, social links, navigation and
the Vedanta URL. The résumé is a single web page, `src/pages/resume/index.astro`,
styled by `src/styles/resume.css`. There is no PDF to keep in sync; use the
browser's Print, then Save as PDF, if someone asks for one.

## robots.txt

`public/robots.txt` blocks AI training crawlers (`GPTBot`, `ClaudeBot`,
`anthropic-ai`, `CCBot`, `Google-Extended`, `Applebot-Extended`,
`meta-externalagent`, `Bytespider`). It allows the lookup bots that fetch pages
when someone asks an AI assistant about the site (`ChatGPT-User`,
`Claude-User`, `OAI-SearchBot`, `PerplexityBot`) and normal search engines. The
Vedanta repo has the same policy in `docs/robots.txt`.

## Hosting and DNS

All of this is already set up. It is kept here in case something needs
rebuilding.

- **GitHub repo:** `pavanturlapati/pavanturlapati-site`, `main` branch.
- **GitHub, Settings, Pages:** *Source* is **GitHub Actions**, custom domain
  `pavanturlapati.com`, *Enforce HTTPS* on. With Actions publishing,
  `public/CNAME` is ignored but harmless.
- **Cloudflare DNS** for `pavanturlapati.com`, every record set to
  **DNS only** (grey cloud) so GitHub can issue the certificate:
  - four `A` records on `@`: `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153`;
  - four `AAAA` records on `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
    `2606:50c0:8002::153`, `2606:50c0:8003::153`;
  - a `CNAME` for `www` pointing at `pavanturlapati.github.io` (without the
    repo name);
  - a `CNAME` for `vedanta` pointing at `pavanturlapati.github.io`;
  - a `TXT` record on `@` for Google Search Console verification. Leave it in
    place.
- **Vedanta repo** (`my-journey-through-vedanta`): `docs/CNAME` contains
  `vedanta.pavanturlapati.com`, `mkdocs.yml` has
  `site_url: https://vedanta.pavanturlapati.com/`, footer links are relative to
  the site root (`/about/...`), and its Pages custom domain is set with
  *Enforce HTTPS* on.
- **Google Search Console:** a Domain property for `pavanturlapati.com` covers
  both sites. Submitted sitemaps: `https://pavanturlapati.com/sitemap-index.xml`
  and `https://vedanta.pavanturlapati.com/sitemap.xml`.

Check GitHub's current custom-domain guide if any of the DNS values change.

## Backlog

`TODO.md` is a local backlog. It is listed in `.gitignore`, so it is not
pushed.
