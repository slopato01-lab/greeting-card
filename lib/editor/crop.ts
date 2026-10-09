/**
 * Обрезка своего фото перед заменой примера в шаблоне (просьба
 * пользователя 10.10.2026). Чистые расчёты, без DOM — интерфейс
 * в components/editor/CropDialog.tsx.
 *
 * Состояние — точка в центре рамки (в точках исходного фото) и
 * приближение. При `zoom = 1` рамка — самый большой прямоугольник
 * нужной пропорции, что влезает в фото: снимок заполняет её без
 * пустых полос. Приближение только уменьшает рамку, центр не даёт
 * ей выйти за фото — пустых полос не бывает никогда.
 */

export type CropView = { cx: number; cy: number; zoom: number };

export type CropRect = { x: number; y: number; width: number; height: number };

/** Ширина и высота фото и пропорция рамки (ширина / высота). */
export type CropSource = { width: number; height: number; aspect: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

/** Рамка в точках фото при данном приближении. */
function frameSize({ width, height, aspect }: CropSource, zoom: number) {
  const w = Math.min(width, height * aspect);
  const h = Math.min(height, width / aspect);
  return { w: w / zoom, h: h / zoom };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Начало: фото по центру, без приближения. */
export function initialView(source: CropSource): CropView {
  return { cx: source.width / 2, cy: source.height / 2, zoom: MIN_ZOOM };
}

/** Возвращает приближение в пределы и рамку — внутрь фото. */
export function clampView(view: CropView, source: CropSource): CropView {
  const zoom = clamp(Number.isFinite(view.zoom) ? view.zoom : MIN_ZOOM, MIN_ZOOM, MAX_ZOOM);
  const { w, h } = frameSize(source, zoom);
  return {
    zoom,
    cx: clamp(view.cx, w / 2, source.width - w / 2),
    cy: clamp(view.cy, h / 2, source.height - h / 2),
  };
}

/** Сколько экранных точек в одной точке фото при рамке шириной `framePx`. */
export function viewScale(view: CropView, source: CropSource, framePx: number): number {
  return framePx / frameSize(source, view.zoom).w;
}

/** Сдвиг пальцем на (dx, dy) экранных точек: фото едет за пальцем. */
export function panView(
  view: CropView,
  source: CropSource,
  framePx: number,
  dx: number,
  dy: number,
): CropView {
  const scale = viewScale(view, source, framePx);
  return clampView({ ...view, cx: view.cx - dx / scale, cy: view.cy - dy / scale }, source);
}

/**
 * Приближение в `factor` раз вокруг точки рамки (fx, fy) в долях
 * от 0 до 1 — под пальцами или курсором эта точка фото остаётся на месте.
 */
export function zoomView(
  view: CropView,
  source: CropSource,
  factor: number,
  fx = 0.5,
  fy = 0.5,
): CropView {
  const zoom = clamp(view.zoom * factor, MIN_ZOOM, MAX_ZOOM);
  const before = frameSize(source, view.zoom);
  const after = frameSize(source, zoom);
  // Точка фото под (fx, fy) до и после должна совпасть.
  const px = view.cx + (fx - 0.5) * before.w;
  const py = view.cy + (fy - 0.5) * before.h;
  return clampView({ zoom, cx: px - (fx - 0.5) * after.w, cy: py - (fy - 0.5) * after.h }, source);
}

/** Прямоугольник фото, который уйдёт на открытку: целые точки, внутри фото. */
export function cropRectOf(view: CropView, source: CropSource): CropRect {
  const { cx, cy, zoom } = clampView(view, source);
  const { w, h } = frameSize(source, zoom);
  const width = clamp(Math.round(w), 1, source.width);
  const height = clamp(Math.round(h), 1, source.height);
  return {
    x: clamp(Math.round(cx - w / 2), 0, source.width - width),
    y: clamp(Math.round(cy - h / 2), 0, source.height - height),
    width,
    height,
  };
}
