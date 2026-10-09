"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/Button";
import { GamePopup } from "@/components/games/GamePopup";
import { t } from "@/lib/i18n";

/**
 * Карточка «Фото-пазл» на /games (09.10.2026): как в видео
 * design/игра пазл.MP4 — сверху обращение, целое фото с подписью
 * и «Начать». «Начать» открывает попап-пробу (GamePopup, тот же, что
 * в редакторе), а из попапа «Выбрать» ведёт в редактор: там пазл уже
 * добавлен в открытку и открыта вкладка «Игра» (решение пользователя:
 * сначала попап, потом редактор, а не игра прямо в карточке).
 *
 * Обращение и подпись — образец из видео («Ты лучший», «Тебе от меня»),
 * в настоящей открытке их пишет автор. Фото — компания друзей
 * с «С днём рождения!» поверх (09.10.2026, вместо пса в очках),
 * StockSnap CC0, источник в public/assets/games/puzzle.
 *
 * Зерно постоянное: у всех посетителей одна раскладка, как у одной
 * открытки. Каждое открытие попапа начинает игру заново.
 */

/** Пример фото пазла — и для пробы в редакторе, пока нет своего. */
export const PUZZLE_SAMPLE_PHOTO = "/assets/games/puzzle/friends.jpg";
const PHOTO = PUZZLE_SAMPLE_PHOTO;

/** Адрес, по которому редактор сам добавляет пазл и открывает «Игру». */
export const EDITOR_PUZZLE_HREF = "/editor?game=puzzle";

export function PuzzleDemo() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="bg-raised flex flex-col gap-[16px] p-[16px] xl:p-[20px]">
      <p className="bg-paper font-ui caps text-badge text-ink rounded-full px-[16px] py-[10px] text-center">
        {t("game.demo.title")}
      </p>

      <figure className="flex flex-col gap-[12px]">
        {/* Обычный img, как в карточках шаблонов: оптимизатор Next
            в статическом экспорте недоступен, файл уже ужат. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PHOTO}
          alt=""
          width={1000}
          height={1000}
          loading="lazy"
          className="rounded-card xl:rounded-card-d bg-photo aspect-square w-full object-cover"
        />
        <figcaption className="font-ui caps text-badge text-body text-center">
          {t("game.demo.caption")}
        </figcaption>
      </figure>
      <Button labelKey="cta.start" onClick={() => setOpen(true)} />

      <GamePopup
        open={open}
        seed="games-demo"
        photo={PHOTO}
        title={t("game.demo.title")}
        caption={t("game.demo.caption")}
        action={{ labelKey: "catalog.choose", href: EDITOR_PUZZLE_HREF }}
        onClose={close}
      />
    </div>
  );
}
