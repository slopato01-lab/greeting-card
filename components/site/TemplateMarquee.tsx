import { AnimatedTemplateCard } from "@/components/site/AnimatedTemplateCard";
import { ANIMATED_TEMPLATES, type AnimatedTemplate } from "@/lib/catalog/templates";

/**
 * Два ряда анимированных шаблонов, бесконечно едущих сами — в шахматном
 * порядке (просьба пользователя 08.10.2026; третий ряд снят тем же
 * днём — карточек было слишком много, оба ряда должны вставать в один
 * экран десктопа): соседние ряды едут
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

/**
 * Порядок карточек в каждом ряду — сдвиг по кругу, разный у рядов.
 * С серией по design/открытки/ (08.10.2026) шаблонов 21, сдвиг на
 * половину: соседние ряды показывают разные темы.
 */
const ROW_SHIFTS = [0, 10] as const;
/** Сколько раз повторить порядок в половине ряда: 21 карточка по 360px и так шире 1920px. */
const REPEAT = 1;

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
          index === 1 ? "ms-[-170px] xl:ms-[calc(var(--mq-card)/-2)]" : ""
        }`}
      >
        {[...half, ...half].map((template, i) => (
          <AnimatedTemplateCard
            key={`${template.id}-${i}`}
            template={template}
            inert={i >= half.length}
            className="w-[340px] shrink-0 xl:w-(--mq-card)"
          />
        ))}
      </ul>
    </div>
  );
}

export function TemplateMarquee({ className = "" }: { className?: string }) {
  return (
    // С 1280 ширина карточки считается от высоты окна: оба ряда вместе
    // с заголовком секции встают в один экран (просьба пользователя
    // 08.10.2026). 37.5dvh − 150px − 3.5vw — ряд = (окно − шапка − заголовок −
    // поля) / 2, минус полоса подписи, открытка 3:4; заголовок растёт
    // вместе с шириной окна — отсюда −3.5vw.
    <div
      className={`flex flex-col gap-[12px] xl:gap-[16px] xl:[--mq-card:clamp(110px,calc(37.5dvh-150px-3.5vw),360px)] ${className}`}
    >
      {ROW_SHIFTS.map((shift, index) => (
        <Row key={shift} index={index} items={rotate(ANIMATED_TEMPLATES, shift)} />
      ))}
    </div>
  );
}
