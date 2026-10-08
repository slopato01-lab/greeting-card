import type { Canvas, FabricObject, IText, StaticCanvas } from "fabric";

import { applyFrame, type Frame, letterState, revealText } from "@/lib/editor/animation";
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
  type StickerId,
  type TextAlign,
} from "@/lib/editor/document";
import { loadFont, readFontFamilies } from "@/lib/editor/fonts";
import { stickerUrl } from "@/lib/editor/stickers";

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
  sticker: StickerId | null;
  mono: boolean;
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
        charSpacing: layer.spacing,
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
      if (layer.mono) setMono(fabric, object, true);
      break;
    }
    case "sticker": {
      try {
        object = await fabric.FabricImage.fromURL(stickerUrl(layer.sticker), {}, common);
      } catch {
        return null;
      }
      break;
    }
  }

  const hasFill = layer.kind !== "image" && layer.kind !== "sticker";
  meta.set(object, {
    fill: hasFill ? layer.fill : null,
    font: layer.kind === "text" ? layer.font : null,
    asset: layer.kind === "image" ? layer.asset : null,
    sticker: layer.kind === "sticker" ? layer.sticker : null,
    mono: layer.kind === "image" ? layer.mono : false,
    anim: layer.anim,
  });
  return object;
}

/** Чёрно-белый фильтр фото. Фильтр пересчитывает картинку один раз. */
function setMono(fabric: FabricModule, object: FabricObject, mono: boolean) {
  if (!(object instanceof fabric.FabricImage)) return;
  object.filters = mono ? [new fabric.filters.Grayscale()] : [];
  object.applyFilters();
}

export function applyMono(fabric: FabricModule, object: FabricObject, mono: boolean) {
  const info = meta.get(object);
  if (info === undefined || info.asset === null) return;
  setMono(fabric, object, mono);
  meta.set(object, { ...info, mono });
}

/** Это заглушка на месте фото? */
export function stickerOf(object: FabricObject): StickerId | null {
  return meta.get(object)?.sticker ?? null;
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
    if (info.sticker !== null) {
      return {
        ...base,
        kind: "sticker",
        sticker: info.sticker,
        width: object.width,
        height: object.height,
      };
    }
    if (info.asset === null) return null;
    return {
      ...base,
      kind: "image",
      asset: info.asset,
      width: object.width,
      height: object.height,
      mono: info.mono,
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
      spacing: object.charSpacing,
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
  canvas: StaticCanvas,
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
  canvas: StaticCanvas,
  doc: EditorDoc,
  theme: Theme,
  assetUrl: AssetResolver,
): Promise<number> {
  // Все объекты создаются заранее и добавляются разом: фото грузятся
  // с разной скоростью, а порядок слоёв обязан сохраниться.
  const objects = await Promise.all(
    doc.layers.map((layer) => createObject(fabric, layer, theme, assetUrl)),
  );
  // Превью шаблонов рисуются на StaticCanvas — у него выделения нет.
  if (canvas instanceof fabric.Canvas) canvas.discardActiveObject();
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
export function usedAssets(canvas: StaticCanvas): Set<string> {
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

/** Цвет с прозрачностью для отдельной буквы. Понимает только #rrggbb. */
function withAlpha(color: string, alpha: number): string {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
  if (match === null) return color;
  const [r, g, b] = match.slice(1).map((hex) => parseInt(hex, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/**
 * «По буквам»: каждой букве свой цвет с прозрачностью и сдвиг вверх.
 * Через стили символов Fabric — они не меняют раскладку строки,
 * поэтому буквы не толкают друг друга, пока появляются.
 */
function showLetters(text: IText, progress: number) {
  const base = typeof text.fill === "string" ? text.fill : "#000000";
  const lines = text._textLines;
  const count = lines.reduce((sum, line) => sum + line.length, 0);
  const styles: Record<number, Record<number, { fill: string; deltaY: number }>> = {};
  let index = 0;
  lines.forEach((line, row) => {
    const rowStyles: Record<number, { fill: string; deltaY: number }> = {};
    line.forEach((_, col) => {
      const { alpha, dy } = letterState(index, count, progress);
      rowStyles[col] = { fill: withAlpha(base, alpha), deltaY: dy };
      index += 1;
    });
    styles[row] = rowStyles;
  });
  text.set("styles", styles);
}

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
  if (layer.kind !== "text" || !(object instanceof fabric.IText)) return;

  const visible = revealText(layer.text, frame.reveal);
  const spacing = layer.spacing + frame.spacing;
  let remeasure = false;
  if (object.text !== visible) {
    object.set("text", visible);
    remeasure = true;
  }
  if (object.charSpacing !== spacing) {
    object.set("charSpacing", spacing);
    remeasure = true;
  }
  if (remeasure) object.initDimensions();

  if (frame.letters < 1) showLetters(object, frame.letters);
  else if (Object.keys(object.styles).length > 0) object.set("styles", {});
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
  if (layer.kind === "text" && object instanceof fabric.IText) {
    object.set({ text: layer.text, charSpacing: layer.spacing, styles: {} });
    object.initDimensions();
  }
  object.setCoords();
}
