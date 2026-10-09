import type { Animation, Color, EditorDoc, FontId, Layer, StickerId } from "@/lib/editor/document";
import { anim, attach, doc, photo, rect, sticker, text } from "@/lib/editor/template-kit";
import type { TextKey } from "@/lib/i18n";

/**
 * Третья серия по design/открытки/ (09.10.2026): двенадцать макетов —
 * «др», «др 1», «др 2», «с др», «любовь», «любовь 1–5», «подруге 3»,
 * «свадьба 6».
 *
 * Правила те же, что в series.ts и series-2.ts: раскладка, цвета,
 * характер шрифтов и надписи — как на макете, без перевода; фото людей
 * чужие → примеры StockSnap CC0 (CREDITS.md), своё фото обрезается под
 * окно примера. Подпись автора («chirokelle») не переносилась.
 *
 * Решения пользователя 09.10.2026: VOGUE оставить; коллажи «полумесяц»
 * и «сердце» — со всеми окнами макета (30 и 18), они с короной и
 * принимают до 30 своих фото (premium.ts); рекламу фотопечати
 * в «подруге 3» заменить своим текстом.
 *
 * Анимация минимальная (просьба пользователя): слои по очереди
 * проявляются, рукописные надписи пишутся по буквам, петли — только
 * у мелочей вроде звёзд и сердечек.
 *
 * Макеты 2:3 и 9:16 разложены в холст 3:4 (600 × 800): порядок
 * и пропорции элементов сохранены, вертикальные промежутки — нет.
 */

export const SERIES3_IDS = [
  "bd-vogue",
  "bd-bff",
  "bd-kodak",
  "bd-camera",
  "lv-pin",
  "lv-polaroid",
  "lv-moon",
  "lv-home",
  "lv-grid",
  "lv-feeling",
  "fr-moments",
  "wd-quote",
] as const;
export type Series3Id = (typeof SERIES3_IDS)[number];

// ── Общие куски ─────────────────────────────────────────────

const fade = (delay: number, duration = 0.6) => anim({ in: "fade", inDuration: duration, delay });
const write = (delay: number, duration = 1) => anim({ in: "letters", inDuration: duration, delay });

/** Окно коллажа: центр, ширина и высота в точках холста. */
type Tile = readonly [x: number, y: number, w: number, h: number];

/**
 * Окна коллажа по координатам макета: масштаб `k` вокруг точки
 * (fromX, fromY) макета, которая встаёт в (toX, toY) холста.
 */
function fromMockup(
  tiles: readonly Tile[],
  k: number,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): Tile[] {
  return tiles.map(([x, y, w, h]) => [toX + (x - fromX) * k, toY + (y - fromY) * k, w * k, h * k]);
}

/** Фото в окнах коллажа, по очереди проявляются. */
function tiles(
  windows: readonly Tile[],
  samples: readonly StickerId[],
  start: number,
  step: number,
): Layer[] {
  return windows.map(([x, y, w], i) =>
    photo(samples[i % samples.length] ?? "sample-moon-1", x, y, w, 0, fade(start + i * step, 0.5)),
  );
}

/** Полароид: белая карточка и фото в ней чуть выше центра, одним движением. */
function polaroid(
  sample: StickerId,
  x: number,
  y: number,
  photoWidth: number,
  frame: { width: number; height: number; lift: number },
  angle: number,
  motion: Animation,
  paper: Color = "#f7f6f2",
): Layer[] {
  const at = attach(x, y, angle, 0, -frame.lift);
  return [
    rect(x, y, frame.width, frame.height, paper, motion, angle),
    photo(sample, at.x, at.y, photoWidth, angle, motion),
  ];
}

const samples = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${prefix}-${i + 1}` as StickerId);

// ── День рождения ──────────────────────────────────────────

/** «VOGUE · 21st Birthday Edition» — обложка журнала на фото во весь лист. */
function bdVogue(): EditorDoc {
  const white = "#ffffff";
  return doc("#121212", [
    photo("sample-cover", 300, 400, 600, 0, fade(0, 1)),
    text("tpl.bd-vogue.masthead", 300, 104, white, "playfair", 128, {
      spacing: 40,
      anim: fade(0.4, 0.9),
    }),
    ...shadowed("tpl.bd-vogue.age", 476, 262, white, "playfair", 44, { anim: fade(1.0) }),
    ...shadowed("tpl.bd-vogue.suffix", 518, 246, white, "playfair", 20, { anim: fade(1.0) }),
    ...shadowed("tpl.bd-vogue.edition", 494, 338, white, "playfair", 42, { anim: fade(1.2) }),
    ...shadowed("tpl.bd-vogue.golden", 500, 418, white, "playfair", 20, { anim: fade(1.4) }),
    ...shadowed("tpl.bd-vogue.about", 124, 652, white, "playfair", 28, {
      bold: true,
      scaleX: 0.88,
      anim: fade(1.7),
    }),
    ...shadowed("tpl.bd-vogue.happy", 436, 650, white, "badscript", 80, {
      angle: -6,
      anim: write(2.0, 0.8),
    }),
    ...shadowed("tpl.bd-vogue.birthday", 470, 736, white, "badscript", 80, {
      angle: -6,
      anim: write(2.6, 1),
    }),
  ]);
}

/** «Happy Birthday, best friend» — красный коллаж на льне, печати и подруги без фона. */
function bdBff(): EditorDoc {
  const red = "#a3262a";
  const grid: Tile[] = [99, 300, 501].flatMap((x) => [342, 490].map((y): Tile => [x, y, 196, 146]));
  return doc("#e8e2dc", [
    text("tpl.bd-bff.best", 132, 70, red, "inter", 14, { bold: true, spacing: 80, anim: fade(0) }),
    text("tpl.bd-bff.grateful", 466, 70, red, "inter", 14, {
      bold: true,
      spacing: 80,
      anim: fade(0.1),
    }),
    text("tpl.bd-bff.happy", 306, 150, red, "badscript", 70, { angle: -4, anim: write(0.3, 0.8) }),
    text("tpl.bd-bff.birthday", 300, 222, red, "playfair", 62, {
      bold: true,
      scaleY: 1.1,
      anim: fade(0.9),
    }),
    ...tiles(grid, samples("sample-bff", 6), 1.1, 0.12),
    sticker("wax-seal", 200, 416, 0.34, -8, anim({ in: "pop", inDuration: 0.4, delay: 1.9 })),
    sticker("wax-seal", 400, 416, 0.34, 10, anim({ in: "pop", inDuration: 0.4, delay: 2.0 })),
    photo(
      "sample-bff-cut",
      300,
      688,
      340,
      0,
      anim({ in: "slide-bottom", inDuration: 0.8, delay: 2.2 }),
    ),
    text("tpl.bd-bff.family", 76, 650, red, "inter", 12, { bold: true, anim: fade(2.8) }),
    text("tpl.bd-bff.together", 528, 612, red, "inter", 12, { bold: true, anim: fade(3.0) }),
  ]);
}

/**
 * Тень — тот же текст тёмным со сдвигом: белая надпись на светлом
 * участке своего фото без неё теряется.
 */
function shadowed(
  key: TextKey,
  x: number,
  y: number,
  fill: Color,
  font: FontId,
  size: number,
  options: { bold?: boolean; angle?: number; scaleX?: number; anim: Animation },
): Layer[] {
  return [
    text(key, x + 2, y + 2, "#000000", font, size, { ...options, opacity: 0.55 }),
    text(key, x, y, fill, font, size, options),
  ];
}

/** «Happy Birthday» на плёнке Kodak: три кадра, большой кадр с пожеланием, три кадра. */
function bdKodak(): EditorDoc {
  const orange = "#e39a3b";
  const white = "#ffffff";
  const label = (y: number, delay: number) =>
    text("tpl.bd-kodak.film", 300, y, orange, "ptmono", 9, { bold: true, anim: fade(delay) });
  const row = (y: number): Tile[] => [100, 300, 500].map((x): Tile => [x, y, 176, 170]);
  return doc("#0d0b0a", [
    label(14, 0),
    ...tiles(row(112), samples("sample-kodak", 3), 0.2, 0.15),
    label(210, 0.4),
    photo("sample-kodak-big", 300, 400, 600, 0, fade(0.9, 0.8)),
    label(592, 1.2),
    ...tiles(row(690), samples("sample-kodak", 6).slice(3), 1.4, 0.15),
    label(788, 1.6),
    ...shadowed("tpl.bd-kodak.happy", 300, 366, white, "badscript", 46, { anim: write(2.0, 1) }),
    ...shadowed("tpl.bd-kodak.wish", 300, 424, white, "ptserif", 16, { anim: fade(2.8) }),
  ]);
}

/** «HAPPY BIRTHDAY» — фото в экране настоящего фотоаппарата, мишки и звёзды. */
function bdCamera(): EditorDoc {
  // Экран в camera-real.png: x 91–474, y 41–587 (383 × 546), центр
  // (282.5, 314) — от центра файла (272, 439.5) это (10.5, −125.5).
  // Фотоаппарат крупный, во всю высоту под надписью (просьба
  // пользователя 09.10.2026: «настоящий и больше»).
  const camera = { x: 300, y: 478, scale: 0.72 };
  const screen = attach(camera.x, camera.y, 0, 10.5 * camera.scale, -125.5 * camera.scale);
  const balloon = (key: TextKey, y: number, size: number, delay: number): Layer[] =>
    (
      [
        ["#7d838a", 3],
        ["#c9ced3", 0],
      ] as const
    ).map(([fill, d]) =>
      text(key, 300 + d, y + d, fill, "rubik", size, {
        bold: true,
        spacing: 40,
        anim: anim({ in: "land", inDuration: 0.7, delay }),
      }),
    );
  return doc("#ffffff", [
    sticker(
      "camera-real",
      camera.x,
      camera.y,
      camera.scale,
      0,
      anim({ in: "zoom", inDuration: 0.7, delay: 0 }),
    ),
    photo("sample-cam", screen.x, screen.y, 383 * camera.scale, 0, fade(0.6, 0.8)),
    ...balloon("tpl.bd-camera.happy", 60, 58, 1.0),
    ...balloon("tpl.bd-camera.birthday", 122, 54, 1.3),
    sticker(
      "teddy-bear",
      522,
      300,
      0.22,
      10,
      anim({ in: "pop", inDuration: 0.5, delay: 1.8, loop: "swing", loopPeriod: 3.2 }),
    ),
    sticker(
      "teddy-bear",
      88,
      702,
      0.28,
      -6,
      anim({ in: "pop", inDuration: 0.5, delay: 2.0, loop: "swing", loopPeriod: 3.6 }),
    ),
    sticker("party-hat", 82, 618, 0.15, -14, anim({ in: "pop", inDuration: 0.4, delay: 2.2 })),
    sticker(
      "star-silver",
      66,
      420,
      0.6,
      -12,
      anim({ in: "pop", inDuration: 0.4, delay: 2.3, loop: "pulse", loopPeriod: 2.4 }),
    ),
    sticker(
      "star-silver",
      528,
      728,
      0.62,
      14,
      anim({ in: "pop", inDuration: 0.4, delay: 2.5, loop: "pulse", loopPeriod: 2.8 }),
    ),
  ]);
}

// ── Любовь ─────────────────────────────────────────────────

/** «Любить» — фото на кнопке поверх мятой бумаги, красная нить, «Soulmate». */
function lvPin(): EditorDoc {
  const red = "#8a1f24";
  const ink = "#1d1d1d";
  const frame = { x: 318, y: 296, angle: 5 };
  const frameIn = anim({ in: "zoom", inDuration: 0.7, delay: 0.5 });
  return doc("#e7e7e5", [
    sticker("paper-crumpled", 300, 400, 1, 0, fade(0, 0.4)),
    sticker("red-thread", 300, 400, 1, 0, fade(0.2, 0.8)),
    sticker("torn-frame", frame.x, frame.y, 0.9, frame.angle, frameIn),
    photo("sample-pin", frame.x, frame.y, 404, frame.angle, frameIn),
    sticker("push-pin", 108, 62, 0.62, 0, anim({ in: "pop", inDuration: 0.4, delay: 1.1 })),
    text("tpl.lv-pin.love", 214, 176, red, "marck", 84, { angle: -10, anim: write(1.3, 1) }),
    text("tpl.lv-pin.line1", 300, 556, red, "montserrat", 22, { bold: true, anim: fade(2.2) }),
    text("tpl.lv-pin.line2", 352, 594, red, "montserrat", 22, { bold: true, anim: fade(2.5) }),
    sticker("paper-cloud", 168, 702, 1, 0, fade(2.8)),
    text("tpl.lv-pin.word", 130, 676, ink, "playfair", 30, { bold: true, anim: fade(3.0) }),
    text("tpl.lv-pin.meaning", 166, 726, ink, "ptserif", 14, { anim: fade(3.2) }),
    text("tpl.lv-pin.sign", 520, 762, "#555555", "badscript", 20, { anim: fade(3.4) }),
  ]);
}

/** «I LOVE YOU» — полароид на скотче на чёрном, обрывок письма и фонарь. */
function lvPolaroid(): EditorDoc {
  const cream = "#efe7d4";
  return doc("#0b0b0b", [
    sticker("letter-scrap", 150, 230, 1, 0, fade(0, 0.8)),
    sticker("street-lamp", 60, 610, 1, 0, fade(0.3, 0.8)),
    text("tpl.lv-polaroid.i-love", 440, 78, cream, "playfair", 76, { anim: fade(0.5) }),
    text("tpl.lv-polaroid.you", 440, 160, cream, "playfair", 76, { anim: fade(0.8) }),
    ...polaroid(
      "sample-tape",
      355,
      450,
      300,
      { width: 340, height: 400, lift: 16 },
      0,
      anim({ in: "zoom", inDuration: 0.7, delay: 1.1 }),
    ),
    sticker("tape-beige", 360, 252, 0.8, -2, anim({ in: "pop", inDuration: 0.4, delay: 1.7 })),
    sticker(
      "blossom",
      512,
      640,
      0.2,
      12,
      anim({ in: "pop", inDuration: 0.4, delay: 1.9, loop: "swing", loopPeriod: 3.4 }),
    ),
    text("tpl.lv-polaroid.always", 330, 764, cream, "inter", 22, {
      spacing: 60,
      anim: anim({ in: "typewriter", inDuration: 1.4, delay: 2.2 }),
    }),
  ]);
}

/**
 * «I love you to the moon and back» — полумесяц из 30 ч/б фото на чёрном.
 * Окна сняты с макета (533 × 900); почти все квадратные, одно 4:3.
 */
const MOON_TILES: readonly Tile[] = [
  [152, 288, 58, 56],
  [219, 281, 72, 72],
  [285, 257, 50, 38],
  [300, 300, 30, 30],
  [115, 357, 72, 72],
  [190, 357, 72, 72],
  [40, 450, 30, 30],
  [95, 432, 72, 72],
  [171, 432, 72, 72],
  [230, 452, 30, 30],
  [57, 508, 72, 72],
  [133, 508, 72, 72],
  [197, 498, 52, 52],
  [77, 583, 72, 72],
  [152, 583, 72, 72],
  [218, 555, 52, 52],
  [276, 560, 36, 36],
  [105, 650, 52, 52],
  [173, 662, 72, 72],
  [250, 618, 72, 72],
  [250, 693, 72, 72],
  [290, 700, 30, 30],
  [190, 727, 40, 40],
  [262, 762, 52, 52],
  [327, 656, 72, 72],
  [327, 733, 72, 72],
  [400, 684, 68, 68],
  [380, 740, 36, 36],
  [465, 660, 58, 58],
  [505, 705, 30, 30],
];

function lvMoon(): EditorDoc {
  const white = "#ffffff";
  const windows = fromMockup(MOON_TILES, 1.05, 266, 500, 300, 430);
  // Третье окно — 4:3, остальные квадратные.
  const pool = samples("sample-moon", 28);
  const order: StickerId[] = windows.map((_, i) =>
    i === 2
      ? "sample-bw-1"
      : i === 29
        ? "sample-bw-sq"
        : (pool[i < 2 ? i : i - 1] ?? "sample-moon-1"),
  );
  return doc("#000000", [
    ...tiles(windows, order, 0.2, 0.06),
    text("tpl.lv-moon.line1", 398, 352, white, "badscript", 36, { anim: write(2.2, 0.8) }),
    text("tpl.lv-moon.line2", 404, 404, white, "badscript", 36, { anim: write(2.9, 0.9) }),
  ]);
}

/** «home» — сердце из 18 фото, в середине большое; слова о доме справа внизу. */
const HOME_TILES: readonly Tile[] = [
  [80, 240, 40, 35],
  [132, 234, 58, 46],
  [203, 262, 76, 50],
  [303, 262, 78, 50],
  [375, 232, 58, 46],
  [425, 240, 36, 32],
  [105, 307, 114, 94],
  [403, 307, 114, 94],
  [68, 375, 34, 30],
  [125, 395, 76, 72],
  [381, 380, 74, 72],
  [440, 375, 36, 30],
  [138, 458, 48, 48],
  [369, 458, 48, 48],
  [203, 521, 36, 36],
  [255, 530, 66, 56],
  [309, 521, 36, 36],
];

function lvHome(): EditorDoc {
  const ink = "#161616";
  const at = (x: number, y: number) => fromMockup([[x, y, 0, 0]], 1.15, 253, 390, 300, 380)[0];
  const main = at(255, 395) ?? [302, 386, 0, 0];
  return doc("#ffffff", [
    photo("sample-home-main", main[0], main[1], 178 * 1.15, 0, fade(0.2, 0.8)),
    ...tiles(
      fromMockup(HOME_TILES, 1.15, 253, 390, 300, 380),
      samples("sample-home", 17),
      0.6,
      0.08,
    ),
    text("tpl.lv-home.home", 414, 652, ink, "playfair", 46, { bold: true, anim: fade(2.2) }),
    text("tpl.lv-home.text", 424, 708, ink, "inter", 12, {
      italic: true,
      align: "left",
      anim: fade(2.5),
    }),
    text("tpl.lv-home.love", 458, 760, ink, "playfair", 15, { bold: true, anim: fade(2.8) }),
  ]);
}

/** «люблю тебя» — десять ч/б фото рамкой вокруг слов. */
function lvGrid(): EditorDoc {
  const red = "#a3262a";
  const ink = "#161616";
  const windows: Tile[] = [
    [100, 103],
    [300, 103],
    [500, 103],
    [100, 301],
    [500, 301],
    [100, 499],
    [500, 499],
    [100, 697],
    [300, 697],
    [500, 697],
  ].map(([x = 0, y = 0]): Tile => [x, y, 176, 186]);
  return doc("#ffffff", [
    ...tiles(windows, samples("sample-grid", 10), 0.1, 0.12),
    text("tpl.lv-grid.love", 300, 252, red, "inter", 19, { anim: fade(1.5) }),
    text("tpl.lv-grid.text", 300, 388, ink, "inter", 17, { align: "left", anim: fade(1.9, 0.8) }),
    text("tpl.lv-grid.stronger", 300, 548, red, "marck", 32, { anim: write(2.6, 0.9) }),
  ]);
}

/** «ЛЮБИТЬ ТЕБЯ — самое прекрасное чувство»: красный маркер, котики, «ЛЮБОВЬ» из букв. */
function lvFeeling(): EditorDoc {
  const red = "#c62a2a";
  const ink = "#141414";
  const marker = (key: TextKey, x: number, y: number, delay: number) =>
    text(key, x, y, red, "shantell", 50, { bold: true, anim: fade(delay) });
  const letter = (key: TextKey, x: number, y: number, fill: Color, delay: number) =>
    text(key, x, y, fill, "playfair", 76, { bold: true, anim: fade(delay, 0.4) });
  return doc("#e4e4e4", [
    sticker("cats-doodle", 96, 70, 0.8, 0, anim({ in: "pop", inDuration: 0.5, delay: 0 })),
    text("tpl.lv-feeling.title", 304, 150, red, "shantell", 54, {
      bold: true,
      scaleX: 0.95,
      anim: fade(0.3),
    }),
    photo("sample-dark", 150, 390, 300, 0, fade(0.7, 0.8)),
    text("tpl.lv-feeling.definition", 462, 234, red, "ptmono", 9, { anim: fade(1.2) }),
    sticker("paper-scrap", 482, 450, 0.9, 4, fade(1.4)),
    letter("tpl.lv-feeling.l1", 482, 346, ink, 1.6),
    letter("tpl.lv-feeling.l2", 454, 450, ink, 1.8),
    letter("tpl.lv-feeling.l3", 510, 450, "#8e1f22", 1.9),
    letter("tpl.lv-feeling.l4", 482, 554, ink, 2.0),
    marker("tpl.lv-feeling.most", 120, 602, 2.3),
    marker("tpl.lv-feeling.beautiful", 236, 652, 2.5),
    marker("tpl.lv-feeling.feeling", 336, 702, 2.7),
    text("tpl.lv-feeling.text", 272, 768, red, "ptmono", 9, { anim: fade(3.0) }),
    sticker(
      "heart-doodle-red",
      536,
      700,
      0.36,
      -8,
      anim({ in: "pop", inDuration: 0.4, delay: 3.2, loop: "heartbeat", loopPeriod: 1.8 }),
    ),
    sticker(
      "heart-doodle-red",
      572,
      668,
      0.28,
      14,
      anim({ in: "pop", inDuration: 0.4, delay: 3.3, loop: "heartbeat", loopPeriod: 1.8 }),
    ),
  ]);
}

// ── Подруге ────────────────────────────────────────────────

/** «Some moments are too good to stay in gallery» — лист на скотче среди полароидов. */
function frMoments(): EditorDoc {
  const ink = "#1b1b1b";
  const frame = { width: 250, height: 236, lift: 16 };
  const shot = (i: number, x: number, y: number, angle: number) =>
    polaroid(
      `sample-moment-${i}` as StickerId,
      x,
      y,
      220,
      frame,
      angle,
      fade(0.1 + i * 0.15, 0.6),
      "#fbfbf9",
    );
  const line = (key: TextKey, y: number, delay: number) =>
    text(key, 300, y, ink, "caveat", 46, { anim: write(delay, 0.8) });
  return doc("#ebebeb", [
    ...shot(1, 112, 132, -10),
    ...shot(2, 512, 96, 12),
    ...shot(3, 86, 588, -12),
    ...shot(4, 540, 556, 8),
    ...shot(5, 470, 762, 5),
    ...shot(6, 150, 790, -4),
    rect(300, 420, 400, 580, "#f2efe6", fade(1.1)),
    sticker("tape-beige", 236, 136, 0.55, -4, anim({ in: "pop", inDuration: 0.4, delay: 1.3 })),
    sticker("tape-beige", 382, 710, 0.55, 3, anim({ in: "pop", inDuration: 0.4, delay: 1.4 })),
    sticker("dried-flower", 500, 354, 0.6, 0, fade(1.5)),
    text("tpl.fr-moments.cherish", 300, 182, ink, "inter", 13, { anim: fade(1.6) }),
    line("tpl.fr-moments.line1", 256, 1.8),
    line("tpl.fr-moments.line2", 312, 2.4),
    line("tpl.fr-moments.line3", 368, 3.0),
    text("tpl.fr-moments.text", 300, 502, ink, "inter", 12, { anim: fade(3.6) }),
    sticker("circle-doodle", 300, 610, 0.72, 0, fade(3.9)),
    text("tpl.fr-moments.love", 300, 610, ink, "inter", 13, { anim: fade(3.9) }),
  ]);
}

// ── Свадьба ────────────────────────────────────────────────

/** Цитата Хайнлайна на тетрадном листе, полароид со свадьбы на ч/б фоне. */
function wdQuote(): EditorDoc {
  const red = "#8e1f22";
  const angle = -4;
  const quote = (key: TextKey, y: number, delay: number) =>
    text(key, 364, y, red, "badscript", 25, { anim: write(delay, 0.8) });
  return doc("#2b2b2b", [
    photo("sample-wd-hands", 300, 400, 600, 0, fade(0, 1)),
    { ...rect(300, 400, 600, 800, "#000000", fade(0, 1)), opacity: 0.25 },
    sticker("notebook-sheet", 360, 590, 1, 0, fade(0.6)),
    ...polaroid(
      "sample-wd-dance",
      340,
      330,
      300,
      { width: 330, height: 320, lift: 18 },
      angle,
      anim({ in: "zoom", inDuration: 0.7, delay: 1.0 }),
    ),
    sticker("tape-maroon", 330, 176, 0.55, 2, anim({ in: "pop", inDuration: 0.4, delay: 1.6 })),
    quote("tpl.wd-quote.line1", 556, 2.0),
    quote("tpl.wd-quote.line2", 594, 2.6),
    quote("tpl.wd-quote.line3", 632, 3.2),
    quote("tpl.wd-quote.author", 688, 3.8),
  ]);
}

export const SERIES3: Readonly<Record<Series3Id, () => EditorDoc>> = {
  "bd-vogue": bdVogue,
  "bd-bff": bdBff,
  "bd-kodak": bdKodak,
  "bd-camera": bdCamera,
  "lv-pin": lvPin,
  "lv-polaroid": lvPolaroid,
  "lv-moon": lvMoon,
  "lv-home": lvHome,
  "lv-grid": lvGrid,
  "lv-feeling": lvFeeling,
  "fr-moments": frMoments,
  "wd-quote": wdQuote,
};
