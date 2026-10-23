---
title: "A private study site built from a school textbook"
description: "A private, login-only study site built from a child's own textbook: lessons, quizzes, a tutor, and a view that shows a parent what has been practised."
date: 2026-10-22
---

## Project name

**Study Companion**: a private website that turns a school science textbook into short lessons, quizzes, flashcards and a tutor, and shows a parent what has actually been practised. It is invite-only, so there is no public link.

## Objective

I could not help much with the science homework myself. Two problems kept coming up:

- **No proper study material.** What was available was the textbook and class notes. An earlier app I built used AI-generated content, and it did not match what the school actually teaches.
- **No view of practice.** I could not tell which chapters were being worked on, what was hard, or whether any practice had happened at all.

The goals were:

- Teach only what the textbook covers, in the same order and with the same vocabulary.
- Explain it the way a mentor would, in plain words.
- Let a parent see which sections have been read and where quiz answers go wrong.
- Keep it private, and make it easy to add the next lesson.

## Tech stack

- **Site:** [Astro](https://astro.build), rendered on the server so every page can check who is logged in.
- **Hosting:** [Cloudflare Workers](https://developers.cloudflare.com/workers/).
- **Login and data:** [Supabase](https://supabase.com), with Google sign-in and per-user database rules.
- **Tutor:** an OpenAI chat model, with a daily question limit.
- **Content:** plain Markdown and JSON files, organised as Module, Lesson, Section.
- **Built with:** an AI coding assistant.

## Approach

1. **Photograph the textbook.** I take photos of the pages. The assistant reads them and writes each section in its own words. Facts and terms come from the book, and anything unclear is flagged for me to check rather than guessed.
2. **Organise by Module, Lesson and Section.** Each lesson is a folder of short Markdown files, so adding a lesson means adding a folder.
3. **Practise.** Each lesson has a multiple-choice quiz, and every answer comes with an explanation of why. Each question is tied to the section it tests. There are also flashcards and two small interactive tools.
4. **Ask.** A tutor answers questions using only the text of the current lesson.
5. **Review.** A dashboard shows which sections are marked as read, quiz results and weak spots. Access is approved or revoked from an admin page.

Two design choices mattered most:

- **The textbook is the source of truth.** Writing from the book, not from what an AI thinks students at that level learn, is what fixed the mismatch with school.
- **Questions map to sections.** That one link is what lets the dashboard say "this section keeps getting missed" instead of only showing a score.

## Benefits

- **Progress is visible.** I no longer have to ask "what did you study?" I can see what was read, what was attempted and where the trouble is.
- **It matches the class.** The content follows the pages actually handed out.
- **It is private.** Pages need an approved login and are hidden from search engines.
- **It grows over time.** A new lesson is a new folder and a new set of photos.
- **It stays up.** A scheduled job pings the database every three days. Without it, the free database tier pauses when idle, which is the most likely reason my earlier app kept going down.

## Limitations

- **One lesson so far.** Only the first lesson of one module is written. The rest depends on more photos.
- **The content needs checking.** I am not a science expert, so I can only catch errors in the AI's explanations by comparing them with the book. Unclear spots are flagged for that reason.
- **Quiz format is a guess.** I do not yet know how the real tests are set out, so for now they are multiple choice.
- **Progress is a signal, not proof.** "Marked as read" and quiz scores show effort, not understanding.
- **The tutor can be wrong.** It is told to stay within the lesson, but it is still an AI.
- **Not for sharing.** The material comes from a copyrighted textbook, so the site and its source are kept private.

## Conclusion

The tools were the easy part. What made this useful was putting the textbook first and connecting every quiz question back to a section, so progress means something. Next I will add the remaining lessons as I get the photos, and consider a simple tracker for the claim, evidence and reasoning format the module teaches.
