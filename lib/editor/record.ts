import { applyPalette, GIFEncoder, quantize } from "gifenc";

import { TOKEN_COLORS } from "@/lib/editor/document";

/**
 * Запись открытки в GIF и в видео — в браузере, без сервера.
 *
 * Кадры рисует вызывающий: `draw(time, ctx)` кладёт на холст 2D
 * открытку в момент `time`. Отсюда — только кодирование, водяной знак
 * и звук. Так модуль не знает про Fabric и слои.
 *
 * - **GIF** — без звука по самой природе формата. Кадры считаются
 *   быстрее реального времени, по одному, с передышкой для страницы.
 *   Палитра своя у каждого кадра: фото и градиенты на общей
 *   палитре полосатят.
 * - **Видео** — MediaRecorder над потоком холста плюс звук трека через
 *   Web Audio. Пишется в реальном времени: десять секунд открытки —
 *   десять секунд записи. MP4 там, где браузер умеет (Safari, свежий
 *   Chrome), иначе WebM.
 *
 * Всё, что подписалось, отписывается по `signal`.
 */

export type DrawFrame = (time: number, ctx: CanvasRenderingContext2D) => void;

/** Ширина GIF. 400 × 533: файл в несколько мегабайт, а не в десятки. */
export const GIF_WIDTH = 400;
export const GIF_FPS = 12;
/** Длинная открытка в GIF реже по кадрам, чтобы файл не распух. */
const GIF_MAX_FRAMES = 180;

/** Ширина видео: 720 × 960, хватает для экрана телефона. */
export const VIDEO_WIDTH = 720;
const VIDEO_FPS = 30;

/** Предпочтения формата видео: сначала MP4 — его открывает любой телефон. */
const VIDEO_TYPES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

export class AbortedError extends Error {
  constructor() {
    super("aborted");
    this.name = "AbortedError";
  }
}

function checkAbort(signal: AbortSignal) {
  if (signal.aborted) throw new AbortedError();
}

function context(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx === null) throw new Error("2d context unavailable");
  return ctx;
}

/**
 * Водяной знак: название сайта на белой непрозрачной плашке в правом
 * нижнем углу.
 * Цвета — из замороженной палитры открытки, а не из CSS сайта: знак
 * впекается в файл и не должен зависеть от темы страницы.
 */
/**
 * Подпись автора музыки (CC BY) — мелкой строкой в левом нижнем углу
 * видео, на такой же белой плашке, как водяной знак.
 */
export function drawCredit(ctx: CanvasRenderingContext2D, text: string) {
  const { width, height } = ctx.canvas;
  const size = Math.round(width * 0.022);
  const pad = Math.round(size * 0.6);
  const family = getComputedStyle(document.body).fontFamily;
  ctx.save();
  ctx.font = `500 ${size}px ${family}`;
  const label = `♪ ${text}`;
  // Длинная подпись не должна заезжать под водяной знак справа.
  const maxText = width * 0.6;
  const textWidth = Math.min(ctx.measureText(label).width, maxText);
  const boxHeight = size + pad * 1.2;
  const x = pad * 1.4;
  const y = height - boxHeight - pad * 1.4;
  ctx.fillStyle = TOKEN_COLORS.paper;
  ctx.beginPath();
  ctx.roundRect(x, y, textWidth + pad * 2, boxHeight, boxHeight / 2);
  ctx.fill();
  ctx.fillStyle = TOKEN_COLORS.canvas;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + pad, y + boxHeight / 2, maxText);
  ctx.restore();
}

export function drawWatermark(ctx: CanvasRenderingContext2D, label: string) {
  const { width, height } = ctx.canvas;
  const size = Math.round(width * 0.04);
  const pad = Math.round(size * 0.7);
  const family = getComputedStyle(document.body).fontFamily;
  ctx.save();
  ctx.font = `600 ${size}px ${family}`;
  const textWidth = ctx.measureText(label).width;
  const boxWidth = textWidth + pad * 2;
  const boxHeight = size + pad * 1.2;
  const x = width - boxWidth - pad;
  const y = height - boxHeight - pad;
  ctx.fillStyle = TOKEN_COLORS.paper;
  ctx.beginPath();
  ctx.roundRect(x, y, boxWidth, boxHeight, boxHeight / 2);
  ctx.fill();
  ctx.fillStyle = TOKEN_COLORS.canvas;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + pad, y + boxHeight / 2);
  ctx.restore();
}

/** Сколько секунд записывать: без анимации хватит одного кадра. */
export function gifFrames(duration: number, still: boolean): { count: number; fps: number } {
  if (still) return { count: 1, fps: GIF_FPS };
  const fps = Math.min(GIF_FPS, GIF_MAX_FRAMES / duration);
  return { count: Math.max(1, Math.round(duration * fps)), fps };
}

/** Даёт странице вздохнуть между кадрами: иначе вкладка замирает. */
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export async function encodeGif({
  width,
  height,
  duration,
  still,
  draw,
  watermark,
  onProgress,
  signal,
}: {
  width: number;
  height: number;
  duration: number;
  still: boolean;
  draw: DrawFrame;
  /** Подпись водяного знака; null — без знака. */
  watermark: string | null;
  onProgress: (share: number) => void;
  signal: AbortSignal;
}): Promise<Blob> {
  const ctx = context(width, height);
  const { count, fps } = gifFrames(duration, still);
  const delay = Math.round(1000 / fps);
  const gif = GIFEncoder();

  for (let index = 0; index < count; index += 1) {
    checkAbort(signal);
    // Последний кадр — ровно конец открытки: там она собрана целиком.
    const time = still ? duration : count === 1 ? duration : (index / (count - 1)) * duration;
    ctx.clearRect(0, 0, width, height);
    draw(time, ctx);
    if (watermark !== null) drawWatermark(ctx, watermark);
    const { data } = ctx.getImageData(0, 0, width, height);
    const palette = quantize(data, 256);
    const indexed = applyPalette(data, palette);
    // Финальный кадр держится две секунды, потом GIF начинается заново.
    const last = index === count - 1;
    gif.writeFrame(indexed, width, height, { palette, delay: last ? 2000 : delay });
    onProgress((index + 1) / count);
    await breathe();
  }

  gif.finish();
  // Копия в свой ArrayBuffer: Blob не принимает вид на общий буфер.
  return new Blob([gif.bytes().slice()], { type: "image/gif" });
}

export function videoSupported(): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function"
  );
}

function pickVideoType(): string | null {
  return VIDEO_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

export async function recordVideo({
  width,
  height,
  duration,
  draw,
  watermark,
  audioSrc,
  credit,
  onProgress,
  signal,
}: {
  width: number;
  height: number;
  duration: number;
  draw: DrawFrame;
  watermark: string | null;
  /** Отрывок песни с нашего домена; null — видео без звука. */
  audioSrc: string | null;
  /** Подпись автора песни (CC BY); null — не нужна. */
  credit: string | null;
  onProgress: (share: number) => void;
  signal: AbortSignal;
}): Promise<{ blob: Blob; extension: "mp4" | "webm" }> {
  checkAbort(signal);
  const type = pickVideoType();
  if (type === null) throw new Error("no supported video type");
  const ctx = context(width, height);
  const paint = (time: number) => {
    ctx.clearRect(0, 0, width, height);
    draw(time, ctx);
    if (watermark !== null) drawWatermark(ctx, watermark);
    if (credit !== null) drawCredit(ctx, credit);
  };
  paint(0);

  const stream = ctx.canvas.captureStream(VIDEO_FPS);
  let audio: HTMLAudioElement | null = null;
  let audioContext: AudioContext | null = null;
  if (audioSrc !== null) {
    audio = new Audio(audioSrc);
    audio.loop = true;
    audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    const destination = audioContext.createMediaStreamDestination();
    // Только в запись, не в динамики: человек ждёт файл, а не концерт.
    source.connect(destination);
    for (const track of destination.stream.getAudioTracks()) stream.addTrack(track);
  }

  const recorder = new MediaRecorder(stream, { mimeType: type });
  const chunks: Blob[] = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  const stopped = new Promise<void>((resolve) =>
    recorder.addEventListener("stop", () => resolve(), { once: true }),
  );

  let raf = 0;
  const cleanup = () => {
    cancelAnimationFrame(raf);
    if (recorder.state !== "inactive") recorder.stop();
    audio?.pause();
    void audioContext?.close();
    for (const track of stream.getTracks()) track.stop();
  };
  signal.addEventListener("abort", cleanup, { once: true });

  try {
    if (audioContext !== null) await audioContext.resume();
    if (audio !== null) await audio.play();
    checkAbort(signal);
    recorder.start(250);
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (signal.aborted) {
          resolve();
          return;
        }
        const time = Math.min(duration, (now - started) / 1000);
        paint(time);
        onProgress(time / duration);
        if (time >= duration) {
          resolve();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    checkAbort(signal);
    recorder.stop();
    await stopped;
  } finally {
    signal.removeEventListener("abort", cleanup);
    cleanup();
  }

  return {
    blob: new Blob(chunks, { type: type.split(";")[0] ?? type }),
    extension: type.startsWith("video/mp4") ? "mp4" : "webm",
  };
}
