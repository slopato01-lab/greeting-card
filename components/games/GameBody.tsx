"use client";

import { MemoryGame } from "@/components/games/MemoryGame";
import { PhotoPuzzle } from "@/components/games/PhotoPuzzle";
import type { GameKind } from "@/lib/editor/document";

/**
 * Сама игра по её виду — одна точка для попапа-пробы, сцены редактора
 * и /games. Фото уже готовы к игре (playPhotos в lib/games/kinds.ts).
 * Сюрприза здесь нет: проба и сцена показывают только игру.
 */
export function GameBody({
  kind,
  seed,
  photos,
}: {
  kind: GameKind;
  seed: string;
  photos: readonly string[];
}) {
  const props = { seed, photos, cover: null, reward: null, onDone: () => undefined };
  return kind === "memory" ? <MemoryGame {...props} /> : <PhotoPuzzle {...props} />;
}
