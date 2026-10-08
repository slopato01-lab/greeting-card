/**
 * Проверка формата шаблона. Гоняется встроенным `node --test`
 * (`pnpm test`), без тестового фреймворка: Node 22 сам понимает
 * TypeScript, если в коде нет ничего, кроме типов.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CARD_WIDTH,
  clampLayer,
  defaultLayer,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  emptyDoc,
  LIMITS,
  parseEditorDoc,
  parseEditorJson,
} from "./document.ts";

const valid = {
  format: EDITOR_FORMAT,
  version: EDITOR_VERSION,
  background: "paper",
  layers: [
    {
      kind: "rect",
      x: 300,
      y: 400,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fill: "gold",
      width: 400,
      height: 500,
    },
    {
      kind: "text",
      x: 300,
      y: 200,
      angle: -90,
      scaleX: 1,
      scaleY: 1,
      fill: "canvas",
      text: "С днём рождения!",
      fontSize: 40,
      font: "display",
    },
    { kind: "circle", x: 100, y: 100, angle: 0, scaleX: 2, scaleY: 2, fill: "muted", radius: 50 },
  ],
};

test("корректный шаблон проходит и сохраняет порядок слоёв", () => {
  const doc = parseEditorDoc(valid);
  assert.ok(doc);
  assert.deepEqual(
    doc.layers.map((l) => l.kind),
    ["rect", "text", "circle"],
  );
});

test("отрицательный угол приводится к 0…360", () => {
  const doc = parseEditorDoc(valid);
  assert.equal(doc?.layers[1]?.angle, 270);
});

test("лишние поля отбрасываются", () => {
  const withExtra = structuredClone(valid) as typeof valid & { evil?: string };
  withExtra.evil = "x";
  const firstLayer = withExtra.layers[0] as Record<string, unknown>;
  firstLayer.src = "https://example.com/tracker.png";

  const doc = parseEditorDoc(withExtra);
  assert.ok(doc);
  assert.equal("evil" in doc, false);
  assert.equal("src" in (doc.layers[0] ?? {}), false);
});

test("сырой JSON Fabric не принимается", () => {
  const fabricJson = {
    version: "5.3.0",
    objects: [{ type: "rect", left: 100, top: 150, width: 400, height: 500, fill: "#ffcccc" }],
  };
  assert.equal(parseEditorDoc(fabricJson), null);
});

test("цвет только из токенов", () => {
  const bad = structuredClone(valid);
  (bad.layers[0] as Record<string, unknown>).fill = "#ffcccc";
  assert.equal(parseEditorDoc(bad), null);
});

test("неизвестный вид слоя роняет весь шаблон", () => {
  const bad = structuredClone(valid);
  (bad.layers[0] as Record<string, unknown>).kind = "image";
  assert.equal(parseEditorDoc(bad), null);
});

test("числа: NaN, бесконечность и строки не проходят", () => {
  for (const x of [Number.NaN, Number.POSITIVE_INFINITY, "300", null]) {
    const bad = structuredClone(valid);
    (bad.layers[0] as Record<string, unknown>).x = x;
    assert.equal(parseEditorDoc(bad), null, `x = ${String(x)}`);
  }
});

test("пределы: длина текста, кегль, число слоёв", () => {
  const longText = structuredClone(valid);
  (longText.layers[1] as Record<string, unknown>).text = "а".repeat(LIMITS.textLength + 1);
  assert.equal(parseEditorDoc(longText), null);

  const hugeFont = structuredClone(valid);
  (hugeFont.layers[1] as Record<string, unknown>).fontSize = LIMITS.fontSize.max + 1;
  assert.equal(parseEditorDoc(hugeFont), null);

  const tooMany = {
    ...valid,
    layers: Array.from({ length: LIMITS.layers + 1 }, () => valid.layers[2]),
  };
  assert.equal(parseEditorDoc(tooMany), null);
});

test("другая версия формата не принимается", () => {
  assert.equal(parseEditorDoc({ ...valid, version: 2 }), null);
});

test("parseEditorJson не бросает на мусоре", () => {
  assert.equal(parseEditorJson("{не json"), null);
  assert.equal(parseEditorJson("null"), null);
  assert.ok(parseEditorJson(JSON.stringify(valid)));
});

test("пустой документ и слои по умолчанию проходят собственную проверку", () => {
  const doc = emptyDoc();
  doc.layers.push(
    defaultLayer("text", "Текст"),
    defaultLayer("rect", ""),
    defaultLayer("circle", ""),
  );
  const parsed = parseEditorDoc(JSON.parse(JSON.stringify(doc)));
  assert.deepEqual(parsed, doc);
  assert.equal(parsed?.layers[0]?.x, CARD_WIDTH / 2);
});

test("clampLayer: всё, что ушло с холста, проходит проверку на входе", () => {
  const wild = [
    {
      ...defaultLayer("text", "а".repeat(LIMITS.textLength + 100)),
      x: 99999,
      scaleX: 50,
      fontSize: 1,
    },
    { ...defaultLayer("rect", ""), y: -99999, angle: -725, width: 0, height: Number.NaN },
    { ...defaultLayer("circle", ""), scaleY: 0, radius: Number.POSITIVE_INFINITY },
  ];
  const doc = { ...emptyDoc(), layers: wild.map(clampLayer) };
  const parsed = parseEditorDoc(JSON.parse(JSON.stringify(doc)));
  assert.ok(parsed);
  assert.equal(
    parsed.layers[0]?.kind === "text" && parsed.layers[0].text.length,
    LIMITS.textLength,
  );
  assert.equal(parsed.layers[1]?.angle, 355);
});

test("clampLayer не трогает слой, который уже в пределах", () => {
  const layer = defaultLayer("text", "Текст");
  assert.deepEqual(clampLayer(layer), layer);
});
