import {
  type Animation,
  type Color,
  type EditorDoc,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  type FontId,
  type Layer,
  type StickerId,
  type StickerLayer,
  type TextLayer,
} from "@/lib/editor/document";
import { SERIES, SERIES_IDS } from "@/lib/editor/series";
import { SERIES2, SERIES2_IDS } from "@/lib/editor/series-2";
import { anim, sticker, text as kitText } from "@/lib/editor/template-kit";
import type { TextKey } from "@/lib/i18n";

/**
 * Готовые шаблоны редактора по образцу design/пример анимации и дизайна.MP4.
 *
 * Общая схема, снятая с видео покадрово:
 * - светлый однотонный фон, коллаж по центру;
 * - заголовок маркерным шрифтом с прыгающим регистром, появляется по буквам;
 * - обращение — второй строкой акцентным цветом, тоже по буквам;
 * - фото человека проявляется (в шаблоне — заглушка, её меняют на своё);
 * - стикеры влетают с поворотом по очереди, лента ложится последней;
 * - пожелание — моноширинным с разрядкой, собирается из разрядки;
 * - внизу маленькое сердечко с сердцебиением, огонёк свечи мерцает.
 *
 * Тексты — из словаря: это заготовки, их правят прямо на холсте.
 * Цвета — hex: это содержимое открытки, а не оформление сайта
 * (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
 */

export const TEMPLATE_IDS = [
  "birthday",
  "party",
  "polaroid",
  ...SERIES_IDS,
  ...SERIES2_IDS,
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateInfo = { id: TemplateId; label: TextKey; build: () => EditorDoc };

/** Текст по центру открытки — так стоят почти все надписи старых шаблонов. */
function text(
  key: TextKey,
  y: number,
  fill: Color,
  font: FontId,
  fontSize: number,
  options: { bold?: boolean; spacing?: number; anim: Animation },
): TextLayer {
  return kitText(key, 300, y, fill, font, fontSize, options);
}

/** Общий каркас: заголовок, обращение, фото, пожелание, сердечко. */
function card(options: {
  background: Color;
  ink: Color;
  accent: Color;
  title: TextKey;
  titleLines: 1 | 2;
  who: TextKey;
  wish: TextKey;
  heart: StickerId;
  /**
   * Фото по центру. По умолчанию — серый силуэт; в «Дне рождения» —
   * пример уже вырезанного фото, своё на его место встаёт без фона.
   */
  photo?: { sticker: StickerId; x: number; y: number; scale: number };
  /** Стикеры между фото и пожеланием — у каждой темы свои. */
  decor: Layer[];
}): EditorDoc {
  const photo = options.photo ?? { sticker: "photo-placeholder", x: 288, y: 468, scale: 0.62 };
  const titleY = options.titleLines === 2 ? 108 : 92;
  const whoY = options.titleLines === 2 ? 206 : 160;
  const layers: Layer[] = [
    text(options.title, titleY, options.ink, "shantell", 50, {
      bold: true,
      anim: anim({ in: "letters", inDuration: 1, delay: 0 }),
    }),
    text(options.who, whoY, options.accent, "shantell", 50, {
      bold: true,
      anim: anim({ in: "letters", inDuration: 0.6, delay: 0.85 }),
    }),
    sticker(
      photo.sticker,
      photo.x,
      photo.y,
      photo.scale,
      0,
      anim({ in: "fade", inDuration: 0.7, delay: 1.3 }),
    ),
    ...options.decor,
    text(options.wish, 690, options.ink, "ptmono", 17, {
      spacing: 80,
      anim: anim({ in: "tracking", inDuration: 0.9, delay: 2.5 }),
    }),
    sticker(
      options.heart,
      300,
      770,
      0.26,
      0,
      anim({ in: "pop", inDuration: 0.5, delay: 3.2, loop: "heartbeat", loopPeriod: 1.4 }),
    ),
  ];
  return {
    format: EDITOR_FORMAT,
    version: EDITOR_VERSION,
    background: options.background,
    duration: 6,
    layers,
  };
}

/**
 * Афиша-приглашение — по снимку экрана из design/ (08.10.2026): три строки
 * огромного розового «ДЕНЬ РОЖДЕНИЯ», дата и время на бумажных бирках,
 * чёрно-белое фото без фона, настоящий торт (фото, ч/б), сердечки. QR-кода из образца нет:
 * ссылок на открытки ещё нет, а нерабочий код хуже никакого — вместо
 * подписи «Сканируй qr-код» рукописное «Приходи — будет торт!».
 *
 * Своя раскладка, не card(): у афиши нет заголовка над фото, буквы
 * лежат фоном под всем коллажем.
 */
function party(): EditorDoc {
  const pink = "#ff9fd6";
  const row = (y: number, delay: number, from: "slide-left" | "slide-right"): TextLayer => ({
    ...text("tpl.party.title", y, pink, "oswald", 90, {
      bold: false,
      anim: anim({ in: from, inDuration: 0.7, delay }),
    }),
    // Узкие высокие буквы, как на афише: Oswald, вытянутый по высоте.
    scaleY: 2.4,
  });
  const label = (x: number, y: number, angle: number, key: TextKey, delay: number): Layer[] => {
    const motion = anim({ in: "toss-top", inDuration: 0.6, delay });
    // Бирка и надпись на ней влетают одним движением: одинаковая анимация.
    return [
      sticker("paper-label", x, y, 0.9, angle, motion),
      { ...text(key, y + 4, "#111111", "marck", 66, { anim: motion }), x, angle },
    ];
  };
  return {
    format: EDITOR_FORMAT,
    version: EDITOR_VERSION,
    background: "#f7f7f7",
    duration: 6,
    layers: [
      row(112, 0, "slide-left"),
      row(302, 0.15, "slide-right"),
      row(492, 0.3, "slide-left"),
      sticker(
        "sample-party",
        452,
        590,
        0.6,
        0,
        anim({ in: "slide-bottom", inDuration: 0.8, delay: 0.55 }),
      ),
      ...label(210, 186, -6, "tpl.party.date", 1.1),
      ...label(330, 300, 5, "tpl.party.time", 1.3),
      sticker(
        "cake-photo",
        160,
        700,
        0.5,
        -3,
        anim({ in: "toss-bottom", inDuration: 0.6, delay: 1.6 }),
      ),
      {
        ...text("tpl.party.note", 486, "#111111", "caveat", 30, {
          anim: anim({ in: "typewriter", inDuration: 0.9, delay: 2.1 }),
        }),
        x: 96,
        align: "left",
      },
      sticker("arrow-doodle", 214, 520, 0.36, 8, anim({ in: "fade", inDuration: 0.4, delay: 2.9 })),
      sticker(
        "heart-pink",
        296,
        500,
        0.26,
        -8,
        anim({ in: "pop", inDuration: 0.5, delay: 2.3, loop: "heartbeat", loopPeriod: 1.3 }),
      ),
      sticker(
        "heart-pink",
        36,
        702,
        0.18,
        10,
        anim({ in: "pop", inDuration: 0.5, delay: 2.45, loop: "heartbeat", loopPeriod: 1.5 }),
      ),
      sticker(
        "heart-pink",
        320,
        760,
        0.14,
        -6,
        anim({ in: "pop", inDuration: 0.5, delay: 2.6, loop: "heartbeat", loopPeriod: 1.7 }),
      ),
    ],
  };
}

/**
 * Ёлка из полароидов — по записи экрана из design/ (08.10.2026):
 * тёмно-зелёный фон с бледными снежинками, шесть фото в рамках
 * пирамидой 1-2-3, золотая звезда, внизу рваная бумага и «Новый 2026 Год»
 * засечным шрифтом, где год — красным курсивом. Образец квадратный,
 * здесь 3:4: ёлке досталось больше места по высоте.
 *
 * «Новый 2026 Год» — три слова тремя слоями: у года свой цвет и курсив.
 * Центры посчитаны по ширине слов в Playfair 64 (206 / 134 / 96, пробел 16):
 * строка 468 точек ровно по центру. Сменят шрифт или кегль — пересчитать.
 *
 * Рамка и фото в ней — два слоя с одной анимацией: влетают вместе.
 * Фото — заменяемые примеры с `fill`: своё обрежется под окно рамки.
 */
const POLAROID_SCALE = 0.46;
/** Центр окна рамки выше центра стикера на 27 точек (scripts/draw-stickers.py). */
const POLAROID_WINDOW_DY = -27;
/** Окно 260 из 320 — во столько раз фото-пример меньше рамки. */
const POLAROID_WINDOW = 260 / 320;

function polaroid(): EditorDoc {
  const green = "#0f4d3a";
  const frame = (photo: StickerId, x: number, y: number, angle: number, delay: number): Layer[] => {
    const motion = anim({ in: "toss-bottom", inDuration: 0.55, delay });
    const rad = (angle * Math.PI) / 180;
    const dy = POLAROID_WINDOW_DY * POLAROID_SCALE;
    return [
      sticker("polaroid", x, y, POLAROID_SCALE, angle, motion),
      // Фото в окне: смещение окна поворачивается вместе с рамкой.
      sticker(
        photo,
        x - dy * Math.sin(rad),
        y + dy * Math.cos(rad),
        POLAROID_SCALE * POLAROID_WINDOW,
        angle,
        motion,
      ),
    ];
  };
  const snow = (x: number, y: number, scale: number, i: number): StickerLayer => ({
    ...sticker(
      "snowflake-line",
      x,
      y,
      scale,
      i * 17,
      anim({
        in: "fade",
        inDuration: 0.8,
        delay: 2.3 + i * 0.08,
        loop: "float",
        loopPeriod: 3.4 + (i % 3) * 0.5,
      }),
    ),
    opacity: 0.22,
  });
  const word = (
    key: TextKey,
    x: number,
    fill: Color,
    italic: boolean,
    delay: number,
  ): TextLayer => ({
    ...text(key, 652, fill, "playfair", 64, { anim: anim({ in: "land", inDuration: 0.6, delay }) }),
    x,
    italic,
  });
  const corner = (key: TextKey, x: number, align: "left" | "right"): TextLayer => ({
    ...text(key, 38, "#cfe3d9", "inter", 15, {
      anim: anim({ in: "fade", inDuration: 0.6, delay: 2.4 }),
    }),
    x,
    align,
  });
  return {
    format: EDITOR_FORMAT,
    version: EDITOR_VERSION,
    background: green,
    duration: 6,
    layers: [
      snow(64, 140, 0.2, 0),
      snow(536, 110, 0.18, 1),
      snow(84, 350, 0.16, 2),
      snow(528, 330, 0.2, 3),
      snow(44, 500, 0.14, 4),
      snow(560, 490, 0.16, 5),
      snow(190, 70, 0.12, 6),
      snow(424, 200, 0.12, 7),
      corner("tpl.polaroid.handle", 86, "left"),
      corner("tpl.polaroid.tag", 528, "right"),
      sticker(
        "torn-paper",
        300,
        662,
        1,
        0,
        anim({ in: "slide-bottom", inDuration: 0.6, delay: 0 }),
      ),
      ...frame("ny-photo-4", 162, 494, -7, 0.3),
      ...frame("ny-photo-5", 300, 500, 3, 0.42),
      ...frame("ny-photo-6", 438, 492, 8, 0.54),
      ...frame("ny-photo-2", 232, 344, -6, 0.66),
      ...frame("ny-photo-3", 370, 340, 5, 0.78),
      ...frame("ny-photo-1", 300, 192, 0, 0.9),
      sticker(
        "star-gold",
        300,
        104,
        0.4,
        0,
        anim({ in: "pop", inDuration: 0.5, delay: 1.1, loop: "flicker", loopPeriod: 1.4 }),
      ),
      word("tpl.polaroid.word1", 169, green, false, 1.3),
      word("tpl.polaroid.year", 355, "#c62828", true, 1.5),
      word("tpl.polaroid.word3", 486, green, false, 1.7),
      text("tpl.polaroid.wish", 712, green, "inter", 18, {
        anim: anim({ in: "tracking", inDuration: 0.8, delay: 2.0 }),
      }),
    ],
  };
}

export const TEMPLATES: readonly TemplateInfo[] = [
  {
    id: "birthday",
    label: "tpl.birthday.label",
    // Ближе всех к видео: настоящий ребёнок без фона, колпак на голове,
    // свеча с огоньком и спичка сбоку, розовая лента. Своё фото встаёт
    // на место примера уже вырезанным (lib/editor/cutout.ts).
    build: () =>
      card({
        background: "#efefef",
        ink: "#1d1d1d",
        accent: "#e8508a",
        title: "tpl.birthday.title",
        titleLines: 2,
        who: "tpl.birthday.who",
        wish: "tpl.birthday.wish",
        heart: "heart-doodle-pink",
        photo: { sticker: "sample-birthday", x: 296, y: 470, scale: 0.5 },
        decor: [
          sticker(
            "party-hat",
            304,
            298,
            0.28,
            -8,
            anim({ in: "toss-left", delay: 1.6, inDuration: 0.6 }),
          ),
          sticker(
            "candle",
            492,
            490,
            0.5,
            8,
            anim({ in: "toss-bottom", delay: 1.75, inDuration: 0.6 }),
          ),
          sticker(
            "flame",
            510,
            346,
            0.4,
            8,
            anim({ in: "fade", delay: 2.3, inDuration: 0.4, loop: "flicker", loopPeriod: 0.9 }),
          ),
          sticker(
            "match",
            535,
            557,
            0.46,
            16,
            anim({ in: "toss-bottom", delay: 1.9, inDuration: 0.6 }),
          ),
          sticker(
            "tape-pink",
            300,
            606,
            0.78,
            -3,
            anim({ in: "toss-right", delay: 2.1, inDuration: 0.5 }),
          ),
        ],
      }),
  },
  {
    id: "party",
    label: "tpl.party.label",
    build: party,
  },
  {
    id: "polaroid",
    label: "tpl.polaroid.label",
    build: polaroid,
  },
  // Серия по design/открытки/ (08.10.2026), lib/editor/series.ts.
  ...SERIES_IDS.map((id): TemplateInfo => ({ id, label: `tpl.${id}.label`, build: SERIES[id] })),
  // Вторая серия (09.10.2026), lib/editor/series-2.ts.
  ...SERIES2_IDS.map((id): TemplateInfo => ({ id, label: `tpl.${id}.label`, build: SERIES2[id] })),
];
