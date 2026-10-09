import type { Color, EditorDoc, FontId, Layer, StickerId } from "@/lib/editor/document";
import { anim, attach, doc, photo, rect, sticker, text } from "@/lib/editor/template-kit";
import type { TextKey } from "@/lib/i18n";

/**
 * Серия шаблонов по design/открытки/ (08.10.2026): пятнадцать макетов,
 * пять тем — 14 февраля, день рождения, Новый год, подруге, свадьба.
 *
 * Что взято из макетов и что нет:
 * - раскладка, цвета, характер шрифтов и тексты — как на макете,
 *   английские надписи не переводились (решение пользователя);
 * - фото людей с макетов чужие — вместо них примеры с Unsplash
 *   и StockSnap (`sample-*`, CREDITS.md), людей — уже без фона;
 *   своё фото встаёт на их место и обрезается под окно;
 * - фирменные знаки и чужие ники с макетов не переносились: вместо
 *   ника автора — «@yourname», логотип киностудии убран совсем.
 *
 * Анимация придумана к каждому макету в духе
 * design/пример анимации и дизайна.MP4: всё появляется по очереди
 * за первые 3–4 секунды, дальше живут только сердца, звёзды и блёстки.
 * Вариант без анимации — флаг `still` документа, его включают
 * в редакторе («Без анимации»), шаблонам он не нужен.
 *
 * Геометрия окон плёнки (film-strip) и диска (reel) — из
 * scripts/draw-stickers.py: поменяли там — пересчитать здесь.
 */

export const SERIES_IDS = [
  "val-wishing",
  "val-film",
  "val-loveis",
  "val-paper",
  "val-strip",
  "bd-disco",
  "bd-cinema",
  "bd-kittens",
  "ny-party",
  "ny-xmas",
  "fr-memory",
  "fr-polaroids",
  "fr-disc",
  "wd-married",
  "wd-kids",
] as const;
export type SeriesId = (typeof SERIES_IDS)[number];

// ── Общие куски ─────────────────────────────────────────────

/** Полароид из scripts/draw-stickers.py: 320 × 370, окно 260, центр окна выше на 27. */
const POLAROID = { width: 320, window: 260, windowDy: -27, captionDy: 138 } as const;

/** Полароид с фото в окне: рамка и фото влетают одним движением. */
function polaroid(
  sample: StickerId,
  x: number,
  y: number,
  scale: number,
  angle: number,
  delay: number,
): Layer[] {
  const motion = anim({ in: "toss-bottom", inDuration: 0.6, delay });
  const at = attach(x, y, angle, 0, POLAROID.windowDy * scale);
  return [
    sticker("polaroid", x, y, scale, angle, motion),
    photo(sample, at.x, at.y, POLAROID.window * scale, angle, motion),
  ];
}

/** Подпись на нижнем поле полароида. */
function caption(
  key: TextKey,
  x: number,
  y: number,
  scale: number,
  angle: number,
  fill: Color,
  font: FontId,
  size: number,
  delay: number,
): Layer {
  const at = attach(x, y, angle, 0, POLAROID.captionDy * scale);
  return text(key, at.x, at.y, fill, font, size, {
    angle,
    anim: anim({ in: "typewriter", inDuration: 0.7, delay }),
  });
}

/**
 * Буквы «из журнала»: каждая на своём клочке бумаги, свой шрифт
 * и цвет, лёгкий наклон. `letters` — ключи словаря по одной букве.
 */
const TILE_PAPER: readonly Color[] = [
  "#f4b6c2",
  "#fde7a9",
  "#cdd8f2",
  "#ffffff",
  "#e9d8f6",
  "#c9ecda",
  "#ffd7a8",
  "#f7f0e4",
];
const TILE_INK: readonly Color[] = ["#1f1f1f", "#c2185b", "#1e3a8a", "#7a1f2b", "#0f5132"];
const TILE_FONTS: readonly FontId[] = [
  "playfair",
  "oswald",
  "russo",
  "lobster",
  "rubik",
  "unbounded",
  "ptserif",
];
const TILT = [-5, 3, -2, 4, -4, 2, -3, 5, -1, 3] as const;

function tiles(
  letters: readonly TextKey[],
  y: number,
  size: number,
  delay: number,
  options: { paper?: readonly Color[]; ink?: readonly Color[]; x?: number } = {},
): Layer[] {
  const paper = options.paper ?? TILE_PAPER;
  const ink = options.ink ?? TILE_INK;
  const step = size * 0.92;
  const start = (options.x ?? 300) - (step * (letters.length - 1)) / 2;
  return letters.flatMap((key, i) => {
    const angle = TILT[i % TILT.length] ?? 0;
    const motion = anim({ in: "pop", inDuration: 0.4, delay: delay + i * 0.08 });
    const x = start + i * step;
    return [
      rect(x, y, size * 0.86, size, paper[i % paper.length] ?? "#ffffff", motion, angle),
      text(
        key,
        x,
        y + size * 0.04,
        ink[i % ink.length] ?? "#1f1f1f",
        TILE_FONTS[i % 7] ?? "rubik",
        size * 0.72,
        {
          bold: true,
          angle,
          anim: motion,
        },
      ),
    ];
  });
}

const beat = (delay: number, period = 1.4) =>
  anim({ in: "pop", inDuration: 0.5, delay, loop: "heartbeat", loopPeriod: period });
const twinkle = (delay: number, period = 1.3) =>
  anim({ in: "pop", inDuration: 0.4, delay, loop: "flicker", loopPeriod: period });

// ── 14 февраля ─────────────────────────────────────────────

/** «Wishing you a delightful Valentine's Day!» — рукописный заголовок, фото на листе в клетку. */
function valWishing(): EditorDoc {
  const red = "#a3172b";
  const photoIn = anim({ in: "toss-bottom", inDuration: 0.7, delay: 2.0 });
  return doc("#f4f0e8", [
    sticker("heart-red", 120, 92, 0.32, -12, beat(0.2)),
    sticker(
      "heart-doodle-red",
      446,
      96,
      0.62,
      10,
      anim({ in: "fade", inDuration: 0.6, delay: 0.3 }),
    ),
    text("tpl.val-wishing.title", 300, 222, red, "marck", 66, {
      bold: true,
      angle: -5,
      anim: anim({ in: "letters", inDuration: 1.5, delay: 0.4 }),
    }),
    text("tpl.val-wishing.text", 300, 382, "#5a1a1f", "ptmono", 10.5, {
      anim: anim({ in: "fade", inDuration: 0.8, delay: 1.8 }),
    }),
    text("tpl.val-wishing.handle", 300, 436, "#5a1a1f", "ptmono", 13, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.0 }),
    }),
    sticker(
      "grid-paper",
      262,
      640,
      1.18,
      -3,
      anim({ in: "toss-left", inDuration: 0.6, delay: 1.7 }),
    ),
    rect(336, 606, 404, 306, red, photoIn),
    photo("sample-bw-1", 336, 606, 396, 0, photoIn),
    sticker(
      "paperclip",
      150,
      478,
      0.82,
      -18,
      anim({ in: "toss-top", inDuration: 0.5, delay: 2.6 }),
    ),
    sticker("heart-red", 506, 468, 0.46, 14, beat(2.9, 1.3)),
  ]);
}

/** «save the date!» — наклонная фотоплёнка слева, рукописные слова справа. */
const FILM = { scale: 1.36, angle: 4, windowWidth: 144, centers: [-222, -74, 74, 222] } as const;

function valFilm(): EditorDoc {
  const ink = "#222222";
  const filmIn = anim({ in: "slide-top", inDuration: 0.9, delay: 0 });
  const samples: readonly StickerId[] = [
    "sample-bw-1",
    "sample-bw-2",
    "sample-bw-3",
    "sample-bw-4",
  ];
  const cx = 138;
  const cy = 400;
  return doc("#f6f5f2", [
    sticker("film-strip", cx, cy, FILM.scale, FILM.angle, filmIn),
    ...FILM.centers.map((dy, i) => {
      const at = attach(cx, cy, FILM.angle, 0, dy * FILM.scale);
      return photo(
        samples[i] ?? "sample-bw-1",
        at.x,
        at.y,
        FILM.windowWidth * FILM.scale,
        FILM.angle,
        filmIn,
      );
    }),
    sticker("glasses-doodle", 470, 210, 0.58, 0, anim({ in: "fade", inDuration: 0.6, delay: 2.4 })),
    text("tpl.val-film.save", 372, 318, ink, "badscript", 66, {
      angle: -22,
      anim: anim({ in: "letters", inDuration: 0.6, delay: 0.9 }),
    }),
    text("tpl.val-film.date", 428, 410, ink, "badscript", 86, {
      angle: -22,
      anim: anim({ in: "letters", inDuration: 0.9, delay: 1.4 }),
    }),
    text("tpl.val-film.when", 440, 566, ink, "playfair", 34, {
      anim: anim({ in: "land", inDuration: 0.6, delay: 2.2 }),
    }),
    text("tpl.val-film.who", 440, 628, ink, "inter", 16, {
      anim: anim({ in: "tracking", inDuration: 0.8, delay: 2.5 }),
    }),
    rect(440, 690, 210, 2, ink, anim({ in: "fade", inDuration: 0.5, delay: 2.9 })),
    sticker("heart-red", 440, 690, 0.08, 0, beat(3.0)),
  ]);
}

/** «Любовь это…» — карточка в тонкой рамке, большое окно с парой на закате, два сердца. */
function valLoveIs(): EditorDoc {
  const ink = "#111111";
  const frameIn = anim({ in: "fade", inDuration: 0.5, delay: 0 });
  return doc("#ffffff", [
    rect(300, 400, 552, 752, ink, frameIn),
    rect(300, 400, 548, 748, "#ffffff", frameIn),
    text("tpl.val-loveis.title", 160, 72, ink, "inter", 32, {
      bold: true,
      anim: anim({ in: "typewriter", inDuration: 0.8, delay: 0.3 }),
    }),
    text("tpl.val-loveis.title-en", 100, 110, ink, "ptmono", 22, {
      anim: anim({ in: "typewriter", inDuration: 0.5, delay: 1.0 }),
    }),
    sticker("heart-red", 466, 92, 0.48, -8, beat(1.2)),
    sticker("heart-red", 520, 76, 0.4, 10, beat(1.35, 1.5)),
    // Пара на закате вместо силуэта (09.10.2026, просьба пользователя):
    // та же рамка 344×430, своё фото обрезается под неё.
    sticker("sample-sunset", 300, 372, 0.43, 0, anim({ in: "zoom", inDuration: 0.7, delay: 1.5 })),
    text("tpl.val-loveis.text", 300, 640, ink, "inter", 23, {
      bold: true,
      anim: anim({ in: "fade", inDuration: 0.8, delay: 2.3 }),
    }),
    text("tpl.val-loveis.text-en", 300, 718, ink, "lobster", 26, {
      anim: anim({ in: "letters", inDuration: 0.9, delay: 2.8 }),
    }),
  ]);
}

/** «MY FOREVER VALENTINE» — первая полоса газеты: линейки, заголовок, фото с подписью. */
function valPaper(): EditorDoc {
  const red = "#8c1020";
  const rule = (y: number, h: number, delay: number, from: "slide-left" | "slide-right") =>
    rect(300, y, 524, h, red, anim({ in: from, inDuration: 0.6, delay }));
  const side = (x: number) =>
    text("tpl.val-paper.special", x, 70, red, "playfair", 12, {
      bold: true,
      italic: true,
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.5 }),
    });
  return doc("#f7f4f1", [
    rect(150, 34, 176, 2, red, anim({ in: "slide-left", inDuration: 0.6, delay: 0 })),
    rect(450, 34, 176, 2, red, anim({ in: "slide-right", inDuration: 0.6, delay: 0 })),
    text("tpl.val-paper.special-line", 300, 34, red, "playfair", 12, {
      bold: true,
      italic: true,
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.3 }),
    }),
    side(84),
    side(516),
    text("tpl.val-paper.kicker", 300, 68, red, "playfair", 30, {
      bold: true,
      anim: anim({ in: "typewriter", inDuration: 0.7, delay: 0.4 }),
    }),
    rule(102, 4, 0.2, "slide-left"),
    text("tpl.val-paper.title", 300, 220, red, "oswald", 80, {
      bold: true,
      scaleY: 1.08,
      anim: anim({ in: "land", inDuration: 0.7, delay: 0.8 }),
    }),
    rule(338, 2, 1.2, "slide-right"),
    sticker("heart-doodle-red", 300, 338, 0.16, 0, beat(1.4)),
    photo("sample-wide-1", 300, 508, 440, 0, anim({ in: "fade", inDuration: 0.8, delay: 1.5 })),
    text("tpl.val-paper.names", 300, 612, "#fff4f4", "marck", 60, {
      bold: true,
      angle: -6,
      anim: anim({ in: "letters", inDuration: 0.9, delay: 2.2 }),
    }),
    rule(680, 2, 2.6, "slide-left"),
    sticker("heart-doodle-red", 300, 680, 0.16, 0, beat(2.8)),
    text("tpl.val-paper.motto", 300, 728, red, "playfair", 25, {
      bold: true,
      italic: true,
      anim: anim({ in: "tracking", inDuration: 0.9, delay: 2.9 }),
    }),
    rule(774, 4, 3.2, "slide-right"),
  ]);
}

/** «HAPPY VALENTINES DAY» — лента из четырёх фото справа, буквы слева, сердце-отпечаток. */
function valStrip(): EditorDoc {
  const red = "#d0161e";
  const samples: readonly StickerId[] = [
    "sample-wide-1",
    "sample-wide-3",
    "sample-wide-5",
    "sample-wide-2",
  ];
  const word = (key: TextKey, x: number, y: number, delay: number) =>
    text(key, x, y, red, "oswald", 56, {
      bold: true,
      scaleY: 1.32,
      anim: anim({ in: "slide-left", inDuration: 0.6, delay }),
    });
  return doc("#ffffff", [
    ...samples.map((id, i) =>
      photo(
        id,
        448,
        118 + i * 190,
        222,
        0,
        anim({ in: "slide-right", inDuration: 0.6, delay: i * 0.2 }),
      ),
    ),
    rect(300, 150, 4, 236, red, anim({ in: "slide-top", inDuration: 0.6, delay: 0.8 })),
    rect(300, 660, 4, 244, red, anim({ in: "slide-bottom", inDuration: 0.6, delay: 0.8 })),
    // Слова прижаты вправо к красной линии: x — центр, правый край у 286.
    word("tpl.val-strip.happy", 212, 324, 1.1),
    word("tpl.val-strip.valentines", 152, 410, 1.25),
    word("tpl.val-strip.day", 242, 496, 1.4),
    sticker("heart-red", 92, 316, 0.24, -12, beat(1.7)),
    sticker("heart-red", 130, 348, 0.18, 10, beat(1.8, 1.6)),
    sticker(
      "cherries",
      102,
      494,
      0.22,
      -12,
      anim({ in: "toss-left", inDuration: 0.6, delay: 1.9 }),
    ),
    sticker(
      "heart-print",
      150,
      686,
      0.56,
      0,
      anim({ in: "fade", inDuration: 0.8, delay: 2.2, loop: "pulse", loopPeriod: 2.4 }),
    ),
  ]);
}

// ── День рождения ───────────────────────────────────────────

/** «It's my birthdayy!» — диско-шар, рваная бумага на бордо, фото именинника без фона. */
function bdDisco(): EditorDoc {
  const wine = "#7d1622";
  return doc(wine, [
    sticker(
      "torn-paper",
      300,
      404,
      1,
      -3,
      anim({ in: "slide-bottom", inDuration: 0.7, delay: 0 }),
      {
        scaleY: 2.35,
      },
    ),
    sticker(
      "mirror-ball",
      132,
      112,
      0.56,
      0,
      anim({ in: "toss-top", inDuration: 0.7, delay: 0.4, loop: "swing", loopPeriod: 3 }),
    ),
    text("tpl.bd-disco.title", 438, 196, wine, "marck", 46, {
      bold: true,
      angle: -6,
      anim: anim({ in: "letters", inDuration: 1, delay: 0.8 }),
    }),
    text("tpl.bd-disco.age", 410, 296, "#b9bcc2", "unbounded", 110, {
      bold: true,
      anim: anim({ in: "pop", inDuration: 0.6, delay: 1.6, loop: "float", loopPeriod: 2.6 }),
    }),
    text("tpl.bd-disco.when", 400, 388, wine, "playfair", 16, {
      bold: true,
      anim: anim({ in: "tracking", inDuration: 0.7, delay: 2.0 }),
    }),
    text("tpl.bd-disco.invite", 420, 432, wine, "montserrat", 16, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.2 }),
    }),
    text("tpl.bd-disco.place", 440, 482, wine, "montserrat", 13, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.3 }),
    }),
    // Парень лет двадцати трёх в позе ребёнка с макета: сидит, ноги вперёд.
    sticker("sample-disco", 200, 588, 0.5, 0, anim({ in: "fade", inDuration: 0.8, delay: 1.2 })),
    sticker(
      "party-hat",
      212,
      370,
      0.2,
      -10,
      anim({ in: "toss-left", inDuration: 0.6, delay: 1.8 }),
    ),
    sticker("cocktail", 520, 560, 0.22, 8, anim({ in: "toss-right", inDuration: 0.6, delay: 2.5 })),
    text("tpl.bd-disco.drink", 438, 628, wine, "montserrat", 14, {
      anim: anim({ in: "typewriter", inDuration: 0.6, delay: 2.7 }),
    }),
    sticker("vinyl", 548, 758, 0.5, 0, anim({ in: "slide-right", inDuration: 0.7, delay: 2.6 })),
    sticker("star-red", 82, 404, 0.34, -10, twinkle(2.8)),
    sticker("star-red", 528, 352, 0.2, 12, twinkle(2.9, 1.6)),
    sticker("star-red", 360, 760, 0.42, 8, twinkle(3.0, 1.4)),
    sticker("star-red", 72, 752, 0.3, -6, twinkle(3.1, 1.7)),
    sticker("star-doodle", 70, 236, 0.3, 0, twinkle(3.2, 1.2)),
  ]);
}

/** «HAPPY BIRTHDAY» — кинопремьера: красный зал, огромный заголовок, героиня поверх букв. */
function bdCinema(): EditorDoc {
  const gold = "#e8c25a";
  return doc("#1a0b0c", [
    sticker("cinema-seats", 300, 400, 1, 0, anim({ in: "fade", inDuration: 0.8, delay: 0 })),
    text("tpl.bd-cinema.date", 300, 104, gold, "oswald", 24, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0.4 }),
    }),
    rect(300, 122, 120, 2, gold, anim({ in: "fade", inDuration: 0.6, delay: 0.5 })),
    text("tpl.bd-cinema.premiere", 300, 152, "#ffffff", "unbounded", 22, {
      bold: true,
      anim: anim({ in: "tracking", inDuration: 0.8, delay: 0.6 }),
    }),
    text("tpl.bd-cinema.title", 300, 352, "#ffffff", "unbounded", 76, {
      bold: true,
      anim: anim({ in: "land", inDuration: 0.7, delay: 1.0 }),
    }),
    // Девушка сидит в кресле по центру зала, как на макете; голова
    // заходит на нижнюю строку заголовка.
    sticker(
      "sample-cinema",
      300,
      590,
      0.52,
      0,
      anim({ in: "slide-bottom", inDuration: 0.8, delay: 1.6 }),
    ),
    text("tpl.bd-cinema.left", 112, 486, gold, "rubik", 30, {
      anim: anim({ in: "slide-left", inDuration: 0.6, delay: 2.2 }),
    }),
    text("tpl.bd-cinema.right", 488, 490, gold, "rubik", 30, {
      anim: anim({ in: "slide-right", inDuration: 0.6, delay: 2.3 }),
    }),
    sticker(
      "popcorn",
      300,
      690,
      0.26,
      -4,
      anim({ in: "toss-bottom", inDuration: 0.6, delay: 2.6, loop: "swing", loopPeriod: 2.6 }),
    ),
  ]);
}

/** «HAPPY BirthdAY» — буквы из журнала, полароид, котята, торт и подсолнух. */
function bdKittens(): EditorDoc {
  const ink = "#333333";
  const happy: readonly TextKey[] = [
    "tpl.bd-kittens.h1",
    "tpl.bd-kittens.h2",
    "tpl.bd-kittens.h3",
    "tpl.bd-kittens.h4",
    "tpl.bd-kittens.h5",
  ];
  const birthday: readonly TextKey[] = [
    "tpl.bd-kittens.b1",
    "tpl.bd-kittens.b2",
    "tpl.bd-kittens.b3",
    "tpl.bd-kittens.b4",
    "tpl.bd-kittens.b5",
    "tpl.bd-kittens.b6",
    "tpl.bd-kittens.b7",
    "tpl.bd-kittens.b8",
  ];
  const note = anim({ in: "toss-right", inDuration: 0.6, delay: 2.2 });
  return doc("#f5f2ee", [
    ...tiles(happy, 92, 74, 0),
    ...tiles(birthday, 186, 68, 0.45),
    ...polaroid("sample-sq-1", 176, 398, 0.8, -4, 1.3),
    sticker("tape-pink", 172, 252, 0.3, -6, anim({ in: "fade", inDuration: 0.4, delay: 1.8 })),
    caption("tpl.bd-kittens.wish", 176, 398, 0.8, -4, ink, "caveat", 26, 2.0),
    sticker("ribbon", 70, 514, 0.17, -10, anim({ in: "pop", inDuration: 0.5, delay: 2.0 })),
    sticker("strawberry", 76, 584, 0.15, -8, anim({ in: "pop", inDuration: 0.5, delay: 2.1 })),
    sticker("strawberry", 112, 596, 0.13, 12, anim({ in: "pop", inDuration: 0.5, delay: 2.15 })),
    sticker("cat-face", 452, 336, 0.42, 6, anim({ in: "toss-right", inDuration: 0.6, delay: 1.6 })),
    sticker("sticky-note", 502, 530, 0.6, 6, note),
    text("tpl.bd-kittens.note", 502, 540, ink, "caveat", 24, { angle: 6, anim: note }),
    sticker("black-cat", 112, 712, 0.4, 0, anim({ in: "toss-left", inDuration: 0.6, delay: 2.4 })),
    sticker("birthday-cake", 182, 744, 0.17, 0, anim({ in: "pop", inDuration: 0.5, delay: 2.7 })),
    sticker("cupcake", 302, 724, 0.2, -6, anim({ in: "toss-bottom", inDuration: 0.6, delay: 2.6 })),
    sticker("cat", 418, 704, 0.38, 0, anim({ in: "toss-bottom", inDuration: 0.6, delay: 2.5 })),
    sticker(
      "party-hat",
      404,
      612,
      0.14,
      -10,
      anim({ in: "toss-top", inDuration: 0.5, delay: 2.9 }),
    ),
    sticker(
      "sunflower",
      534,
      726,
      0.2,
      10,
      anim({ in: "toss-right", inDuration: 0.6, delay: 2.8 }),
    ),
    sticker("heart-doodle-pink", 528, 132, 0.24, 10, beat(3.0)),
    sticker("heart-doodle-pink", 380, 470, 0.16, -10, beat(3.1, 1.6)),
    sticker("star-doodle", 52, 300, 0.2, 0, twinkle(3.2)),
    sticker("star-doodle", 556, 612, 0.16, 0, twinkle(3.3, 1.5)),
  ]);
}

// ── Новый год ──────────────────────────────────────────────

/** «NEW YEAR PARTY» — ёлка из фото в белых рамках на красном. */
function nyParty(): EditorDoc {
  const white = "#ffffff";
  const rows: readonly (readonly StickerId[])[] = [
    ["sample-sq-8"],
    ["sample-sq-6", "sample-sq-9"],
    ["sample-sq-10", "sample-sq-2", "sample-sq-7"],
    ["sample-sq-3", "sample-sq-11", "sample-sq-4", "sample-sq-12"],
  ];
  const size = 102;
  const step = 118;
  const tilt = [-4, 3, -2, 5, -3, 2, -5, 4, -2, 3] as const;
  let n = 0;
  const frames = rows.flatMap((row, r) => {
    const y = 176 + r * 112;
    return row.map((id, c) => {
      const x = 300 + (c - (row.length - 1) / 2) * step;
      const angle = tilt[n % tilt.length] ?? 0;
      // Снизу вверх: нижний ряд ложится первым, как ёлку собирают из фото.
      const motion = anim({
        in: "toss-bottom",
        inDuration: 0.5,
        delay: 0.3 + (3 - r) * 0.35 + c * 0.08,
      });
      n += 1;
      return [
        rect(x, y, size + 12, size + 12, white, motion, angle),
        photo(id, x, y, size, angle, motion),
      ];
    });
  });
  const flake = (x: number, y: number, scale: number, i: number) =>
    sticker(
      "snowflake-line",
      x,
      y,
      scale,
      i * 20,
      anim({
        in: "fade",
        inDuration: 0.6,
        delay: 2.2 + i * 0.1,
        loop: "float",
        loopPeriod: 3 + (i % 3) * 0.5,
      }),
      { opacity: 0.85 },
    );
  return doc("#c8102e", [
    text("tpl.ny-party.date", 110, 66, white, "oswald", 50, {
      bold: true,
      anim: anim({ in: "slide-left", inDuration: 0.6, delay: 0 }),
    }),
    text("tpl.ny-party.place", 110, 106, white, "oswald", 17, {
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.3 }),
    }),
    text("tpl.ny-party.time", 490, 66, white, "oswald", 50, {
      bold: true,
      anim: anim({ in: "slide-right", inDuration: 0.6, delay: 0 }),
    }),
    text("tpl.ny-party.start", 490, 106, white, "oswald", 17, {
      anim: anim({ in: "fade", inDuration: 0.5, delay: 0.3 }),
    }),
    ...frames.flat(),
    sticker("star-doodle-white", 300, 96, 0.5, 0, twinkle(1.9)),
    flake(78, 300, 0.12, 0),
    flake(522, 250, 0.1, 1),
    flake(110, 470, 0.09, 2),
    flake(500, 440, 0.12, 3),
    flake(450, 160, 0.08, 4),
    text("tpl.ny-party.kicker", 300, 604, white, "oswald", 24, {
      bold: true,
      spacing: 120,
      anim: anim({ in: "tracking", inDuration: 0.8, delay: 2.0 }),
    }),
    text("tpl.ny-party.title", 300, 696, white, "oswald", 58, {
      bold: true,
      scaleY: 1.1,
      anim: anim({ in: "land", inDuration: 0.7, delay: 2.3 }),
    }),
  ]);
}

/** «Merry Christmas & Happy New Year» — ёлка из полароидов, золотая лента и блёстки. */
function nyXmas(): EditorDoc {
  const green = "#2f4a2a";
  const gold = "#b8892f";
  const corner = (key: TextKey, x: number, y: number) =>
    text(key, x, y, gold, "montserrat", 12, {
      bold: true,
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.6 }),
    });
  const scale = 0.48;
  return doc("#e7e2d7", [
    sticker("gold-swirl", 300, 210, 1, 0, anim({ in: "slide-left", inDuration: 1, delay: 0 }), {
      opacity: 0.85,
    }),
    sticker(
      "glitter-gold",
      430,
      370,
      1.1,
      0,
      anim({ in: "fade", inDuration: 1, delay: 0.4, loop: "blink", loopPeriod: 2.6 }),
    ),
    sticker(
      "glitter-gold",
      150,
      560,
      0.8,
      90,
      anim({ in: "fade", inDuration: 1, delay: 0.6, loop: "blink", loopPeriod: 3.1 }),
    ),
    corner("tpl.ny-xmas.corner1", 84, 42),
    corner("tpl.ny-xmas.corner2", 300, 42),
    corner("tpl.ny-xmas.corner3", 516, 42),
    text("tpl.ny-xmas.wish", 140, 150, green, "montserrat", 15, {
      bold: true,
      italic: true,
      anim: anim({ in: "typewriter", inDuration: 1, delay: 2.2 }),
    }),
    ...polaroid("sample-sq-5", 132, 512, scale, -3, 0.5),
    ...polaroid("sample-sq-12", 300, 516, scale, 2, 0.62),
    ...polaroid("sample-sq-3", 468, 510, scale, 4, 0.74),
    ...polaroid("sample-sq-4", 216, 352, scale, -2, 0.9),
    ...polaroid("sample-sq-1", 384, 354, scale, 3, 1.02),
    ...polaroid("sample-sq-11", 300, 192, scale, 0, 1.18),
    sticker("star-gold", 300, 92, 0.44, 0, twinkle(1.4)),
    text("tpl.ny-xmas.title", 290, 628, green, "marck", 64, {
      angle: -6,
      anim: anim({ in: "letters", inDuration: 1.1, delay: 1.6 }),
    }),
    text("tpl.ny-xmas.and", 300, 724, green, "playfair", 22, {
      anim: anim({ in: "fade", inDuration: 0.4, delay: 2.5 }),
    }),
    text("tpl.ny-xmas.ny", 300, 752, green, "montserrat", 19, {
      bold: true,
      spacing: 300,
      anim: anim({ in: "tracking", inDuration: 0.8, delay: 2.6 }),
    }),
    corner("tpl.ny-xmas.handle", 96, 782),
    corner("tpl.ny-xmas.site", 500, 782),
  ]);
}

// ── Подруге ────────────────────────────────────────────────

/** Диск стереоскопа из scripts/draw-stickers.py: 640 × 640, окна 92 на радиусе 228. */
const REEL = { size: 640, radius: 228, window: 92 } as const;

/** Фото в окнах диска. `slots` — номера окон, 0 — верхнее, дальше по часовой через 30°. */
function reelPhotos(
  cx: number,
  cy: number,
  scale: number,
  slots: readonly number[],
  samples: readonly StickerId[],
  delay: number,
): Layer[] {
  return slots.map((slot, i) => {
    const angle = -90 + slot * 30;
    const rad = (angle * Math.PI) / 180;
    const r = REEL.radius * scale;
    return photo(
      samples[i % samples.length] ?? "sample-sq-1",
      cx + r * Math.cos(rad),
      cy + r * Math.sin(rad),
      (REEL.window - 10) * scale,
      angle + 90,
      anim({ in: "pop", inDuration: 0.45, delay: delay + i * 0.12 }),
    );
  });
}

/** «this is my memory of today» — бордовый холст, снизу половина диска с фото. */
function frMemory(): EditorDoc {
  const white = "#fbf3ee";
  const top = (key: TextKey, x: number) =>
    text(key, x, 40, white, "inter", 12, { anim: anim({ in: "fade", inDuration: 0.6, delay: 0 }) });
  const scale = 1.15;
  return doc("#6e1c1c", [
    top("tpl.fr-memory.design", 62),
    top("tpl.fr-memory.by", 300),
    top("tpl.fr-memory.handle", 520),
    text("tpl.fr-memory.this", 236, 168, white, "playfair", 40, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0.4 }),
    }),
    text("tpl.fr-memory.my", 508, 168, white, "playfair", 40, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 0.55 }),
    }),
    text("tpl.fr-memory.memory", 300, 250, white, "playfair", 124, {
      italic: true,
      anim: anim({ in: "letters", inDuration: 1, delay: 0.7 }),
    }),
    text("tpl.fr-memory.today", 214, 330, white, "playfair", 36, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 1.5 }),
    }),
    sticker("reel", 300, 790, scale, 0, anim({ in: "slide-bottom", inDuration: 0.9, delay: 1.2 })),
    ...reelPhotos(
      300,
      790,
      scale,
      [9, 10, 11, 0, 1, 2, 3],
      [
        "sample-sq-2",
        "sample-sq-5",
        "sample-sq-12",
        "sample-sq-1",
        "sample-sq-4",
        "sample-sq-3",
        "sample-sq-11",
      ],
      2.0,
    ),
  ]);
}

/** «i Love You» — три полароида на бордо в поцелуях, банты, «Favorite person». */
function frPolaroids(): EditorDoc {
  const kiss = (x: number, y: number, scale: number, angle: number, i: number) =>
    sticker(
      "kiss-mark",
      x,
      y,
      scale,
      angle,
      anim({ in: "fade", inDuration: 0.5, delay: i * 0.06 }),
      {
        opacity: 0.3,
      },
    );
  const love: readonly TextKey[] = [
    "tpl.fr-polaroids.l1",
    "tpl.fr-polaroids.l2",
    "tpl.fr-polaroids.l3",
    "tpl.fr-polaroids.l4",
  ];
  const you: readonly TextKey[] = [
    "tpl.fr-polaroids.y1",
    "tpl.fr-polaroids.y2",
    "tpl.fr-polaroids.y3",
  ];
  const paper: readonly Color[] = ["#ffffff", "#1f1f1f", "#ffffff", "#e9e3dc"];
  const ink: readonly Color[] = ["#1f1f1f", "#ffffff", "#1f1f1f", "#1f1f1f"];
  return doc("#5e1418", [
    kiss(80, 120, 0.42, -20, 0),
    kiss(330, 70, 0.36, 15, 1),
    kiss(540, 160, 0.4, 30, 2),
    kiss(60, 400, 0.38, 10, 3),
    kiss(300, 300, 0.44, -10, 4),
    kiss(560, 360, 0.36, -25, 5),
    kiss(120, 640, 0.4, 20, 6),
    kiss(420, 700, 0.42, -15, 7),
    kiss(560, 560, 0.34, 5, 8),
    ...polaroid("sample-sq-4", 228, 196, 0.78, -6, 0.4),
    ...polaroid("sample-sq-6", 404, 418, 0.78, 6, 0.6),
    ...polaroid("sample-sq-2", 212, 640, 0.78, -4, 0.8),
    caption("tpl.fr-polaroids.caption", 404, 418, 0.78, 6, "#333333", "caveat", 26, 1.6),
    sticker("love-letter", 390, 62, 0.2, 16, anim({ in: "toss-top", inDuration: 0.6, delay: 1.3 })),
    sticker("rose", 82, 290, 0.22, -10, anim({ in: "toss-left", inDuration: 0.6, delay: 1.4 })),
    sticker("ribbon", 334, 300, 0.18, 14, anim({ in: "pop", inDuration: 0.5, delay: 1.5 })),
    sticker("ribbon", 108, 476, 0.3, -8, anim({ in: "pop", inDuration: 0.5, delay: 1.6 })),
    sticker("heart-red", 296, 762, 0.3, -8, beat(1.8)),
    text("tpl.fr-polaroids.favorite", 506, 218, "#f3c9cf", "caveat", 30, {
      bold: true,
      angle: 24,
      anim: anim({ in: "typewriter", inDuration: 0.7, delay: 2.0 }),
    }),
    sticker("arrow-doodle", 522, 296, 0.26, 70, anim({ in: "fade", inDuration: 0.4, delay: 2.5 })),
    ...tiles(["tpl.fr-polaroids.i"], 568, 50, 2.6, { x: 486 }),
    ...tiles(love, 636, 56, 2.7, { x: 474, paper, ink }),
    ...tiles(you, 706, 56, 3.0, { x: 474, paper, ink }),
  ]);
}

/** «DISC 1 MEMORIES» — диск стереоскопа целиком, двенадцать фото по кругу. */
function frDisc(): EditorDoc {
  const wine = "#7a1a1a";
  const scale = 0.84;
  const cx = 292;
  const cy = 404;
  return doc("#ece5d2", [
    text("tpl.fr-disc.mood", 112, 94, "#5a1a1a", "inter", 22, {
      anim: anim({ in: "typewriter", inDuration: 0.6, delay: 0 }),
    }),
    sticker("burst", 520, 196, 0.92, 10, anim({ in: "rotate", inDuration: 0.7, delay: 0.3 })),
    sticker("reel", cx, cy, scale, 0, anim({ in: "zoom", inDuration: 0.8, delay: 0.4 })),
    ...reelPhotos(
      cx,
      cy,
      scale,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [
        "sample-sq-1",
        "sample-sq-2",
        "sample-sq-3",
        "sample-sq-4",
        "sample-sq-5",
        "sample-sq-6",
        "sample-sq-7",
        "sample-sq-8",
        "sample-sq-9",
        "sample-sq-10",
        "sample-sq-11",
        "sample-sq-12",
      ],
      1.1,
    ),
    text("tpl.fr-disc.disc", cx, cy - 76, wine, "inter", 18, {
      anim: anim({ in: "fade", inDuration: 0.5, delay: 2.6 }),
    }),
    text("tpl.fr-disc.title", cx, cy - 40, wine, "playfair", 40, {
      scaleX: 0.86,
      anim: anim({ in: "land", inDuration: 0.6, delay: 2.8 }),
    }),
    text("tpl.fr-disc.month", cx, cy + 52, wine, "inter", 18, {
      spacing: 120,
      anim: anim({ in: "tracking", inDuration: 0.6, delay: 3.0 }),
    }),
    sticker("burst", 84, 702, 0.56, -8, anim({ in: "rotate", inDuration: 0.6, delay: 3.1 })),
    text("tpl.fr-disc.dump", 84, 702, "#ffffff", "inter", 18, {
      anim: anim({ in: "rotate", inDuration: 0.6, delay: 3.1 }),
    }),
    text("tpl.fr-disc.life", 448, 742, "#5a1a1a", "inter", 22, {
      anim: anim({ in: "typewriter", inDuration: 0.8, delay: 3.3 }),
    }),
  ]);
}

// ── Свадьба ────────────────────────────────────────────────

/** «We Getting Married» — фраза семь раз во весь лист, полароид с руками поверх. */
function wdMarried(): EditorDoc {
  const red = "#e32b2b";
  const ink = "#222222";
  const rows = Array.from({ length: 7 }, (_, i) =>
    text("tpl.wd-married.row", 300, 74 + i * 82, red, "marck", 66, {
      bold: true,
      anim: anim({
        in: i % 2 === 0 ? "slide-left" : "slide-right",
        inDuration: 0.6,
        delay: i * 0.12,
      }),
    }),
  );
  const scale = 1.12;
  const angle = 5;
  const card = { x: 330, y: 332 };
  const names = attach(card.x, card.y, angle, -80, 30 * scale);
  return doc("#f2f1ee", [
    ...rows,
    ...polaroid("sample-bw-sq", card.x, card.y, scale, angle, 1.0),
    text("tpl.wd-married.names", names.x, names.y, ink, "marck", 30, {
      angle: -8,
      anim: anim({ in: "letters", inDuration: 0.8, delay: 1.8 }),
    }),
    caption("tpl.wd-married.date", card.x + 60, card.y, scale, angle, ink, "caveat", 30, 2.4),
    text("tpl.wd-married.text", 300, 652, red, "caveat", 22, {
      anim: anim({ in: "fade", inDuration: 0.8, delay: 2.8 }),
    }),
    text("tpl.wd-married.rsvp", 196, 736, red, "caveat", 16, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 3.2 }),
    }),
    rect(300, 736, 2, 46, red, anim({ in: "fade", inDuration: 0.6, delay: 3.2 })),
    text("tpl.wd-married.address", 410, 736, red, "caveat", 16, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 3.3 }),
    }),
  ]);
}

/** «Приглашаем на свадьбу» — рисованная рамка, «жених» и «невеста» на детских фото. */
function wdKids(): EditorDoc {
  const brown = "#b5432a";
  return doc("#ffffff", [
    sticker("frame-sketch", 300, 400, 1, 0, anim({ in: "fade", inDuration: 0.8, delay: 0 })),
    rect(300, 104, 300, 2, brown, anim({ in: "fade", inDuration: 0.5, delay: 0.3 })),
    text("tpl.wd-kids.title", 300, 158, brown, "amatic", 46, {
      bold: true,
      spacing: 100,
      anim: anim({ in: "typewriter", inDuration: 0.8, delay: 0.4 }),
    }),
    text("tpl.wd-kids.word", 300, 226, brown, "amatic", 76, {
      bold: true,
      spacing: 80,
      anim: anim({ in: "letters", inDuration: 0.8, delay: 1.1 }),
    }),
    // Жених и невеста — малыши, в цвете (просьба пользователя 08.10.2026).
    sticker(
      "sample-groom",
      208,
      470,
      0.42,
      0,
      anim({ in: "toss-left", inDuration: 0.7, delay: 1.7 }),
    ),
    sticker(
      "sample-bride",
      398,
      470,
      0.42,
      0,
      anim({ in: "toss-right", inDuration: 0.7, delay: 1.9 }),
    ),
    text("tpl.wd-kids.groom", 214, 318, brown, "amatic", 32, {
      bold: true,
      angle: -10,
      anim: anim({ in: "typewriter", inDuration: 0.5, delay: 2.5 }),
    }),
    text("tpl.wd-kids.bride", 432, 330, brown, "amatic", 32, {
      bold: true,
      angle: 24,
      anim: anim({ in: "typewriter", inDuration: 0.5, delay: 2.7 }),
    }),
    sticker("heart-doodle-red", 92, 396, 0.22, -10, beat(3.0)),
    sticker("heart-doodle-red", 506, 470, 0.2, 12, beat(3.1, 1.6)),
    sticker("heart-doodle-red", 538, 492, 0.14, -6, beat(3.2, 1.5)),
    text("tpl.wd-kids.date", 300, 660, brown, "amatic", 96, {
      bold: true,
      spacing: 120,
      anim: anim({ in: "land", inDuration: 0.7, delay: 2.9 }),
    }),
    text("tpl.wd-kids.start", 300, 726, brown, "amatic", 36, {
      bold: true,
      spacing: 60,
      anim: anim({ in: "tracking", inDuration: 0.7, delay: 3.3 }),
    }),
  ]);
}

export const SERIES: Readonly<Record<SeriesId, () => EditorDoc>> = {
  "val-wishing": valWishing,
  "val-film": valFilm,
  "val-loveis": valLoveIs,
  "val-paper": valPaper,
  "val-strip": valStrip,
  "bd-disco": bdDisco,
  "bd-cinema": bdCinema,
  "bd-kittens": bdKittens,
  "ny-party": nyParty,
  "ny-xmas": nyXmas,
  "fr-memory": frMemory,
  "fr-polaroids": frPolaroids,
  "fr-disc": frDisc,
  "wd-married": wdMarried,
  "wd-kids": wdKids,
};
