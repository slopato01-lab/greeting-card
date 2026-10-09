"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { PhotoPuzzle } from "@/components/games/PhotoPuzzle";
import { t } from "@/lib/i18n";

/**
 * Живой пазл в карточке «Фото-пазл» на /games (09.10.2026): как в видео
 * design/игра пазл.MP4 — сверху обращение, целое фото с подписью
 * и «Начать», потом сама игра. Оформление светлое, от токенов.
 *
 * Обращение и подпись — образец из видео («Ты лучший», «Тебе от меня»),
 * в настоящей открытке их пишет автор. Фото — мемный пёс в лётных
 * очках, общественное достояние, источник в public/assets/games/puzzle.
 *
 * Зерно постоянное: у всех посетителей одна раскладка, как у одной
 * открытки. «Собрать ещё раз» перемонтирует игру с той же раскладкой.
 */

const PHOTO = "/assets/games/puzzle/dog.jpg";
const PHOTOS = [PHOTO] as const;

export function PuzzleDemo() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  return (
    <div className="bg-raised flex flex-col gap-[16px] p-[16px] xl:p-[20px]">
      <p className="bg-paper font-ui caps text-badge text-ink rounded-full px-[16px] py-[10px] text-center">
        {t("game.demo.title")}
      </p>

      {started ? (
        <>
          <PhotoPuzzle
            key={round}
            seed="games-demo"
            photos={PHOTOS}
            cover={null}
            reward={null}
            onDone={() => setDone(true)}
          />
          {done ? (
            <Button
              labelKey="game.puzzle.again"
              tone="dark"
              onClick={() => {
                setDone(false);
                setRound((value) => value + 1);
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          <figure className="flex flex-col gap-[12px]">
            {/* Обычный img, как в карточках шаблонов: оптимизатор Next
                в статическом экспорте недоступен, файл уже ужат. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO}
              alt=""
              width={1200}
              height={1200}
              loading="lazy"
              className="rounded-card xl:rounded-card-d bg-photo aspect-square w-full object-cover"
            />
            <figcaption className="font-ui caps text-badge text-body text-center">
              {t("game.demo.caption")}
            </figcaption>
          </figure>
          <Button labelKey="cta.start" onClick={() => setStarted(true)} />
        </>
      )}
    </div>
  );
}
