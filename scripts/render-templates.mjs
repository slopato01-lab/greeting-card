/**
 * Видео анимированных шаблонов для каталога: public/assets/templates/editor/.
 *
 *   pnpm build && pnpm templates:render
 *
 * Рендерит каждый шаблон из lib/editor/templates.ts тем же движком, что
 * и редактор: открывает служебную страницу /render собранного сайта
 * в Chrome, просит кадр за кадром (window.__renderFrame, шаг 1/30 с)
 * и собирает ffmpeg-ом:
 *
 * - <id>.mp4  — H.264, его играют все браузеры. VP9/WebM проверяли:
 *   на этих плоских кадрах он выходит тяжелее H.264, поэтому не нужен;
 * - <id>.webp — последний кадр, обложка: пока видео грузится и для тех,
 *   у кого в системе выключено движение.
 *
 * В конце видео держится полный кадр HOLD секунд — как в
 * design/пример анимации и дизайна.MP4, — потом всё по кругу.
 *
 * Запускать после правки шаблона, его текстов или стикеров: видео
 * лежат в репозитории, сборка их не перерисовывает.
 * Без зависимостей: Chrome по протоколу DevTools, ffmpeg из системы.
 *
 * Аргументы (08.10.2026):
 *   pnpm templates:render love party       — только эти шаблоны;
 *   pnpm templates:render --preview <папка> — без видео: в папку ложатся
 *     PNG трёх моментов каждого шаблона (середина появления, конец,
 *     «Без анимации») — для сверки с макетом.
 */
import { spawn, spawnSync } from "node:child_process";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "out");
const DEST = resolve(ROOT, "public/assets/templates/editor");
const FPS = 30;
const HOLD = 0.5;
/** 600 × 800 → 480 × 640: карточка каталога не шире 450px. */
const MULTIPLIER = 0.8;
const PORT = 9871;
const DEBUG_PORT = 9334;
const argv = process.argv.slice(2);
const previewAt = argv.indexOf("--preview");
const PREVIEW = previewAt === -1 ? null : resolve(argv[previewAt + 1] ?? "preview");
const ONLY = new Set(
  argv.filter((arg, i) => !arg.startsWith("--") && (previewAt === -1 || i !== previewAt + 1)),
);
const CHROME =
  process.env.CHROME ??
  join(process.env.HOME ?? "", ".cache/ms-playwright/chromium-1228/chrome-linux64/chrome");

if (!existsSync(join(OUT, "render.html"))) {
  console.error("Нет out/render.html — сначала pnpm build.");
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Статический сервер собранного сайта ─────────────────────
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  let file = join(OUT, path);
  if (!file.startsWith(OUT)) {
    res.writeHead(403).end();
    return;
  }
  if (!extname(file)) file += ".html";
  if (!existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

// ── Chrome ──────────────────────────────────────────────────
const profile = mkdtempSync(join(tmpdir(), "render-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore", detached: true },
);

const frames = mkdtempSync(join(tmpdir(), "frames-"));
try {
  let target;
  for (let i = 0; i < 50 && target === undefined; i += 1) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      // Chrome ещё не поднялся.
    }
  }
  if (target === undefined) throw new Error("Chrome не ответил");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    pending.get(m.id)?.(m);
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      id += 1;
      pending.set(id, r);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const res = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails));
    return res.result?.result?.value;
  };

  await send("Page.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/render` });
  for (let i = 0; i < 100 && !(await evaluate("window.__renderReady === true")); i += 1) {
    await sleep(200);
  }
  const templates = await evaluate("window.__renderTemplates");
  if (!Array.isArray(templates)) throw new Error("Страница /render не отдала список шаблонов");

  if (PREVIEW !== null) mkdirSync(PREVIEW, { recursive: true });
  for (const { id: name, duration } of templates) {
    if (ONLY.size > 0 && !ONLY.has(name)) continue;
    if (PREVIEW !== null) {
      for (const [suffix, time] of [
        ["a", duration * 0.25],
        ["b", duration],
      ]) {
        const url = await evaluate(`window.__renderFrame(${JSON.stringify(name)}, ${time}, 1)`);
        writeFileSync(
          join(PREVIEW, `${name}-${suffix}.png`),
          Buffer.from(url.split(",")[1], "base64"),
        );
      }
      console.log(`${name.padEnd(14)} превью`);
      continue;
    }
    const dir = join(frames, name);
    mkdirSync(dir);
    const count = Math.round((duration + HOLD) * FPS);
    for (let i = 0; i < count; i += 1) {
      const url = await evaluate(
        `window.__renderFrame(${JSON.stringify(name)}, ${i / FPS}, ${MULTIPLIER})`,
      );
      writeFileSync(
        join(dir, `${String(i).padStart(4, "0")}.png`),
        Buffer.from(url.split(",")[1], "base64"),
      );
    }
    const input = ["-y", "-v", "error", "-framerate", String(FPS), "-i", join(dir, "%04d.png")];
    const run = (args) => {
      const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
      if (result.status !== 0) throw new Error(`ffmpeg: ${args.at(-1)}`);
    };
    run([
      ...input,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "26",
      "-preset",
      "slow",
      "-movflags",
      "+faststart",
      "-an",
      join(DEST, `${name}.mp4`),
    ]);
    run([
      "-y",
      "-v",
      "error",
      "-i",
      join(dir, `${String(count - 1).padStart(4, "0")}.png`),
      "-quality",
      "82",
      join(DEST, `${name}.webp`),
    ]);
    console.log(`${name.padEnd(10)} ${count} кадров`);
  }
  ws.close();
} finally {
  const exited = new Promise((r) => chrome.once("exit", r));
  try {
    process.kill(-chrome.pid, "SIGTERM");
  } catch {
    chrome.kill();
  }
  await exited;
  server.close();
  for (const dir of [profile, frames]) {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      try {
        rmSync(dir, { recursive: true, force: true });
        break;
      } catch {
        await sleep(100);
      }
    }
  }
}
