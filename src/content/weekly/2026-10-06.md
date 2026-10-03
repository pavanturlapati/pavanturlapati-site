---
title: "Weekly Mashup: Oct 6, 2026"
description: "Sample edition. AI agents and desktop access, a model-selection guide, DoorDash's restaurant OS, and Playwright test locks."
date: 2026-10-06
draft: true
---

## The big three

1. **Apple is tightening macOS "Full Disk Access"** because AI agents raise the risk of broad access to your files and messages.
2. **OpenAI published a practical guide to choosing between its GPT-6 models**, including how caching and reasoning level change cost.
3. **DoorDash launched DashOS**, a single layer over its ordering, loyalty, reservations and marketing tools for restaurants.

## AI

### Apple tightens Full Disk Access as AI agents get more capable

Apple said it will add new controls around Full Disk Access on macOS. The setting was designed so backups work properly, but Apple says AI agents have raised the risks of that level of access. Under the new controls, an app will need "very explicit user action" before it gets that access. The announcement follows an Inc. columnist's claim that Meta's Muse app on Mac read his private messages, which Meta disputed, and a Wired report of a flaw in the ChatGPT Mac app that could have exposed sensitive data.

**Why it matters:** desktop agents are only useful if they can see your files, and that is exactly what makes them risky. Expect permission design to become part of how agents are tested and trusted.

*Source: [TechCrunch](https://techcrunch.com/2026/10/02/apple-says-its-tightening-macos-full-disk-access-controls-due-to-new-risks-from-ai-agents/) · 3 min read · Oct 2*

### OpenAI's guide to picking a GPT-6 model

OpenAI's guide describes three models: GPT-6 Astra for the hardest reasoning, GPT-6.1 Sol for complex coding, research and computer use, and GPT-6 Luna for focused, repeated tasks at scale. It also says to choose a reasoning level (low, medium or high) based on the task, and to reuse shared context through prompt caching, which OpenAI says makes cached input tokens up to 95% cheaper than uncached ones, depending on the model. For computer use, it points to Playwright for browsers.

**Why it matters:** the cost and quality of AI work now depends as much on choosing the right model and effort level as on the prompt itself.

*Source: [OpenAI](https://openai.com/index/practical-guide-building-gpt-6) · 8 min read · Oct 2*

## QSR

### DoorDash launches DashOS for restaurants

DoorDash introduced DashOS, which ties together its marketplace, direct ordering, reservations, loyalty, guest management and marketing tools, according to a press release from its Dash Forward event. DoorDash says it works with existing systems and lists integrations including Clover from Fiserv, Qu, Checkmate, Chowly, Deliverect, Stream and Urban Piper. DoorDash claims its AI-driven recommendations could increase reservations by up to 15%. That figure is DoorDash's own claim, not an independent result.

**Why it matters:** more restaurant technology is moving toward one connected customer view across channels, which raises the stakes for integration quality.

*Source: [Restaurant Dive](https://www.restaurantdive.com/news/door-dash-dashos-ai-tool-rewards/831793/) · 3 min read · Oct 1*

## Testing

### Playwright 1.63 adds test locks

Playwright 1.63 lets a test declare a named lock. Tests that share a lock name never run at the same time, across files, workers and projects, while everything else still runs in parallel. That helps tests that touch a shared resource, such as an external service or a global account setting. The release also adds a visible-only locator and finding elements across frames without locating the iframe first. This release is from Sept 4, so it's a catch-up item, not this week's news.

**Why it matters:** locks are a cleaner answer to flaky tests caused by shared state than limiting everything to a single worker.

*Source: [Playwright release notes](https://github.com/microsoft/playwright/releases/tag/v1.63.0) · 5 min read · Sept 4*

## Takeaway

Agents are gaining access to our machines and our data, and platform owners are starting to draw lines. That is a testing and trust problem as much as a security one.
