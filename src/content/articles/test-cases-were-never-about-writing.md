---
title: "Test Cases Were Never About Writing. AI Changes the Format, Not the Skill."
description: "AI can now write and run test cases. So what does the tester still bring? Why curiosity, product understanding, and user empathy remain the core of testing, starting from a simple textbox."
date: 2026-10-10
tags: ["quality"]
linkedin: "https://www.linkedin.com/feed/update/urn:li:share:7514761416868945920/"
---

My first technical article as a testing engineer was about how to test a textbox.

Positive cases. Negative cases. Different data combinations. Edge cases.

Looking back, that article was never really about a textbox. It was about learning to think: *What is this field supposed to do? Who is going to use it? What could go wrong? What does "correct" even mean here?*

Years later, AI can generate test cases, execute them, and report product status automatically. That made me pause and ask:

**What does "writing a test case" mean in the AI era? Do we even need to write them? And what happens to the skill?**

My conclusion is this: **the format is changing, and it should change. The skill is not.**

## Writing test cases was never a test of English

Nobody was ever a good tester because of their grammar or the tidiness of their step-by-step documents.

Writing test cases was the *last* step of a much bigger process:

- Understanding the product
- Understanding the requirements, including the ones nobody wrote down
- Understanding the timelines and what is realistic to test
- Understanding the users and how they will really behave
- Deciding what "quality" means for *this* product, at *this* moment
- And only then, expressing all of that in a format everyone could understand: developers, product owners, and other testers

The test case was the container. The thinking was the value.

## Back to the textbox

Say we need to test an email field. AI can generate hundreds of inputs in seconds: valid formats, invalid formats, long strings, special characters, empty values, spaces.

That's useful. But it isn't testing yet. A good tester asks the questions no prompt can fully anticipate:

- Is this field mandatory? Who decided that?
- Will our users be typing this on a phone, in a hurry, with autocorrect on?
- What happens when the validation passes on screen but the API receives something else?
- Is the error message actually helpful to a worried customer?
- Does the business care more about blocking bad emails or about not losing a signup?

AI can produce combinations. **Only someone who understands the product, the user, and the risk can decide which of those combinations matter.**

Providing context is one essential skill. Validating assumptions, defining expected behavior, and evaluating evidence are equally important.

## What changes: the format

This part I'm happy to embrace. The traditional format of "Step 1, Step 2, Expected Result" was one way to communicate intent. It doesn't have to be the only one.

In the AI era, the useful artifact might be:

- Clear acceptance criteria
- Business rules and constraints
- Examples of good and bad behavior
- Risk-based scenarios
- An executable specification or an automated check
- Evidence showing what actually happened

In regulated or safety-critical products, detailed test cases and traceability will remain essential. In other places, a well-defined statement of intent may be enough for AI to generate and run the tests.

The goal is the same as it always was: express quality expectations in a form that people *and now machines* can understand, challenge, and act on.

## What doesn't change: the human

This is the part I feel most strongly about. Some things AI doesn't replace, because they are not tasks. They are qualities of the person:

**Curiosity.** The instinct to ask "what if?" and "why does it work this way?" AI can propose questions we haven't considered; the tester must assess which ones matter and whether the answers are trustworthy.

**Understanding the product.** Knowing what the product is for, what the business is trying to achieve, and which parts are fragile, not from documentation, but from living with it.

**Understanding the user.** Real users are impatient, distracted, and inventive. Empathy for them is what separates "it works as specified" from "it works for people."

**A definition of quality.** Quality is not "all tests passed." It's a judgment about what matters, to whom, and what level of risk is acceptable right now. AI can inform that judgment, but it can't own it.

**Problem solving and innovation.** When something unexpected happens, or when a new kind of product needs a new way of testing, someone has to figure it out. People bring context, judgment, and accountability to unfamiliar problems, often working alongside AI to explore them.

## So what is the skill now?

I would put it this way:

> The skill of writing test cases is the skill of turning *understanding* into *clarity*.

In the past, that clarity went into a spreadsheet. Today it may go into a prompt, a specification, or a set of acceptance criteria that AI turns into tests. Tomorrow it will be something else.

The tester who understands the product and the user will do well in any of those formats. The tester who only knew how to fill in a template will struggle, but they would have struggled before too, because the template was never the point.

And AI becomes a powerful assistant for the first kind of tester: faster test generation, wider coverage, quicker analysis, less repetitive work. That frees time for what only humans do: asking better questions, spotting what's missing, challenging assumptions, and deciding whether we're ready to ship.

## My takeaway

If I were starting my testing career today, I would still learn positive and negative testing, boundary values, and equivalence partitioning. I would learn to work with AI and review its output as critically as I'd review a colleague's work.

But above all, I would protect the things that make a tester a tester: **curiosity, product understanding, empathy for the user, and a clear view of what quality means.**

My first article was about testing a textbox. Today I think it was really about the skill of thinking, and that is the one thing AI isn't replacing.

**What do you think? As the format of testing changes, which human qualities do you believe matter most?**

**— Pavan Turlapati**
