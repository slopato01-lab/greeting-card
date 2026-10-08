import type { Canvas, Circle, FabricObject, IText, Rect } from "fabric";

import {
  type ColorToken,
  COLOR_TOKENS,
  type EditorDoc,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  type FontRole,
  FONT_ROLES,
  type Layer,
} from "./document";

/**
 * Мост между форматом шаблона (lib/editor/document.ts) и Fabric.
 *
 * Fabric знает только готовые цвета и семейства шрифтов. Имена токенов,
 * из которых они взялись, хранятся рядом с объектом в WeakMap — их
 * не нужно ни дописывать в классы Fabric, ни чистить при удалении.
 *
 * Сам модуль `fabric` сюда приходит параметром: он тяжёлый и умеет
 * работать только в браузере, поэтому грузится динамически в момент,
 * когда редактор появился на экране.
 */

export type FabricModule = typeof import("fabric");

/** Значения токенов, прочитанные из CSS. */
export type Theme = {
  colors: Record<ColorToken, string>;
  fonts: Record<FontRole, string>;
};

/**
 * Читает токены с корня документа. Значения задаёт app/globals.css,
 * источник — docs/DESIGN.md. Шрифты приходят уже раскрытыми:
 * `--font-display` ссылается на `--font-unb` от next/font, и браузер
 * подставляет её в вычисленном значении.
 */
export function readTheme(): Theme {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim();

  const colors = {} as Record<ColorToken, string>;
  for (const token of COLOR_TOKENS) colors[token] = read(`--color-${token}`);

  const fonts = {} as Record<FontRole, string>;
  for (const role of FONT_ROLES) fonts[role] = read(`--font-${role}`);

  return { colors, fonts };
}

type Meta = { fill: ColorToken; font: FontRole | null };

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

/** Координаты слоя — центр объекта: так вращение идёт вокруг середины. */
export function createObject(fabric: FabricModule, layer: Layer, theme: Theme): FabricObject {
  const common = {
    ...controlStyle(theme),
    left: layer.x,
    top: layer.y,
    angle: layer.angle,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    fill: theme.colors[layer.fill],
  };

  let object: FabricObject;
  switch (layer.kind) {
    case "text":
      object = new fabric.IText(layer.text, {
        ...common,
        fontSize: layer.fontSize,
        fontFamily: theme.fonts[layer.font],
        cursorColor: theme.colors.canvas,
        editingBorderColor: theme.colors.gold,
      });
      break;
    case "rect":
      object = new fabric.Rect({ ...common, width: layer.width, height: layer.height });
      break;
    case "circle":
      object = new fabric.Circle({ ...common, radius: layer.radius });
      break;
  }

  meta.set(object, { fill: layer.fill, font: layer.kind === "text" ? layer.font : null });
  return object;
}

/** Обратное превращение. Объекты, которых редактор не создавал, пропускаются. */
export function objectToLayer(fabric: FabricModule, object: FabricObject): Layer | null {
  const info = meta.get(object);
  if (info === undefined) return null;

  const base = {
    x: object.left,
    y: object.top,
    angle: ((object.angle % 360) + 360) % 360,
    scaleX: object.scaleX,
    scaleY: object.scaleY,
    fill: info.fill,
  };

  if (object instanceof fabric.IText) {
    const text = object as IText;
    return {
      ...base,
      kind: "text",
      text: text.text,
      fontSize: text.fontSize,
      font: info.font ?? "display",
    };
  }
  if (object instanceof fabric.Rect) {
    const rect = object as Rect;
    return { ...base, kind: "rect", width: rect.width, height: rect.height };
  }
  if (object instanceof fabric.Circle) {
    return { ...base, kind: "circle", radius: (object as Circle).radius };
  }
  return null;
}

export function canvasToDoc(
  fabric: FabricModule,
  canvas: Canvas,
  background: ColorToken,
): EditorDoc {
  const layers: Layer[] = [];
  for (const object of canvas.getObjects()) {
    const layer = objectToLayer(fabric, object);
    if (layer !== null) layers.push(layer);
  }
  return { format: EDITOR_FORMAT, version: EDITOR_VERSION, background, layers };
}

/** Заменяет содержимое холста документом. Документ уже проверен. */
export function loadDocIntoCanvas(
  fabric: FabricModule,
  canvas: Canvas,
  doc: EditorDoc,
  theme: Theme,
) {
  canvas.discardActiveObject();
  canvas.remove(...canvas.getObjects());
  canvas.backgroundColor = theme.colors[doc.background];
  for (const layer of doc.layers) canvas.add(createObject(fabric, layer, theme));
  canvas.requestRenderAll();
}

/** Перекрашивает объект токеном и запоминает токен. */
export function applyFill(object: FabricObject, token: ColorToken, theme: Theme) {
  const info = meta.get(object);
  if (info === undefined) return;
  object.set("fill", theme.colors[token]);
  meta.set(object, { ...info, fill: token });
}

export function applyFont(object: IText, role: FontRole, theme: Theme) {
  const info = meta.get(object);
  if (info === undefined) return;
  object.set("fontFamily", theme.fonts[role]);
  // Ширина строки зависит от шрифта: без пересчёта рамка выделения
  // останется от прежнего.
  object.initDimensions();
  object.setCoords();
  meta.set(object, { ...info, font: role });
}
