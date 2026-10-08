import type { StickerId } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";

/**
 * Стикеры редактора: файлы в public/assets/stickers.
 *
 * Рисованные — scripts/draw-stickers.py (коллаж по мотивам
 * design/пример анимации и дизайна.MP4), сложные предметы — Noto Emoji,
 * scripts/fetch-stickers.mjs. Ширина и высота — атрибуты SVG: по ним
 * слой знает свой размер до загрузки картинки.
 *
 * `placeholder` — заглушка на месте фото в шаблоне. Её выделяют
 * и жмут «Заменить на своё фото».
 */

export const STICKER_THEMES = ["common", "birthday", "newyear", "march8", "love"] as const;
export type StickerTheme = (typeof STICKER_THEMES)[number];

export type StickerInfo = {
  id: StickerId;
  theme: StickerTheme;
  label: TextKey;
  width: number;
  height: number;
  /** Заменяется своим фото: «Заменить на своё фото» в свойствах. */
  placeholder?: true;
  /** При замене фото автоматически убирается фон (lib/editor/cutout.ts). */
  cutout?: true;
  /** Своё фото вместо примера — чёрно-белое по умолчанию (коллажи по видео). */
  mono?: true;
  /**
   * Своё фото обрезается по центру под пропорцию примера и заполняет
   * его целиком — окно полароида, а не фото с полями внутри окна.
   */
  fill?: true;
  /** Не показывать в каталоге стикеров — живёт только в шаблоне. */
  hidden?: true;
  /** Расширение файла, если не SVG. */
  ext?: "png" | "jpg";
};

/** Общее у примеров фото серии: заменяемые, обрезаются под окно, в каталоге не видны. */
const SAMPLE = {
  theme: "common",
  label: "sticker.ny-photo",
  placeholder: true,
  fill: true,
  hidden: true,
  ext: "jpg",
} as const satisfies Omit<StickerInfo, "id" | "width" | "height">;

export const STICKERS: readonly StickerInfo[] = [
  {
    id: "photo-placeholder",
    theme: "common",
    label: "sticker.photo-placeholder",
    width: 400,
    height: 500,
    placeholder: true,
    mono: true,
  },
  // Пример фото в шаблоне «День рождения»: мальчик, уже вырезанный из
  // фона и чёрно-белый, как ребёнок в design/пример анимации и дизайна.MP4.
  // Unsplash, источник — public/assets/stickers/CREDITS.md.
  {
    id: "sample-birthday",
    theme: "birthday",
    label: "sticker.sample-birthday",
    width: 623,
    height: 640,
    placeholder: true,
    cutout: true,
    mono: true,
    hidden: true,
    ext: "png",
  },
  // Пример фото в афише-приглашении — девушка с пучком, как на снимке
  // экрана из design/. Unsplash, источник — CREDITS.md.
  {
    id: "sample-party",
    theme: "birthday",
    label: "sticker.sample-party",
    width: 608,
    height: 760,
    placeholder: true,
    cutout: true,
    mono: true,
    hidden: true,
    ext: "png",
  },
  { id: "paper-label", theme: "common", label: "sticker.paper-label", width: 300, height: 104 },
  { id: "heart-pink", theme: "love", label: "sticker.heart-pink", width: 160, height: 150 },
  { id: "arrow-doodle", theme: "common", label: "sticker.arrow-doodle", width: 220, height: 160 },
  { id: "cake-mono", theme: "birthday", label: "sticker.cake-mono", width: 512, height: 512 },
  // Настоящий торт для афиши: фото с Unsplash, белый фон снят заливкой,
  // ч/б — в одном ключе с фото именинницы. Источник — CREDITS.md.
  {
    id: "cake-photo",
    theme: "birthday",
    label: "sticker.cake-photo",
    width: 520,
    height: 750,
    ext: "png",
  },
  // Ёлка из полароидов (запись экрана 08.10.2026): рамка, звезда, рваная
  // бумага, снежинка для фона и шесть примеров фото в окна рамок.
  { id: "polaroid", theme: "newyear", label: "sticker.polaroid", width: 320, height: 370 },
  { id: "star-gold", theme: "newyear", label: "sticker.star-gold", width: 200, height: 200 },
  { id: "torn-paper", theme: "common", label: "sticker.torn-paper", width: 640, height: 300 },
  {
    id: "snowflake-line",
    theme: "newyear",
    label: "sticker.snowflake-line",
    width: 240,
    height: 240,
  },
  ...(
    ["ny-photo-1", "ny-photo-2", "ny-photo-3", "ny-photo-4", "ny-photo-5", "ny-photo-6"] as const
  ).map((id): StickerInfo => ({
    id,
    theme: "newyear",
    label: "sticker.ny-photo",
    width: 320,
    height: 320,
    placeholder: true,
    fill: true,
    hidden: true,
    ext: "jpg",
  })),
  { id: "party-hat", theme: "birthday", label: "sticker.party-hat", width: 400, height: 480 },
  { id: "candle", theme: "birthday", label: "sticker.candle", width: 120, height: 520 },
  { id: "flame", theme: "birthday", label: "sticker.flame", width: 120, height: 200 },
  { id: "match", theme: "birthday", label: "sticker.match", width: 60, height: 420 },
  { id: "tape-pink", theme: "common", label: "sticker.tape-pink", width: 520, height: 124 },
  { id: "tape-mint", theme: "common", label: "sticker.tape-mint", width: 520, height: 124 },
  { id: "tape-gold", theme: "common", label: "sticker.tape-gold", width: 520, height: 124 },
  { id: "tape-red", theme: "common", label: "sticker.tape-red", width: 520, height: 124 },
  {
    id: "heart-doodle-pink",
    theme: "love",
    label: "sticker.heart-doodle-pink",
    width: 160,
    height: 150,
  },
  {
    id: "heart-doodle-red",
    theme: "love",
    label: "sticker.heart-doodle-red",
    width: 160,
    height: 150,
  },
  { id: "heart-red", theme: "love", label: "sticker.heart-red", width: 160, height: 150 },
  { id: "sparkle-gold", theme: "common", label: "sticker.sparkle-gold", width: 160, height: 160 },
  { id: "sparkle-pink", theme: "common", label: "sticker.sparkle-pink", width: 160, height: 160 },
  { id: "confetti", theme: "birthday", label: "sticker.confetti", width: 400, height: 300 },
  { id: "ornament-red", theme: "newyear", label: "sticker.ornament-red", width: 240, height: 330 },
  {
    id: "ornament-gold",
    theme: "newyear",
    label: "sticker.ornament-gold",
    width: 240,
    height: 330,
  },
  { id: "snowflake", theme: "newyear", label: "sticker.snowflake", width: 240, height: 240 },
  { id: "gift", theme: "birthday", label: "sticker.gift", width: 512, height: 512 },
  { id: "balloon", theme: "birthday", label: "sticker.balloon", width: 512, height: 512 },
  { id: "party-popper", theme: "birthday", label: "sticker.party-popper", width: 512, height: 512 },
  {
    id: "christmas-tree",
    theme: "newyear",
    label: "sticker.christmas-tree",
    width: 512,
    height: 512,
  },
  { id: "snowman", theme: "newyear", label: "sticker.snowman", width: 512, height: 512 },
  { id: "glowing-star", theme: "newyear", label: "sticker.glowing-star", width: 512, height: 512 },
  { id: "tulip", theme: "march8", label: "sticker.tulip", width: 512, height: 512 },
  { id: "bouquet", theme: "march8", label: "sticker.bouquet", width: 512, height: 512 },
  { id: "blossom", theme: "march8", label: "sticker.blossom", width: 512, height: 512 },
  { id: "rose", theme: "love", label: "sticker.rose", width: 512, height: 512 },
  { id: "love-letter", theme: "love", label: "sticker.love-letter", width: 512, height: 512 },
  { id: "kiss-mark", theme: "love", label: "sticker.kiss-mark", width: 512, height: 512 },
  { id: "ribbon", theme: "march8", label: "sticker.ribbon", width: 512, height: 512 },
  {
    id: "clinking-glasses",
    theme: "newyear",
    label: "sticker.clinking-glasses",
    width: 512,
    height: 512,
  },
  // Серия по design/открытки/ (08.10.2026). Примеры фото трёх форм:
  // квадрат, 4:3 и 4:3 в ч/б — своё обрезается под форму примера.
  // Unsplash через picsum.photos, источники — CREDITS.md.
  ...(
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
    ] as const
  ).map((id): StickerInfo => ({ ...SAMPLE, id, width: 400, height: 400 })),
  ...(
    [
      "sample-wide-1",
      "sample-wide-2",
      "sample-wide-3",
      "sample-wide-4",
      "sample-wide-5",
      "sample-wide-6",
    ] as const
  ).map((id): StickerInfo => ({ ...SAMPLE, id, width: 560, height: 420 })),
  ...(["sample-bw-1", "sample-bw-2", "sample-bw-3", "sample-bw-4", "sample-bw-5"] as const).map(
    (id): StickerInfo => ({ ...SAMPLE, id, width: 560, height: 420, mono: true }),
  ),
  { ...SAMPLE, id: "sample-bw-sq", width: 400, height: 400, mono: true },
  { id: "grid-paper", theme: "common", label: "sticker.grid-paper", width: 300, height: 260 },
  { id: "paperclip", theme: "common", label: "sticker.paperclip", width: 80, height: 220 },
  { id: "film-strip", theme: "common", label: "sticker.film-strip", width: 220, height: 600 },
  { id: "glasses-doodle", theme: "love", label: "sticker.glasses-doodle", width: 220, height: 200 },
  { id: "heart-print", theme: "love", label: "sticker.heart-print", width: 300, height: 270 },
  { id: "star-red", theme: "birthday", label: "sticker.star-red", width: 200, height: 200 },
  { id: "star-doodle", theme: "common", label: "sticker.star-doodle", width: 120, height: 120 },
  {
    id: "star-doodle-white",
    theme: "common",
    label: "sticker.star-doodle-white",
    width: 120,
    height: 120,
  },
  { id: "vinyl", theme: "birthday", label: "sticker.vinyl", width: 300, height: 300 },
  // Фон всей открытки «Кинопремьера» — в каталоге стикеров не нужен.
  {
    id: "cinema-seats",
    theme: "birthday",
    label: "sticker.cinema-seats",
    width: 600,
    height: 800,
    hidden: true,
  },
  { id: "sticky-note", theme: "common", label: "sticker.sticky-note", width: 200, height: 240 },
  { id: "reel", theme: "common", label: "sticker.reel", width: 640, height: 640 },
  { id: "burst", theme: "common", label: "sticker.burst", width: 240, height: 240 },
  { id: "gold-swirl", theme: "newyear", label: "sticker.gold-swirl", width: 600, height: 520 },
  { id: "glitter-gold", theme: "newyear", label: "sticker.glitter-gold", width: 400, height: 400 },
  { id: "frame-sketch", theme: "love", label: "sticker.frame-sketch", width: 600, height: 800 },
  { id: "mirror-ball", theme: "birthday", label: "sticker.mirror-ball", width: 512, height: 512 },
  { id: "cocktail", theme: "birthday", label: "sticker.cocktail", width: 512, height: 512 },
  { id: "popcorn", theme: "birthday", label: "sticker.popcorn", width: 512, height: 512 },
  { id: "cat", theme: "birthday", label: "sticker.cat", width: 512, height: 512 },
  { id: "black-cat", theme: "birthday", label: "sticker.black-cat", width: 512, height: 512 },
  { id: "cat-face", theme: "birthday", label: "sticker.cat-face", width: 512, height: 512 },
  { id: "cupcake", theme: "birthday", label: "sticker.cupcake", width: 512, height: 512 },
  {
    id: "birthday-cake",
    theme: "birthday",
    label: "sticker.birthday-cake",
    width: 512,
    height: 512,
  },
  { id: "sunflower", theme: "march8", label: "sticker.sunflower", width: 512, height: 512 },
  { id: "strawberry", theme: "love", label: "sticker.strawberry", width: 512, height: 512 },
  { id: "cherries", theme: "love", label: "sticker.cherries", width: 512, height: 512 },
];

const BY_ID = new Map(STICKERS.map((sticker) => [sticker.id, sticker]));

export function stickerInfo(id: StickerId): StickerInfo {
  const info = BY_ID.get(id);
  if (info === undefined) throw new Error(`Нет стикера ${id}`);
  return info;
}

export function stickerUrl(id: StickerId): string {
  return `/assets/stickers/${id}.${BY_ID.get(id)?.ext ?? "svg"}`;
}
