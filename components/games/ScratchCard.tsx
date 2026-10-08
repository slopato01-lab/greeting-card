"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import type { GameProps } from "@/lib/games/contract";
import { seededRandom } from "@/lib/games/seed";

/**
 * Скретч-карта — третья игра MVP (docs/PRODUCT.md): покрытие стирается
 * пальцем, под ним сюрприз. Первая игра, написанная по контракту
 * из lib/games/contract.ts.
 *
 * Как устроено:
 * - покрытие — холст фиксированного логического размера, растянутый
 *   стилями на всю карточку. Поэтому поворот экрана и смена ширины
 *   не сбрасывают стёртое (docs/TESTING.md): пиксели холста те же,
 *   меняется только масштаб;
 * - покрытие — золото с блёстками, поверх него картинка темы, если
 *   она есть. Блёстки раскладываются от зерна открытки, а не
 *   Math.random: при каждом открытии узор одинаковый;
 * - стёрто больше половины — покрытие гаснет целиком и игра пройдена.
 *   Проиграть нельзя, таймера нет;
 * - для клавиатуры и скринридера — кнопка «Открыть сразу». Пока
 *   покрытие на месте, сюрприз скрыт и от скринридера (`inert`):
 *   иначе он прочитал бы промокод до игры;
 * - на холсте `touch-action: none`, иначе вместо стирания страница
 *   прокручивается. Слушатели снимаются одним AbortSignal.
 *
 * Цвета берутся из токенов через getComputedStyle: холст не понимает
 * CSS-переменных, а явных цветов в коде быть не должно.
 */

/** Логический размер холста. Пропорции те же, что у карточки, 16 : 10. */
const WIDTH = 640;
const HEIGHT = 400;

/** Толщина «пальца» в пикселях холста. */
const BRUSH = 56;

/** Какая доля покрытия должна быть стёрта, чтобы открыть всё. */
const DONE_SHARE = 0.5;

/** Как часто считать стёртое: раз в столько движений пальца. */
const CHECK_EVERY = 6;

/** Шаг выборки пикселей при подсчёте: каждый восьмой по обеим осям. */
const SAMPLE_STEP = 8;

const SPARKLES = 48;

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Четырёхлучевая блёстка с центром в (x, y). */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size);
  ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size);
  ctx.fill();
}

function paintCoating(ctx: CanvasRenderingContext2D, seed: string, image: HTMLImageElement | null) {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = token("--color-gold");
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (image !== null) {
    // object-fit: cover — картинка заполняет холст без искажений.
    const scale = Math.max(WIDTH / image.naturalWidth, HEIGHT / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
  }

  const random = seededRandom(`${seed}:scratch`);
  ctx.fillStyle = token(image === null ? "--color-canvas" : "--color-gold");
  for (let index = 0; index < SPARKLES; index += 1) {
    sparkle(ctx, random() * WIDTH, random() * HEIGHT, 3 + random() * 7);
  }
}

/** Доля стёртого: сколько выбранных пикселей стали прозрачными. */
function clearedShare(ctx: CanvasRenderingContext2D): number {
  const { data } = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  let total = 0;
  let clear = 0;
  for (let y = 0; y < HEIGHT; y += SAMPLE_STEP) {
    for (let x = 0; x < WIDTH; x += SAMPLE_STEP) {
      total += 1;
      if ((data[(y * WIDTH + x) * 4 + 3] ?? 255) === 0) clear += 1;
    }
  }
  return total === 0 ? 0 : clear / total;
}

export function ScratchCard({ seed, reward, cover, onDone }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const doneRef = useRef(false);

  // onDone — вызывается ровно один раз, как обещает контракт.
  const finish = () => {
    setRevealed(true);
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // Свежая ссылка на finish для слушателей холста: эффект ниже
  // не пересоздаётся на каждый рендер, а стёртое хранится в холсте.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true }) ?? null;
    if (canvas === null || ctx === null) {
      // Холста нет — играть не во что. Сюрприз не должен потеряться.
      finishRef.current();
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    let touched = false;
    paintCoating(ctx, seed, null);

    // Картинка темы ложится поверх золота, когда догрузится. Если
    // человек уже начал стирать — не перекрашиваем: стёртое пропало бы.
    let image: HTMLImageElement | null = null;
    if (cover !== null) {
      image = new Image();
      image.addEventListener(
        "load",
        () => {
          if (!touched && image !== null) paintCoating(ctx, seed, image);
        },
        { signal },
      );
      image.src = cover;
    }

    let drawing = false;
    let last: { x: number; y: number } | null = null;
    let moves = 0;

    const point = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - box.left) / box.width) * WIDTH,
        y: ((event.clientY - box.top) / box.height) * HEIGHT,
      };
    };

    const erase = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = BRUSH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    const check = () => {
      if (clearedShare(ctx) >= DONE_SHARE) finishRef.current();
    };

    canvas.addEventListener(
      "pointerdown",
      (event) => {
        touched = true;
        drawing = true;
        // Захват держит стирание, даже если палец съехал за край.
        // Бросает, если указатель уже не активен, — стирать это не мешает.
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // ничего: без захвата просто не дотянемся за край холста
        }
        const at = point(event);
        erase(at, at);
        last = at;
      },
      { signal },
    );

    canvas.addEventListener(
      "pointermove",
      (event) => {
        if (!drawing || last === null) return;
        const at = point(event);
        erase(last, at);
        last = at;
        moves += 1;
        if (moves % CHECK_EVERY === 0) check();
      },
      { signal },
    );

    const stop = () => {
      if (!drawing) return;
      drawing = false;
      last = null;
      check();
    };
    canvas.addEventListener("pointerup", stop, { signal });
    canvas.addEventListener("pointercancel", stop, { signal });

    return () => {
      controller.abort();
      if (image !== null) image.src = "";
    };
  }, [seed, cover]);

  return (
    <div>
      <div className="rounded-card xl:rounded-card-d bg-surface relative aspect-[16/10] w-full overflow-hidden">
        <div
          inert={!revealed}
          aria-hidden={!revealed}
          className="absolute inset-0 flex items-center justify-center p-[20px] text-center"
        >
          {reward}
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-hidden="true"
          className={`absolute inset-0 size-full cursor-crosshair touch-none transition-opacity duration-500 ${revealed ? "pointer-events-none opacity-0" : ""}`}
        />
      </div>

      {revealed ? null : (
        <Button
          labelKey="game.scratch.reveal"
          tone="light"
          onClick={finish}
          className="mt-[16px] xl:mt-[20px]"
        />
      )}
    </div>
  );
}
