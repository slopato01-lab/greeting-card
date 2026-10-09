"use client";

import { useState } from "react";

import {
  FileButton,
  GroupLabel,
  IconButton,
  Panel,
  ToolButton,
} from "@/components/editor/controls";
import { GamePopup } from "@/components/games/GamePopup";
import { type CardGame, GAME_KINDS, type GameKind, LIMITS } from "@/lib/editor/document";
import { TEMPLATES } from "@/lib/editor/templates";
import { GAME_INFO, MAZE_DEFAULT_TEMPLATE, playPhotos, templateCover } from "@/lib/games/kinds";
import { t } from "@/lib/i18n";

/**
 * Вкладка «Игра» (09.10.2026, план утверждён пользователем): фото-пазл
 * и «Собери пару». Нажал на игру — сначала попап-проба (GamePopup),
 * из него «Добавить в открытку». Потом здесь же свои фото и два текста:
 * обращение над игрой и подпись. Пазлу — одно фото, парам — до шести;
 * чего не хватает, игра добирает примерами с /games. Лабиринту —
 * то, что выскочит в финале: обложка любого шаблона или своё фото.
 *
 * Другая игра — через «Убрать игру»: у игр разные фото, молча
 * переносить их из одной в другую нельзя.
 *
 * Игра хранится в черновике (поле `game`), на холст не ложится:
 * GIF и видео — картинка, играть в них нельзя. Об этом — строка внизу.
 */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

const FIELD =
  "font-ui text-note text-ink bg-paper border-muted rounded-inner min-h-tap w-full border px-[12px] disabled:opacity-50";

const NOTE = "font-ui text-note xl:text-note-d text-body leading-[1.4]";

function Thumb({ src }: { src: string }) {
  return (
    // Обычный img: оптимизатор Next в статическом экспорте недоступен.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={72}
      height={72}
      className="rounded-inner bg-photo size-[72px] shrink-0 object-cover"
    />
  );
}

export function GamePanel({
  game,
  photo,
  photos,
  disabled,
  onGame,
  onPhoto,
}: {
  game: CardGame | null;
  /** Своё фото пазла, адрес blob: — или null, тогда пример. */
  photo: string | null;
  /** Свои фото «Собери пару» с адресами blob:. */
  photos: ReadonlyArray<{ asset: string; url: string }>;
  disabled: boolean;
  onGame: (game: CardGame | null) => void;
  onPhoto: (file: File) => void;
}) {
  /** Какую игру пробуют в попапе; null — попап закрыт. */
  const [trying, setTrying] = useState<GameKind | null>(null);
  // Каждая проба — новая раскладка той же игры.
  const [round, setRound] = useState(0);

  const openTry = (kind: GameKind) => {
    setRound((value) => value + 1);
    setTrying(kind);
  };

  const own =
    game?.kind === "memory" ? photos.map((item) => item.url) : photo === null ? [] : [photo];
  const shown = playPhotos(
    trying ?? game?.kind ?? "puzzle",
    game === null ? [] : own,
    game?.template,
  );

  return (
    <Panel labelledBy="editor-game">
      <GroupLabel id="editor-game" labelKey="editor.tab.game" />

      {game === null ? (
        GAME_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => openTry(kind)}
            className="bg-paper border-line rounded-inner hover:border-muted active:bg-line flex items-center gap-[12px] border p-[8px] text-start transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Thumb src={GAME_INFO[kind].preview} />
            <span className="flex min-w-0 flex-col gap-[4px]">
              <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                {t(GAME_INFO[kind].title)}
              </span>
              <span className={NOTE}>{t(GAME_INFO[kind].hint)}</span>
              <span className="font-ui caps text-badge text-gold-deep">{t("game.try")}</span>
            </span>
          </button>
        ))
      ) : (
        <>
          <div className="flex items-center gap-[12px]">
            <Thumb src={shown[0] ?? GAME_INFO[game.kind].preview} />
            <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
              <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                {t(GAME_INFO[game.kind].title)}
              </span>
              <FileButton
                icon="photo"
                labelKey={
                  game.kind === "memory"
                    ? "editor.game.addPhoto"
                    : game.kind === "maze"
                      ? "editor.game.scarePhoto"
                      : "editor.game.photo"
                }
                accept={ACCEPT}
                disabled={
                  disabled || (game.kind === "memory" && photos.length >= LIMITS.gamePhotos)
                }
                onFile={onPhoto}
              />
            </div>
          </div>

          {game.kind === "memory" ? (
            <>
              <p className={NOTE}>{t("editor.game.photosNote")}</p>
              {photos.length === 0 ? null : (
                <ul role="list" className="grid grid-cols-3 gap-[8px]">
                  {photos.map((item, index) => (
                    <li key={item.asset} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt=""
                        width={96}
                        height={96}
                        className="rounded-inner bg-photo aspect-square w-full object-cover"
                      />
                      <span className="absolute end-[4px] top-[4px]">
                        <IconButton
                          icon="close"
                          labelKey="editor.game.removePhoto"
                          disabled={disabled}
                          onClick={() =>
                            onGame({
                              ...game,
                              photos: (game.photos ?? []).filter((_, at) => at !== index),
                            })
                          }
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}

          {game.kind === "maze" ? (
            <fieldset className="flex flex-col gap-[8px]">
              <legend className="font-ui caps text-badge text-muted mb-[6px]">
                {t("editor.game.scare")}
              </legend>
              <p className={NOTE}>{t("editor.game.scareNote")}</p>
              {/* Обложки шаблонов — выбор одной, как радиокнопки.
                  Своё фото главнее: пока оно есть, ни одна не выбрана. */}
              <ul
                role="list"
                className="grid max-h-[320px] grid-cols-3 gap-[8px] overflow-y-auto p-[2px]"
              >
                {TEMPLATES.map((info) => {
                  const chosen =
                    game.asset === undefined &&
                    (game.template ?? MAZE_DEFAULT_TEMPLATE) === info.id;
                  return (
                    <li key={info.id}>
                      <button
                        type="button"
                        aria-pressed={chosen}
                        aria-label={t(info.label)}
                        title={t(info.label)}
                        disabled={disabled}
                        onClick={() => {
                          const { asset: _photo, ...rest } = game;
                          onGame({ ...rest, template: info.id });
                        }}
                        className={[
                          "rounded-inner bg-photo block aspect-[3/4] w-full overflow-hidden transition-shadow disabled:opacity-50",
                          chosen ? "ring-gold-deep ring-2" : "hover:ring-muted hover:ring-1",
                        ].join(" ")}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={templateCover(info.id)}
                          alt=""
                          width={96}
                          height={128}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ) : null}

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
            <ToolButton
              icon="play"
              labelKey="game.try"
              disabled={disabled}
              onClick={() => openTry(game.kind)}
            />
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
        open={trying !== null}
        kind={trying ?? "puzzle"}
        seed={`editor-try-${round}`}
        photos={shown}
        title={game?.title ?? t("game.demo.title")}
        caption={game?.caption ?? t("game.demo.caption")}
        {...(game === null && trying !== null
          ? {
              action: {
                labelKey: "game.add" as const,
                onClick: () => {
                  onGame({
                    kind: trying,
                    title: t("game.demo.title"),
                    caption: t("game.demo.caption"),
                  });
                  setTrying(null);
                },
              },
            }
          : {})}
        onClose={() => setTrying(null)}
      />
    </Panel>
  );
}
