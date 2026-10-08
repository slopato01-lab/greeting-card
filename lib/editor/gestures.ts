import type { Canvas, FabricObject } from "fabric";

import { LIMITS } from "@/lib/editor/document";
import type { FabricModule } from "@/lib/editor/fabric";

/**
 * Касания холста на телефоне (08.10.2026, просьба пользователя: «двигать
 * элементы двумя пальцами, чтобы страница продолжала листаться»).
 *
 * - Один палец Fabric не получает вовсе: касания перехватываются
 *   на рамке холста в фазе захвата, раньше слушателя Fabric на самом
 *   холсте. Прокрутку делает браузер (у рамки touch-action: pan-y).
 * - Короткое касание выделяет: после тапа браузер сам присылает
 *   mousedown/mouseup/click, а их Fabric слушает как обычно. Тап по
 *   выделенному тексту открывает правку — тоже штатно.
 * - Два пальца на элементе: середина между пальцами двигает его,
 *   расстояние меняет размер, угол поворачивает. Захватывается
 *   выделенный элемент, если он есть, иначе верхний под пальцами.
 *   preventDefault на втором пальце не даёт браузеру листать или
 *   масштабировать страницу — если пальцы встали почти одновременно;
 *   начатую прокрутку браузер уже не отдаёт.
 *
 * Мышь, трекпад и клавиатура это не трогает: это события указателя,
 * а не касания.
 *
 * Конец жеста — `object:modified`, как после перетаскивания мышью:
 * дальше черновик и clampLayer, как обычно. Все слушатели снимаются
 * по signal.
 */

type Start = {
  target: FabricObject;
  midX: number;
  midY: number;
  distance: number;
  angle: number;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

type Pair = { midX: number; midY: number; distance: number; angle: number };

function pair(touches: TouchList): Pair | null {
  const a = touches[0];
  const b = touches[1];
  if (a === undefined || b === undefined) return null;
  return {
    midX: (a.clientX + b.clientX) / 2,
    midY: (a.clientY + b.clientY) / 2,
    distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
    angle: (Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180) / Math.PI,
  };
}

const clampScale = (value: number) => Math.min(LIMITS.scale.max, Math.max(LIMITS.scale.min, value));

export function attachTouchGestures(
  fabric: FabricModule,
  canvas: Canvas,
  frame: HTMLElement,
  signal: AbortSignal,
): void {
  // Сколько единиц холста в одном CSS-пикселе: холст внутри всегда
  // одного размера, на экране — сколько поместилось.
  const ratio = () => {
    const rect = canvas.upperCanvasEl.getBoundingClientRect();
    return rect.width === 0 ? 1 : canvas.getWidth() / rect.width;
  };

  const pick = (p: Pair): FabricObject | null => {
    if (canvas.skipTargetFind) return null;
    const active = canvas.getActiveObject();
    if (active !== undefined && active.selectable && active.evented) return active;
    const rect = canvas.upperCanvasEl.getBoundingClientRect();
    const k = ratio();
    const point = new fabric.Point((p.midX - rect.left) * k, (p.midY - rect.top) * k);
    const objects = canvas.getObjects();
    for (let i = objects.length - 1; i >= 0; i--) {
      const object = objects[i];
      if (object === undefined || !object.visible || !object.selectable || !object.evented)
        continue;
      if (object.containsPoint(point)) return object;
    }
    return null;
  };

  let start: Start | null = null;

  const finish = () => {
    if (start === null) return;
    const { target } = start;
    start = null;
    target.setCoords();
    canvas.fire("object:modified", { target });
    canvas.requestRenderAll();
  };

  frame.addEventListener(
    "touchstart",
    (event) => {
      // Fabric касаний не видит — ни одного, ни двух пальцев.
      event.stopPropagation();
      if (event.touches.length !== 2) {
        if (event.touches.length > 2) finish();
        return;
      }
      const p = pair(event.touches);
      if (p === null) return;
      const target = pick(p);
      if (target === null) return;
      if (event.cancelable) event.preventDefault();
      if (canvas.getActiveObject() !== target) canvas.setActiveObject(target);
      start = {
        target,
        ...p,
        left: target.left,
        top: target.top,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        rotation: target.angle,
      };
      canvas.requestRenderAll();
    },
    { capture: true, passive: false, signal },
  );

  frame.addEventListener(
    "touchmove",
    (event) => {
      event.stopPropagation();
      if (start === null) return;
      if (event.cancelable) event.preventDefault();
      const p = pair(event.touches);
      if (p === null) return;
      const { target } = start;
      const k = ratio();
      if (!target.lockMovementX) target.left = start.left + (p.midX - start.midX) * k;
      if (!target.lockMovementY) target.top = start.top + (p.midY - start.midY) * k;
      if (start.distance > 0) {
        const factor = p.distance / start.distance;
        if (!target.lockScalingX) target.scaleX = clampScale(start.scaleX * factor);
        if (!target.lockScalingY) target.scaleY = clampScale(start.scaleY * factor);
      }
      if (!target.lockRotation) target.angle = start.rotation + (p.angle - start.angle);
      target.setCoords();
      canvas.requestRenderAll();
    },
    { capture: true, passive: false, signal },
  );

  const end = (event: TouchEvent) => {
    event.stopPropagation();
    if (event.touches.length < 2) finish();
  };
  frame.addEventListener("touchend", end, { capture: true, signal });
  frame.addEventListener("touchcancel", end, { capture: true, signal });
}
