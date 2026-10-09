"use client";

import { PhotoPuzzle } from "@/components/games/PhotoPuzzle";

/**
 * Сцена вкладки «Игра» (09.10.2026, просьба пользователя): пока открыта
 * вкладка, вместо открытки в середине редактора — сам пазл, как его
 * увидит получатель. Сбоку, в GamePanel, меняют фото, обращение
 * и подпись — сцена следует за ними сразу.
 *
 * Раскладка та же, что в попапе-пробе (GamePopup) и на /games:
 * обращение на плашке, игра, подпись. Новое фото — новая раскладка
 * (key), правка текста игру не сбрасывает.
 *
 * Холст открытки при этом не размонтируется, а только прячется:
 * Fabric держит слои, и на другой вкладке открытка такая же, как была.
 */
export function GameStage({
  photo,
  title,
  caption,
}: {
  photo: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="bg-raised text-ink rounded-panel xl:rounded-panel-d flex w-full max-w-[440px] flex-col gap-[16px] p-[16px] xl:w-[min(100cqw,calc(100cqh-200px))] xl:max-w-[560px] xl:p-[20px]">
      {title.trim() === "" ? null : (
        <p className="bg-paper font-ui caps text-badge text-ink min-h-tap flex items-center justify-center rounded-full px-[16px] py-[10px] text-center break-words">
          {title}
        </p>
      )}

      <PhotoPuzzle
        key={photo}
        seed={`editor-stage-${photo}`}
        photos={[photo]}
        cover={null}
        reward={null}
        onDone={() => undefined}
      />

      {caption.trim() === "" ? null : (
        <p className="font-ui caps text-badge text-body text-center break-words">{caption}</p>
      )}
    </div>
  );
}
