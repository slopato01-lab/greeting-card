"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Slider } from "@/components/editor/controls";
import type { CropChoice, CropRequest } from "@/components/editor/useCardEditor";
import {
  clampView,
  cropRectOf,
  type CropSource,
  type CropView,
  initialView,
  MAX_ZOOM,
  MIN_ZOOM,
  panView,
  viewScale,
  zoomView,
} from "@/lib/editor/crop";
import { t } from "@/lib/i18n";

/**
 * Окно обрезки своего фото перед заменой примера (просьба пользователя
 * 10.10.2026). Рамка — в пропорции места на открытке; фото двигают
 * пальцем или мышью, приближают двумя пальцами, колёсиком, ползунком,
 * с клавиатуры — стрелки и «+»/«−». Пустых полос в рамке не бывает:
 * пределы считает lib/editor/crop.ts.
 *
 * Нативный <dialog> через showModal(), как Paywall: фокус заперт, Esc
 * закрывает (= «Отмена»). Внутри рамки один палец двигает фото, а не
 * листает страницу — окно модальное, листать под ним нечего.
 */

const KEY_STEP = 10;
const KEY_STEP_BIG = 40;
const KEY_ZOOM = 1.1;
const WHEEL_SPEED = 0.002;

type Point = { x: number; y: number };

export function CropDialog({
  request,
  onChoose,
}: {
  request: CropRequest | null;
  onChoose: (choice: CropChoice) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<CropView | null>(null);
  const [framePx, setFramePx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [seen, setSeen] = useState<CropRequest | null>(null);

  // Новое фото — рамка по центру, без приближения. Во время рендера,
  // а не в эффекте: так React советует подстраивать состояние под пропсы.
  if (request !== seen) {
    setSeen(request);
    setView(request === null ? null : initialView(request));
    setLoaded(false);
  }

  const source: CropSource | null =
    request === null
      ? null
      : { width: request.width, height: request.height, aspect: request.aspect };

  // Жесты читают свежие значения через ref: слушатели вешаются один раз.
  const latest = useRef({ source, framePx });
  useEffect(() => {
    latest.current = { source, framePx };
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (request !== null && !dialog.open) dialog.showModal();
    if (request === null && dialog.open) dialog.close();
  }, [request]);

  // Esc закрывает <dialog> сам — это «Отмена».
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const controller = new AbortController();
    dialog.addEventListener("close", () => onChoose(null), { signal: controller.signal });
    return () => controller.abort();
  }, [onChoose]);

  // Ширина рамки на экране, касания, колёсико.
  useEffect(() => {
    const frame = frameRef.current;
    if (frame === null || request === null) return;
    const controller = new AbortController();
    const { signal } = controller;

    const observer = new ResizeObserver(() => setFramePx(frame.clientWidth));
    observer.observe(frame);
    signal.addEventListener("abort", () => observer.disconnect());

    const pointers = new Map<number, Point>();
    /** Доля рамки под точкой экрана: 0…1 по каждой оси. */
    const fraction = (point: Point) => {
      const box = frame.getBoundingClientRect();
      return {
        fx: box.width > 0 ? (point.x - box.left) / box.width : 0.5,
        fy: box.height > 0 ? (point.y - box.top) / box.height : 0.5,
      };
    };
    const update = (change: (view: CropView, source: CropSource, px: number) => CropView) => {
      const { source: current, framePx: px } = latest.current;
      if (current === null || px <= 0) return;
      setView((view) => (view === null ? view : change(view, current, px)));
    };

    frame.addEventListener(
      "pointerdown",
      (event) => {
        frame.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      },
      { signal },
    );
    frame.addEventListener(
      "pointermove",
      (event) => {
        const previous = pointers.get(event.pointerId);
        if (previous === undefined) return;
        const next = { x: event.clientX, y: event.clientY };
        const other = [...pointers].find(([id]) => id !== event.pointerId)?.[1];
        pointers.set(event.pointerId, next);
        if (other === undefined) {
          update((view, current, px) =>
            panView(view, current, px, next.x - previous.x, next.y - previous.y),
          );
          return;
        }
        // Два пальца: приближение вокруг середины между ними и сдвиг за ней.
        const before = Math.hypot(previous.x - other.x, previous.y - other.y);
        const after = Math.hypot(next.x - other.x, next.y - other.y);
        if (before <= 0) return;
        const mid = { x: (next.x + other.x) / 2, y: (next.y + other.y) / 2 };
        const { fx, fy } = fraction(mid);
        update((view, current, px) =>
          panView(
            zoomView(view, current, after / before, fx, fy),
            current,
            px,
            (next.x - previous.x) / 2,
            (next.y - previous.y) / 2,
          ),
        );
      },
      { signal },
    );
    const release = (event: PointerEvent) => pointers.delete(event.pointerId);
    frame.addEventListener("pointerup", release, { signal });
    frame.addEventListener("pointercancel", release, { signal });

    // React вешает onWheel пассивным — preventDefault там не работает.
    frame.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const { fx, fy } = fraction({ x: event.clientX, y: event.clientY });
        update((view, current) =>
          zoomView(view, current, Math.exp(-event.deltaY * WHEEL_SPEED), fx, fy),
        );
      },
      { signal, passive: false },
    );

    return () => controller.abort();
  }, [request]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (source === null || view === null || framePx <= 0) return;
    const step = event.shiftKey ? KEY_STEP_BIG : KEY_STEP;
    // Стрелка двигает фото, как палец: вправо — фото едет вправо.
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    let next: CropView | null = null;
    if (move !== undefined) next = panView(view, source, framePx, move[0], move[1]);
    else if (event.key === "+" || event.key === "=") next = zoomView(view, source, KEY_ZOOM);
    else if (event.key === "-" || event.key === "_") next = zoomView(view, source, 1 / KEY_ZOOM);
    if (next === null) return;
    event.preventDefault();
    setView(next);
  };

  const scale = source !== null && view !== null ? viewScale(view, source, framePx) : 0;
  const frameH = request === null ? 0 : framePx / request.aspect;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="crop-title"
      aria-describedby="crop-hint"
      className="bg-paper text-ink rounded-panel xl:rounded-panel-d backdrop:bg-ink/60 m-auto w-[calc(100%-32px)] max-w-[480px] p-0"
    >
      {request === null || source === null || view === null ? null : (
        <div className="flex flex-col gap-[16px] p-[20px] xl:p-[28px]">
          <div className="flex flex-col gap-[8px]">
            <h2
              id="crop-title"
              className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight"
            >
              {t("editor.crop.title")}
            </h2>
            <p id="crop-hint" className="font-ui text-note xl:text-note-d text-body leading-[1.5]">
              {t("editor.crop.hint")}
            </p>
          </div>

          <div
            ref={frameRef}
            tabIndex={0}
            role="group"
            aria-label={t("editor.crop.title")}
            aria-describedby="crop-hint"
            aria-busy={!loaded}
            onKeyDown={onKeyDown}
            style={{
              aspectRatio: request.aspect,
              width: `min(100%, calc(52svh * ${request.aspect}))`,
            }}
            className="bg-surface rounded-inner relative cursor-grab touch-none self-center overflow-hidden select-none active:cursor-grabbing"
          >
            {/* Фото уже пересохранено (image.ts) и живёт как blob: — next/image тут не нужен. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={request.url}
              alt=""
              draggable={false}
              onLoad={() => setLoaded(true)}
              style={{
                width: request.width * scale,
                height: request.height * scale,
                transform: `translate(${framePx / 2 - view.cx * scale}px, ${frameH / 2 - view.cy * scale}px)`,
              }}
              className="pointer-events-none absolute top-0 left-0 max-w-none origin-top-left"
            />
          </div>

          <Slider
            labelKey="editor.crop.zoom"
            value={view.zoom}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            display={`${Math.round(view.zoom * 100)}%`}
            onChange={(zoom) => setView(clampView({ ...view, zoom }, source))}
          />

          <div className="flex flex-col gap-[8px]">
            <Button
              labelKey="editor.crop.apply"
              className="xl:w-full"
              disabled={!loaded}
              onClick={() => onChoose({ kind: "crop", rect: cropRectOf(view, source) })}
            />
            {request.whole ? (
              <Button
                labelKey="editor.crop.whole"
                tone="dark"
                className="xl:w-full"
                onClick={() => onChoose({ kind: "whole" })}
              />
            ) : null}
            <button
              type="button"
              onClick={() => onChoose(null)}
              className="font-ui text-note xl:text-note-d text-ink hover:text-gold-deep active:text-gold-deep min-h-tap self-center px-[12px] underline underline-offset-4 transition-colors"
            >
              {t("editor.crop.cancel")}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
