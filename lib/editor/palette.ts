import type { HexColor } from "./document.ts";

/**
 * Палитра редактора — цвета содержимого открытки, а не оформления
 * сайта. Правило «только токены» из CLAUDE.md относится к интерфейсу;
 * здесь цвета — данные, которые пользователь кладёт в свою открытку.
 * Решение 08.10.2026, docs/DESIGN.md, «Цвета содержимого открытки».
 *
 * Девять тонов по пять ступеней: от самой светлой к самой тёмной.
 * Средняя ступень — насыщенный цвет. Подобраны так, чтобы светлые
 * годились под фон, а тёмные — под текст на них.
 */

export const HUES = [
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
  "neutral",
] as const;
export type Hue = (typeof HUES)[number];

export const SHADES = 5;

export const PALETTE: Record<Hue, readonly HexColor[]> = {
  red: ["#ffcdd2", "#ef9a9a", "#e53935", "#c62828", "#7f1d1d"],
  orange: ["#ffe0b2", "#ffb74d", "#fb8c00", "#e65100", "#7c2d12"],
  yellow: ["#fff9c4", "#fff176", "#fdd835", "#f9a825", "#a16207"],
  green: ["#c8e6c9", "#81c784", "#43a047", "#2e7d32", "#14532d"],
  teal: ["#b2dfdb", "#4db6ac", "#00897b", "#00695c", "#134e4a"],
  blue: ["#bbdefb", "#64b5f6", "#1e88e5", "#1565c0", "#1e3a8a"],
  purple: ["#e1bee7", "#ba68c8", "#8e24aa", "#6a1b9a", "#3b0764"],
  pink: ["#f8bbd0", "#f06292", "#d81b60", "#ad1457", "#831843"],
  neutral: ["#ffffff", "#e0e0e0", "#9e9e9e", "#424242", "#000000"],
};

export type Swatch = { color: HexColor; hue: Hue; shade: number };

function swatch(hue: Hue, shade: number): Swatch {
  return { color: PALETTE[hue][shade] ?? "#000000", hue, shade };
}

/** Свёрнутая палитра: белый, чёрный и средняя ступень каждого тона. */
export const MAIN_SWATCHES: readonly Swatch[] = [
  swatch("neutral", 0),
  swatch("neutral", 4),
  ...HUES.filter((h) => h !== "neutral").map((h) => swatch(h, 2)),
  swatch("neutral", 2),
  swatch("yellow", 0),
];

/** Вся палитра по рядам: ряд — ступень, столбец — тон. */
export const ALL_SWATCHES: readonly Swatch[] = Array.from({ length: SHADES }, (_, shade) =>
  HUES.map((hue) => swatch(hue, shade)),
).flat();
