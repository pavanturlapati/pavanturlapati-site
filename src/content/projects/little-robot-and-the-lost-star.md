---
title: "The Little Robot and the Lost Star: my first steps in AI-assisted animation"
description: "Turning a story idea into a 15-second cartoon with OpenAI, Claude, Zed and Blender. An early hands-on experiment in making videos with AI."
date: 2026-10-28
linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7521418897565159424/"
image: "/projects/little-robot-and-the-lost-star/ending.png"
---

## Project name

**The Little Robot and the Lost Star**: a 15-second animated story about a little robot helping a lost star find its way back to the sky.

[Watch the video on YouTube](https://youtu.be/KNfL0bkvcYg).

![The little blue robot waves goodbye as the happy star returns to the evening sky.](/projects/little-robot-and-the-lost-star/ending.png)

## Objective

I have always wanted to make videos and bring the stories in my head to life. Animation is one more area I have started exploring through hands-on learning with AI.

For this project, I wanted to take one small idea through the whole process: developing the story, creating the artwork, animating it, adding a voice and publishing the result. Not a polished production, but a first step I could actually finish and learn from.

## Tools

- **OpenAI:** discussing the story idea, developing prompts and generating the robot's replacement voice through the speech API.
- **Claude:** using those prompts to create the PNG and SVG artwork.
- **Zed:** working with an AI coding assistant to prepare assets, write Python scripts and connect the animation and audio steps.
- **Blender:** arranging and animating the 2D artwork, setting up the camera and rendering the frames.
- **FFmpeg:** combining the rendered frames and audio into an MP4, and replacing the voice without re-rendering the video.
- **YouTube:** sharing the result.

## Approach

1. **Start with the idea.** I discussed the story with OpenAI and used that conversation to develop prompts for the visual assets.
2. **Create the artwork.** I took the prompts to Claude and generated PNG and SVG assets for the characters and scenes.
3. **Make the artwork move.** With help from Zed, I prepared the artwork as separate cutout layers and used Python scripts in Blender to animate the robot walking, bending to help the star and waving goodbye.
4. **Build the story.** The star changes from sad to happy, rises into the sky and the background transitions from day to evening. The complete animation runs for 360 frames at 24 frames per second.
5. **Review and improve.** Still-frame checks helped catch rendering problems before exporting the full video. The first voice did not sound right to me, so I replaced it with OpenAI's Cedar voice while keeping the existing music and effects.
6. **Export and share.** I exported a 15-second, 720p MP4 and uploaded the video to YouTube. The editable Blender project is also set up for a future 1080p render.

**The replacement robot voice is AI-generated using OpenAI.**

## What I learned

The interesting part was connecting the tools. A prompt can help create artwork, but that artwork still needs to be prepared for animation. A rendered animation still needs timing, sound and review before it feels like a story.

I also learned why it helps to keep the pieces separate: the artwork, editable Blender project, rendered frames, dialogue, music and effects. When I wanted to change the voice, I could create another version without starting the animation again.

AI helped me move from an idea to something I could watch and share. It did not remove the need to make choices, check the results and improve what was not working.

## Limitations

- This is an early learning project, not a professional animation production.
- The characters are animated 2D cutouts, not fully modelled 3D characters.
- The music and sound effects are synthesized placeholders.
- The mouth animation is driven by speech amplitude, not individual speech sounds. The replacement voice keeps the original speech windows, but the mouth animation has not been regenerated for it, so lip sync is approximate.

## Conclusion

These are baby steps, but they are steps in a direction I have wanted to explore for a long time. I now have a small story on screen and a better understanding of how to make the next one.

[Watch The Little Robot and the Lost Star on YouTube](https://youtu.be/KNfL0bkvcYg).
