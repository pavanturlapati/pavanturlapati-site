# pt-site

Personal website for Pavan Turlapati: articles, short notes, a curated link
feed, a Letterboxd film log, and a résumé. Built with [Astro](https://astro.build)
as a fully static site, hosted free on GitHub Pages.

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
npm run export:hero     # shorter card for the Featured tile, about 3200 x 2100 px
```

The build must run first, because the scripts serve `dist/`. They use
headless Chrome, so Chrome (or Edge) needs to be installed. Output goes to
`exports/pavan-turlapati-resume.png` and `exports/pavan-turlapati-hero.png`.
`exports/` is git-ignored.

## Settings you may want to change

`src/config.ts` holds the name, tagline, email, social links, navigation and
the Vedanta URL. The résumé is a single web page, `src/pages/resume/index.astro`,
styled by `src/styles/resume.css`. There is no PDF to keep in sync; use the
browser's Print, then Save as PDF, if someone asks for one.

## One-time setup

1. **Create a GitHub repo** and push this folder as its root (`main` branch).
2. **GitHub, Settings, Pages:** set *Source* to **GitHub Actions**.
3. **GitHub, Settings, Pages, Custom domain:** enter `pavanturlapati.com`
   (`public/CNAME` already contains it) and enable *Enforce HTTPS* once the
   certificate is issued.
4. **Cloudflare DNS** for `pavanturlapati.com`, with the proxy set to
   **DNS only** (grey cloud) so GitHub can issue the certificate:
   - four `A` records on the apex, `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`, or one `CNAME` on the apex pointing
     at `<your-github-username>.github.io` (Cloudflare flattens it);
   - a `CNAME` for `www` pointing at `<your-github-username>.github.io`.
5. Check GitHub's current custom-domain guide if any of the above has changed.

### Vedanta notes on a subdomain

The notes live in the separate `my-journey-through-vedanta` repo (MkDocs).

1. In that repo add `docs/CNAME` containing `vedanta.pavanturlapati.com`.
2. In `mkdocs.yml` add `site_url: https://vedanta.pavanturlapati.com/` and
   change the footer links from `/my-journey-through-vedanta/about/...` to
   `/about/...`.
3. In that repo's Settings, Pages, set the custom domain.
4. In Cloudflare DNS add a `CNAME` `vedanta` pointing at
   `pavanturlapati.github.io` (DNS only).
