"use client";

import { GameBody } from "@/components/games/GameBody";
import type { GameKind } from "@/lib/editor/document";

/**
 * Сцена вкладки «Игра» (09.10.2026, просьба пользователя): пока открыта
 * вкладка, вместо открытки в середине редактора — сама игра, как её
 * увидит получатель. Сбоку, в GamePanel, меняют фото, обращение
 * и подпись — сцена следует за ними сразу.
 *
 * Раскладка та же, что в попапе-пробе (GamePopup) и на /games:
 * обращение на плашке, игра, подпись. Новое фото или другая игра —
 * новая раскладка (key), правка текста игру не сбрасывает.
 *
 * Холст открытки при этом не размонтируется, а только прячется:
 * Fabric держит слои, и на другой вкладке открытка такая же, как была.
 */
export function GameStage({
  kind,
  photos,
  title,
  caption,
}: {
  kind: GameKind;
  /** Фото, готовые к игре: playPhotos в lib/games/kinds.ts. */
  photos: readonly string[];
  title: string;
  caption: string;
}) {
  return (
    <div
      className={[
        "bg-raised text-ink rounded-panel xl:rounded-panel-d flex w-full max-w-[440px] flex-col gap-[16px] p-[16px] xl:max-w-[560px] xl:p-[20px]",
        // Поле лабиринта в полтора раза выше ширины: ширина сцены
        // считается от высоты так, чтобы игра со всеми строками влезла.
        kind === "maze"
          ? "xl:w-[min(100cqw,calc((100cqh-270px)*0.67+40px))]"
          : "xl:w-[min(100cqw,calc(100cqh-200px))]",
      ].join(" ")}
    >
      {title.trim() === "" ? null : (
        <p className="bg-paper font-ui caps text-badge text-ink min-h-tap flex items-center justify-center rounded-full px-[16px] py-[10px] text-center break-words">
          {title}
        </p>
      )}

      <GameBody
        key={`${kind}:${photos.join(" ")}`}
        kind={kind}
        seed={`editor-stage-${photos.join(" ")}`}
        photos={photos}
      />

      {caption.trim() === "" ? null : (
        <p className="font-ui caps text-badge text-body text-center break-words">{caption}</p>
      )}
    </div>
  );
}
