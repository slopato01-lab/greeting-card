import {
  type Animation,
  type Color,
  type EditorDoc,
  EDITOR_FORMAT,
  EDITOR_VERSION,
  type FontId,
  type Layer,
  NO_ANIMATION,
  type StickerId,
  type StickerLayer,
  type TextLayer,
} from "@/lib/editor/document";
import { stickerInfo } from "@/lib/editor/stickers";
import { type TextKey, t } from "@/lib/i18n";

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

export const TEMPLATE_IDS = ["birthday", "party", "newyear", "march8", "love"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateInfo = { id: TemplateId; label: TextKey; build: () => EditorDoc };

const anim = (change: Partial<Animation>): Animation => ({ ...NO_ANIMATION, ...change });

function text(
  key: TextKey,
  y: number,
  fill: Color,
  font: FontId,
  fontSize: number,
  options: { bold?: boolean; spacing?: number; anim: Animation },
): TextLayer {
  return {
    kind: "text",
    text: t(key),
    x: 300,
    y,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    fill,
    font,
    fontSize,
    bold: options.bold ?? false,
    italic: false,
    align: "center",
    spacing: options.spacing ?? 0,
    anim: options.anim,
  };
}

function sticker(
  id: StickerId,
  x: number,
  y: number,
  scale: number,
  angle: number,
  animation: Animation,
): StickerLayer {
  const { width, height } = stickerInfo(id);
  return {
    kind: "sticker",
    sticker: id,
    width,
    height,
    x,
    y,
    angle,
    scaleX: scale,
    scaleY: scale,
    opacity: 1,
    anim: animation,
  };
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
    id: "newyear",
    label: "tpl.newyear.label",
    build: () =>
      card({
        background: "#f4efe6",
        ink: "#1f4d3a",
        accent: "#c62828",
        title: "tpl.newyear.title",
        titleLines: 2,
        who: "tpl.newyear.who",
        wish: "tpl.newyear.wish",
        heart: "heart-doodle-red",
        decor: [
          sticker(
            "ornament-red",
            128,
            330,
            0.42,
            -8,
            anim({ in: "toss-top", delay: 1.6, inDuration: 0.7, loop: "swing", loopPeriod: 2.4 }),
          ),
          sticker(
            "ornament-gold",
            470,
            350,
            0.34,
            8,
            anim({ in: "toss-top", delay: 1.75, inDuration: 0.7, loop: "swing", loopPeriod: 2.8 }),
          ),
          sticker(
            "christmas-tree",
            455,
            540,
            0.3,
            6,
            anim({ in: "toss-right", delay: 1.9, inDuration: 0.6 }),
          ),
          sticker(
            "snowflake",
            118,
            560,
            0.36,
            0,
            anim({ in: "pop", delay: 2.0, inDuration: 0.5, loop: "float", loopPeriod: 2.2 }),
          ),
          sticker(
            "sparkle-gold",
            470,
            236,
            0.3,
            0,
            anim({ in: "pop", delay: 2.2, inDuration: 0.4, loop: "flicker", loopPeriod: 1.1 }),
          ),
          sticker(
            "tape-gold",
            300,
            606,
            0.78,
            2,
            anim({ in: "toss-left", delay: 2.1, inDuration: 0.5 }),
          ),
        ],
      }),
  },
  {
    id: "march8",
    label: "tpl.march8.label",
    build: () =>
      card({
        background: "#f7eeea",
        ink: "#3a2a2f",
        accent: "#d81b60",
        title: "tpl.march8.title",
        titleLines: 1,
        who: "tpl.march8.who",
        wish: "tpl.march8.wish",
        heart: "heart-doodle-pink",
        decor: [
          sticker(
            "tulip",
            448,
            520,
            0.36,
            14,
            anim({ in: "toss-right", delay: 1.6, inDuration: 0.6, loop: "swing", loopPeriod: 3 }),
          ),
          sticker(
            "bouquet",
            140,
            530,
            0.38,
            -12,
            anim({ in: "toss-left", delay: 1.75, inDuration: 0.6 }),
          ),
          sticker("ribbon", 300, 266, 0.2, 0, anim({ in: "pop", delay: 1.95, inDuration: 0.5 })),
          sticker(
            "sparkle-pink",
            470,
            300,
            0.26,
            0,
            anim({ in: "pop", delay: 2.2, inDuration: 0.4, loop: "flicker", loopPeriod: 1.2 }),
          ),
          sticker(
            "tape-mint",
            300,
            606,
            0.78,
            -2,
            anim({ in: "toss-bottom", delay: 2.1, inDuration: 0.5 }),
          ),
        ],
      }),
  },
  {
    id: "love",
    label: "tpl.love.label",
    build: () =>
      card({
        background: "#fbeaec",
        ink: "#3b1d22",
        accent: "#e5484d",
        title: "tpl.love.title",
        titleLines: 2,
        who: "tpl.love.who",
        wish: "tpl.love.wish",
        heart: "heart-doodle-red",
        decor: [
          sticker(
            "heart-red",
            440,
            330,
            0.62,
            12,
            anim({
              in: "toss-right",
              delay: 1.6,
              inDuration: 0.6,
              loop: "heartbeat",
              loopPeriod: 1.3,
            }),
          ),
          sticker(
            "love-letter",
            140,
            540,
            0.28,
            -14,
            anim({ in: "toss-left", delay: 1.75, inDuration: 0.6 }),
          ),
          sticker(
            "kiss-mark",
            452,
            548,
            0.2,
            10,
            anim({ in: "pop", delay: 1.95, inDuration: 0.5 }),
          ),
          sticker(
            "sparkle-pink",
            150,
            300,
            0.24,
            0,
            anim({ in: "pop", delay: 2.2, inDuration: 0.4, loop: "flicker", loopPeriod: 1.2 }),
          ),
          sticker(
            "tape-red",
            300,
            606,
            0.78,
            3,
            anim({ in: "toss-right", delay: 2.1, inDuration: 0.5 }),
          ),
        ],
      }),
  },
];
