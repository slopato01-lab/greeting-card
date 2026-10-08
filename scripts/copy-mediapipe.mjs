/**
 * Копирует WASM MediaPipe из node_modules в public/mediapipe/wasm.
 *
 * Запускается перед каждой сборкой (`pnpm build`). Файлы весят 21 МБ
 * и меняются только с версией пакета — в репозиторий их не кладём
 * (public/mediapipe/wasm в .gitignore). Раздаются со своего домена:
 * вырезка фона не ходит на чужие серверы, см. lib/editor/cutout.ts.
 *
 * Копируются две пары: с SIMD и без. Какую взять, FilesetResolver
 * решает сам по возможностям браузера.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = resolve(ROOT, "node_modules/@mediapipe/tasks-vision/wasm");
const TO = resolve(ROOT, "public/mediapipe/wasm");

const FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

await mkdir(TO, { recursive: true });
for (const file of FILES) await copyFile(resolve(FROM, file), resolve(TO, file));
console.log(`MediaPipe: ${FILES.length} файла в public/mediapipe/wasm`);
