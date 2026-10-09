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
  imageLayer,
  LIMITS,
  NO_ANIMATION,
  parseColor,
  parseEditorDoc,
  parseEditorJson,
  gameAssets,
  parseGame,
} from "./document.ts";

const anim = { ...NO_ANIMATION, in: "slide-left", out: "fade" };

const valid = {
  format: EDITOR_FORMAT,
  version: EDITOR_VERSION,
  background: "#fdf6e3",
  duration: 8,
  layers: [
    {
      kind: "rect",
      x: 300,
      y: 400,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      anim,
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
      opacity: 0.8,
      anim,
      fill: "#E53935",
      text: "С днём рождения!",
      fontSize: 40,
      font: "caveat",
      bold: true,
      italic: false,
      align: "center",
    },
    {
      kind: "image",
      x: 100,
      y: 100,
      angle: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      opacity: 1,
      anim,
      asset: "abcdef1234",
      width: 800,
      height: 600,
    },
  ],
  assets: {
    abcdef1234: "data:image/jpeg;base64,/9j/4AAQ",
    unused0000: "data:image/png;base64,iVBO",
  } as Record<string, string>,
};

const v1 = {
  format: EDITOR_FORMAT,
  version: 1,
  background: "paper",
  layers: [
    {
      kind: "text",
      x: 300,
      y: 200,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      fill: "canvas",
      text: "Привет",
      fontSize: 40,
      font: "ui",
    },
  ],
};

type Raw = Record<string, unknown>;
const layerOf = (doc: { layers: unknown[] }, i: number) => doc.layers[i] as Raw;

test("корректный шаблон проходит и сохраняет порядок слоёв", () => {
  const doc = parseEditorDoc(valid);
  assert.ok(doc);
  assert.deepEqual(
    doc.layers.map((l) => l.kind),
    ["rect", "text", "image"],
  );
});

test("hex приводится к нижнему регистру, токены остаются токенами", () => {
  const text = parseEditorDoc(valid)?.layers[1];
  assert.equal(text?.kind === "text" && text.fill, "#e53935");
  assert.equal(parseColor("gold"), "gold");
  assert.equal(parseColor("#FFF"), null);
  assert.equal(parseColor("red"), null);
  assert.equal(parseColor("#12345g"), null);
});

test("отрицательный угол приводится к 0…360", () => {
  assert.equal(parseEditorDoc(valid)?.layers[1]?.angle, 270);
});

test("фото без ссылок из слоёв выкидываются из assets", () => {
  assert.deepEqual(Object.keys(parseEditorDoc(valid)?.assets ?? {}), ["abcdef1234"]);
});

test("фото: только data URL картинок, без внешних адресов", () => {
  for (const url of [
    "https://example.com/a.jpg",
    "data:text/html;base64,PHNjcmlwdD4=",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/jpeg;base64,не base64",
  ]) {
    const bad = structuredClone(valid);
    bad.assets.abcdef1234 = url;
    assert.equal(parseEditorDoc(bad), null, url);
  }
});

test("фото: неверный id и больше десяти фото не проходят", () => {
  const badId = structuredClone(valid);
  layerOf(badId, 2).asset = "../etc/passwd";
  assert.equal(parseEditorDoc(badId), null);

  const photo = valid.layers[2];
  assert.ok(photo);
  const many = { ...valid, layers: Array.from({ length: LIMITS.images + 1 }, () => photo) };
  assert.equal(parseEditorDoc(many), null);
});

test("версия 1 читается и переводится во вторую", () => {
  const doc = parseEditorDoc(v1);
  assert.ok(doc);
  assert.equal(doc.version, 2);
  assert.equal(doc.duration, 6);
  const text = doc.layers[0];
  assert.ok(text?.kind === "text");
  assert.equal(text.font, "inter");
  assert.equal(text.bold, false);
  assert.equal(text.opacity, 1);
  assert.deepEqual(text.anim, NO_ANIMATION);
});

test("в версии 1 hex недопустим — его там не было", () => {
  const hex = structuredClone(v1);
  layerOf(hex, 0).fill = "#ffffff";
  assert.equal(parseEditorDoc(hex), null);
});

test("лишние поля отбрасываются", () => {
  const withExtra: Raw & typeof valid = structuredClone(valid);
  withExtra.evil = "x";
  layerOf(withExtra, 0).src = "https://example.com/tracker.png";

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

test("неизвестный вид слоя, шрифт или анимация роняют шаблон", () => {
  const cases: [number, string, unknown][] = [
    [0, "kind", "video"],
    [1, "font", "comic-sans"],
    [1, "align", "justify"],
    [0, "anim", { ...anim, in: "explode" }],
    [0, "anim", { ...anim, delay: -1 }],
    [0, "anim", null],
    [0, "opacity", 2],
  ];
  for (const [i, key, value] of cases) {
    const bad = structuredClone(valid);
    layerOf(bad, i)[key] = value;
    assert.equal(parseEditorDoc(bad), null, `${key} = ${JSON.stringify(value)}`);
  }
});

test("числа: NaN, бесконечность и строки не проходят", () => {
  for (const x of [Number.NaN, Number.POSITIVE_INFINITY, "300", null]) {
    const bad = structuredClone(valid);
    layerOf(bad, 0).x = x;
    assert.equal(parseEditorDoc(bad), null, `x = ${String(x)}`);
  }
});

test("пределы: длина текста, кегль, число слоёв, длительность", () => {
  const longText = structuredClone(valid);
  layerOf(longText, 1).text = "а".repeat(LIMITS.textLength + 1);
  assert.equal(parseEditorDoc(longText), null);

  const hugeFont = structuredClone(valid);
  layerOf(hugeFont, 1).fontSize = LIMITS.fontSize.max + 1;
  assert.equal(parseEditorDoc(hugeFont), null);

  const tooMany = {
    ...valid,
    layers: Array.from({ length: LIMITS.layers + 1 }, () => valid.layers[0]),
  };
  assert.equal(parseEditorDoc(tooMany), null);

  assert.equal(parseEditorDoc({ ...valid, duration: LIMITS.duration.max + 1 }), null);
});

test("другая версия формата не принимается", () => {
  assert.equal(parseEditorDoc({ ...valid, version: 3 }), null);
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
    imageLayer("abcdef1234", 1600, 1200),
  );
  const parsed = parseEditorDoc(JSON.parse(JSON.stringify(doc)));
  assert.deepEqual(parsed, doc);
  assert.equal(parsed?.layers[0]?.x, CARD_WIDTH / 2);
});

test("фото вписывается в 400 × 400", () => {
  const layer = imageLayer("abcdef1234", 1600, 800);
  assert.equal(layer.width * layer.scaleX, 400);
  assert.equal(imageLayer("abcdef1234", 200, 100).scaleX, 1);
});

test("clampLayer: всё, что ушло с холста, проходит проверку на входе", () => {
  const wild = [
    {
      ...defaultLayer("text", "а".repeat(LIMITS.textLength + 100)),
      x: 99999,
      scaleX: 50,
      fontSize: 1,
      opacity: 3,
    },
    { ...defaultLayer("rect", ""), y: -99999, angle: -725, width: 0, height: Number.NaN },
    {
      ...defaultLayer("circle", ""),
      scaleY: 0,
      radius: Number.POSITIVE_INFINITY,
      anim: { ...NO_ANIMATION, delay: 999, inDuration: 0 },
    },
  ];
  const doc = { ...emptyDoc(), layers: wild.map(clampLayer) };
  const parsed = parseEditorDoc(JSON.parse(JSON.stringify(doc)));
  assert.ok(parsed);
  const text = parsed.layers[0];
  assert.equal(text?.kind === "text" && text.text.length, LIMITS.textLength);
  assert.equal(parsed.layers[1]?.angle, 355);
});

test("clampLayer не трогает слой, который уже в пределах", () => {
  const layer = defaultLayer("text", "Текст");
  assert.deepEqual(clampLayer(layer), layer);
});

test("«Без анимации» сохраняется, а всё, кроме true, — нет", () => {
  assert.equal(parseEditorDoc({ ...valid, still: true })?.still, true);
  assert.equal(parseEditorDoc({ ...valid, still: "yes" })?.still, undefined);
  assert.equal(parseEditorDoc(valid)?.still, undefined);
  assert.equal("still" in (parseEditorDoc({ ...valid, still: false }) ?? {}), false);
});

test("музыка: библиотека и Яндекс проходят, чужой адрес и мусор — без музыки", () => {
  const lib = parseEditorDoc({ ...valid, music: { kind: "library", id: "sunny-pop" } });
  assert.deepEqual(lib?.music, { kind: "library", id: "sunny-pop" });

  const ya = parseEditorDoc({ ...valid, music: { kind: "yandex", album: "4766", track: "57703" } });
  assert.deepEqual(ya?.music, { kind: "yandex", album: "4766", track: "57703" });

  for (const music of [
    { kind: "yandex", album: "4766", track: "https://evil.example" },
    { kind: "library", id: "../../etc" },
    { kind: "url", src: "https://evil.example/a.mp3" },
    "sunny-pop",
  ]) {
    const doc = parseEditorDoc({ ...valid, music });
    assert.ok(doc, "открытка не должна падать из-за музыки");
    assert.equal(doc.music, undefined);
  }
});

test("игра: пазл со своими текстами и фото проходит, фото остаётся в assets", () => {
  const game = { kind: "puzzle", asset: "gamephoto1", title: "Ты лучший", caption: "Тебе от меня" };
  const doc = parseEditorDoc({
    ...valid,
    game,
    assets: { ...valid.assets, gamephoto1: "data:image/jpeg;base64,/9j/4AAQ" },
  });
  assert.deepEqual(doc?.game, game);
  assert.deepEqual(Object.keys(doc?.assets ?? {}).sort(), ["abcdef1234", "gamephoto1"]);
});

test("игра: непонятная не валит открытку, а просто пропадает", () => {
  assert.equal(
    parseEditorDoc({ ...valid, game: { kind: "tetris", title: "", caption: "" } })?.game,
    undefined,
  );
  assert.equal(
    parseGame({ kind: "puzzle", title: "x".repeat(LIMITS.gameText + 1), caption: "" }),
    null,
  );
  assert.equal(parseGame({ kind: "puzzle", title: 1, caption: "" }), null);
  assert.deepEqual(parseGame({ kind: "puzzle", asset: "../../etc", title: "", caption: "" }), {
    kind: "puzzle",
    title: "",
    caption: "",
  });
});

test("игра: «Собери пару» хранит до шести фото, кривые отбрасывает по одному", () => {
  const photos = ["pair000001", "pair000002", "../../etc", 7, "pair000003"].map((asset) => ({
    asset,
  }));
  const game = parseGame({ kind: "memory", photos, title: "", caption: "" });
  assert.deepEqual(game?.photos, [
    { asset: "pair000001" },
    { asset: "pair000002" },
    { asset: "pair000003" },
  ]);
  const many = Array.from({ length: 9 }, (_, index) => ({ asset: `pair00000${index}` }));
  assert.equal(
    parseGame({ kind: "memory", photos: many, title: "", caption: "" })?.photos?.length,
    LIMITS.gamePhotos,
  );
  assert.deepEqual(gameAssets(game), ["pair000001", "pair000002", "pair000003"]);

  const doc = parseEditorDoc({
    ...valid,
    game: { kind: "memory", photos: [{ asset: "pair000001" }], title: "", caption: "" },
    assets: {
      ...valid.assets,
      pair000001: "data:image/jpeg;base64,/9j/4AAQ",
      stray00001: "data:image/jpeg;base64,/9j/4AAQ",
    },
  });
  assert.deepEqual(Object.keys(doc?.assets ?? {}).sort(), ["abcdef1234", "pair000001"]);
});
