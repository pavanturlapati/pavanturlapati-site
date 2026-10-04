---
title: "OpenAI computer use: I let an AI agent run my Jira tests in a real browser"
description: "A one-day experiment with OpenAI's computer-use agent and GPT-6.1 Sol: plain-English tests from Jira, run with no browser or infrastructure of mine, with screenshots as proof."
date: 2026-10-03
---

## Project name

**Jira Computer-Use Test Runner**: a proof of concept that reads plain-English test cases from Jira, hands them to an OpenAI agent that drives a real browser, and attaches an HTML report with a screenshot of every step back to Jira. The code is public: [github.com/pavanturlapati/openai-computeruse](https://github.com/pavanturlapati/openai-computeruse).

OpenAI now has an agent platform where you give a model a task and it works in a browser *on OpenAI's side*, clicking, typing and looking at the page the way a person would. I had not tried it yet, so I spent a day on it. I wanted to know whether it could do the kind of checks I normally write in Playwright, only from sentences instead of code.

## Objective

I use Playwright, and it is great, but every test is code that has to be written and maintained, and every run needs a browser and somewhere to run it. The question for this experiment was how far an agent could get when a test is only a numbered list of English steps, kept in Jira where the team already works. The goals were:

- Test cases stay in Jira, written in plain English, with no selectors or scripts.
- No browser, driver or server for me to set up or look after.
- A screenshot for every step, so I can see that it really ran and did not just claim to.
- The evidence (an HTML and a JSON report) ends up on a Jira issue without manual work.
- Try **GPT-6.1 Sol**, which OpenAI describes as near-Astra performance at a lower cost, and see if it holds up for computer use.
- No URLs, credentials or keys in the code. Everything comes from one config file.

## Tech stack

- **Jira Cloud REST API (v3):** a JQL search to fetch the tests, and calls to create the execution issue, attach files, add a comment and set labels.
- **OpenAI Agents API with the [computer use tool](https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use):** the agent works in a browser hosted by OpenAI, so there is nothing to install. The API is in beta.
- **Model: [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol).** OpenAI positions it as near-Astra performance for complex coding, computer use and professional work at a lower cost: $2 in and $10 out per million tokens, against $10 and $50 for GPT-6 Astra. I took that as a reason to try it first.
- **Node.js** (plain ES modules), with the official `openai` package and `dotenv`. No test framework and no browser driver.
- **Target site:** [the-internet.herokuapp.com/login](https://the-internet.herokuapp.com/login), a public demo site for test automation, with its published demo credentials.
- **Built with:** an AI coding assistant.

## Approach

1. **Write the tests in Jira.** Each test is an issue with a label and a numbered list in the description. Each line is one step, for example: *Verify the page shows the message "You logged into a secure area!"*.
2. **Fetch.** A JQL query pulls the tests into a local `tests.json`. The Jira description format is converted to plain steps.
3. **Run.** Each test gets its own browser session. The steps go to the agent one at a time, and it answers each with a pass or fail and a short note on what it saw.
4. **Capture.** The screenshots the agent takes during a step are saved and tied to that step.
5. **Report.** The run writes `report.json` and a self-contained `report.html` with the screenshots embedded, so the file can be opened or emailed on its own.
6. **Write back.** The two files are attached to a Jira execution issue, with a summary comment and a passed or failed label.

Three design choices made the biggest difference:

- **One step per message.** Sending the whole test at once makes it hard to say which screenshot belongs to which step. Sending one step at a time gives a clean step-to-screenshot mapping and a precise place where a test fails.
- **A site allowlist.** The browser asks for approval before it opens a new site. The POC approves only the sites listed in the config and denies the rest.
- **Credentials are used only for approved sites.** The agent sometimes asks for a sign-in instead of typing the values itself. The runner answers only if the site is on the allowlist, and it never writes the values to the logs.

### What it produced

Two sample tests ran against the public demo login page: a valid login, and a wrong password. Both passed, with all six steps verified. Each step has a screenshot and the agent's own words on what it saw. This is the page the agent was looking at when it passed the wrong-password test:

![The demo login page after a wrong password, showing a red "Your password is invalid!" banner](/projects/jira-computer-use-test-runner/screenshots/KAN-7-step3.jpg)

You can open the real artifacts from that run:

- [report.html](/projects/jira-computer-use-test-runner/report.html): the full report, with the screenshots embedded.
- [report.json](/projects/jira-computer-use-test-runner/report.json): the same results as data, with the steps, notes and timings.
- [tests.json](/projects/jira-computer-use-test-runner/tests.json): the two test cases exactly as they were fetched from Jira.

I removed my Jira site name and the OpenAI session IDs from these files before publishing them. Nothing else was changed. The Jira links in them point to a placeholder site, so they will not open anything.

## Benefits

- **It really ran.** This is what I liked most. The screenshots are proof: you can see the page at each step, the typed login, the green success banner and the red error. I did not have to take the agent's word for it.
- **Zero infrastructure.** No browser to install, no driver to match, no machine to keep up. It was an API key and a Node script.
- **Low effort to write a test.** The two sample tests are three plain sentences each. There is no page object or locator to maintain.
- **GPT-6.1 Sol was enough.** On this small task the cheaper model completed the steps and checked the results correctly. That is a small sample, and I did not run the same tests on Astra, so I cannot say how close the two are, only that Sol worked.
- **Results where the team already looks.** The report is attached to a Jira issue, with the outcome in the summary, a comment and a label.
- **Nothing sensitive in the repo.** All URLs, tokens and test data live in a gitignored `.env` file. The repo has only an example file with placeholders, and I scanned every tracked file and the git history for the real values before publishing it.

## Limitations

- **It is not a replacement for Playwright.** The verdicts are the model's judgement from what it sees on screen, so results can vary from run to run. I would not use this alone as a release gate. It looks better suited to exploratory checks, smoke tests and drafting tests quickly.
- **It is slow.** The two tests took about four minutes in total, roughly two minutes each for three short steps. A Playwright test of the same flow takes seconds.
- **It was flaky.** In my runs a test sometimes failed on step 1 with a navigation timeout, before any screenshot was taken, and then passed when I re-ran it unchanged. I treat that as a hosted-browser flake, not a test failure, but the POC has no retry yet, so a flake shows up as a failed run.
- **Public sites only.** The browser runs in OpenAI's environment, so it cannot reach `localhost` or an internal site.
- **Test credentials sit in the Jira text.** That is fine for a public demo account, but not for real accounts. Real credentials need a separate secret store.
- **Jira has no Pass/Fail field on standard issues.** The result is recorded with a summary suffix, a comment and labels. A workflow transition is supported but needs your board's status names.
- **I have not measured cost per run.** The model prices above are list prices, and the report does not yet show token usage.
- **The API is in beta,** so model names and response shapes may change.

## Conclusion

I came in curious and left impressed. An agent opened a real browser I never had to set up, ran steps I had written as sentences in Jira, and handed back screenshots that showed it had done the work. GPT-6.1 Sol was good enough for it, at a lower price than Astra. It is slower and less predictable than Playwright, so I see it as a new tool alongside it, not a replacement. Next I want to add an optional retry for the navigation flake, show token usage and cost in the report, and try a longer flow than a login.
