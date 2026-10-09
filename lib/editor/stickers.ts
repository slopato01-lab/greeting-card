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
  // Вырезанные примеры (08.10.2026, просьба пользователя): дети в цвете
  // для «жениха и невесты», девушка в кресле для «Кинопремьеры», парень
  // для «Диско» — в позе ребёнка с макета. StockSnap, CC0, CREDITS.md.
  // Своё фото на их месте вырезается само (cutout).
  ...(
    [
      ["sample-groom", 472, 640, false],
      ["sample-bride", 569, 640, false],
      ["sample-cinema", 560, 766, false],
      ["sample-disco", 386, 760, true],
    ] as const
  ).map(([id, width, height, mono]): StickerInfo => ({
    id,
    theme: "common",
    label: "sticker.sample-person",
    width,
    height,
    placeholder: true,
    cutout: true,
    hidden: true,
    ext: "png",
    ...(mono ? { mono: true } : {}),
  })),
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
  // Вторая серия по design/открытки/ (09.10.2026), lib/editor/series-2.ts.
  // Примеры фото — StockSnap CC0 (CREDITS.md), размер каждого — под окно
  // своего шаблона: своё фото обрезается под ту же пропорцию.
  ...(
    [
      ["sample-love-1", 760, 400, true],
      ["sample-love-2", 760, 400, true],
      ["sample-love-bg", 600, 800, true],
      ["sample-strip-1", 480, 400, true],
      ["sample-strip-2", 480, 400, true],
      ["sample-strip-3", 480, 400, true],
      ["sample-strip-4", 480, 400, true],
      ["sample-strip-5", 480, 400, true],
      ["sample-strip-6", 480, 400, true],
      ["sample-xmas-friends", 560, 440, false],
      ["sample-xmas-1", 480, 360, false],
      ["sample-xmas-2", 480, 360, false],
      ["sample-xmas-3", 480, 360, false],
      ["sample-xmas-4", 440, 380, false],
      ["sample-xmas-5", 440, 380, false],
      ["sample-xmas-6", 440, 380, false],
      ["sample-xmas-7", 420, 300, false],
      ["sample-xmas-8", 420, 300, false],
      ["sample-xmas-9", 420, 300, false],
      ["sample-xmas-10", 420, 300, false],
      ["sample-wed-1", 520, 620, false],
      ["sample-wed-2", 600, 360, true],
      ["sample-amor-1", 300, 600, true],
      ["sample-amor-2", 300, 360, true],
      ["sample-amor-3", 300, 600, true],
      // «Любовь это…» (series.ts): пара на закате, в цвете — просьба
      // пользователя 09.10.2026 вместо силуэта-заглушки.
      ["sample-sunset", 800, 1000, false],
    ] as const
  ).map(([id, width, height, mono]): StickerInfo => ({
    ...SAMPLE,
    id,
    width,
    height,
    ...(mono ? { mono: true } : {}),
  })),
  // Кевин из «Один дома» — вырезан из макета «новый год 6» по просьбе
  // пользователя. Не CC: права у правообладателя фильма (CREDITS.md).
  {
    id: "kevin",
    theme: "newyear",
    label: "sticker.kevin",
    width: 420,
    height: 584,
    hidden: true,
    ext: "png",
  },
  {
    id: "xmas-tree-photo",
    theme: "newyear",
    label: "sticker.xmas-tree-photo",
    width: 300,
    height: 794,
    hidden: true,
    ext: "png",
  },
  { id: "gingerbread", theme: "newyear", label: "sticker.gingerbread", width: 300, height: 320 },
  { id: "bow-red", theme: "newyear", label: "sticker.bow-red", width: 340, height: 300 },
  { id: "cassette", theme: "newyear", label: "sticker.cassette", width: 380, height: 250 },
  { id: "holly", theme: "newyear", label: "sticker.holly", width: 300, height: 260 },
  {
    id: "snowflake-rust",
    theme: "newyear",
    label: "sticker.snowflake-rust",
    width: 240,
    height: 240,
  },
  {
    id: "asterisk-cream",
    theme: "newyear",
    label: "sticker.asterisk-cream",
    width: 100,
    height: 100,
  },
  {
    id: "film-strip-red",
    theme: "newyear",
    label: "sticker.film-strip-red",
    width: 300,
    height: 580,
  },
  { id: "garland", theme: "newyear", label: "sticker.garland", width: 600, height: 220 },
  { id: "candy-cane", theme: "newyear", label: "sticker.candy-cane", width: 90, height: 300 },
  // Фон всей открытки «Один дома» — в каталоге стикеров не нужен.
  {
    id: "tartan",
    theme: "newyear",
    label: "sticker.tartan",
    width: 600,
    height: 800,
    hidden: true,
  },
  {
    id: "instant-camera",
    theme: "common",
    label: "sticker.instant-camera",
    width: 420,
    height: 330,
  },
  {
    id: "film-strip-black",
    theme: "common",
    label: "sticker.film-strip-black",
    width: 300,
    height: 670,
  },
  { id: "clapperboard", theme: "common", label: "sticker.clapperboard", width: 220, height: 180 },
  // Уголки арочной рамки «Save the date»: цвет фона впечён — только для шаблона.
  {
    id: "arch-corner-l",
    theme: "love",
    label: "sticker.arch-corner",
    width: 120,
    height: 100,
    hidden: true,
  },
  {
    id: "arch-corner-r",
    theme: "love",
    label: "sticker.arch-corner",
    width: 120,
    height: 100,
    hidden: true,
  },
  { id: "bicycle", theme: "love", label: "sticker.bicycle", width: 220, height: 150 },
  { id: "heart-line-red", theme: "love", label: "sticker.heart-line-red", width: 520, height: 460 },
  {
    id: "gloss-sheen",
    theme: "common",
    label: "sticker.gloss-sheen",
    width: 600,
    height: 800,
    hidden: true,
  },
  // Третья серия по design/открытки/ (09.10.2026), lib/editor/series-3.ts.
  // Примеры фото — StockSnap CC0 (CREDITS.md), размер — под окно шаблона;
  // ч/б примеры коллажей делают своё фото ч/б по умолчанию.
  ...(
    [
      ["sample-cover", 600, 800, false],
      ["sample-bff-1", 392, 292, false],
      ["sample-bff-2", 392, 292, false],
      ["sample-bff-3", 392, 292, false],
      ["sample-bff-4", 392, 292, false],
      ["sample-bff-5", 392, 292, false],
      ["sample-bff-6", 392, 292, false],
      ["sample-kodak-1", 352, 340, false],
      ["sample-kodak-2", 352, 340, false],
      ["sample-kodak-3", 352, 340, false],
      ["sample-kodak-4", 352, 340, false],
      ["sample-kodak-5", 352, 340, false],
      ["sample-kodak-6", 352, 340, false],
      ["sample-kodak-big", 600, 360, false],
      ["sample-cam", 384, 520, false],
      ["sample-pin", 440, 420, false],
      ["sample-tape", 444, 496, false],
      ["sample-moon-1", 200, 200, true],
      ["sample-moon-2", 200, 200, true],
      ["sample-moon-3", 200, 200, true],
      ["sample-moon-4", 200, 200, true],
      ["sample-moon-5", 200, 200, true],
      ["sample-moon-6", 200, 200, true],
      ["sample-moon-7", 200, 200, true],
      ["sample-moon-8", 200, 200, true],
      ["sample-moon-9", 200, 200, true],
      ["sample-moon-10", 200, 200, true],
      ["sample-moon-11", 200, 200, true],
      ["sample-moon-12", 200, 200, true],
      ["sample-moon-13", 200, 200, true],
      ["sample-moon-14", 200, 200, true],
      ["sample-moon-15", 200, 200, true],
      ["sample-moon-16", 200, 200, true],
      ["sample-moon-17", 200, 200, true],
      ["sample-moon-18", 200, 200, true],
      ["sample-moon-19", 200, 200, true],
      ["sample-moon-20", 200, 200, true],
      ["sample-moon-21", 200, 200, true],
      ["sample-moon-22", 200, 200, true],
      ["sample-moon-23", 200, 200, true],
      ["sample-moon-24", 200, 200, true],
      ["sample-moon-25", 200, 200, true],
      ["sample-moon-26", 200, 200, true],
      ["sample-moon-27", 200, 200, true],
      ["sample-moon-28", 200, 200, true],
      ["sample-home-main", 410, 474, false],
      ["sample-home-1", 92, 80, false],
      ["sample-home-2", 133, 106, false],
      ["sample-home-3", 175, 115, false],
      ["sample-home-4", 179, 115, false],
      ["sample-home-5", 133, 106, false],
      ["sample-home-6", 83, 74, false],
      ["sample-home-7", 262, 216, false],
      ["sample-home-8", 262, 216, false],
      ["sample-home-9", 78, 69, false],
      ["sample-home-10", 175, 166, false],
      ["sample-home-11", 170, 166, false],
      ["sample-home-12", 83, 69, false],
      ["sample-home-13", 110, 110, false],
      ["sample-home-14", 110, 110, false],
      ["sample-home-15", 83, 83, false],
      ["sample-home-16", 152, 129, false],
      ["sample-home-17", 83, 83, false],
      ["sample-grid-1", 352, 372, true],
      ["sample-grid-2", 352, 372, true],
      ["sample-grid-3", 352, 372, true],
      ["sample-grid-4", 352, 372, true],
      ["sample-grid-5", 352, 372, true],
      ["sample-grid-6", 352, 372, true],
      ["sample-grid-7", 352, 372, true],
      ["sample-grid-8", 352, 372, true],
      ["sample-grid-9", 352, 372, true],
      ["sample-grid-10", 352, 372, true],
      ["sample-dark", 450, 522, true],
      ["sample-wd-dance", 480, 400, false],
      ["sample-wd-hands", 600, 800, true],
      ["sample-moment-1", 440, 360, false],
      ["sample-moment-2", 440, 360, false],
      ["sample-moment-3", 440, 360, false],
      ["sample-moment-4", 440, 360, false],
      ["sample-moment-5", 440, 360, false],
      ["sample-moment-6", 440, 360, false],
    ] as const
  ).map(([id, width, height, mono]): StickerInfo => ({
    ...SAMPLE,
    id,
    width,
    height,
    ...(mono ? { mono: true } : {}),
  })),
  // Подруги без фона в «Happy Birthday, best friend»: своё фото тоже
  // теряет фон само, как пример в «Дне рождения».
  {
    id: "sample-bff-cut",
    theme: "birthday",
    label: "sticker.ny-photo",
    width: 640,
    height: 427,
    placeholder: true,
    cutout: true,
    hidden: true,
    ext: "png",
  },
  {
    id: "camera-silver",
    theme: "birthday",
    label: "sticker.camera-silver",
    width: 360,
    height: 520,
  },
  { id: "star-silver", theme: "birthday", label: "sticker.star-silver", width: 160, height: 160 },
  { id: "teddy-bear", theme: "birthday", label: "sticker.teddy-bear", width: 512, height: 512 },
  { id: "wax-seal", theme: "love", label: "sticker.wax-seal", width: 120, height: 120 },
  {
    id: "paper-crumpled",
    theme: "common",
    label: "sticker.paper-crumpled",
    width: 600,
    height: 800,
    hidden: true,
  },
  {
    id: "red-thread",
    theme: "love",
    label: "sticker.red-thread",
    width: 600,
    height: 800,
    hidden: true,
  },
  { id: "push-pin", theme: "common", label: "sticker.push-pin", width: 140, height: 150 },
  { id: "torn-frame", theme: "common", label: "sticker.torn-frame", width: 520, height: 500 },
  { id: "paper-cloud", theme: "common", label: "sticker.paper-cloud", width: 300, height: 150 },
  { id: "letter-scrap", theme: "love", label: "sticker.letter-scrap", width: 300, height: 460 },
  { id: "street-lamp", theme: "love", label: "sticker.street-lamp", width: 60, height: 420 },
  { id: "dried-flower", theme: "common", label: "sticker.dried-flower", width: 200, height: 260 },
  { id: "tape-beige", theme: "common", label: "sticker.tape-beige", width: 260, height: 70 },
  { id: "tape-maroon", theme: "common", label: "sticker.tape-maroon", width: 260, height: 70 },
  { id: "cats-doodle", theme: "love", label: "sticker.cats-doodle", width: 200, height: 150 },
  { id: "paper-scrap", theme: "common", label: "sticker.paper-scrap", width: 220, height: 400 },
  {
    id: "notebook-sheet",
    theme: "common",
    label: "sticker.notebook-sheet",
    width: 480,
    height: 360,
  },
  { id: "circle-doodle", theme: "common", label: "sticker.circle-doodle", width: 200, height: 90 },
  // Настоящий компактный фотоаппарат (Flickr, CC0, CREDITS.md): фон снят
  // по контуру корпуса, повёрнут вертикально, как на макете «с др».
  // Экран — x 91–474, y 41–587 файла.
  {
    id: "camera-real",
    theme: "birthday",
    label: "sticker.camera-real",
    width: 544,
    height: 879,
    ext: "png",
  },
  {
    id: "cinema-seats-front",
    theme: "birthday",
    label: "sticker.cinema-seats-front",
    width: 600,
    height: 225,
    hidden: true,
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
