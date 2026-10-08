import { AnimatedTemplateCard } from "@/components/site/AnimatedTemplateCard";
import { ANIMATED_TEMPLATES, type AnimatedTemplate } from "@/lib/catalog/templates";

/**
 * Три ряда анимированных шаблонов, бесконечно едущих сами — в шахматном
 * порядке (просьба пользователя 08.10.2026): соседние ряды едут
 * навстречу и сдвинуты на полкарточки, у каждого ряда свой порядок
 * карточек, чтобы одна и та же не стояла столбиком.
 *
 * Как устроена бесконечность: ряд — это последовательность карточек,
 * повторённая столько раз, чтобы перекрыть самый широкий экран,
 * и ещё раз целиком следом. Лента едет ровно на ширину первой
 * половины (translateX(-50%)) и незаметно начинает сначала.
 * Вторая половина — копия: `inert`, её не видят ни Tab, ни скринридер.
 *
 * Остановка: наведение и фокус внутри ряда ставят его на паузу —
 * по движущейся карточке трудно попасть. При prefers-reduced-motion
 * ряды стоят и листаются пальцем (класс .marquee в globals.css).
 *
 * Видео в карточках играют только на экране (LoopVideo), копии за
 * краем не грузятся вовсе: preload="none".
 */

/** Порядок карточек в каждом ряду — сдвиг по кругу, разный у рядов. */
const ROW_SHIFTS = [0, 2, 1] as const;
/** Сколько раз повторить порядок в половине ряда: 10 карточек по 390px шире 1920px. */
const REPEAT = 2;

function rotate<T>(items: readonly T[], by: number): T[] {
  return items.map((_, i) => items[(i + by) % items.length]).filter((x): x is T => x !== undefined);
}

function Row({ items, index }: { items: AnimatedTemplate[]; index: number }) {
  const half = Array.from({ length: REPEAT }, () => items).flat();
  const reverse = index % 2 === 1;
  return (
    <div className="marquee-row">
      <ul
        role="list"
        className={`marquee ${reverse ? "marquee-reverse" : ""} ${
          // Шахматный порядок: средний ряд сдвинут на полкарточки.
          index === 1 ? "ms-[-145px] xl:ms-[-195px]" : ""
        }`}
      >
        {[...half, ...half].map((template, i) => (
          <AnimatedTemplateCard
            key={`${template.id}-${i}`}
            template={template}
            inert={i >= half.length}
            className="w-[290px] shrink-0 xl:w-[390px]"
          />
        ))}
      </ul>
    </div>
  );
}

export function TemplateMarquee({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-[12px] xl:gap-[20px] ${className}`}>
      {ROW_SHIFTS.map((shift, index) => (
        <Row key={shift} index={index} items={rotate(ANIMATED_TEMPLATES, shift)} />
      ))}
    </div>
  );
}
