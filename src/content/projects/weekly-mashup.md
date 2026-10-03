---
title: "Weekly Mashup: an automated weekly bulletin"
description: "How I built a weekly AI, QSR technology and testing bulletin that writes, publishes and posts itself, for about 40 cents a month."
date: 2026-10-03
---

## Project name

**Weekly Mashup**: a weekly bulletin on AI, restaurant (QSR) technology and software testing. It publishes itself on this site every Tuesday morning and posts a short teaser to LinkedIn. You can read the editions at [/weekly/](/weekly/).

## Objective

I wanted one place to keep up with three topics I care about, without it becoming a second job. The goals were:

- A digest that can be read in under 30 minutes, links included, with a source for every item.
- No manual work in a normal week.
- A LinkedIn post that sends readers to this site instead of replacing it.
- A running cost well under $1 a month.

## Tech stack

- **Site:** [Astro](https://astro.build), a static site generator, hosted free on GitHub Pages.
- **Automation:** GitHub Actions on a weekly schedule, running small Node.js scripts.
- **Sources:** public RSS and Atom feeds from AI labs, tech press, restaurant trade press and engineering blogs.
- **Writing:** Claude (Sonnet 5.5) through the Anthropic API, with structured JSON output.
- **Authentication to the AI:** GitHub's short-lived identity token, exchanged for a short-lived Anthropic token through [workload identity federation](https://platform.claude.com/docs/en/manage-claude/wif-providers/github-actions). No API key is stored anywhere.
- **LinkedIn:** the [Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api), posting as me with a member token.
- **Built with:** an AI coding assistant, in about a day.

## Approach

The pipeline has six stages. Each one is a plain script, so I can run or debug it on its own.

1. **Collect.** Fetch the feeds, keep the last seven days, and drop duplicates. No AI is involved.
2. **Select.** A cheap, short AI call reads only titles and snippets and picks 8 to 10 items, plus the "big three" for the week.
3. **Read.** The script downloads the full text of only the picked articles. Pages that block automated readers fall back to the short feed summary, and the writer is told to say less in that case.
4. **Write.** A second AI call writes the edition from that text. The rules are strict: state only what the article says, attribute company claims, and use only the supplied links.
5. **Check.** Code verifies that every link was in the supplied set, the sections are present and in order, there are enough items, and the LinkedIn text is the right length. If a check fails, nothing is published, and the run retries once.
6. **Publish and post.** The edition is committed and deployed. The script waits until the page is live, uploads a card image and posts to LinkedIn, then records the post link on the edition page.

Three design choices made the biggest difference:

- **Code owns the fixed text.** The edition link and the "AI-generated" label are added by code, not requested from the model. Early on, the model sometimes left the link out, which failed the run.
- **The LinkedIn post is a teaser.** It has a hook, three headlines and a pointer to the full edition. The details, sources and "why it matters" lines live only on the site.
- **It says what it is.** Every edition is labelled AI-generated and published without a human reading it first.

## Benefits

- **No weekly effort.** The schedule, publishing and posting all run without me.
- **Cheap.** A run costs about nine cents, roughly 40 cents a month.
- **No secret to leak for the AI.** The Anthropic access is a short-lived token tied to the repository and branch, so there is no long-lived key to steal.
- **Traceable.** Every item links to its original source, and every run leaves a log and a summary.
- **Safe failure.** If a check fails or LinkedIn is unavailable, the worst case is a missing post, not a wrong one.

## Limitations

- **It can be wrong.** Nobody reads an edition before it goes out. Items summarised from a short feed snippet are the weakest, and the "why it matters" lines are the model's inference, not fact. If something is wrong, I remove it.
- **Some publishers block automated reading,** so a few items rely on a short summary.
- **LinkedIn tokens expire every 60 days** and cannot be refreshed automatically, so that part needs a manual renewal.
- **LinkedIn does not read the page for link cards,** so the card title, description and image have to be supplied.

## Conclusion

The result is a small, boring pipeline that does one job every week. What made it work was keeping each stage simple, letting code check the model's output, and being open with readers about how the edition is made. The next steps are to watch how it behaves over a few weeks, add more testing sources, and tune the selection based on feedback.
