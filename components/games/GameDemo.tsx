"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/Button";
import { GamePopup } from "@/components/games/GamePopup";
import { Icon } from "@/components/Icon";
import type { GameKind } from "@/lib/editor/document";
import { editorGameHref, MEMORY_SAMPLE_PHOTOS, playPhotos, PUZZLE_SAMPLE_PHOTO } from "@/lib/games/kinds";
import { t } from "@/lib/i18n";

/**
 * Карточка игры на /games (09.10.2026, раньше — PuzzleDemo): сверху
 * обращение, превью игры, подпись и «Начать». «Начать» открывает
 * попап-пробу (GamePopup, тот же, что в редакторе), а из попапа
 * «Выбрать» ведёт в редактор: там игра уже добавлена в открытку
 * и открыта вкладка «Игра» (решение пользователя: сначала попап,
 * потом редактор, а не игра прямо в карточке).
 *
 * Превью: у пазла — целое фото, у «Собери пару» — поле рубашками
 * вверх, две карточки открыты. Обращение и подпись — образец из видео
 * («Ты лучший», «Тебе от меня»), в настоящей открытке их пишет автор.
 *
 * Зерно постоянное: у всех посетителей одна раскладка, как у одной
 * открытки. Каждое открытие попапа начинает игру заново.
 */

/** Какие карточки превью «Собери пару» лежат лицом вверх и с каким фото. */
const MEMORY_PREVIEW_OPEN: Readonly<Record<number, string>> = {
  1: MEMORY_SAMPLE_PHOTOS[1],
  6: MEMORY_SAMPLE_PHOTOS[1],
  9: MEMORY_SAMPLE_PHOTOS[3],
};

function Preview({ kind }: { kind: GameKind }) {
  if (kind === "puzzle") {
    return (
      // Обычный img, как в карточках шаблонов: оптимизатор Next
      // в статическом экспорте недоступен, файл уже ужат.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={PUZZLE_SAMPLE_PHOTO}
        alt=""
        width={1000}
        height={1000}
        loading="lazy"
        className="rounded-card xl:rounded-card-d bg-photo aspect-square w-full object-cover"
      />
    );
  }
  return (
    <div aria-hidden="true" className="grid grid-cols-4 gap-[8px]">
      {Array.from({ length: 12 }, (_, card) => {
        const photo = MEMORY_PREVIEW_OPEN[card];
        return photo === undefined ? (
          <span
            key={card}
            className="memory-back rounded-inner text-gold-deep flex aspect-[3/4] items-center justify-center"
          >
            <Icon name="planet" size={24} />
          </span>
        ) : (
          <span
            key={card}
            style={{ backgroundImage: `url("${photo}")` }}
            className="rounded-inner bg-photo ring-gold aspect-[3/4] bg-cover bg-center ring-2"
          />
        );
      })}
    </div>
  );
}

export function GameDemo({ kind }: { kind: GameKind }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="bg-raised flex flex-col gap-[16px] p-[16px] xl:p-[20px]">
      <p className="bg-paper font-ui caps text-badge text-ink rounded-full px-[16px] py-[10px] text-center">
        {t("game.demo.title")}
      </p>

      <figure className="flex flex-col gap-[12px]">
        <Preview kind={kind} />
        <figcaption className="font-ui caps text-badge text-body text-center">
          {t("game.demo.caption")}
        </figcaption>
      </figure>
      <Button labelKey="cta.start" onClick={() => setOpen(true)} />

      <GamePopup
        open={open}
        kind={kind}
        seed="games-demo"
        photos={playPhotos(kind, [])}
        title={t("game.demo.title")}
        caption={t("game.demo.caption")}
        action={{ labelKey: "catalog.choose", href: editorGameHref(kind) }}
        onClose={close}
      />
    </div>
  );
}
