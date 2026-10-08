import type { Canvas, FabricObject } from "fabric";

import { applyFrame, type Frame, revealText } from "@/lib/editor/animation";
import {
  type Animation,
  clampLayer,
  type Color,
  type ColorToken,
  COLOR_TOKENS,
  type EditorDoc,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  type FontId,
  type Layer,
  type TextAlign,
} from "@/lib/editor/document";
import { loadFont, readFontFamilies } from "@/lib/editor/fonts";

/**
 * Мост между форматом шаблона (lib/editor/document.ts) и Fabric.
 *
 * Fabric знает только готовые цвета и семейства шрифтов. То, из чего
 * они взялись (токен или hex, id шрифта, id фото, анимация), хранится
 * рядом с объектом в WeakMap — его не нужно ни дописывать в классы
 * Fabric, ни чистить при удалении.
 *
 * Сам модуль `fabric` приходит параметром: он тяжёлый и работает только
 * в браузере, поэтому грузится динамически, когда редактор на экране.
 */

export type FabricModule = typeof import("fabric");

/** Значения токенов и семейства шрифтов, прочитанные из CSS. */
export type Theme = {
  colors: Record<ColorToken, string>;
  fonts: Record<FontId, string>;
};

/**
 * Читает токены с корня документа. Значения задаёт app/globals.css,
 * источник — docs/DESIGN.md.
 */
export function readTheme(): Theme {
  const style = getComputedStyle(document.documentElement);
  const colors = {} as Record<ColorToken, string>;
  for (const token of COLOR_TOKENS) {
    colors[token] = style.getPropertyValue(`--color-${token}`).trim();
  }
  return { colors, fonts: readFontFamilies() };
}

/** Цвет шаблона в цвет для холста: токен — из CSS, hex — как есть. */
export function resolveColor(color: Color, theme: Theme): string {
  return (COLOR_TOKENS as readonly string[]).includes(color)
    ? theme.colors[color as ColorToken]
    : color;
}

type Meta = {
  fill: Color | null;
  font: FontId | null;
  asset: string | null;
  anim: Animation;
};

const meta = new WeakMap<FabricObject, Meta>();

/**
 * Ручки выделения. Золото — цвет «выбранного» по DESIGN.md.
 * Уголки крупнее стандартных: за 13 точек на 390px не ухватиться
 * пальцем, а touchCornerSize Fabric включает только на касаниях.
 */
function controlStyle(theme: Theme) {
  return {
    originX: "center" as const,
    originY: "center" as const,
    borderColor: theme.colors.gold,
    cornerColor: theme.colors.gold,
    cornerStrokeColor: theme.colors.canvas,
    transparentCorners: false,
    cornerSize: 14,
    touchCornerSize: 32,
    padding: 4,
  };
}

/** Откуда брать картинку фото по его id. `null` — фото не нашлось. */
export type AssetResolver = (id: string) => string | null;

/**
 * Создаёт объект холста по слою. Ждёт шрифт текста и картинку фото,
 * поэтому асинхронная. `null` — у фото нет картинки.
 */
export async function createObject(
  fabric: FabricModule,
  layer: Layer,
  theme: Theme,
  assetUrl: AssetResolver,
): Promise<FabricObject | null> {
  const common = {
    ...controlStyle(theme),
    left: layer.x,
    top: layer.y,
    angle: layer.angle,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
  };

  let object: FabricObject;
  switch (layer.kind) {
    case "text": {
      const family = theme.fonts[layer.font];
      await loadFont(family, layer.bold, layer.italic);
      object = new fabric.IText(layer.text, {
        ...common,
        fill: resolveColor(layer.fill, theme),
        fontSize: layer.fontSize,
        fontFamily: family,
        fontWeight: layer.bold ? 700 : 400,
        fontStyle: layer.italic ? "italic" : "normal",
        textAlign: layer.align,
        cursorColor: theme.colors.canvas,
        editingBorderColor: theme.colors.gold,
      });
      break;
    }
    case "rect":
      object = new fabric.Rect({
        ...common,
        fill: resolveColor(layer.fill, theme),
        width: layer.width,
        height: layer.height,
      });
      break;
    case "circle":
      object = new fabric.Circle({
        ...common,
        fill: resolveColor(layer.fill, theme),
        radius: layer.radius,
      });
      break;
    case "image": {
      const url = assetUrl(layer.asset);
      if (url === null) return null;
      try {
        object = await fabric.FabricImage.fromURL(url, {}, common);
      } catch {
        return null;
      }
      break;
    }
  }

  meta.set(object, {
    fill: layer.kind === "image" ? null : layer.fill,
    font: layer.kind === "text" ? layer.font : null,
    asset: layer.kind === "image" ? layer.asset : null,
    anim: layer.anim,
  });
  return object;
}

/**
 * Обратное превращение. Объекты, которых редактор не создавал,
 * пропускаются. Результат всегда в пределах LIMITS — см. clampLayer.
 */
export function objectToLayer(fabric: FabricModule, object: FabricObject): Layer | null {
  const layer = rawLayer(fabric, object);
  return layer === null ? null : clampLayer(layer);
}

function isBold(weight: string | number): boolean {
  return weight === "bold" || Number(weight) >= 600;
}

function rawLayer(fabric: FabricModule, object: FabricObject): Layer | null {
  const info = meta.get(object);
  if (info === undefined) return null;

  const base = {
    x: object.left,
    y: object.top,
    angle: object.angle,
    scaleX: object.scaleX,
    scaleY: object.scaleY,
    opacity: object.opacity,
    anim: info.anim,
  };

  if (object instanceof fabric.FabricImage) {
    if (info.asset === null) return null;
    return {
      ...base,
      kind: "image",
      asset: info.asset,
      width: object.width,
      height: object.height,
    };
  }

  const fill = info.fill ?? "canvas";
  if (object instanceof fabric.IText) {
    const align = object.textAlign;
    return {
      ...base,
      kind: "text",
      fill,
      text: object.text,
      fontSize: object.fontSize,
      font: info.font ?? "inter",
      bold: isBold(object.fontWeight),
      italic: object.fontStyle === "italic",
      align: align === "left" || align === "right" ? align : "center",
    };
  }
  if (object instanceof fabric.Rect) {
    return { ...base, kind: "rect", fill, width: object.width, height: object.height };
  }
  if (object instanceof fabric.Circle) {
    return { ...base, kind: "circle", fill, radius: object.radius };
  }
  return null;
}

export function canvasToDoc(
  fabric: FabricModule,
  canvas: Canvas,
  background: Color,
  duration: number,
): EditorDoc {
  const layers: Layer[] = [];
  for (const object of canvas.getObjects()) {
    const layer = objectToLayer(fabric, object);
    if (layer !== null) layers.push(layer);
  }
  return { format: EDITOR_FORMAT, version: EDITOR_VERSION, background, duration, layers };
}

/**
 * Заменяет содержимое холста документом. Документ уже проверен.
 * Возвращает число слоёв фото, для которых не нашлось картинки:
 * такие слои пропускаются, а редактор говорит об этом вслух.
 */
export async function loadDocIntoCanvas(
  fabric: FabricModule,
  canvas: Canvas,
  doc: EditorDoc,
  theme: Theme,
  assetUrl: AssetResolver,
): Promise<number> {
  // Все объекты создаются заранее и добавляются разом: фото грузятся
  // с разной скоростью, а порядок слоёв обязан сохраниться.
  const objects = await Promise.all(
    doc.layers.map((layer) => createObject(fabric, layer, theme, assetUrl)),
  );
  canvas.discardActiveObject();
  canvas.remove(...canvas.getObjects());
  canvas.backgroundColor = resolveColor(doc.background, theme);
  let missing = 0;
  for (const object of objects) {
    if (object === null) missing += 1;
    else canvas.add(object);
  }
  canvas.requestRenderAll();
  return missing;
}

/** Ids фото, на которые ссылается холст. */
export function usedAssets(canvas: Canvas): Set<string> {
  const ids = new Set<string>();
  for (const object of canvas.getObjects()) {
    const asset = meta.get(object)?.asset;
    if (asset !== null && asset !== undefined) ids.add(asset);
  }
  return ids;
}

// ── Правки ──────────────────────────────────────────────────

/** Перекрашивает объект и запоминает цвет. У фото заливки нет. */
export function applyFill(object: FabricObject, color: Color, theme: Theme) {
  const info = meta.get(object);
  if (info === undefined || info.fill === null) return;
  object.set("fill", resolveColor(color, theme));
  meta.set(object, { ...info, fill: color });
}

export function applyAnimation(object: FabricObject, anim: Animation) {
  const info = meta.get(object);
  if (info === undefined) return;
  meta.set(object, { ...info, anim });
}

export type TextStyle = { font?: FontId; bold?: boolean; italic?: boolean; align?: TextAlign };

/** Шрифт, начертание и выравнивание текста. Ждёт файл шрифта. */
export async function applyTextStyle(
  fabric: FabricModule,
  object: FabricObject,
  style: TextStyle,
  theme: Theme,
) {
  const info = meta.get(object);
  if (info === undefined || !(object instanceof fabric.IText)) return;

  const font = style.font ?? info.font ?? "inter";
  const bold = style.bold ?? isBold(object.fontWeight);
  const italic = style.italic ?? object.fontStyle === "italic";
  await loadFont(theme.fonts[font], bold, italic);

  object.set({
    fontFamily: theme.fonts[font],
    fontWeight: bold ? 700 : 400,
    fontStyle: italic ? "italic" : "normal",
    ...(style.align === undefined ? {} : { textAlign: style.align }),
  });
  // Ширина строки зависит от шрифта: без пересчёта рамка выделения
  // останется от прежнего.
  object.initDimensions();
  object.setCoords();
  meta.set(object, { ...info, font });
}

// ── Проигрывание ────────────────────────────────────────────

/**
 * Ставит объект в положение кадра анимации. Исходный слой не меняется:
 * после просмотра объект возвращают в него через restoreObject.
 */
export function showFrame(fabric: FabricModule, object: FabricObject, layer: Layer, frame: Frame) {
  const moved = applyFrame(layer, frame);
  object.set({
    left: moved.x,
    top: moved.y,
    scaleX: moved.scaleX,
    scaleY: moved.scaleY,
    angle: moved.angle,
    opacity: Math.min(1, Math.max(0, moved.opacity)),
  });
  if (layer.kind === "text" && object instanceof fabric.IText) {
    const visible = revealText(layer.text, frame.reveal);
    if (object.text !== visible) object.set("text", visible);
  }
}

export function restoreObject(fabric: FabricModule, object: FabricObject, layer: Layer) {
  object.set({
    left: layer.x,
    top: layer.y,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    angle: layer.angle,
    opacity: layer.opacity,
  });
  if (layer.kind === "text" && object instanceof fabric.IText) object.set("text", layer.text);
  object.setCoords();
}
