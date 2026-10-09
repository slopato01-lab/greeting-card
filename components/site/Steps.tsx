"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { counterNumber } from "@/components/site/counter";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Три этапа»: как собирается открытка.
 *
 * Раскладка — золотая карточка из макета главной
 * (design/главная greetinh-cards.jpg), справа от карточки
 * «что внутри». В макете на ней аватарки в кружках; у нас в тех же
 * тёмных кружках номера этапов.
 *
 * С 09.10.2026 (просьба пользователя) этапы — цепочка: кружки
 * соединены линией 2px от 1 к 3. Когда карточка въезжает в экран,
 * линия прорисовывается сверху вниз, кружки заливаются по очереди.
 * Цепочка вертикальная на всех ширинах: карточка занимает 5/12
 * ряда, и в три колонки заголовки этапов на 1280 не встают.
 *
 * До гидрации и при reduced motion цепочка сразу собрана: атрибут
 * data-chain="idle" ставится только скриптом, и только если движение
 * разрешено.
 *
 * Разметка — нумерованный список. Цифры скрыты от скринридера,
 * они дублируют нумерацию `ol`. Заголовки полос — h2: собственного
 * заголовка у секции нет, а прыгать с h1 героя сразу на h3 значит
 * сломать порядок заголовков на странице.
 */
const STEPS = [
  { title: "steps.title.1", body: "steps.body.1" },
  { title: "steps.title.2", body: "steps.body.2" },
  { title: "steps.title.3", body: "steps.body.3" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey }>;

export function Steps() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        node.dataset.chain = "play";
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    controller.signal.addEventListener("abort", () => observer.disconnect());

    // Атрибут пишется прямо в узел: состояние чисто CSS-ное,
    // перерисовка React ему не нужна. Без атрибута цепочка собрана.
    node.dataset.chain = "idle";
    observer.observe(node);
    return () => controller.abort();
  }, []);

  return (
    <section
      ref={ref}
      className="steps-chain rounded-panel xl:rounded-panel-d bg-gold text-ink p-[24px] xl:p-[40px]"
    >
      {/* role="list" не лишний: preflight Tailwind снимает маркеры через
          list-style: none, а Safari вместе с маркерами теряет и семантику
          списка. Здесь она несёт смысл — цифры скрыты от скринридера,
          и порядок остаётся только в разметке. */}
      <ol role="list" className="flex flex-col">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            style={{ "--i": index } as CSSProperties}
            className="relative flex items-start gap-[16px] pb-[28px] last:pb-0 xl:gap-[20px] xl:pb-[36px]"
          >
            {/* Звено цепочки до следующего кружка: от низа кружка
                до низа полосы. У последнего этапа звена нет. */}
            {index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="steps-link bg-ink absolute start-[21px] top-[44px] bottom-0 w-[2px]"
              />
            )}
            <span
              aria-hidden="true"
              className="steps-dot border-ink font-display text-note xl:text-note-d size-tap relative flex shrink-0 items-center justify-center rounded-full border-2 font-medium"
            >
              {counterNumber(index)}
            </span>
            <div className="min-w-0 pt-[6px]">
              <h2 className="font-display text-h3 xl:text-h3-d font-medium tracking-tight">
                {t(step.title)}
              </h2>
              {/* text-card — размер, text-ink — цвет: тёмный текст на золоте */}
              <p className="font-ui text-card xl:text-card-d mt-[8px] leading-[1.5]">
                {t(step.body)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
