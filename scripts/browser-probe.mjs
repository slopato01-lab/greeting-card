/**
 * Проверка страницы в настоящем Chrome, в реальном времени.
 *
 *   node scripts/browser-probe.mjs <url> [секунд=20] [ширина=1280] [снимки]
 *
 * Открывает страницу, ждёт, печатает текст элемента #probe и, если
 * задано, делает снимки экрана в указанные секунды («2.5,6») — файлы
 * shot-<ширина>-<секунда>.png в папке $SHOT_DIR (по умолчанию текущая).
 *
 * Зачем, если есть `chrome --headless --dump-dom`: у того «виртуальное
 * время», в нём requestAnimationFrame тикает раз в секунду и подвисают
 * асинхронные декодеры картинок. Анимация редактора и приём фото там
 * выглядят сломанными, хотя работают. Здесь время настоящее.
 *
 * Сценарий проверки — обычный <script>, который дописывают в копию
 * собранной страницы (out/probe.html) и который пишет итоги в
 * <pre id="probe"> на documentElement (в body его снесёт гидратация).
 *
 * Без зависимостей: Chrome по протоколу DevTools, WebSocket из Node 22.
 * PROBE_WEBGL=1 включает программный WebGL — нужен для вырезки фона.
 * Браузер — $CHROME или Chromium из кеша playwright.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, seconds = "20", width = "1280", shots = ""] = process.argv.slice(2);
if (url === undefined) {
  console.error("Использование: node scripts/browser-probe.mjs <url> [секунд] [ширина] [снимки]");
  process.exit(1);
}

const CHROME =
  process.env.CHROME ??
  join(process.env.HOME ?? "", ".cache/ms-playwright/chromium-1228/chrome-linux64/chrome");
const PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), "probe-"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    // PROBE_WEBGL=1 — программный WebGL (SwiftShader): без него в headless
    // нет WebGL, а MediaPipe (вырезка фона) без него не работает.
    ...(process.env.PROBE_WEBGL === "1"
      ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
      : ["--disable-gpu"]),
    "--no-sandbox",
    `--window-size=${width},1400`,
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  // Своя группа процессов: у Chrome есть дочерние (рендерер, GPU),
  // и они дописывают профиль после выхода главного.
  { stdio: "ignore", detached: true },
);

try {
  let target;
  for (let i = 0; i < 50 && target === undefined; i += 1) {
    await sleep(200);
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      // Chrome ещё не поднялся.
    }
  }
  if (target === undefined) throw new Error("Chrome не ответил по протоколу DevTools");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener("open", resolve));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    pending.get(message.id)?.(message);
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      id += 1;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send("Page.enable");
  // Узкие ширины — через эмуляцию: окно headless не уже 500px.
  await send("Emulation.setDeviceMetricsOverride", {
    width: Number(width),
    height: 1400,
    deviceScaleFactor: 1,
    mobile: Number(width) < 768,
  });
  await send("Page.navigate", { url });

  const started = Date.now();
  for (const at of shots.split(",").filter(Boolean).map(Number)) {
    await sleep(Math.max(0, at * 1000 - (Date.now() - started)));
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    const file = join(process.env.SHOT_DIR ?? ".", `shot-${width}-${at}.png`);
    writeFileSync(file, Buffer.from(shot.result.data, "base64"));
  }
  await sleep(Math.max(0, Number(seconds) * 1000 - (Date.now() - started)));

  const result = await send("Runtime.evaluate", {
    expression: "document.getElementById('probe')?.textContent ?? 'no probe'",
    returnByValue: true,
  });
  console.log(result.result?.result?.value);
  ws.close();
} finally {
  const exited = new Promise((resolve) => chrome.once("exit", resolve));
  try {
    process.kill(-chrome.pid, "SIGTERM");
  } catch {
    chrome.kill();
  }
  await exited;
  // Подчищаем профиль; не вышло за секунду — не повод ронять проверку.
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      rmSync(profile, { recursive: true, force: true });
      break;
    } catch {
      await sleep(100);
    }
  }
}
