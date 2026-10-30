---
title: "Bobo and the Thirsty Flower: from a 15-second experiment to a one-minute story"
description: "My next AI-assisted animation: a one-minute story about Bobo and Little Star helping a thirsty flower, built with Blender, Python and OpenAI voices."
date: 2026-10-30
image: "/projects/bobo-and-the-thirsty-flower/ending.png"
---

## Project name

**Bobo and the Thirsty Flower**: a 60-second animated story in which Bobo and Little Star discover a drooping flower, give it water, wait for it to recover, and welcome a butterfly to the garden.

[Watch the video on YouTube](https://youtu.be/5C7E0lRaI4w).

<iframe
  src="https://www.youtube-nocookie.com/embed/5C7E0lRaI4w"
  title="Bobo and the Thirsty Flower — one-minute animated story"
  width="960"
  height="540"
  style="width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0;"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>

![Bobo and Little Star beside the recovered flower, with a butterfly resting on its petals.](/projects/bobo-and-the-thirsty-flower/ending.png)

## Objective

I have always wanted to make videos and bring the stories in my head to life. My first animation, [The Little Robot and the Lost Star](/projects/little-robot-and-the-lost-star/), was a 15-second experiment. This project was the next baby step: telling a complete story in one minute while keeping the same characters and visual style.

The story itself is simple. A flower needs help. Bobo and Little Star water it, wait patiently, and enjoy seeing it bloom. I wanted the actions and emotions to be understandable to preschool children even without relying entirely on dialogue.

The bigger learning challenge was continuity. Could the characters feel like friends interacting? Could a smile, a glance, a small movement, or a pause make the story clearer? And could I bring four separately reviewed sections together without making the episode feel like four disconnected clips?

## Tools

| Tool | How I used it |
| --- | --- |
| **ChatGPT** | Discussing the story, developing animation briefs, reviewing the progression, and turning feedback into focused changes. |
| **Codex** | Inspecting the existing project, writing and refining Python scripts, running Blender and FFmpeg, checking renders, and preparing GitHub branches and draft pull requests. |
| **Blender 5.4** | Arranging the 2D artwork, animating the characters and props, managing the camera and full timeline, and rendering the final frames with EEVEE. |
| **Python** | Building the scene, calculating movement, placing keyframes, processing dialogue timing, generating flower in-betweens, synthesizing music and effects, and automating checks. |
| **Pillow and resvg-py** | Preparing review images and contact sheets, and rasterizing SVG prop artwork into transparent PNGs. |
| **OpenAI Speech API** | Creating the approved character voices: Marin for Bobo and Shimmer for Little Star. Approved takes were cached and reused during later animation passes. |
| **FFmpeg and FFprobe** | Combining the rendered frames and approved audio into MP4, and checking codecs, frame timing, duration, decoding, and audio levels. |
| **GitHub** | Keeping a shared source history, isolating changes in branches, and reviewing each pass through draft pull requests. |
| **OpenAI image generation** | Creating a separate YouTube thumbnail using a finished episode frame as the character and garden reference. |
| **YouTube** | Sharing the completed episode, with an English subtitle file prepared from the dialogue timing. |

The original Bobo, Little Star, and garden artwork came from the first project, where I used Claude to create PNG and SVG assets. I reused those established designs here. The new episode props and flower poses were prepared through the Python/SVG workflow rather than regenerating the characters for each shot.

## Approach

### 1. Start with a small, readable story

I divided the minute into four 15-second sections, each with one clear purpose:

| Time | Story beat |
| --- | --- |
| **0–15 seconds** | Bobo meets Little Star, and they discover the drooping flower. |
| **15–30 seconds** | They notice the dry soil, fetch a watering can, and water the flower. |
| **30–45 seconds** | They wait, then notice the flower gradually lifting and opening. |
| **45–60 seconds** | A butterfly arrives and lands; Bobo waves goodbye while Star adds a cheerful finish. |

This gave me manageable pieces to review without losing sight of the complete episode. Although I reviewed short sections, the animation remained one continuous Blender timeline.

### 2. Reuse the artwork as an animated cutout scene

The characters are layered 2D cutouts inside Blender, rather than fully modelled 3D characters. Transparent PNGs sit on planes, with separate layers for parts such as arms, legs, mouths, and expressions.

Python scripts create the scene and animate those layers. Parent objects act as simple rig controls, so the whole character can move while individual parts rotate or change expression. An orthographic camera keeps the established flat, illustrated look.

Reusing the same artwork helped preserve the characters' proportions, colours, and identity across the episode. It also made the project repeatable: I could rebuild the scene from its script and assets instead of recreating the arrangement manually.

### 3. Let the approved dialogue guide the timing

I kept the dialogue short: 12 lines across the minute. Once the voices were approved, their actual start and end times were recorded in a timing file.

The animation uses those timestamps rather than guessed speech windows. Mouth movement follows speech loudness and is gated to the relevant character's dialogue. This is a simple speaking indication, not detailed lip sync for individual speech sounds.

One early review exposed a storytelling problem: when Star greeted Bobo, the animation put too much emphasis on Bobo. Refining that moment meant making Star's speech visible, making Bobo listen, and giving both characters a more joyful greeting. It was a useful reminder that correct timing alone does not make an interaction readable.

### 4. Give the physical actions clear connections

The watering sequence needed more than moving a can across the screen. Bobo had to bend toward it, pick it up, carry it, raise it, pour, and put it down.

The script attaches the held can to the arm and calculates the relationship between the hand, handle, and spout. Water droplets travel from the spout toward the soil, while the dry-soil layer transitions to a moist one.

During refinement, falling droplets were made to keep the position from which they were emitted. Otherwise, lowering the can could incorrectly pull droplets that were already in the air along with it.

These small technical relationships helped the action read as one connected sequence.

### 5. Make the flower recover gradually

The flower's recovery is the emotional centre of the story. It needed to feel gradual, with enough time for the characters and the viewer to notice it.

The existing artwork included 25 flower poses, from drooping to upright and open. Switching between those poses was too visibly stepped. I reused the same SVG artwork generator to produce 143 additional intermediate poses, interpolating the stem, leaf positions, flower-head angle, petal shape, and colour.

Only one flower pose is visible at a time. This avoids the doubled outlines that can appear when two different poses are simply faded over one another.

Bobo and Star's reactions were then timed after the recovery had visibly begun: curiosity first, recognition next, and happiness afterward. I also replaced a distracting movement around the flower with a quieter nearby hover so the flower could remain the focus.

### 6. Review acting, not just movement

A surprising amount of the work was in expressions and small gestures:

- Making Bobo's waiting expression different from his delighted smile.
- Showing that one character is speaking while the other listens.
- Making waves feel motivated by greeting a friend or saying goodbye.
- Keeping Star lively through restrained floating, tilting, and bouncing.
- Avoiding arm overlaps, awkward cropping, or movements that hide the important action.

For the finale, the butterfly's first resting pose blended into the pink petals. A small adjustment to the last part of its approach placed it on an upper petal, with more open wings and its body visible against the sky. Bobo's goodbye was refined into two clear, gentle waving motions, followed by lowering his arm before the ending.

The final composition settles into a short still hold, rather than cutting off a movement halfway through.

### 7. Keep sound separate from animation revisions

The character voices were generated using OpenAI. The background music and sound effects were synthesized locally through Python scripts; they were not generated by an AI music service.

The mix combines dialogue, music, and effects. Music is reduced under dialogue using a timed ducking envelope. After the voices and mix were approved, the later visual passes reused them instead of repeatedly changing the sound.

Keeping the pieces separate made iteration easier. A visual correction did not require another voice-generation request, and a review render could use the corresponding section of the existing full-episode mix.

### 8. Use short review renders and preserve approved work

I reviewed each section as a separate 960×540, 24 FPS clip with its corresponding audio. Representative stills and contact sheets made it easier to inspect expressions, overlap, landing positions, and transitions.

Each pass had a focused purpose. Once a section was approved, the next pass was expected to preserve it. GitHub branches and draft pull requests made those changes easier to track, while scene-state comparisons checked whether earlier animation had changed unexpectedly.

The final production work started from the integrated version containing all four approved sections, rather than assuming the main branch already contained every approved change.

### 9. Render and validate the complete episode

For the master, I rendered the full Blender timeline continuously at **1920×1080, 24 FPS**: 1,440 frames for 60 seconds. The native frame render took approximately 27 minutes on my local setup.

FFmpeg combined those frames with the approved full audio mix into an H.264 MP4 with AAC audio. The final video was not made by upscaling the smaller review clips or stitching their MP4s together.

The checks included:

- Comparing all 1,440 evaluated animation frames against the approved scene.
- Inspecting native frames around the 15-, 30-, and 45-second boundaries.
- Checking for missing assets, black frames, missing frames, and irregular video timestamps.
- Decoding the complete MP4 and verifying the video and audio streams.
- Confirming that the encoded audio matched the approved mix.
- Checking audio peaks, dialogue/background levels, silence, and the ending fade.
- Confirming that the final hold contained all four story elements and no unfinished gesture.

The final master is **60 seconds, native Full HD, and approximately 9.35 MB**. The checks found no black frames, missing video timestamps, or clipped audio samples. The audio measurements support technical review, but listening and judging the pacing remain human decisions.

### 10. Prepare the video for sharing

I prepared an English SRT subtitle file from the approved dialogue timestamps, so the captions follow the actual lines rather than a fresh transcription guess.

I also created a separate YouTube thumbnail using a finished frame as the visual reference, with a larger composition and readable episode title. That thumbnail work did not change the animation itself.

## What I learned

Moving from 15 seconds to a minute was more than making a longer video. It meant keeping the story, characters, props, expressions, and sound consistent across several connected actions.

The hardest parts were often small. A character can move without seeming to notice anything. A smile can arrive too early. A butterfly can reach the right coordinates but still look as though it is floating above the flower. A wave can be technically animated but too subtle to read.

I found it useful to describe feedback in observable terms: who should be speaking, where a character should look, when an expression should change, or which part of a gesture needs to finish. That gave the AI coding assistant something concrete to implement and gave me something concrete to review.

The other useful lesson was to preserve what already worked. Short review clips, saved versions, separate audio tracks, and checks against approved animation helped prevent each improvement from becoming a reason to rebuild everything.

AI helped with planning, code, voices, review support, and the thumbnail. I still had to choose the story, judge the results, ask for changes, and decide when a section was ready to move forward.

## Limitations

- This remains a learning project using simple 2D cutout rigs, not a fully articulated character-animation system.
- Some eyes and facial details are baked into PNG layers. Gaze and emotion therefore depend partly on whole-layer shifts, body tilt, and compatible mouth overlays.
- Mouth animation is driven by speech amplitude rather than phonemes. Some approved speaking moments rely more on body movement than a separate animated mouth.
- Some approved poses retain minor overlaps, including Bobo's pouring arm partially covering an eye, and a visible mirrored turn while carrying the can.
- The existing water, footstep, and butterfly effects have small timing differences from the refined animation. I preserved the approved mix for the master rather than silently introducing another sound pass.
- Automated validation checks structure and consistency. It cannot decide whether the story feels warm, the pause feels right, or the characters feel like friends.

## Conclusion

This is another small step toward making the stories in my head something I can watch and share. I now have a complete one-minute episode, a more repeatable workflow, and a better understanding of how much storytelling happens in a glance, a pause, or a simple wave.

There is still plenty to improve. For me, the rewarding part is learning how the pieces fit together—and finishing a story before starting the next one.

[Watch Bobo and the Thirsty Flower on YouTube](https://youtu.be/5C7E0lRaI4w).

The voices of Bobo and Little Star are AI-generated using OpenAI.
