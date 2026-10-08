"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { LoopVideo } from "@/components/site/LoopVideo";
import { ANIMATED_TEMPLATES } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Дуга открыток в герое — по design/главный экран.jpg: ряд карточек
 * выгнут, как внутренняя сторона цилиндра. Чем дальше карточка от
 * центра экрана, тем она крупнее и сильнее развёрнута к зрителю.
 *
 * Как устроено:
 * - ряд — обычная горизонтальная прокрутка: листается пальцем,
 *   колесом и трекпадом, карточки достижимы с клавиатуры;
 * - сам ряд едет медленно вперёд (rAF двигает scrollLeft) и стоит,
 *   пока на нём палец, курсор или фокус;
 * - бесконечность — два одинаковых полуряда: доехали до конца первого —
 *   прокрутка тихо перескакивает на ту же точку во втором. Копия
 *   `inert`, её не видят ни Tab, ни скринридер;
 * - наклон и масштаб каждой карточки пересчитываются в том же кадре
 *   от её положения относительно центра ряда.
 *
 * При prefers-reduced-motion ряд стоит и плоский: без автопрокрутки
 * и без изгиба, листается пальцем. Видео там же не играют (LoopVideo).
 *
 * Всё, что подписалось, снимается одним AbortController.
 */

/** Сколько раз повторить шаблоны в полуряду: 12 карточек шире 1920px. */
const REPEAT = 2;
/** Скорость автопрокрутки, px в секунду. */
const SPEED = 28;
/** Поворот крайней карточки, градусы. */
const MAX_TURN = 28;
/** Насколько крайняя карточка крупнее центральной. */
const MAX_GROW = 0.3;
/** После касания или прокрутки рукой ряд стоит столько, мс. */
const RESUME_AFTER = 2500;

export function HeroArc() {
  const rowRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (row === null) return;
    const controller = new AbortController();
    const { signal } = controller;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(row.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );

    let frame = 0;
    let last = 0;
    // Позиция дробная, а scrollLeft браузер округляет: копим отдельно.
    let position = 0;
    let held = false;
    let resumeAt = 0;

    // Период ряда — расстояние от карточки до её копии. Не половина
    // scrollWidth: туда входят поля ряда, и шов дёргался бы.
    const halfWidth = () => {
      const first = cards[0];
      const copy = cards[cards.length / 2];
      return first === undefined || copy === undefined ? 0 : copy.offsetLeft - first.offsetLeft;
    };

    // Положение берём из offsetLeft, а не getBoundingClientRect:
    // тот учитывает уже наложенный поворот, и дуга раскачивалась бы
    // от собственного прошлого кадра. Ряд — position: relative,
    // поэтому offsetLeft отсчитывается от его начала.
    const bend = () => {
      const reach = row.clientWidth / 2;
      const scroll = row.scrollLeft;
      for (const card of cards) {
        if (reduce.matches) {
          card.style.transform = "";
          continue;
        }
        // От −1 (левый край ряда) до 1 (правый), дальше — за краем.
        const raw = (card.offsetLeft + card.offsetWidth / 2 - scroll - reach) / reach;
        const d = Math.max(-1.4, Math.min(1.4, raw));
        const grow = 1 + MAX_GROW * d * d;
        card.style.transform = `perspective(900px) rotateY(${(-d * MAX_TURN).toFixed(2)}deg) scale(${grow.toFixed(3)})`;
      }
    };

    const wrap = () => {
      const half = halfWidth();
      if (half <= 0) return;
      if (position >= half) position -= half;
      if (position < 0) position += half;
      row.scrollLeft = position;
    };

    const tick = (now: number) => {
      const dt = last === 0 ? 0 : Math.min(now - last, 64);
      last = now;
      if (!held && !reduce.matches && now >= resumeAt) {
        position += (SPEED * dt) / 1000;
        wrap();
      }
      bend();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    // Начинаем с середины первого полуряда: слева тоже есть карточки.
    position = halfWidth() / 2;
    wrap();
    start();

    // Прокрутили рукой — подхватываем позицию и ненадолго замираем.
    row.addEventListener(
      "scroll",
      () => {
        if (Math.abs(row.scrollLeft - position) > 2) {
          position = row.scrollLeft;
          resumeAt = performance.now() + RESUME_AFTER;
          wrap();
        }
        if (reduce.matches) bend();
      },
      { signal, passive: true },
    );

    const hold = () => {
      held = true;
    };
    const release = () => {
      held = false;
      resumeAt = performance.now() + RESUME_AFTER;
    };
    row.addEventListener("pointerenter", hold, { signal });
    row.addEventListener("pointerleave", release, { signal });
    row.addEventListener("pointerdown", hold, { signal });
    row.addEventListener("pointerup", release, { signal });
    row.addEventListener("pointercancel", release, { signal });
    row.addEventListener("focusin", hold, { signal });
    row.addEventListener("focusout", release, { signal });
    reduce.addEventListener("change", bend, { signal });
    window.addEventListener("resize", bend, { signal });

    signal.addEventListener("abort", () => cancelAnimationFrame(frame));
    return () => controller.abort();
  }, []);

  const half = Array.from({ length: REPEAT }, () => ANIMATED_TEMPLATES).flat();

  return (
    <ul ref={rowRef} role="list" aria-label={t("hero.cards")} className="hero-arc">
      {[...half, ...half].map((template, i) => (
        <li
          key={`${template.id}-${i}`}
          inert={i >= ANIMATED_TEMPLATES.length || undefined}
          className="hero-arc-card"
        >
          <Link
            href={`/editor?template=${template.id}`}
            aria-label={t(template.nameKey)}
            // Фон шаблона — цвет открытки, а не оформления сайта
            // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
            style={{ backgroundColor: template.background }}
            className="rounded-card xl:rounded-card-d border-line relative block aspect-[3/4] overflow-hidden border transition-transform active:translate-y-px"
          >
            <LoopVideo
              src={template.video}
              poster={template.poster}
              className="absolute inset-0 size-full object-cover"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
