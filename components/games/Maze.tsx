"use client";

import { type KeyboardEvent, type PointerEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { GameProps } from "@/lib/games/contract";
import {
  checkpointAt,
  hitsObstacle,
  MAZE_COLS,
  MAZE_LEVELS,
  mazeLevels,
  moveBall,
  type Point,
  reachedExit,
} from "@/lib/games/maze";
import {
  drawMaze,
  levelPalette,
  mazeHeight,
  mazeView,
  type MazeTokens,
} from "@/lib/games/maze-draw";
import { t } from "@/lib/i18n";

/**
 * Лабиринт со скримером (09.10.2026, просьба пользователя) — по идее
 * design/игра лабиринт.MP4, но объёмнее, ярче и короче: три уровня
 * с препятствиями, всё прохождение — 30–60 секунд. В финале резко,
 * с криком и тряской, во весь экран выскакивает поздравление:
 * шаблон открытки или своё фото автора — первое из `photos`.
 *
 * Как устроено:
 * - уровни, стены и препятствия — lib/games/maze.ts, рисование —
 *   lib/games/maze-draw.ts; цвета — токены, прочитанные из :root;
 * - шарик ведут пальцем или мышью: он идёт за движением пальца, где бы
 *   палец ни лежал на поле, — так шарик не прячется под пальцем.
 *   С клавиатуры — стрелками. Стены не пускают, вдоль них он скользит;
 * - задел препятствие — вспышка, шарик на последней контрольной точке.
 *   Проиграть нельзя, таймера нет;
 * - холст наклонён CSS-перспективой — вместе с высотой стен это и есть
 *   «3D» без библиотек;
 * - кадры — requestAnimationFrame только пока идёт игра; он, таймер
 *   надписи уровня, загрузка звука и AudioContext снимаются при
 *   размонтировании;
 * - звук: AudioContext заводится на первом касании (без жеста браузер
 *   звук не пустит, а финал наступает посреди движения пальца, это не
 *   жест). Не завёлся — скример всё равно выскочит, просто молча;
 * - без движения (prefers-reduced-motion) скример появляется без
 *   тряски и наезда. Крик остаётся: он и есть сюрприз.
 */

const SCREAM_URL = "/assets/games/maze/scream.mp3";
/** Шаг шарика на одно нажатие стрелки, клетки. */
const KEY_STEP = 0.34;
/** Сколько висит надпись «Уровень 2 из 3», мс. */
const BANNER_MS = 1100;
/** Вспышка после касания гаснет за столько секунд. */
const FLASH_SECONDS = 0.45;

type Phase = "play" | "scare" | "done";

function readTokens(): MazeTokens {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(`--color-${name}`).trim();
  return {
    ink: token("ink"),
    paper: token("paper"),
    gold: token("gold"),
    goldDeep: token("gold-deep"),
    pink: token("pink"),
    mint: token("mint"),
    sky: token("sky"),
    lilac: token("lilac"),
  };
}

export function Maze({ seed, reward, photos, onDone }: GameProps) {
  const scare = photos[0] ?? null;
  const levels = useMemo(() => mazeLevels(seed), [seed]);
  const [phase, setPhase] = useState<Phase>("play");
  const [levelIndex, setLevelIndex] = useState(0);
  const [banner, setBanner] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  // Каждый новый заход — новый номер: эффект игры перезапускается.
  const [round, setRound] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Накопленный сдвиг пальца в клетках — забирает кадр. */
  const pending = useRef<Point>({ x: 0, y: 0 });
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const audio = useRef<{ context: AudioContext; buffer: AudioBuffer | null } | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Надпись уровня гаснет сама.
  useEffect(() => {
    if (banner === null) return;
    const timer = window.setTimeout(() => setBanner(null), BANNER_MS);
    return () => window.clearTimeout(timer);
  }, [banner]);

  // Звук живёт, пока живёт игра.
  useEffect(
    () => () => {
      const current = audio.current;
      audio.current = null;
      if (current !== null) void current.context.close().catch(() => undefined);
    },
    [],
  );

  /** Завести звук — только из обработчика жеста. */
  const unlockAudio = () => {
    if (audio.current !== null) {
      void audio.current.context.resume().catch(() => undefined);
      return;
    }
    if (typeof AudioContext === "undefined") return;
    const context = new AudioContext();
    const slot: { context: AudioContext; buffer: AudioBuffer | null } = { context, buffer: null };
    audio.current = slot;
    void context.resume().catch(() => undefined);
    void fetch(SCREAM_URL)
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error())))
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        slot.buffer = buffer;
      })
      .catch(() => undefined);
  };

  const scream = () => {
    const current = audio.current;
    if (current === null || current.buffer === null || current.context.state === "closed") return;
    const source = current.context.createBufferSource();
    source.buffer = current.buffer;
    source.connect(current.context.destination);
    source.start();
  };

  // Игра: кадры, пока фаза «play».
  useEffect(() => {
    if (phase !== "play") return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    if (canvas === null || wrap === null || ctx === null) return;

    const tokens = readTokens();
    let index = 0;
    let level = levels[0];
    if (level === undefined) return;
    let ball = level.start;
    let respawn = level.start;
    // Часы игры — метки кадров requestAnimationFrame: отсчёт уровня
    // начинается с первого кадра, а не с монтирования.
    let started: number | null = null;
    let flash = 0;
    let last = 0;
    let frame = 0;
    let palette = levelPalette(tokens, 0);
    pending.current = { x: 0, y: 0 };

    const fit = () => {
      const width = wrap.clientWidth;
      if (width === 0) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(mazeHeight(width) * ratio);
      canvas.style.height = `${mazeHeight(width)}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);

    const tick = (now: number) => {
      const current = level;
      if (current === undefined) return;
      if (started === null) {
        started = now;
        last = now;
      }
      const time = (now - started) / 1000;
      const delta = Math.min(0.1, (now - last) / 1000);
      last = now;

      const move = pending.current;
      pending.current = { x: 0, y: 0 };
      if (move.x !== 0 || move.y !== 0) ball = moveBall(current, ball, move.x, move.y);

      const point = checkpointAt(current, ball);
      if (point !== null) respawn = point;

      if (hitsObstacle(current, ball, time)) {
        ball = respawn;
        flash = 1;
        pending.current = { x: 0, y: 0 };
        setHits((count) => count + 1);
      }

      if (reachedExit(current, ball)) {
        if (index + 1 >= levels.length) {
          scream();
          setPhase("scare");
          if (!doneRef.current) {
            doneRef.current = true;
            onDoneRef.current();
          }
          return;
        }
        index += 1;
        level = levels[index];
        if (level === undefined) return;
        ball = level.start;
        respawn = level.start;
        started = now;
        palette = levelPalette(tokens, index);
        setLevelIndex(index);
        setBanner(index);
      }

      flash = Math.max(0, flash - delta / FLASH_SECONDS);
      const next = level;
      if (next !== undefined) {
        drawMaze(
          ctx,
          mazeView(canvas.width),
          next,
          (now - (started ?? now)) / 1000,
          ball,
          palette,
          flash,
        );
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [phase, levels, round]);

  /** Клетка в пикселях на экране — переводит движение пальца в клетки. */
  const cellPx = () => (wrapRef.current?.clientWidth ?? MAZE_COLS) / MAZE_COLS;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (phase !== "play" || pointer.current !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    unlockAudio();
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ничего: без захвата палец просто не уйдёт за край поля
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const press = pointer.current;
    if (press === null || press.id !== event.pointerId) return;
    const size = cellPx();
    pending.current = {
      x: pending.current.x + (event.clientX - press.x) / size,
      y: pending.current.y + (event.clientY - press.y) / size,
    };
    press.x = event.clientX;
    press.y = event.clientY;
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current?.id === event.pointerId) pointer.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = {
      ArrowLeft: { x: -KEY_STEP, y: 0 },
      ArrowRight: { x: KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: -KEY_STEP },
      ArrowDown: { x: 0, y: KEY_STEP },
    }[event.key];
    if (step === undefined || phase !== "play") return;
    event.preventDefault();
    unlockAudio();
    pending.current = { x: pending.current.x + step.x, y: pending.current.y + step.y };
  };

  const restart = () => {
    setLevelIndex(0);
    setHits(0);
    setPhase("play");
    setRound((value) => value + 1);
  };

  const levelLabel = `${t("game.maze.level")} ${levelIndex + 1} ${t("game.maze.of")} ${MAZE_LEVELS}`;

  return (
    <div className="flex flex-col gap-[16px]">
      {phase === "done" ? (
        <div className="flex flex-col items-center gap-[16px] text-center">
          {scare === null ? null : (
            // Обычный img: оптимизатор Next в статическом экспорте недоступен.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scare}
              alt=""
              className="rounded-card xl:rounded-card-d bg-photo max-h-[60dvh] w-full object-contain"
            />
          )}
          <p className="font-ui text-sub xl:text-sub-d text-ink font-medium">
            {t("game.maze.done")}
          </p>
          <Button labelKey="game.maze.again" tone="dark" onClick={restart} />
          {reward}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-[12px]">
            <p className="bg-paper font-ui caps text-badge text-ink rounded-full px-[14px] py-[8px] tabular-nums">
              {levelLabel}
            </p>
            {/* Касания не наказываются — сообщение только для скринридера. */}
            <p aria-live="polite" className="sr-only">
              {hits > 0 ? `${t("game.maze.hit")} ${hits}` : ""}
            </p>
          </div>

          <div className="relative perspective-[1100px]">
            <div
              ref={wrapRef}
              tabIndex={0}
              role="application"
              aria-label={`${t("game.maze.label")}. ${levelLabel}. ${t("game.maze.keys")}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              onKeyDown={onKeyDown}
              className="rounded-card xl:rounded-card-d shadow-card focus-visible:ring-gold-deep origin-bottom touch-none overflow-hidden select-none focus-visible:ring-2 focus-visible:outline-none motion-safe:rotate-x-[14deg]"
            >
              <canvas key={round} ref={canvasRef} className="block w-full" />
            </div>

            {banner === null ? null : (
              <p
                key={banner}
                aria-live="polite"
                className="maze-banner bg-ink text-canvas font-ui caps text-badge pointer-events-none absolute start-1/2 top-1/2 rounded-full px-[18px] py-[10px] whitespace-nowrap"
              >
                {levelLabel}
              </p>
            )}
          </div>

          <p className="font-ui text-note xl:text-note-d text-body">{t("game.maze.how")}</p>
        </>
      )}

      {phase === "scare" ? <MazeScare image={scare} onClose={() => setPhase("done")} /> : null}
    </div>
  );
}

/**
 * Скример: своё окно поверх всего (top layer, как попап игры), чёрный
 * фон, поздравление наезжает и трясётся. Esc, крестик или нажатие
 * мимо картинки закрывают — дальше экран «Лабиринт пройден».
 */
function MazeScare({ image, onClose }: { image: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    const controller = new AbortController();
    dialog.addEventListener("close", () => onCloseRef.current(), { signal: controller.signal });
    if (!dialog.open) dialog.showModal();
    return () => {
      controller.abort();
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={t("game.maze.scare")}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="bg-ink backdrop:bg-ink m-0 h-dvh max-h-none w-dvw max-w-none p-0"
    >
      <div className="relative flex h-full w-full items-center justify-center p-[16px]">
        {image === null ? null : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={t("game.maze.scare")}
            className="maze-scare rounded-card xl:rounded-card-d h-[88dvh] max-h-full w-auto max-w-full object-contain"
          />
        )}
        <button
          type="button"
          aria-label={t("game.close")}
          title={t("game.close")}
          onClick={() => ref.current?.close()}
          className="bg-paper text-ink hover:bg-surface active:bg-line size-tap absolute end-[16px] top-[16px] flex items-center justify-center rounded-full transition-colors"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
    </dialog>
  );
}
