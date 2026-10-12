---
title: "Face Greeter: a door that knows you"
description: "A free browser app that recognises you through your webcam and opens an animated door with a spoken, time-aware greeting. Nothing leaves your device."
date: 2026-10-12
---

## Project name

**Face Greeter**: step in front of your webcam and a door slides open with a spoken greeting by name, matched to your local time: good morning, afternoon, evening or night. Try it at [greeter.pavanturlapati.com](https://greeter.pavanturlapati.com/). The code is on [GitHub](https://github.com/pavanturlapati/face-greeter) under the MIT licence.

## Objective

I wanted to build a small, simulated version of face recognition to see how far a plain webcam can go. The goals were:

- Recognise a person and greet them by name, out loud, based on the time of day.
- Let anyone enrol themselves with their own name.
- Keep it private: no account, no server and no stored photos.
- Host it for free so anyone can open it from a link.

## Tech stack

- **App:** TypeScript with [Vite](https://vite.dev). There is no backend.
- **Face detection and matching:** [`@vladmandic/face-api`](https://github.com/vladmandic/face-api), which runs in the browser on TensorFlow.js. The models load from a public CDN.
- **Voice:** the browser's built-in speech synthesis.
- **Storage:** the browser's local storage.
- **Hosting:** Cloudflare Workers static assets, on a subdomain of this site, deployed from GitHub on every push.
- **Tests:** Vitest, for the greeting, head-pose and matching logic.
- **Built with:** an AI coding assistant.

## Approach

1. **Detect.** The webcam feed is scanned about six times a second for a face.
2. **Fingerprint.** Each face is turned into a list of 128 numbers. Two photos of the same person produce lists that are close together.
3. **Enrol.** You type a name and look at the camera while the app saves eight fingerprints. No images are kept.
4. **Match.** A live face is compared with everyone enrolled, and the closest person under a distance threshold wins. The app must see the same person on three frames in a row before it greets them.
5. **Greet.** The door animation opens, the greeting is spoken, and the same person isn't greeted again for 30 seconds.

The enrolment screen also asks you to turn left, right, up and down. Those poses are not saved. They are a joke, and the app admits it at the end.

## Benefits

- **Private by design.** Only your name and the number lists are stored, and only in your own browser. Nothing is uploaded, and other visitors cannot see your data.
- **Free to run.** There is no server to pay for, because the visitor's browser does the work.
- **Easy to try.** It is one link, with no install and no sign-up.
- **Open.** Anyone can read the code and see for themselves what is saved.

## Limitations

- **It is a demo, not security.** It uses an ordinary 2D camera, so a photo of you on a phone screen can fool it. Do not use it to protect anything.
- **It is not Face ID.** Apple's system builds a 3D depth map with an infrared sensor and keeps the data in secure hardware. A webcam has neither, and no software can fully make up for that.
- **Lighting and angle matter.** Poor light or a strongly turned head can make it fail to recognise you.
- **Similar faces can be confused.** The more people enrolled, the higher the chance of a mix-up.
- **Data stays on one browser.** Clearing site data, or using a private window, erases your enrolment, and it does not sync between devices.
- **Voices vary.** The spoken greeting depends on the voices your device provides.

## Conclusion

Most of the work was not the recognition itself, which a library handles well, but the details around it: waiting for the same person on several frames, working out head poses, speaking prompts without the app hearing itself, and being clear about what is stored. The next steps are a simple blink or head-movement check against photos, and trying a real depth camera to see what 3D data adds.
