import {
  type Animation,
  type Color,
  type EditorDoc,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  type FontId,
  type Layer,
  NO_ANIMATION,
  type RectLayer,
  type StickerId,
  type StickerLayer,
  type TextAlign,
  type TextLayer,
} from "@/lib/editor/document";
import { stickerInfo } from "@/lib/editor/stickers";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Кирпичи для шаблонов редактора: слои с разумными умолчаниями.
 * Общие для lib/editor/templates.ts и lib/editor/series.ts.
 *
 * Координаты — центр слоя (origin center в lib/editor/fabric.ts),
 * в том числе у текста: x — середина строки, а не левый край.
 */

export const anim = (change: Partial<Animation>): Animation => ({ ...NO_ANIMATION, ...change });

export function text(
  key: TextKey,
  x: number,
  y: number,
  fill: Color,
  font: FontId,
  fontSize: number,
  options: {
    bold?: boolean;
    italic?: boolean;
    align?: TextAlign;
    spacing?: number;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
    opacity?: number;
    anim: Animation;
  },
): TextLayer {
  return {
    kind: "text",
    text: t(key),
    x,
    y,
    angle: options.angle ?? 0,
    scaleX: options.scaleX ?? 1,
    scaleY: options.scaleY ?? 1,
    opacity: options.opacity ?? 1,
    fill,
    font,
    fontSize,
    bold: options.bold ?? false,
    italic: options.italic ?? false,
    align: options.align ?? "center",
    spacing: options.spacing ?? 0,
    anim: options.anim,
  };
}

export function sticker(
  id: StickerId,
  x: number,
  y: number,
  scale: number,
  angle: number,
  animation: Animation,
  options: { scaleY?: number; opacity?: number } = {},
): StickerLayer {
  const { width, height } = stickerInfo(id);
  return {
    kind: "sticker",
    sticker: id,
    width,
    height,
    x,
    y,
    angle,
    scaleX: scale,
    scaleY: options.scaleY ?? scale,
    opacity: options.opacity ?? 1,
    anim: animation,
  };
}

/**
 * Пример фото, вписанный по ширине в окно `width` точек.
 * Размер берётся из реестра стикеров: квадрат, 4:3 — что лежит.
 */
export function photo(
  id: StickerId,
  x: number,
  y: number,
  width: number,
  angle: number,
  animation: Animation,
): StickerLayer {
  return sticker(id, x, y, width / stickerInfo(id).width, angle, animation);
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  animation: Animation,
  angle = 0,
): RectLayer {
  return {
    kind: "rect",
    fill,
    width,
    height,
    x,
    y,
    angle,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    anim: animation,
  };
}

/**
 * Точка, сдвинутая на (dx, dy) в системе координат слоя, повёрнутого
 * на `angle` градусов вокруг (x, y). Для фото в окне рамки или плёнки:
 * окно поворачивается вместе с рамкой.
 */
export function attach(
  x: number,
  y: number,
  angle: number,
  dx: number,
  dy: number,
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return {
    x: x + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: y + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

export function doc(background: Color, layers: Layer[], duration = 6): EditorDoc {
  return { format: EDITOR_FORMAT, version: EDITOR_VERSION, background, duration, layers };
}
