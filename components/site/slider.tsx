"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { counterNumber, counterVisual } from "@/components/site/counter";
import { scrollBehavior } from "@/components/site/pill";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Счётчик «01 ——— 02 03 04» и пара стрелок из макета главной
 * (design/главная.jpg). Живут в трёх секциях: две ленты карточек
 * («Что спрятать внутри», «Больше, чем просто открытка») и вкладки
 * поводов в FAQ. Оформление общее, чтобы состояния не разъехались.
 *
 * Состояний в макете нет, они выведены от токенов, разбор —
 * docs/DESIGN.md, раздел «Раскладка главной».
 */

/** Линия после активного номера — она и показывает, где ты. */
export function CounterLine() {
  return <span aria-hidden="true" className="bg-ink mx-[10px] h-px min-w-[30px] flex-1" />;
}

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
  const base =
    "size-tap flex items-center justify-center rounded-full border transition-colors " +
    "aria-disabled:border-muted aria-disabled:text-muted aria-disabled:cursor-not-allowed " +
    "aria-disabled:bg-white aria-disabled:hover:border-muted aria-disabled:hover:bg-white";

  return (
    <div className={`flex items-center gap-[10px] ${className}`}>
      <button
        type="button"
        aria-label={t("cta.back")}
        aria-disabled={!canPrev}
        onClick={() => {
          if (canPrev) onPrev();
        }}
        className={`${base} border-ink text-ink hover:bg-pink-card active:bg-pink-card bg-white`}
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
        className={`${base} border-ink bg-ink hover:bg-pink hover:border-pink text-white active:bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))]`}
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
function useSlider(count: number) {
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
 * Секция «текст слева, лента справа» — второй блок макета главной.
 *
 * Мобильный: счётчик, заголовок, подводка, лента, стрелки — колонкой.
 * С 1280px текст уходит в левую колонку и прижимается заголовком
 * к низу, лента со стрелками — в правую.
 *
 * Лента на десктопе остаётся лентой, как в макете: две карточки
 * видны, остальные за краем. Влево она не вырывается — там текст,
 * вправо выходит до края полосы страницы.
 */
export function SplitSlider({
  titleId,
  title,
  lead,
  labels,
  action,
  trackClassName,
  children,
}: {
  titleId: string;
  title: TextKey;
  lead?: TextKey;
  /** Подписи карточек по порядку: ими счётчик называет номера. */
  labels: ReadonlyArray<TextKey>;
  action?: ReactNode;
  trackClassName: string;
  /** Карточки — элементы `<li>`. */
  children: ReactNode;
}) {
  const { trackRef, go, active } = useSlider(labels.length);

  return (
    <div className="page-shell xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-10">
      <div className="flex flex-col">
        <ol role="list" className="flex items-center">
          {labels.map((label, index) => (
            <li key={label} className={`flex items-center ${index === active ? "flex-1" : ""}`}>
              <button
                type="button"
                aria-current={index === active ? "true" : undefined}
                onClick={() => go(index)}
                className={counterVisual(index === active)}
              >
                {counterNumber(index)}
                <span className="sr-only"> {t(label)}</span>
              </button>
              {index === active ? <CounterLine /> : null}
            </li>
          ))}
        </ol>

        {lead ? (
          <p className="font-display text-card xl:text-card-d text-body mt-[25px] leading-[1.15] xl:max-w-[520px]">
            {t(lead)}
          </p>
        ) : null}

        <h2
          id={titleId}
          className="font-display text-h2 xl:text-h2-d mt-[30px] font-medium xl:mt-auto xl:pt-[60px]"
        >
          {t(title)}
        </h2>

        {action}
      </div>

      <div className="mt-[40px] min-w-0 xl:mt-0">
        <ul
          ref={trackRef}
          role="list"
          tabIndex={0}
          aria-labelledby={titleId}
          className={`carousel relative xl:ms-0 xl:[scroll-padding-inline-start:0] xl:ps-0 ${trackClassName}`}
        >
          {children}
        </ul>

        <SliderArrows
          onPrev={() => go(active - 1)}
          onNext={() => go(active + 1)}
          canPrev={active > 0}
          canNext={active < labels.length - 1}
          className="mt-[20px] justify-end xl:mt-[25px]"
        />
      </div>
    </div>
  );
}
