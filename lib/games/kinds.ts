import type { GameKind } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";

import { MEMORY_PAIRS } from "./memory.ts";

/**
 * Что знают об играх все экраны сразу: /games, попап-проба, вкладка
 * «Игра» в редакторе. Название, подсказка, картинка в списке и чем
 * играть, пока у автора нет своих фото.
 *
 * Примеры — снимки, которые уже лежат в репозитории, с источниками:
 * пазл — public/assets/games/puzzle/CREDITS.md, пары — StockSnap CC0,
 * public/assets/stickers/CREDITS.md (sample-kodak-*, sample-cam,
 * sample-cover). Лабиринту фото не нужно: в финале выскакивает
 * обложка шаблона открытки (public/assets/templates/editor/*.webp,
 * их рисует pnpm templates:render) или своё фото автора.
 */

/** Пример фото пазла — и для пробы в редакторе, пока нет своего. */
export const PUZZLE_SAMPLE_PHOTO = "/assets/games/puzzle/friends.jpg";

/** Шесть примеров для «Собери пару» — по одному на пару. */
export const MEMORY_SAMPLE_PHOTOS = [
  "/assets/stickers/sample-kodak-1.jpg",
  "/assets/stickers/sample-cam.jpg",
  "/assets/stickers/sample-kodak-2.jpg",
  "/assets/stickers/sample-cover.jpg",
  "/assets/stickers/sample-kodak-5.jpg",
  "/assets/stickers/sample-kodak-6.jpg",
] as const;

/** Шаблон скримера, пока автор не выбрал свой: красный «Happy birthday». */
export const MAZE_DEFAULT_TEMPLATE = "bd-cinema";

/** Обложка шаблона — картинка, которая выскочит в финале лабиринта. */
export function templateCover(template: string): string {
  return `/assets/templates/editor/${template}.webp`;
}

export const GAME_INFO: Record<GameKind, { title: TextKey; hint: TextKey; preview: string }> = {
  puzzle: { title: "games.card.1.title", hint: "game.puzzle.hint", preview: PUZZLE_SAMPLE_PHOTO },
  memory: {
    title: "games.card.2.title",
    hint: "game.memory.hint",
    preview: MEMORY_SAMPLE_PHOTOS[0],
  },
  maze: {
    title: "games.card.4.title",
    hint: "game.maze.hint",
    preview: "/assets/games/maze/preview.webp",
  },
};

/**
 * Чем играть: свои фото автора, а где их не хватает — примеры.
 * Пазлу нужно одно фото, «Собери пару» — шесть разных: своих
 * меньше — добираем примерами, чтобы пар всегда было шесть.
 * Лабиринту — одна картинка скримера: своё фото или обложка шаблона.
 */
export function playPhotos(kind: GameKind, own: readonly string[], template?: string): string[] {
  if (kind === "puzzle") return [own[0] ?? PUZZLE_SAMPLE_PHOTO];
  if (kind === "maze") return [own[0] ?? templateCover(template ?? MAZE_DEFAULT_TEMPLATE)];
  const unique = [...new Set(own)].slice(0, MEMORY_PAIRS);
  const fill = MEMORY_SAMPLE_PHOTOS.filter((photo) => !unique.includes(photo));
  return [...unique, ...fill].slice(0, MEMORY_PAIRS);
}

/** Адрес, по которому редактор сам добавляет игру и открывает «Игру». */
export function editorGameHref(kind: GameKind): string {
  return `/editor?game=${kind}`;
}
