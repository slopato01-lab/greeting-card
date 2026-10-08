"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { scrollBehavior } from "@/components/site/pill";
import { t } from "@/lib/i18n";

/**
 * Ленты карточек со счётчиком «1/8 ——— ← →» и стрелки из макета
 * главной (design/главная greetinh-cards.jpg). Живут в каталоге,
 * преимуществах и карточке «что внутри». Оформление общее, чтобы
 * состояния не разъехались.
 *
 * Состояний в макете нет, они выведены от токенов, разбор —
 * docs/DESIGN.md, раздел «Раскладка главной».
 */

/**
 * Стрелки «назад» и «дальше».
 *
 * Крайнее положение помечается aria-disabled, а не disabled:
 * выключенная кнопка теряет фокус, и после нажатия на последнюю
 * «дальше» фокус уехал бы на body.
 */
export function SliderArrows({
  onPrev,
  onNext,
  canPrev,
  canNext,
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  className?: string;
}) {
  // Обе стрелки — круги с тонкой обводкой, как в макете; «дальше»
  // обведена светлым, это следующий шаг. Крайнее положение: обводка
  // --line, иконка --line. Наведение в нём ничего не меняет.
  const base =
    "size-tap text-ink flex items-center justify-center rounded-full border transition-colors " +
    "hover:bg-raised active:bg-line aria-disabled:cursor-not-allowed aria-disabled:border-line " +
    "aria-disabled:text-line aria-disabled:hover:bg-transparent";

  return (
    <div className={`flex items-center gap-[10px] ${className}`}>
      <button
        type="button"
        aria-label={t("cta.back")}
        aria-disabled={!canPrev}
        onClick={() => {
          if (canPrev) onPrev();
        }}
        className={`${base} border-line`}
      >
        <Icon name="prev" size={20} />
      </button>
      <button
        type="button"
        aria-label={t("cta.next")}
        aria-disabled={!canNext}
        onClick={() => {
          if (canNext) onNext();
        }}
        className={`${base} border-ink`}
      >
        <Icon name="next" size={20} />
      </button>
    </div>
  );
}

/**
 * Лента карточек со счётчиком и стрелками.
 *
 * Активная карточка — та, что стоит у левого края ленты. Лента
 * прокручивается и пальцем, и стрелками, и номером в счётчике;
 * счётчик следит за прокруткой.
 *
 * Стрелки ходят по номерам, а не по краю ленты: на десктопе две
 * последние карточки упираются в один предел прокрутки, и стрелка,
 * выключенная по краю, не пускала бы на последний номер.
 *
 * Ближе к концу ленты несколько карточек упираются в один и тот же
 * предел прокрутки. Тогда активной считается та, которую выбрали
 * стрелкой или номером, а если листали пальцем — последняя.
 */
export function useSlider(count: number) {
  const trackRef = useRef<HTMLUListElement>(null);
  const requested = useRef<number | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const controller = new AbortController();
    const { signal } = controller;

    // Считаем прямо в обработчике: работы на четыре карточки, а без
    // requestAnimationFrame снимать на отписке нечего.
    const measure = () => {
      const max = track.scrollWidth - track.clientWidth;
      const left = track.scrollLeft;
      const atEnd = left >= max - 1;

      const pending = requested.current;
      const next = pending !== null ? pending : atEnd && max > 1 ? count - 1 : nearest(track, left);

      setActive(next);
    };

    // Выбор стрелкой или номером держится, пока ленту не тронули рукой:
    // плавная прокрутка идёт через десяток событий scroll, и по
    // промежуточным счётчик прыгал бы.
    const release = () => {
      requested.current = null;
    };

    track.addEventListener("scroll", measure, { passive: true, signal });
    for (const type of ["pointerdown", "wheel", "touchstart", "keydown"] as const) {
      track.addEventListener(type, release, { passive: true, signal });
    }
    window.addEventListener("resize", measure, { signal });
    measure();

    return () => controller.abort();
  }, [count]);

  const go = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(count - 1, index));
    requested.current = clamped;
    // Номер обновляется сразу: если лента уже упёрлась в край,
    // события scroll не будет вовсе.
    setActive(clamped);
    track.scrollTo({ left: targetOf(track, clamped), behavior: scrollBehavior() });
  };

  return { trackRef, go, active };
}

/** Куда прокрутить ленту, чтобы карточка встала у левого края. */
function targetOf(track: HTMLElement, index: number): number {
  const item = track.children.item(index);
  if (!(item instanceof HTMLElement)) return 0;
  const pad = Number.parseFloat(getComputedStyle(track).scrollPaddingInlineStart) || 0;
  const max = track.scrollWidth - track.clientWidth;
  return Math.max(0, Math.min(max, item.offsetLeft - pad));
}

function nearest(track: HTMLElement, left: number): number {
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < track.children.length; index += 1) {
    const current = Math.abs(targetOf(track, index) - left);
    if (current < distance) {
      best = index;
      distance = current;
    }
  }
  return best;
}

/**
 * Счётчик под лентой: «1/8», линия, стрелки. Номер — позиция, а не
 * текст интерфейса; скринридеру он не нужен, у него есть список
 * и подписи стрелок.
 */
export function Pager({
  active,
  count,
  onPrev,
  onNext,
  className = "",
}: {
  active: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-[16px] ${className}`}>
      <p aria-hidden="true" className="font-ui text-note xl:text-note-d shrink-0">
        <span className="text-ink">{active + 1}</span>
        <span className="text-muted">/{count}</span>
      </p>
      <span aria-hidden="true" className="bg-line h-px flex-1" />
      <SliderArrows
        onPrev={onPrev}
        onNext={onNext}
        canPrev={active > 0}
        canNext={active < count - 1}
      />
    </div>
  );
}

/**
 * Лента карточек со счётчиком под ней. Карточки — элементы `<li>`.
 *
 * Лента вырывается к краям экрана на мобильном (класс .carousel),
 * на десктопе — к правому краю полосы, первая карточка стоит по сетке.
 */
export function Ribbon({
  labelledBy,
  count,
  trackClassName,
  children,
}: {
  labelledBy: string;
  count: number;
  trackClassName: string;
  children: ReactNode;
}) {
  const { trackRef, go, active } = useSlider(count);

  return (
    <div>
      <ul
        ref={trackRef}
        role="list"
        tabIndex={0}
        aria-labelledby={labelledBy}
        className={`carousel relative ${trackClassName}`}
      >
        {children}
      </ul>

      <Pager
        active={active}
        count={count}
        onPrev={() => go(active - 1)}
        onNext={() => go(active + 1)}
        className="mt-[20px] xl:mt-[30px]"
      />
    </div>
  );
}
