"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/Button";
import { GameBody } from "@/components/games/GameBody";
import { Icon } from "@/components/Icon";
import type { GameKind } from "@/lib/editor/document";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Попап-проба игры (09.10.2026, просьба пользователя): по центру экрана,
 * всё вокруг размыто — «чтобы была чисто игра». Открывается из вкладки
 * «Игра» редактора: сначала попробовать, потом добавить в открытку.
 *
 * Нативный <dialog> через showModal(), как попап подписки: фокус заперт
 * внутри, Esc закрывает, страница под ним inert. Нажатие на размытый
 * фон тоже закрывает. Содержимое монтируется только пока окно открыто —
 * каждое открытие начинает игру заново.
 *
 * Раскладки в макете нет: собрана от токенов по образцу /games
 * (обращение на плашке, игра, подпись) и попапа подписки.
 */
export type GamePopupProps = {
  open: boolean;
  kind: GameKind;
  /** Зерно раскладки: одно и то же — одна и та же раскладка. */
  seed: string;
  /** Фото, готовые к игре: playPhotos в lib/games/kinds.ts. */
  photos: readonly string[];
  title: string;
  caption: string;
  /**
   * Кнопка под игрой: действие («Добавить в открытку» в редакторе)
   * или ссылка («Выбрать» на /games ведёт в редактор).
   */
  action?: { labelKey: TextKey; onClick: () => void } | { labelKey: TextKey; href: string };
  onClose: () => void;
};

export function GamePopup({
  open,
  kind,
  seed,
  photos,
  title,
  caption,
  action,
  onClose,
}: GamePopupProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Esc закрывает <dialog> сам — состояние догоняет по событию close.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    const controller = new AbortController();
    dialog.addEventListener("close", onClose, { signal: controller.signal });
    return () => controller.abort();
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={title.trim() === "" ? t("editor.tab.game") : title}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="bg-raised text-ink rounded-panel xl:rounded-panel-d backdrop:bg-ink/30 backdrop:backdrop-blur-overlay m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[440px] overflow-y-auto overscroll-contain p-0"
    >
      {open ? (
        <div className="relative flex flex-col gap-[16px] p-[16px] xl:p-[20px]">
          <div className="flex items-center gap-[8px]">
            <p className="bg-paper font-ui caps text-badge text-ink min-h-tap flex flex-1 items-center justify-center rounded-full px-[16px] py-[10px] text-center break-words">
              {title}
            </p>
            <button
              type="button"
              aria-label={t("game.close")}
              title={t("game.close")}
              onClick={() => ref.current?.close()}
              className="bg-paper text-ink hover:bg-surface active:bg-line size-tap flex shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <GameBody kind={kind} seed={seed} photos={photos} />

          {caption.trim() === "" ? null : (
            <p className="font-ui caps text-badge text-body text-center break-words">{caption}</p>
          )}

          {action === undefined ? null : "href" in action ? (
            <Button labelKey={action.labelKey} href={action.href} className="xl:w-full" />
          ) : (
            <Button labelKey={action.labelKey} onClick={action.onClick} className="xl:w-full" />
          )}
        </div>
      ) : null}
    </dialog>
  );
}
