import type { Animation, Color, EditorDoc, Layer, StickerId } from "@/lib/editor/document";
import { anim, attach, circle, doc, photo, rect, sticker, text } from "@/lib/editor/template-kit";
import type { TextKey } from "@/lib/i18n";

/**
 * Вторая серия по design/открытки/ (09.10.2026): девять макетов —
 * «14 февраля 6–7», «новый год 3–6», «свадьба 3–5».
 *
 * Правила те же, что в lib/editor/series.ts:
 * - раскладка, цвета, характер шрифтов и надписи — как на макете, надписи
 *   не переводились (тут кроме английских есть португальские и турецкие);
 * - фото людей чужие → примеры StockSnap CC0 (`sample-love/strip/xmas/
 *   wed/amor-*`, CREDITS.md), своё фото обрезается под окно примера;
 * - чужие ники → @yourname, логотипы и «designed by» не переносились,
 *   годы событий → 2027;
 * - исключение — Кевин из «Один дома» в «новый год 6»: вырезан из самого
 *   макета, пользователь попросила оставить его обязательно.
 *
 * Квадратные и 9:16 макеты разложены в холст 3:4 (600 × 800): порядок
 * и пропорции элементов сохранены, вертикальные промежутки — нет.
 *
 * Геометрия окон плёнок (film-strip-red, film-strip-black) и уголков
 * арки — из scripts/draw-stickers.py: поменяли там — пересчитать здесь.
 */

export const SERIES2_IDS = [
  "val-booth",
  "val-soulmate",
  "ny-bestie",
  "ny-film",
  "ny-natal",
  "ny-kevin",
  "wd-savedate",
  "wd-post",
  "wd-amor",
] as const;
export type Series2Id = (typeof SERIES2_IDS)[number];

// ── Общие куски ─────────────────────────────────────────────

const twinkle = (delay: number, period = 1.3) =>
  anim({ in: "pop", inDuration: 0.4, delay, loop: "flicker", loopPeriod: period });

/** Фото в белой рамке с полями `pad`: рамка и фото движутся одним слоем. */
function framed(
  sample: StickerId,
  x: number,
  y: number,
  width: number,
  height: number,
  pad: number,
  angle: number,
  motion: Animation,
  paper: Color = "#ffffff",
): Layer[] {
  return [
    rect(x, y, width + pad * 2, height + pad * 2, paper, motion, angle),
    photo(sample, x, y, width, angle, motion),
  ];
}

/** Фото в окнах плёнки: `centers` — смещения окон от центра плёнки по её оси. */
function filmPhotos(
  samples: readonly StickerId[],
  cx: number,
  cy: number,
  scale: number,
  angle: number,
  centers: readonly number[],
  windowWidth: number,
  motion: Animation,
): Layer[] {
  return centers.map((dy, i) => {
    const at = attach(cx, cy, angle, 0, dy * scale);
    return photo(samples[i] ?? "sample-xmas-1", at.x, at.y, windowWidth * scale, angle, motion);
  });
}

// ── 14 февраля ─────────────────────────────────────────────

/** «this is my favorite boy» — три белые карточки поверх ч/б фото: кадр, цитата, кадр. */
function valBooth(): EditorDoc {
  const ink = "#141414";
  const white = "#ffffff";
  const nav = (y: number, angle: number) =>
    text("tpl.val-booth.nav", 300, y, "#f2f2f2", "inter", 10, {
      bold: true,
      angle,
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0.2 }),
    });
  const top = anim({ in: "slide-top", inDuration: 0.7, delay: 0.5 });
  const middle = anim({ in: "zoom", inDuration: 0.6, delay: 1.0 });
  const bottom = anim({ in: "slide-bottom", inDuration: 0.7, delay: 1.5 });
  return doc("#1c1c1c", [
    photo(
      "sample-love-bg",
      300,
      400,
      600,
      0,
      anim({ in: "fade", inDuration: 1, delay: 0, loop: "kenburns" }),
    ),
    {
      ...rect(300, 400, 600, 800, "#000000", anim({ in: "fade", inDuration: 1, delay: 0 })),
      opacity: 0.35,
    },
    nav(22, 0),
    nav(778, 180),
    // Верхняя карточка: кадр и подпись.
    rect(300, 168, 472, 256, white, top),
    photo("sample-love-1", 300, 152, 420, 0, top),
    text("tpl.val-booth.caption", 300, 278, ink, "cormorant", 18, { anim: top }),
    // Средняя: цитата между двумя линейками.
    rect(300, 400, 472, 176, white, middle),
    text("tpl.val-booth.kicker", 152, 336, ink, "ptmono", 10, { anim: middle }),
    text("tpl.val-booth.episode", 480, 336, ink, "inter", 9, { align: "right", anim: middle }),
    rect(300, 354, 420, 2, ink, middle),
    text("tpl.val-booth.quote", 300, 402, ink, "badscript", 36, {
      anim: anim({ in: "letters", inDuration: 1.2, delay: 1.5 }),
    }),
    rect(300, 450, 420, 2, ink, middle),
    text("tpl.val-booth.footer", 300, 468, ink, "inter", 9, {
      spacing: 300,
      anim: anim({ in: "tracking", inDuration: 0.8, delay: 1.9 }),
    }),
    // Нижняя: второй кадр и подпись архива.
    rect(300, 632, 472, 256, white, bottom),
    photo("sample-love-2", 300, 616, 420, 0, bottom),
    text("tpl.val-booth.archive", 300, 742, ink, "caveat", 17, {
      anim: anim({ in: "typewriter", inDuration: 0.6, delay: 2.3 }),
    }),
  ]);
}

/** «soul mate ,» — две ленты из фотобудки крест-накрест на бордо, «safe place» от руки. */
const BOOTH = { width: 268, height: 700, window: 240, centers: [-228, 0, 228] } as const;

function valSoulmate(): EditorDoc {
  const white = "#f6f1ec";
  const paper = "#f3efe8";
  const back = { x: 380, y: 400, angle: 2 };
  const front = { x: 290, y: 430, angle: 28 };
  const backIn = anim({ in: "slide-top", inDuration: 0.8, delay: 0.2 });
  const frontIn = anim({ in: "toss-right", inDuration: 0.8, delay: 0.7 });
  const label = (key: TextKey, dy: number, delay: number) => {
    const at = attach(front.x, front.y, front.angle, 0, dy);
    return text(key, at.x, at.y, "#ffffff", "inter", 13, {
      angle: front.angle,
      anim: anim({ in: "typewriter", inDuration: 0.6, delay }),
    });
  };
  const bar = (dy: number, width: number, delay: number) => {
    const at = attach(front.x, front.y, front.angle, 0, dy);
    return rect(
      at.x,
      at.y,
      width,
      20,
      "#111111",
      anim({ in: "fade", inDuration: 0.3, delay }),
      front.angle,
    );
  };
  const nick = attach(front.x, front.y, front.angle, 36, -250);
  return doc("#4a1418", [
    text("tpl.val-soulmate.since", 300, 34, white, "inter", 11, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0 }),
    }),
    rect(back.x, back.y, BOOTH.width, BOOTH.height, paper, backIn, back.angle),
    ...filmPhotos(
      ["sample-strip-1", "sample-strip-2", "sample-strip-3"],
      back.x,
      back.y,
      1,
      back.angle,
      BOOTH.centers,
      BOOTH.window,
      backIn,
    ),
    rect(front.x, front.y, BOOTH.width, BOOTH.height, paper, frontIn, front.angle),
    ...filmPhotos(
      ["sample-strip-4", "sample-strip-5", "sample-strip-6"],
      front.x,
      front.y,
      1,
      front.angle,
      BOOTH.centers,
      BOOTH.window,
      frontIn,
    ),
    text("tpl.val-soulmate.nick", nick.x, nick.y, "#ffffff", "inter", 9, {
      angle: front.angle,
      anim: anim({ in: "fade", inDuration: 0.4, delay: 1.6 }),
    }),
    bar(-12, 150, 1.8),
    bar(12, 168, 1.9),
    label("tpl.val-soulmate.quote1", -12, 1.8),
    label("tpl.val-soulmate.quote2", 12, 1.9),
    text("tpl.val-soulmate.title", 92, 150, white, "montserrat", 46, {
      bold: true,
      align: "left",
      anim: anim({ in: "slide-left", inDuration: 0.6, delay: 1.2 }),
    }),
    text("tpl.val-soulmate.sub", 82, 236, white, "inter", 12, {
      align: "left",
      anim: anim({ in: "typewriter", inDuration: 0.8, delay: 1.5 }),
    }),
    rect(82, 252, 124, 1, white, anim({ in: "slide-left", inDuration: 0.5, delay: 2.0 })),
    text("tpl.val-soulmate.forever", 300, 600, "#1a1a1a", "inter", 18, {
      anim: anim({ in: "typewriter", inDuration: 0.5, delay: 2.2 }),
    }),
    rect(300, 612, 92, 1, "#1a1a1a", anim({ in: "fade", inDuration: 0.4, delay: 2.4 })),
    text("tpl.val-soulmate.safe", 220, 690, "#e3f1f6", "badscript", 104, {
      angle: -6,
      anim: anim({ in: "letters", inDuration: 1, delay: 2.4 }),
    }),
    text("tpl.val-soulmate.place", 300, 708, white, "ptserif", 18, {
      angle: -10,
      anim: anim({ in: "fade", inDuration: 0.5, delay: 3.1 }),
    }),
    text("tpl.val-soulmate.handle", 552, 548, white, "inter", 11, {
      anim: anim({ in: "fade", inDuration: 0.5, delay: 2.8 }),
    }),
    text("tpl.val-soulmate.sign", 552, 590, white, "badscript", 40, {
      anim: anim({ in: "letters", inDuration: 0.6, delay: 3.0, loop: "pulse", loopPeriod: 2.6 }),
    }),
  ]);
}

// ── Новый год ──────────────────────────────────────────────

/** «Merry Christmas, you bestie!» — красный глянец, фото в рамке, пряник, бант, кассета. */
function nyBestie(): EditorDoc {
  const white = "#ffffff";
  const frameIn = anim({ in: "toss-bottom", inDuration: 0.7, delay: 0.6 });
  return doc("#a8141c", [
    sticker(
      "gloss-sheen",
      300,
      400,
      1,
      0,
      anim({ in: "fade", inDuration: 1.2, delay: 0, loop: "blink", loopPeriod: 5 }),
    ),
    text("tpl.ny-bestie.title", 330, 92, white, "marck", 38, {
      angle: -3,
      anim: anim({ in: "letters", inDuration: 1.2, delay: 0.2 }),
    }),
    text("tpl.ny-bestie.nav", 340, 150, white, "inter", 14, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0.4 }),
    }),
    ...framed("sample-xmas-friends", 284, 360, 372, 292, 24, 0, frameIn),
    sticker(
      "gingerbread",
      104,
      214,
      0.44,
      -10,
      anim({ in: "toss-left", inDuration: 0.6, delay: 1.3, loop: "swing", loopPeriod: 2.8 }),
    ),
    sticker(
      "bow-red",
      478,
      262,
      0.64,
      8,
      anim({ in: "pop", inDuration: 0.5, delay: 1.5, loop: "swing", loopPeriod: 3.4 }),
    ),
    sticker(
      "cassette",
      462,
      560,
      0.52,
      6,
      anim({ in: "slide-right", inDuration: 0.7, delay: 1.8 }),
    ),
    text("tpl.ny-bestie.letter", 196, 630, white, "inter", 13, {
      align: "left",
      anim: anim({ in: "typewriter", inDuration: 1.6, delay: 2.1 }),
    }),
    sticker("sparkle-gold", 72, 724, 0.2, 0, twinkle(3.2)),
    sticker("sparkle-gold", 534, 714, 0.16, 0, twinkle(3.4, 1.6)),
    sticker("sparkle-gold", 552, 96, 0.14, 0, twinkle(3.0, 1.5)),
  ]);
}

/** «Merry Christmas» — плёнка на три семейных кадра на мятой бумаге, остролист и снежинки. */
const RED_FILM = { window: 210, centers: [-187, -5, 177] } as const;

function nyFilm(): EditorDoc {
  const band = "#a8321a";
  const green = "#1f5a2a";
  const asterisks = (y: number, delay: number) =>
    Array.from({ length: 8 }, (_, i) =>
      sticker(
        "asterisk-cream",
        38 + i * 75,
        y,
        0.42,
        0,
        twinkle(delay + i * 0.05, 1.2 + (i % 3) * 0.3),
      ),
    );
  const film = { x: 300, y: 356, angle: -3, scale: 0.94 };
  const filmIn = anim({ in: "slide-top", inDuration: 0.9, delay: 0.5 });
  // Строки заголовка — отдельными слоями: межстрочный интервал холста
  // для рукописного кегля велик. Кремовая тень — как обводка на макете,
  // без неё зелёные буквы теряются на фото.
  const titleLine = (key: TextKey, x: number, y: number, delay: number): Layer[] =>
    [
      { fill: "#f6efe0" as Color, dx: 3 },
      { fill: green as Color, dx: 0 },
    ].map(({ fill, dx }) =>
      text(key, x + dx, y + dx, fill, "lobster", 58, {
        angle: -6,
        anim: anim({ in: "letters", inDuration: 0.6, delay }),
      }),
    );
  return doc("#efe8da", [
    rect(300, 32, 600, 64, band, anim({ in: "slide-left", inDuration: 0.6, delay: 0 })),
    rect(300, 768, 600, 64, band, anim({ in: "slide-right", inDuration: 0.6, delay: 0 })),
    ...asterisks(32, 0.4),
    ...asterisks(768, 0.6),
    sticker(
      "snowflake-rust",
      540,
      180,
      0.5,
      0,
      anim({ in: "rotate", inDuration: 0.8, delay: 1.4, loop: "float", loopPeriod: 3.4 }),
    ),
    sticker(
      "snowflake-rust",
      62,
      520,
      0.46,
      15,
      anim({ in: "rotate", inDuration: 0.8, delay: 1.6, loop: "float", loopPeriod: 3 }),
    ),
    sticker("film-strip-red", film.x, film.y, film.scale, film.angle, filmIn),
    ...filmPhotos(
      ["sample-xmas-1", "sample-xmas-2", "sample-xmas-3"],
      film.x,
      film.y,
      film.scale,
      film.angle,
      RED_FILM.centers,
      RED_FILM.window,
      filmIn,
    ),
    sticker("holly", 140, 128, 0.56, -12, anim({ in: "toss-left", inDuration: 0.6, delay: 1.2 })),
    sticker(
      "holly",
      470,
      612,
      0.62,
      160,
      anim({ in: "toss-right", inDuration: 0.6, delay: 1.9, loop: "swing", loopPeriod: 3.2 }),
    ),
    ...titleLine("tpl.ny-film.merry", 206, 590, 2.0),
    ...titleLine("tpl.ny-film.christmas", 252, 652, 2.5),
    text("tpl.ny-film.text", 214, 716, green, "montserrat", 16, {
      bold: true,
      align: "left",
      anim: anim({ in: "typewriter", inDuration: 0.9, delay: 2.8 }),
    }),
  ]);
}

/** «Um Feliz NATAL para todos!» — гирлянда, три фото в белых рамках, огромное «NATAL». */
function nyNatal(): EditorDoc {
  const red = "#a8352a";
  const olive = "#4f5232";
  const light = (x: number, y: number, i: number) =>
    sticker("sparkle-gold", x, y, 0.12, 0, twinkle(1.2 + i * 0.1, 1 + (i % 3) * 0.35));
  return doc("#efe9e6", [
    sticker("garland", 360, 46, 1.05, 4, anim({ in: "slide-top", inDuration: 0.8, delay: 0 })),
    sticker(
      "garland",
      330,
      766,
      1.05,
      182,
      anim({ in: "slide-bottom", inDuration: 0.8, delay: 0.1 }),
    ),
    sticker("candy-cane", 196, 86, 0.42, -6, anim({ in: "toss-top", inDuration: 0.6, delay: 0.4 })),
    sticker(
      "candy-cane",
      556,
      196,
      0.42,
      -24,
      anim({ in: "toss-right", inDuration: 0.6, delay: 0.5 }),
    ),
    light(118, 36, 0),
    light(250, 84, 1),
    light(402, 92, 2),
    light(520, 70, 3),
    light(140, 760, 4),
    light(470, 752, 5),
    rect(126, 176, 34, 10, olive, anim({ in: "fade", inDuration: 0.4, delay: 0.6 })),
    text("tpl.ny-natal.intro", 160, 236, "#8c3a2c", "ptserif", 16, {
      align: "left",
      anim: anim({ in: "typewriter", inDuration: 0.9, delay: 0.7 }),
    }),
    text("tpl.ny-natal.feliz", 172, 312, olive, "playfair", 38, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 1.3 }),
    }),
    // Две строки отдельными слоями: межстрочный интервал холста для
    // такого кегля слишком велик, на макете строки почти касаются.
    text("tpl.ny-natal.na", 168, 406, red, "playfair", 140, {
      scaleY: 0.92,
      anim: anim({ in: "land", inDuration: 0.8, delay: 1.5 }),
    }),
    text("tpl.ny-natal.tal", 196, 522, red, "playfair", 140, {
      scaleY: 0.92,
      anim: anim({ in: "land", inDuration: 0.8, delay: 1.7 }),
    }),
    text("tpl.ny-natal.todos", 200, 610, olive, "playfair", 34, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.2 }),
    }),
    ...framed(
      "sample-xmas-4",
      376,
      186,
      134,
      116,
      12,
      -4,
      anim({ in: "toss-top", inDuration: 0.6, delay: 1.8 }),
    ),
    ...framed(
      "sample-xmas-5",
      470,
      352,
      196,
      169,
      14,
      3,
      anim({ in: "toss-right", inDuration: 0.6, delay: 2.0 }),
    ),
    ...framed(
      "sample-xmas-6",
      424,
      540,
      164,
      142,
      12,
      -4,
      anim({ in: "toss-bottom", inDuration: 0.6, delay: 2.2 }),
    ),
    circle(330, 440, 36, "#4c5a3a", anim({ in: "rotate", inDuration: 0.6, delay: 2.6 })),
    text("tpl.ny-natal.badge", 330, 442, "#ffffff", "inter", 9, {
      bold: true,
      anim: anim({ in: "rotate", inDuration: 0.6, delay: 2.6 }),
    }),
  ]);
}

/** «Один дома» — шотландка, ёлка, календарь, камера печатает плёнку, Кевин кричит. */
const BLACK_FILM = { window: 196, centers: [-243, -81, 81, 243] } as const;

function nyKevin(): EditorDoc {
  const ink = "#1c1c1c";
  const film = { x: 430, y: 690, scale: 0.98 };
  const filmIn = anim({ in: "slide-top", inDuration: 1, delay: 1.4 });
  const calendar = anim({ in: "toss-left", inDuration: 0.6, delay: 0.8 });
  const at = (dx: number, dy: number) => attach(114, 316, -6, dx, dy);
  const title = at(0, -64);
  const script = at(10, -36);
  const grid = at(0, 30);
  return doc("#a11a1f", [
    sticker("tartan", 300, 400, 1, 0, anim({ in: "fade", inDuration: 0.6, delay: 0 })),
    sticker(
      "xmas-tree-photo",
      150,
      400,
      1,
      0,
      anim({ in: "slide-left", inDuration: 0.8, delay: 0.2 }),
    ),
    sticker("star-gold", 40, 36, 0.36, -8, twinkle(0.9, 1.4)),
    rect(114, 316, 210, 190, "#f8f6f1", calendar, -6),
    text("tpl.ny-kevin.month", title.x, title.y, ink, "playfair", 30, {
      angle: -6,
      anim: calendar,
    }),
    text("tpl.ny-kevin.month-script", script.x, script.y, "#5a5a5a", "marck", 18, {
      angle: -6,
      opacity: 0.8,
      anim: calendar,
    }),
    text("tpl.ny-kevin.grid", grid.x, grid.y, ink, "ptmono", 11, {
      align: "left",
      angle: -6,
      anim: calendar,
    }),
    // Плёнка выезжает из-под камеры: слой ниже камеры, появление сверху.
    sticker("film-strip-black", film.x, film.y, film.scale, 0, filmIn),
    ...filmPhotos(
      ["sample-xmas-7", "sample-xmas-8", "sample-xmas-9", "sample-xmas-10"],
      film.x,
      film.y,
      film.scale,
      0,
      BLACK_FILM.centers,
      BLACK_FILM.window,
      filmIn,
    ),
    sticker(
      "instant-camera",
      430,
      236,
      0.82,
      0,
      anim({ in: "toss-right", inDuration: 0.7, delay: 0.5 }),
    ),
    sticker("kiss-mark", 578, 398, 0.14, -12, anim({ in: "pop", inDuration: 0.4, delay: 2.4 })),
    sticker(
      "kevin",
      140,
      642,
      0.62,
      0,
      anim({ in: "pop", inDuration: 0.6, delay: 2.0, loop: "shake", loopPeriod: 2.4 }),
    ),
    sticker(
      "clapperboard",
      268,
      772,
      0.5,
      -18,
      anim({ in: "toss-bottom", inDuration: 0.6, delay: 2.6 }),
    ),
  ]);
}

// ── Свадьба ────────────────────────────────────────────────

/**
 * Арочная рамка 420 × 500 из четырёх уголков (arch-corner-l/r, 120 × 100)
 * и линий между ними. Нижние уголки — верхние, повёрнутые на 180°:
 * рамка симметрична по обеим осям. Фото — под уголками, своё фото
 * выделяется щелчком в середину рамки.
 */
const ARCH = { width: 420, height: 500, corner: { width: 120, height: 100 } } as const;

function arch(sample: StickerId, x: number, y: number, line: Color, motion: Animation): Layer[] {
  const w = ARCH.width / 2;
  const h = ARCH.height / 2;
  const cw = ARCH.corner.width / 2;
  const ch = ARCH.corner.height / 2;
  // Линия в уголке толщиной 3 и лежит на краю картинки: видна половина.
  const edge = 1.5;
  return [
    photo(sample, x, y, ARCH.width, 0, motion),
    sticker("arch-corner-l", x - w + cw, y - h + ch, 1, 0, motion),
    sticker("arch-corner-r", x + w - cw, y - h + ch, 1, 0, motion),
    sticker("arch-corner-r", x - w + cw, y + h - ch, 1, 180, motion),
    sticker("arch-corner-l", x + w - cw, y + h - ch, 1, 180, motion),
    rect(x - w + edge / 2, y, edge, ARCH.height - 2 * 86, line, motion),
    rect(x + w - edge / 2, y, edge, ARCH.height - 2 * 86, line, motion),
    rect(x, y - h + edge / 2, ARCH.width - 2 * ARCH.corner.width, edge, line, motion),
    rect(x, y + h - edge / 2, ARCH.width - 2 * ARCH.corner.width, edge, line, motion),
  ];
}

/** «SAVE THE DATE» — фото в арочной рамке, крупные инициалы за ним, дата внизу. */
function wdSavedate(): EditorDoc {
  const olive = "#4a4f2a";
  const small = (key: TextKey, x: number, y: number, delay: number, spacing = 0) =>
    text(key, x, y, olive, "inter", 11, {
      spacing,
      anim: anim({ in: "fade", inDuration: 0.6, delay }),
    });
  const rule = (x: number) =>
    rect(x, 732, 64, 1, olive, anim({ in: "fade", inDuration: 0.5, delay: 2.6 }));
  return doc("#e5dfcb", [
    text("tpl.wd-savedate.big-left", 34, 400, olive, "cormorant", 340, {
      italic: true,
      anim: anim({ in: "fade", inDuration: 1.2, delay: 0.3, loop: "float", loopPeriod: 4 }),
    }),
    text("tpl.wd-savedate.big-right", 586, 410, olive, "cormorant", 340, {
      anim: anim({ in: "fade", inDuration: 1.2, delay: 0.5, loop: "float", loopPeriod: 4.6 }),
    }),
    small("tpl.wd-savedate.corner", 116, 62, 0),
    text("tpl.wd-savedate.casamento", 300, 22, olive, "cormorant", 12, {
      spacing: 200,
      anim: anim({ in: "tracking", inDuration: 0.7, delay: 0.1 }),
    }),
    sticker("bicycle", 300, 64, 0.42, 0, anim({ in: "slide-left", inDuration: 0.8, delay: 0.2 })),
    small("tpl.wd-savedate.motto", 300, 106, 0.4),
    small("tpl.wd-savedate.names", 484, 62, 0.2, 200),
    ...arch("sample-wed-1", 300, 400, olive, anim({ in: "zoom", inDuration: 0.8, delay: 0.9 })),
    text("tpl.wd-savedate.title", 300, 690, olive, "cormorant", 54, {
      anim: anim({ in: "tracking", inDuration: 0.9, delay: 1.8 }),
    }),
    small("tpl.wd-savedate.since", 124, 732, 2.5),
    rule(214),
    small("tpl.wd-savedate.casamento", 300, 732, 2.5),
    rule(386),
    small("tpl.wd-savedate.year", 480, 732, 2.5),
    text("tpl.wd-savedate.date", 300, 772, olive, "cormorant", 36, {
      anim: anim({ in: "land", inDuration: 0.7, delay: 2.9 }),
    }),
  ]);
}

/** «Wedding Post» — первая полоса газеты: линейки, «SAVE the DATE», фото, имена. */
function wdPost(): EditorDoc {
  const ink = "#141414";
  const rule = (y: number, h: number, delay: number, from: "slide-left" | "slide-right") =>
    rect(300, y, 512, h, ink, anim({ in: from, inDuration: 0.6, delay }));
  const head = anim({ in: "fade", inDuration: 0.6, delay: 0.3 });
  const line = (key: TextKey, x: number) =>
    text(key, x, 142, ink, "playfair", 14, {
      italic: true,
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.8 }),
    });
  const word = (key: TextKey, x: number, delay: number) =>
    text(key, x, 222, ink, "playfair", 74, {
      bold: true,
      scaleY: 1.14,
      anim: anim({ in: "land", inDuration: 0.6, delay }),
    });
  return doc("#e9e7e2", [
    rule(44, 2, 0, "slide-left"),
    rect(134, 80, 2, 72, ink, head),
    rect(466, 80, 2, 72, ink, head),
    text("tpl.wd-post.special", 86, 80, ink, "playfair", 15, { italic: true, anim: head }),
    text("tpl.wd-post.special", 516, 80, ink, "playfair", 15, { italic: true, anim: head }),
    text("tpl.wd-post.masthead", 300, 80, ink, "playfair", 44, {
      bold: true,
      anim: anim({ in: "typewriter", inDuration: 0.8, delay: 0.4 }),
    }),
    rule(118, 3, 0.2, "slide-right"),
    rule(124, 1, 0.25, "slide-left"),
    line("tpl.wd-post.vol", 100),
    circle(196, 142, 7, ink, anim({ in: "pop", inDuration: 0.4, delay: 0.9 })),
    line("tpl.wd-post.std", 300),
    circle(404, 142, 7, ink, anim({ in: "pop", inDuration: 0.4, delay: 0.9 })),
    line("tpl.wd-post.when", 500),
    rule(160, 1, 0.6, "slide-right"),
    word("tpl.wd-post.save", 132, 1.1),
    text("tpl.wd-post.the", 296, 230, ink, "badscript", 54, {
      anim: anim({ in: "letters", inDuration: 0.6, delay: 1.4 }),
    }),
    word("tpl.wd-post.date", 460, 1.7),
    rule(282, 3, 1.9, "slide-left"),
    rule(288, 1, 1.95, "slide-right"),
    photo(
      "sample-wed-2",
      300,
      448,
      512,
      0,
      anim({ in: "fade", inDuration: 0.8, delay: 2.0, loop: "kenburns" }),
    ),
    rule(610, 3, 2.3, "slide-right"),
    rule(616, 1, 2.35, "slide-left"),
    text("tpl.wd-post.names", 300, 668, ink, "playfair", 60, {
      bold: true,
      scaleY: 1.18,
      anim: anim({ in: "land", inDuration: 0.7, delay: 2.6 }),
    }),
    text("tpl.wd-post.married", 300, 748, ink, "badscript", 44, {
      anim: anim({ in: "letters", inDuration: 1, delay: 3.1 }),
    }),
  ]);
}

/** «YOU & ME … Amor» — три ч/б кадра, красное сердце одной линией, слова о любви. */
function wdAmor(): EditorDoc {
  const red = "#d24a4a";
  const ink = "#141414";
  const line = (x: number, y: number, w: number, h: number, from: Animation["in"], delay: number) =>
    rect(x, y, w, h, red, anim({ in: from, inDuration: 0.6, delay }));
  return doc("#ffffff", [
    line(92, 56, 40, 2, "slide-left", 0),
    line(60, 106, 2, 76, "slide-top", 0),
    line(448, 56, 184, 2, "slide-right", 0),
    line(542, 134, 2, 156, "slide-top", 0.1),
    line(60, 644, 2, 140, "slide-bottom", 0.1),
    line(104, 742, 88, 2, "slide-left", 0.2),
    text("tpl.wd-amor.date", 80, 82, ink, "montserrat", 18, {
      bold: true,
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.3 }),
    }),
    text("tpl.wd-amor.title", 304, 150, red, "caveat", 84, {
      bold: true,
      angle: -8,
      anim: anim({ in: "letters", inDuration: 1, delay: 0.4 }),
    }),
    photo(
      "sample-amor-1",
      141,
      368,
      154,
      0,
      anim({ in: "slide-bottom", inDuration: 0.7, delay: 1.1 }),
    ),
    photo(
      "sample-amor-2",
      302,
      386,
      154,
      0,
      anim({ in: "slide-bottom", inDuration: 0.7, delay: 1.3 }),
    ),
    photo(
      "sample-amor-3",
      464,
      368,
      154,
      0,
      anim({ in: "slide-bottom", inDuration: 0.7, delay: 1.5 }),
    ),
    sticker(
      "heart-line-red",
      322,
      362,
      0.66,
      -6,
      anim({ in: "zoom", inDuration: 0.8, delay: 2.0, loop: "pulse", loopPeriod: 2.4 }),
    ),
    text("tpl.wd-amor.amor", 186, 536, red, "caveat", 86, {
      bold: true,
      anim: anim({ in: "letters", inDuration: 0.8, delay: 2.4 }),
    }),
    rect(156, 572, 130, 1, ink, anim({ in: "slide-left", inDuration: 0.5, delay: 2.8 })),
    text("tpl.wd-amor.text", 304, 646, ink, "ptserif", 14, {
      italic: true,
      anim: anim({ in: "fade", inDuration: 1, delay: 3.0 }),
    }),
  ]);
}

export const SERIES2: Readonly<Record<Series2Id, () => EditorDoc>> = {
  "val-booth": valBooth,
  "val-soulmate": valSoulmate,
  "ny-bestie": nyBestie,
  "ny-film": nyFilm,
  "ny-natal": nyNatal,
  "ny-kevin": nyKevin,
  "wd-savedate": wdSavedate,
  "wd-post": wdPost,
  "wd-amor": wdAmor,
};
