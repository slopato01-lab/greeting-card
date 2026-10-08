import type { ImageSegmenter } from "@mediapipe/tasks-vision";

import type { TextKey } from "@/lib/i18n";

/**
 * Вырезка человека из фото — как фото ребёнка в
 * design/пример анимации и дизайна.MP4. Работает в браузере, фото
 * никуда не уходит.
 *
 * MediaPipe Image Segmenter (Google, Apache 2.0) с моделью
 * selfie_segmenter: 250 КБ, 0.15–0.25 с на фото. Сравнивали 08.10.2026
 * на четырёх портретах с selfie_multiclass (16 МБ) и deeplab_v3: первая
 * чуть чище по краям, но в 65 раз тяжелее; вторая даёт ореолы.
 * @imgly/background-removal не берём — AGPL.
 *
 * Файлы раздаются со своего домена: модель лежит в public/mediapipe,
 * WASM (11 МБ) копирует туда при сборке scripts/copy-mediapipe.mjs.
 * Грузится всё только при первой вырезке — не при открытии редактора.
 *
 * MediaPipe требует WebGL даже на CPU. Нет WebGL (редкий старый
 * телефон, часть встроенных браузеров) — вырезка честно не удаётся,
 * фото остаётся целиком, редактор говорит об этом.
 */

const WASM_ROOT = "/mediapipe/wasm";
const MODEL = "/mediapipe/selfie_segmenter.tflite";

/** Мягкий край: уверенность ниже LOW — фон, выше HIGH — человек. */
const LOW = 0.35;
const HIGH = 0.65;
/** Меньше этой доли кадра — человека на фото нет. */
const MIN_PERSON = 0.02;
/** Поле вокруг вырезки, доля большей стороны. */
const PADDING = 0.02;

let segmenter: Promise<ImageSegmenter> | null = null;

function loadSegmenter(): Promise<ImageSegmenter> {
  segmenter ??= (async () => {
    const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const files = await FilesetResolver.forVisionTasks(WASM_ROOT);
    return ImageSegmenter.createFromOptions(files, {
      baseOptions: { modelAssetPath: MODEL, delegate: "CPU" },
      runningMode: "IMAGE",
      outputConfidenceMasks: true,
      outputCategoryMask: false,
    });
  })().catch((error: unknown) => {
    // Следующая попытка начнёт заново, а не получит тот же отказ.
    segmenter = null;
    throw error;
  });
  return segmenter;
}

export type CutoutResult =
  | { ok: true; blob: Blob; width: number; height: number; offsetX: number; offsetY: number }
  | { ok: false; error: TextKey };

const smooth = (v: number) => {
  const x = Math.min(1, Math.max(0, (v - LOW) / (HIGH - LOW)));
  return x * x * (3 - 2 * x);
};

/**
 * Вырезает человека: прозрачный фон, мягкий край, обрезка по фигуре.
 *
 * `offsetX/offsetY` — насколько центр вырезки сдвинут от центра
 * исходного фото, в его пикселях. Нужен, чтобы человек остался на том
 * же месте холста, хотя картинка стала меньше.
 */
export async function cutoutPerson(source: Blob): Promise<CutoutResult> {
  let model: ImageSegmenter;
  try {
    model = await loadSegmenter();
  } catch {
    return { ok: false, error: "editor.error.cutoutFailed" };
  }

  const bitmap = await createImageBitmap(source);
  try {
    const { width, height } = bitmap;
    let person: Float32Array;
    let maskW: number;
    let maskH: number;
    try {
      const result = model.segment(bitmap);
      const mask = result.confidenceMasks?.[0];
      if (mask === undefined) return { ok: false, error: "editor.error.cutoutFailed" };
      // Копия: после result.close() память маски освобождается.
      person = Float32Array.from(mask.getAsFloat32Array());
      maskW = mask.width;
      maskH = mask.height;
      result.close();
    } catch {
      return { ok: false, error: "editor.error.cutoutFailed" };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null) return { ok: false, error: "editor.error.cutoutFailed" };
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, width, height);

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let inside = 0;
    for (let y = 0; y < height; y += 1) {
      const row = Math.min(maskH - 1, Math.floor((y * maskH) / height)) * maskW;
      for (let x = 0; x < width; x += 1) {
        const confidence = person[row + Math.min(maskW - 1, Math.floor((x * maskW) / width))] ?? 0;
        const alpha = smooth(confidence);
        const at = (y * width + x) * 4 + 3;
        pixels.data[at] = Math.round((pixels.data[at] ?? 255) * alpha);
        if (alpha > 0.5) {
          inside += 1;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (inside < width * height * MIN_PERSON) {
      return { ok: false, error: "editor.error.cutoutNoPerson" };
    }
    context.putImageData(pixels, 0, 0);

    // Обрезка по фигуре с небольшим полем.
    const pad = Math.round(Math.max(width, height) * PADDING);
    const left = Math.max(0, minX - pad);
    const top = Math.max(0, minY - pad);
    const right = Math.min(width, maxX + 1 + pad);
    const bottom = Math.min(height, maxY + 1 + pad);
    const out = document.createElement("canvas");
    out.width = right - left;
    out.height = bottom - top;
    out
      .getContext("2d")
      ?.drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height);

    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (blob === null) return { ok: false, error: "editor.error.cutoutFailed" };
    return {
      ok: true,
      blob,
      width: out.width,
      height: out.height,
      offsetX: (left + right) / 2 - width / 2,
      offsetY: (top + bottom) / 2 - height / 2,
    };
  } finally {
    bitmap.close();
  }
}
