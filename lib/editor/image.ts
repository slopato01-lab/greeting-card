import type { CropRect } from "@/lib/editor/crop";
import type { TextKey } from "@/lib/i18n";

/**
 * Приём фото в редактор. Фото не покидает устройство: сервера ещё нет.
 *
 * Что делается и зачем (docs/SECURITY.md, «Загрузка файлов»):
 * - тип — по сигнатуре первых байтов, а не по расширению и не по
 *   `file.type`, который присылает система;
 * - не больше 10 МБ на входе;
 * - картинка **пересохраняется**: рисуется на холст и кодируется заново.
 *   Это убивает EXIF вместе с GPS-координатами, применяет поворот
 *   из EXIF (createImageBitmap делает это сам) и выбрасывает всё,
 *   что было в файле кроме пикселей;
 * - длинная сторона — не больше 1600 точек: открытка 600 × 800,
 *   с запасом на приближение и экспорт PNG в 1200 × 1600.
 *
 * Когда появится сервер, он обязан пересохранить фото ещё раз сам:
 * браузеру пользователя доверять нельзя. Эта обработка — про приватность
 * и вес черновика, а не про защиту сервера.
 */

export const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.88;

type Kind = "jpeg" | "png" | "webp" | "heic";

/** Сигнатуры: JPEG FF D8 FF, PNG 89 50 4E 47, WebP RIFF…WEBP, HEIC …ftypheic. */
function sniff(bytes: Uint8Array): Kind | null {
  const at = (i: number) => bytes[i] ?? -1;
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));

  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return "jpeg";
  if (at(0) === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && ["heic", "heix", "hevc", "mif1", "msf1"].includes(ascii(8, 12))) {
    return "heic";
  }
  return null;
}

export type PreparedImage = { blob: Blob; width: number; height: number };

export type PrepareResult = { ok: true; image: PreparedImage } | { ok: false; error: TextKey };

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, JPEG_QUALITY));
}

export async function prepareImage(file: File): Promise<PrepareResult> {
  if (file.size > MAX_INPUT_BYTES) return { ok: false, error: "error.photoTooBig" };

  const kind = sniff(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (kind === null) return { ok: false, error: "error.photoFormat" };

  let bitmap: ImageBitmap;
  try {
    // HEIC декодирует только Safari. В остальных браузерах здесь
    // будет ошибка — и честное сообщение, а не пустой слой.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { ok: false, error: "editor.error.photoDecode" };
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null) return { ok: false, error: "editor.error.photoDecode" };
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    // PNG и WebP могут быть с прозрачностью — сохраняем PNG,
    // иначе прозрачный фон станет чёрным. Остальное — JPEG.
    const type = kind === "png" || kind === "webp" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, type);
    if (blob === null) return { ok: false, error: "editor.error.photoDecode" };
    return { ok: true, image: { blob, width, height } };
  } finally {
    bitmap.close();
  }
}

/**
 * Вырезает прямоугольник из уже подготовленного фото и кодирует заново
 * тем же типом. `null` — не вышло; тогда фото встаёт целиком, вписанным.
 */
export async function cropRect(blob: Blob, rect: CropRect): Promise<PreparedImage | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return null;
  }
  try {
    const x = Math.max(0, Math.min(bitmap.width - 1, Math.round(rect.x)));
    const y = Math.max(0, Math.min(bitmap.height - 1, Math.round(rect.y)));
    const w = Math.max(1, Math.min(bitmap.width - x, Math.round(rect.width)));
    const h = Math.max(1, Math.min(bitmap.height - y, Math.round(rect.height)));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");
    if (context === null) return null;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
    const type = blob.type === "image/png" ? "image/png" : "image/jpeg";
    const out = await canvasToBlob(canvas, type);
    return out === null ? null : { blob: out, width: w, height: h };
  } finally {
    bitmap.close();
  }
}

// ── Перевод в data URL и обратно — для файла шаблона ────────

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject());
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Обратно без fetch(dataUrl): строгая CSP из SECURITY.md может закрыть
 * data: в connect-src. Формат data URL уже проверен parseEditorDoc.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",");
  const type = dataUrl.slice("data:".length, dataUrl.indexOf(";"));
  const binary = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** Случайный id фото. Не Math.random — он запрещён в проекте. */
export function newAssetId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
