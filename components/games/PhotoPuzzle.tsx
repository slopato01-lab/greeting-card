"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";

import type { GameProps } from "@/lib/games/contract";
import {
  canSwap,
  isLocked,
  isSolved,
  newlyPlaced,
  pieceBackground,
  PUZZLE_SIZE,
  shuffledOrder,
  swapCells,
} from "@/lib/games/puzzle";
import { plural, t } from "@/lib/i18n";

/**
 * Фото-пазл — первая игра MVP (docs/PRODUCT.md): снимок автора разрезан
 * на 3×3, фрагменты перемешаны. Перетаскиваешь фрагмент на другой —
 * они меняются местами. Собрано — щели между фрагментами сходятся,
 * фото снова целое, под ним сюрприз. По видео design/игра пазл.MP4,
 * в светлом оформлении.
 *
 * Как устроено:
 * - раскладка от зерна открытки (lib/games/puzzle.ts), а не Math.random:
 *   при каждом открытии одна и та же;
 * - фрагменты — кнопки с куском фото в фоне. Пальцем и мышью — тащить
 *   или нажать два фрагмента по очереди; с клавиатуры — Enter/пробел
 *   на двух фрагментах. Выбранный обведён;
 * - на поле `touch-action: none`, иначе вместо перетаскивания
 *   прокручивается страница. Указатель захватывается полем, поэтому
 *   палец может уйти за край. Слушатели — пропсы React, снимает их он;
 * - фрагмент на своём месте закреплён (09.10.2026, просьба пользователя):
 *   по нему проходит золотое свечение, дальше — тонкая золотая обводка;
 *   его нельзя утащить, и на его клетку ничего не ставится. Бросок на
 *   закреплённый фрагмент — не ход. Свечение снимает animationend,
 *   таймеров нет;
 * - считаются только ходы (решение пользователя 09.10.2026): пазл
 *   проходится спокойно, без таймера. Проиграть нельзя;
 * - поворот экрана и блокировка не сбрасывают прогресс: всё в состоянии
 *   компонента, размеры — в процентах от поля;
 * - нет фото — собирать нечего: игра сразу пройдена, сюрприз не теряется.
 */

/** Сколько пикселей нужно протащить, чтобы касание стало перетаскиванием. */
const DRAG_SLOP = 6;

const CELLS = Array.from({ length: PUZZLE_SIZE * PUZZLE_SIZE }, (_, index) => index);

type Press = { cell: number; pointer: number; x: number; y: number; dragging: boolean };

export function PhotoPuzzle({ seed, reward, photos, cover, onDone }: GameProps) {
  const photo = photos[0] ?? cover;
  const [order, setOrder] = useState(() => shuffledOrder(seed));
  const [moves, setMoves] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ cell: number; dx: number; dy: number } | null>(null);
  const [aspect, setAspect] = useState(1);
  const [glow, setGlow] = useState<ReadonlyArray<number>>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<Press | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const solved = photo === null || isSolved(order);

  // onDone — ровно один раз, как обещает контракт.
  useEffect(() => {
    if (!solved || doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, [solved]);

  // Пропорции фото — чтобы вырезать квадрат по центру, как object-fit: cover.
  useEffect(() => {
    if (photo === null) return;
    const controller = new AbortController();
    const image = new Image();
    image.addEventListener(
      "load",
      () => {
        if (image.naturalHeight > 0) setAspect(image.naturalWidth / image.naturalHeight);
      },
      { signal: controller.signal },
    );
    image.src = photo;
    return () => {
      controller.abort();
      image.src = "";
    };
  }, [photo]);

  const swap = (a: number, b: number) => {
    setSelected(null);
    if (!canSwap(order, a, b)) return;
    const next = swapCells(order, a, b);
    setOrder(next);
    setMoves((count) => count + 1);
    setGlow(newlyPlaced(order, next));
  };

  // Нажатие без перетаскивания: первый фрагмент выбирается,
  // второй меняется с ним местами, повторный снимает выбор.
  const tap = (cell: number) => {
    if (solved || isLocked(order, cell)) return;
    if (selected === null) setSelected(cell);
    else if (selected === cell) setSelected(null);
    else swap(selected, cell);
  };

  /** Клетка под указателем или null, если он за полем. */
  const cellAt = (event: PointerEvent) => {
    const board = boardRef.current;
    if (board === null) return null;
    const box = board.getBoundingClientRect();
    const column = Math.floor(((event.clientX - box.left) / box.width) * PUZZLE_SIZE);
    const row = Math.floor(((event.clientY - box.top) / box.height) * PUZZLE_SIZE);
    if (column < 0 || row < 0 || column >= PUZZLE_SIZE || row >= PUZZLE_SIZE) return null;
    return row * PUZZLE_SIZE + column;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (solved || pressRef.current !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const cell = cellAt(event);
    if (cell === null || isLocked(order, cell)) return;
    pressRef.current = {
      cell,
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dragging: false,
    };
    // Бросает, если указатель уже не активен, — играть это не мешает.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ничего: без захвата палец просто не уйдёт за край поля
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (press === null || press.pointer !== event.pointerId) return;
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (!press.dragging && Math.hypot(dx, dy) < DRAG_SLOP) return;
    press.dragging = true;
    setDrag({ cell: press.cell, dx, dy });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (press === null || press.pointer !== event.pointerId) return;
    pressRef.current = null;
    setDrag(null);
    if (!press.dragging) {
      tap(press.cell);
      return;
    }
    const target = cellAt(event);
    if (target !== null && target !== press.cell) swap(press.cell, target);
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pressRef.current?.pointer !== event.pointerId) return;
    pressRef.current = null;
    setDrag(null);
  };

  if (photo === null) return <div className="text-center">{reward}</div>;

  return (
    <div className="flex flex-col gap-[16px]">
      <div
        ref={boardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={[
          "rounded-card xl:rounded-card-d grid aspect-square w-full touch-none grid-cols-3 select-none motion-safe:transition-[gap] motion-safe:duration-500",
          solved ? "gap-0 overflow-hidden" : "gap-[4px]",
        ].join(" ")}
      >
        {CELLS.map((cell) => {
          const piece = order[cell] ?? cell;
          const dragged = drag?.cell === cell;
          const locked = isLocked(order, cell);
          return (
            <button
              key={piece}
              type="button"
              disabled={solved || locked}
              onAnimationEnd={() => setGlow((cells) => cells.filter((item) => item !== cell))}
              aria-pressed={selected === cell}
              aria-label={`${t("game.puzzle.piece")} ${piece + 1}`}
              // Нажатия пальцем и мышью ловит поле (pointerup), сюда
              // доходят только клики с клавиатуры: у них detail === 0.
              onClick={(event) => {
                if (event.detail === 0) tap(cell);
              }}
              style={{
                backgroundImage: `url("${photo}")`,
                ...pieceBackground(piece, aspect),
                ...(dragged ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : {}),
              }}
              className={[
                "bg-photo relative bg-no-repeat",
                "motion-safe:transition-[border-radius,box-shadow] motion-safe:duration-500",
                solved ? "rounded-none" : "rounded-inner",
                !solved && !locked ? "cursor-grab" : "",
                !solved && locked ? "ring-gold ring-2 ring-inset" : "",
                !solved && glow.includes(cell) ? "puzzle-glow z-10" : "",
                selected === cell ? "ring-gold-deep ring-2 ring-offset-2" : "",
                dragged ? "shadow-card z-10 cursor-grabbing" : "",
              ].join(" ")}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-[12px]">
        <p className="font-ui text-note xl:text-note-d text-body">
          {t(solved ? "game.puzzle.done" : "game.puzzle.how")}
        </p>
        <p
          aria-live="polite"
          className="bg-paper font-ui caps text-badge text-ink shrink-0 rounded-full px-[14px] py-[8px] tabular-nums"
        >
          {moves} {plural(moves, ["game.moves.one", "game.moves.few", "game.moves"])}
        </p>
      </div>

      {solved ? <div className="text-center">{reward}</div> : null}
    </div>
  );
}
