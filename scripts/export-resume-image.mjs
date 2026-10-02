#!/usr/bin/env node
/**
 * Exports the résumé poster (/resume/) as a PNG, e.g. for LinkedIn's
 * "Featured" section.
 *
 *   npm run build
 *   npm run export:resume        full résumé
 *   npm run export:hero          shorter card for LinkedIn's Featured tile
 *
 * Output: exports/pavan-turlapati-resume.png
 *         exports/pavan-turlapati-hero.png
 *
 * No npm dependencies: it serves ./dist locally and drives an installed
 * Chrome/Edge through the DevTools protocol using Node's built-in WebSocket
 * (Node 22+). Set CHROME_PATH to use a specific browser.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const hero = process.argv[2] === "hero";
const outFile = join(
  root,
  "exports",
  hero ? "pavan-turlapati-hero.png" : "pavan-turlapati-resume.png",
);

/** Hero card: roughly the 1.91:1 ratio LinkedIn uses for link and media cards. */
const heroCss =
  ".p-grid{grid-template-columns:1fr 1fr!important}" +
  ".p-grid>.p-col:nth-child(1)>.p-panel:nth-child(2){display:none!important}" +
  ".p-grid>.p-col:nth-child(2)>.p-panel:nth-child(2){display:none!important}" +
  ".p-grid>.p-col:nth-child(3){display:none!important}" +
  ".p-row{display:none!important}" +
  ".p-grid{margin-bottom:1rem!important}" +
  ".poster{display:flex!important;flex-direction:column;min-height:838px}" +
  ".poster .p-banner{margin-top:auto!important}";

/** Poster width in CSS pixels, and sharpness multiplier. */
const WIDTH = 1600;
const SCALE = 2;

const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chromePath = candidates.find((path) => existsSync(path));
if (!chromePath) {
  console.error("No Chrome or Edge found. Set CHROME_PATH to its location.");
  process.exit(1);
}
if (!existsSync(join(distDir, "resume", "index.html"))) {
  console.error("dist/ is missing. Run `npm run build` first.");
  process.exit(1);
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".js": "text/javascript",
};

const server = createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (path.endsWith("/") || path.endsWith("\\")) path = join(path, "index.html");
  try {
    const body = await readFile(join(distDir, path));
    res.writeHead(200, {
      "Content-Type": types[extname(path)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const url = `http://127.0.0.1:${server.address().port}/resume/`;

const profileDir = await mkdtemp(join(tmpdir(), "pt-resume-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function waitFor(check, what, tries = 100) {
  for (let i = 0; i < tries; i++) {
    const value = await check();
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${what}`);
}

async function cleanup() {
  chrome.kill();
  server.close();
  // Chrome can hold files briefly on Windows; failing to delete is harmless.
  await sleep(300);
  await rm(profileDir, { recursive: true, force: true }).catch(() => {});
}

try {
  // With --remote-debugging-port=0, Chrome writes the chosen port to a file.
  const port = await waitFor(async () => {
    try {
      const text = await readFile(join(profileDir, "DevToolsActivePort"), "utf8");
      return text.split("\n")[0].trim() || null;
    } catch {
      return null;
    }
  }, "Chrome to start");

  const page = await waitFor(async () => {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      return targets.find((target) => target.type === "page") ?? null;
    } catch {
      return null;
    }
  }, "a browser tab");

  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((done, fail) => {
    socket.addEventListener("open", done, { once: true });
    socket.addEventListener("error", fail, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { done, fail } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) fail(new Error(message.error.message));
      else done(message.result);
    } else if (message.method && listeners.has(message.method)) {
      listeners.get(message.method)(message.params);
    }
  });

  const send = (method, params = {}) =>
    new Promise((done, fail) => {
      const id = ++nextId;
      pending.set(id, { done, fail });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) =>
    new Promise((done) => listeners.set(method, done));

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: WIDTH,
    height: 1000,
    deviceScaleFactor: SCALE,
    mobile: false,
  });

  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;

  // Make the poster fill the viewport edge to edge, with square corners.
  await send("Runtime.evaluate", {
    expression: `(() => {
      const style = document.createElement("style");
      style.textContent =
        ".shell-wide{max-width:none!important;padding:0!important}" +
        "main{padding:0!important}.poster{border-radius:0!important}" +
        ${JSON.stringify(hero ? heroCss : "")};
      document.head.append(style);
      return document.fonts.ready.then(() => true);
    })()`,
    awaitPromise: true,
  });
  await sleep(300);

  const { result } = await send("Runtime.evaluate", {
    expression: `(() => {
      const r = document.querySelector(".poster").getBoundingClientRect();
      return JSON.stringify({
        x: r.left + scrollX, y: r.top + scrollY,
        width: r.width, height: r.height,
      });
    })()`,
    returnByValue: true,
  });
  const clip = JSON.parse(result.value);

  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { ...clip, scale: 1 },
  });

  await mkdir(dirname(outFile), { recursive: true });
  const png = Buffer.from(shot.data, "base64");
  await writeFile(outFile, png);

  // PNG header stores width and height at bytes 16 and 20.
  console.log(
    `Wrote ${outFile}\n  ${png.readUInt32BE(16)} x ${png.readUInt32BE(20)} px, ` +
      `${(png.length / 1024).toFixed(0)} KB`,
  );
  socket.close();
} finally {
  await cleanup();
}
