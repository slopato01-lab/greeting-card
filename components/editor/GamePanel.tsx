"use client";

import { useState } from "react";

import { FileButton, GroupLabel, Panel, ToolButton } from "@/components/editor/controls";
import { GamePopup } from "@/components/games/GamePopup";
import { PUZZLE_SAMPLE_PHOTO } from "@/components/games/PuzzleDemo";
import { type CardGame, LIMITS } from "@/lib/editor/document";
import { t } from "@/lib/i18n";

/**
 * Вкладка «Игра» (09.10.2026, план утверждён пользователем). Пока одна
 * игра — фото-пазл. Нажал на игру — сначала попап-проба (GamePopup),
 * из него «Добавить в открытку». Потом здесь же своё фото и два текста:
 * обращение над игрой и подпись под фото. Без своего фото пазл собирает
 * пример с /games.
 *
 * Игра хранится в черновике (поле `game`), на холст не ложится:
 * GIF и видео — картинка, играть в них нельзя. Об этом — строка внизу.
 */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

const FIELD =
  "font-ui text-note text-ink bg-paper border-muted rounded-inner min-h-tap w-full border px-[12px] disabled:opacity-50";

const NOTE = "font-ui text-note xl:text-note-d text-body leading-[1.4]";

export function GamePanel({
  game,
  photo,
  disabled,
  onGame,
  onPhoto,
}: {
  game: CardGame | null;
  /** Своё фото игры, адрес blob: — или null, тогда пример. */
  photo: string | null;
  disabled: boolean;
  onGame: (game: CardGame | null) => void;
  onPhoto: (file: File) => void;
}) {
  const [trying, setTrying] = useState(false);
  // Каждая проба — новая раскладка того же пазла.
  const [round, setRound] = useState(0);
  const shown = photo ?? PUZZLE_SAMPLE_PHOTO;

  const openTry = () => {
    setRound((value) => value + 1);
    setTrying(true);
  };

  return (
    <Panel labelledBy="editor-game">
      <GroupLabel id="editor-game" labelKey="editor.tab.game" />

      {game === null ? (
        <button
          type="button"
          disabled={disabled}
          onClick={openTry}
          className="bg-paper border-line rounded-inner hover:border-muted active:bg-line flex items-center gap-[12px] border p-[8px] text-start transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* Обычный img: оптимизатор Next в статическом экспорте недоступен. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PUZZLE_SAMPLE_PHOTO}
            alt=""
            width={72}
            height={72}
            className="rounded-inner bg-photo size-[72px] shrink-0 object-cover"
          />
          <span className="flex min-w-0 flex-col gap-[4px]">
            <span className="font-ui text-note xl:text-note-d text-ink font-medium">
              {t("games.card.1.title")}
            </span>
            <span className={NOTE}>{t("game.puzzle.hint")}</span>
            <span className="font-ui caps text-badge text-gold-deep">{t("game.try")}</span>
          </span>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-[12px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shown}
              alt=""
              width={72}
              height={72}
              className="rounded-inner bg-photo size-[72px] shrink-0 object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                {t("games.card.1.title")}
              </span>
              <FileButton
                icon="photo"
                labelKey="editor.game.photo"
                accept={ACCEPT}
                disabled={disabled}
                onFile={onPhoto}
              />
            </div>
          </div>

          <label className="flex flex-col gap-[6px]">
            <span className="font-ui caps text-badge text-muted">{t("editor.game.title")}</span>
            <input
              type="text"
              value={game.title}
              maxLength={LIMITS.gameText}
              disabled={disabled}
              onChange={(event) => onGame({ ...game, title: event.target.value })}
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span className="font-ui caps text-badge text-muted">{t("editor.game.caption")}</span>
            <input
              type="text"
              value={game.caption}
              maxLength={LIMITS.gameText}
              disabled={disabled}
              onChange={(event) => onGame({ ...game, caption: event.target.value })}
              className={FIELD}
            />
          </label>

          <div className="flex flex-wrap gap-[8px]">
            <ToolButton icon="play" labelKey="game.try" disabled={disabled} onClick={openTry} />
            <ToolButton
              icon="trash"
              labelKey="game.remove"
              disabled={disabled}
              onClick={() => onGame(null)}
            />
          </div>
        </>
      )}

      <p className={NOTE}>{t("editor.game.note")}</p>

      <GamePopup
        open={trying}
        seed={`editor-try-${round}`}
        photo={shown}
        title={game?.title ?? t("game.demo.title")}
        caption={game?.caption ?? t("game.demo.caption")}
        {...(game === null
          ? {
              action: {
                labelKey: "game.add" as const,
                onClick: () => {
                  onGame({
                    kind: "puzzle",
                    title: t("game.demo.title"),
                    caption: t("game.demo.caption"),
                  });
                  setTrying(false);
                },
              },
            }
          : {})}
        onClose={() => setTrying(false)}
      />
    </Panel>
  );
}
