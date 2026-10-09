/**
 * Обрезка фото: рамка не выходит за фото, приближение в пределах,
 * точка под пальцами при приближении остаётся на месте.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  clampView,
  cropRectOf,
  initialView,
  MAX_ZOOM,
  panView,
  viewScale,
  zoomView,
} from "./crop.ts";

const landscape = { width: 1600, height: 900, aspect: 3 / 4 };

test("без приближения рамка — самый большой прямоугольник нужной пропорции по центру", () => {
  const rect = cropRectOf(initialView(landscape), landscape);
  assert.deepEqual(rect, { x: 463, y: 0, width: 675, height: 900 });
});

test("сдвиг упирается в край фото", () => {
  const view = panView(initialView(landscape), landscape, 300, 10_000, 10_000);
  const rect = cropRectOf(view, landscape);
  assert.equal(rect.x, 0);
  assert.equal(rect.y, 0);
  const other = cropRectOf(panView(view, landscape, 300, -20_000, 0), landscape);
  assert.equal(other.x + other.width, landscape.width);
});

test("приближение не выходит за пределы", () => {
  assert.equal(zoomView(initialView(landscape), landscape, 100).zoom, MAX_ZOOM);
  assert.equal(zoomView(initialView(landscape), landscape, 0.01).zoom, 1);
  assert.equal(clampView({ cx: 0, cy: 0, zoom: Number.NaN }, landscape).zoom, 1);
});

test("точка под пальцами остаётся на месте при приближении", () => {
  const start = { cx: 800, cy: 450, zoom: 2 };
  const scaleBefore = viewScale(start, landscape, 300);
  const next = zoomView(start, landscape, 1.5, 0.25, 0.75);
  const scaleAfter = viewScale(next, landscape, 300);
  // Экранная точка (0.25 · 300, 0.75 · 400) до и после — одна точка фото.
  const frameH = 300 / landscape.aspect;
  const before = {
    x: start.cx + (75 - 150) / scaleBefore,
    y: start.cy + (300 - frameH / 2) / scaleBefore,
  };
  const after = {
    x: next.cx + (75 - 150) / scaleAfter,
    y: next.cy + (300 - frameH / 2) / scaleAfter,
  };
  assert.ok(Math.abs(before.x - after.x) < 1e-6);
  assert.ok(Math.abs(before.y - after.y) < 1e-6);
});

test("прямоугольник всегда внутри фото и нужной пропорции", () => {
  const tall = { width: 900, height: 1600, aspect: 1 };
  for (const zoom of [1, 1.7, 3.3, 4]) {
    const rect = cropRectOf({ cx: 899, cy: 1, zoom }, tall);
    assert.ok(rect.x >= 0 && rect.y >= 0);
    assert.ok(rect.x + rect.width <= tall.width && rect.y + rect.height <= tall.height);
    assert.ok(Math.abs(rect.width / rect.height - 1) < 0.01);
  }
});
