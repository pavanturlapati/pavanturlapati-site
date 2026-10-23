---
title: "A private study site for school science"
description: "A private, login-only study site that turns a school syllabus into lessons, quizzes and a tutor, and shows a parent what has been practised."
date: 2026-10-22
---

## Project name

**Study Companion**: a private website that turns a school science syllabus into short lessons, quizzes, flashcards and a tutor, and shows a parent what has actually been practised. It is invite-only, so there is no public link.

## Objective

I could not help much with the science homework myself. Two problems kept coming up:

- **No proper study material.** All we had was the syllabus, a list of topics with no explanations or practice.
- **No view of practice.** I could not tell which chapters were being worked on, what was hard, or whether any practice had happened at all.

The goals were:

- Turn the syllabus into lessons that cover exactly what the course expects, in the same order and with the same vocabulary.
- Explain each topic the way a mentor would, in plain words.
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

1. **Start from the syllabus.** The syllabus PDF is the source. It sets the scope, the order and the vocabulary, and the assistant generates each lesson from it.
2. **Add real material where it exists.** For some chapters a textbook was available, which allowed more precise, explicit content. Where it was not, the lesson is generated from the syllabus alone. Anything unclear is flagged for me to check rather than guessed.
3. **Organise by Module, Lesson and Section.** Each lesson is a folder of short Markdown files, so adding a lesson means adding a folder.
4. **Practise.** Each lesson has a multiple-choice quiz, and every answer comes with an explanation of why. Each question is tied to the section it tests. There are also flashcards and two small interactive tools.
5. **Ask.** A tutor answers questions using only the text of the current lesson.
6. **Review.** A dashboard shows which sections are marked as read, quiz results and weak spots. Access is approved or revoked from an admin page.

Two design choices mattered most:

- **The syllabus is the source of truth.** Everything traces back to it, so the lessons stay inside what the course expects.
- **Questions map to sections.** That one link is what lets the dashboard say "this section keeps getting missed" instead of only showing a score.

## Benefits

- **Progress is visible.** I no longer have to ask "what did you study?" I can see what was read, what was attempted and where the trouble is.
- **It follows the course.** The content is built from the syllabus, so nothing off-topic gets in.
- **It is private.** Pages need an approved login and are hidden from search engines.
- **It grows over time.** A new lesson is a new folder, generated from the next part of the syllabus.
- **It stays up.** A scheduled job pings the database every three days, because the free database tier pauses when idle.

## Limitations

- **One lesson so far.** Only the first lesson of one module is written.
- **The content needs checking.** I am not a science expert, so I can only catch errors in the generated explanations by comparing them with the source material. Unclear spots are flagged for that reason.
- **Depth varies.** Lessons backed by a textbook chapter are more detailed than those generated from the syllabus alone.
- **Quiz format is a guess.** I do not yet know how the real tests are set out, so for now they are multiple choice.
- **Progress is a signal, not proof.** "Marked as read" and quiz scores show effort, not understanding.
- **The tutor can be wrong.** It is told to stay within the lesson, but it is still an AI.
- **Not for sharing.** Some of the source material is copyrighted, so the site and its source are kept private.

## Conclusion

The tools were the easy part. What made this useful was treating the syllabus as the source and connecting every quiz question back to a section, so progress means something. Next I will add the remaining lessons from the syllabus, and consider a simple tracker for the claim, evidence and reasoning format the course teaches.
