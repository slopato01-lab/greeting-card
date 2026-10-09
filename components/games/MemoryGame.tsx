"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/Icon";
import type { GameProps } from "@/lib/games/contract";
import {
  flip,
  isComplete,
  isFaceUp,
  isMismatch,
  MEMORY_PAIRS,
  newGame,
  settle,
} from "@/lib/games/memory";
import { plural, t } from "@/lib/i18n";

/**
 * «Собери пару» (мемори) — по идее design/игра собери пару.MP4, но
 * в другом оформлении и вдвое меньше: 12 карточек, 6 пар
 * (просьба пользователя 09.10.2026).
 *
 * Как устроено:
 * - колода от зерна открытки (lib/games/memory.ts), а не Math.random;
 * - поле 4 × 3 — и в попапе, и на телефоне оно целиком в экране;
 * - карточка переворачивается в объёме (perspective + rotateY),
 *   рубашка — золото с узором `.memory-back` из globals.css;
 * - угаданная пара на миг всплывает крупно поверх поля, как в видео,
 *   потом остаётся открытой с золотым свечением. Без движения —
 *   сразу открытой, без всплытия;
 * - несовпавшие закрываются через паузу или сразу, как только
 *   открывают третью карточку;
 * - карточки — кнопки: пальцем, мышью и с клавиатуры одинаково;
 * - только ходы, без таймера, проиграть нельзя (как у пазла);
 * - фото меньше двух — искать нечего: игра сразу пройдена.
 *   Добирать примеры до шести — дело того, кто вызывает игру.
 *
 * Оба таймера (закрытие и всплытие) снимаются при размонтировании.
 */

/** Сколько несовпавшая пара лежит открытой, мс. */
const MISMATCH_MS = 900;
/** Сколько угаданная пара видна крупно, мс — как .memory-pop в globals.css. */
const POP_MS = 1300;

export function MemoryGame({ seed, reward, photos, onDone }: GameProps) {
  const pictures = [...new Set(photos)].slice(0, MEMORY_PAIRS);
  const playable = pictures.length >= 2;
  const [state, setState] = useState(() => newGame(seed, playable ? pictures.length : 0));
  const [pop, setPop] = useState<number | null>(null);
  const [glow, setGlow] = useState<ReadonlyArray<number>>([]);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const complete = !playable || isComplete(state);

  // onDone — ровно один раз, как обещает контракт.
  useEffect(() => {
    if (!complete || doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, [complete]);

  // Несовпавшая пара сама закрывается через паузу.
  const mismatch = isMismatch(state);
  useEffect(() => {
    if (!mismatch) return;
    const timer = window.setTimeout(() => setState((current) => settle(current)), MISMATCH_MS);
    return () => window.clearTimeout(timer);
  }, [mismatch]);

  // Всплывшая пара прячется сама.
  useEffect(() => {
    if (pop === null) return;
    const timer = window.setTimeout(() => setPop(null), POP_MS);
    return () => window.clearTimeout(timer);
  }, [pop]);

  const open = (card: number) => {
    if (complete) return;
    const result = flip(state, card);
    setState(result.state);
    if (result.matched === null) return;
    const pair = result.matched;
    setPop(pair);
    setGlow(result.state.deck.flatMap((item, index) => (item === pair ? [index] : [])));
  };

  if (!playable) return <div className="text-center">{reward}</div>;

  const popped = pop === null ? undefined : pictures[pop];

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="relative">
        <ul role="list" className="grid grid-cols-4 gap-[8px] select-none">
          {state.deck.map((pair, card) => {
            const up = isFaceUp(state, card);
            const done = state.matched.includes(pair);
            return (
              <li key={card} className="perspective-[600px]">
                <button
                  type="button"
                  onClick={() => open(card)}
                  disabled={done || complete}
                  aria-label={`${t("game.memory.card")} ${card + 1}`}
                  aria-pressed={up}
                  className={[
                    "rounded-inner relative block aspect-[3/4] w-full transform-3d",
                    "motion-safe:transition-transform motion-safe:duration-500",
                    up ? "rotate-y-180" : "hover:-translate-y-[2px] active:scale-[0.97]",
                    done ? "" : "cursor-pointer",
                  ].join(" ")}
                >
                  {/* Рубашка. */}
                  <span
                    aria-hidden="true"
                    className="memory-back rounded-inner text-gold-deep absolute inset-0 flex items-center justify-center backface-hidden"
                  >
                    <Icon name="planet" size={28} />
                  </span>
                  {/* Лицо — повёрнуто заранее, видно после переворота. */}
                  <span
                    aria-hidden="true"
                    onAnimationEnd={() => setGlow((cards) => cards.filter((item) => item !== card))}
                    style={{ backgroundImage: `url("${pictures[pair] ?? ""}")` }}
                    className={[
                      "rounded-inner bg-photo absolute inset-0 rotate-y-180 bg-cover bg-center backface-hidden",
                      done ? "ring-gold ring-2" : "",
                      glow.includes(card) ? "puzzle-glow" : "",
                    ].join(" ")}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Угаданная пара крупно, как в видео. Только для глаз:
            скринридеру хватает того, что карточки остались открытыми. */}
        {popped === undefined ? null : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center motion-reduce:hidden"
          >
            <div
              key={pop}
              style={{ backgroundImage: `url("${popped}")` }}
              className="memory-pop bg-photo rounded-card border-paper shadow-card aspect-[3/4] w-[52%] border-2 bg-cover bg-center"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-[12px]">
        <p className="font-ui text-note xl:text-note-d text-body">
          {t(complete ? "game.memory.done" : "game.memory.how")}
        </p>
        <p
          aria-live="polite"
          className="bg-paper font-ui caps text-badge text-ink shrink-0 rounded-full px-[14px] py-[8px] tabular-nums"
        >
          {state.moves} {plural(state.moves, ["game.moves.one", "game.moves.few", "game.moves"])}
        </p>
      </div>

      {complete ? <div className="text-center">{reward}</div> : null}
    </div>
  );
}
