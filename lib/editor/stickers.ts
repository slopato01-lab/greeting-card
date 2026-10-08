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
  /** Не показывать в каталоге стикеров — живёт только в шаблоне. */
  hidden?: true;
  /** Расширение файла, если не SVG. */
  ext?: "png";
};

export const STICKERS: readonly StickerInfo[] = [
  {
    id: "photo-placeholder",
    theme: "common",
    label: "sticker.photo-placeholder",
    width: 400,
    height: 500,
    placeholder: true,
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
    hidden: true,
    ext: "png",
  },
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
