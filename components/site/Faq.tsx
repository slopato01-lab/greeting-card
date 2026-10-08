"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/Button";
import { GhostButton } from "@/components/GhostButton";
import { CounterLine, SliderArrows } from "@/components/site/slider";
import { counterNumber, counterVisual } from "@/components/site/counter";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Какие поздравления/открытки можно сделать».
 *
 * Раскладка — блок «панель со счётчиком + большая картинка» из макета
 * главной (design/главная.jpg). Слева белая панель: счётчик поводов
 * 01–04, название выбранного повода, заголовок секции и стрелки.
 * Справа на месте картинки — розовая панель с карточкой ответа.
 *
 * Номер в счётчике переключает карточку — это вкладки, поэтому
 * role="tablist" и блуждающий tabindex, а не набор переключателей:
 * выбран всегда ровно один повод. Имя вкладки — номер плюс название
 * повода, скрытое визуально: одна цифра скринридеру ничего не скажет.
 * Видимое название выбранного повода стоит под счётчиком.
 *
 * В макете нарисована одна карточка, «Друг за границей». Она встала
 * на повод 2, которому отвечает по смыслу; три остальные написаны,
 * см. docs/PRODUCT.md. Подсвечена в макете при этом первая пилюля —
 * расхождение разрешено в пользу подсветки, по умолчанию открыт повод 1.
 *
 * Стрелки листают поводы по одному, фокус при этом остаётся на стрелке.
 */
type Occasion = {
  pill: TextKey;
  title: TextKey;
  lead: TextKey;
  items: readonly [TextKey, TextKey, TextKey, TextKey];
};

const OCCASIONS = [
  {
    pill: "faq.pill.1",
    title: "faq.card.1.title",
    lead: "faq.card.1.lead",
    items: ["faq.card.1.item.1", "faq.card.1.item.2", "faq.card.1.item.3", "faq.card.1.item.4"],
  },
  {
    pill: "faq.pill.2",
    title: "faq.card.2.title",
    lead: "faq.card.2.lead",
    items: ["faq.card.2.item.1", "faq.card.2.item.2", "faq.card.2.item.3", "faq.card.2.item.4"],
  },
  {
    pill: "faq.pill.3",
    title: "faq.card.3.title",
    lead: "faq.card.3.lead",
    items: ["faq.card.3.item.1", "faq.card.3.item.2", "faq.card.3.item.3", "faq.card.3.item.4"],
  },
  {
    pill: "faq.pill.4",
    title: "faq.card.4.title",
    lead: "faq.card.4.lead",
    items: ["faq.card.4.item.1", "faq.card.4.item.2", "faq.card.4.item.3", "faq.card.4.item.4"],
  },
] as const satisfies ReadonlyArray<Occasion>;

const LAST = OCCASIONS.length - 1;

export function Faq() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;
  const current = OCCASIONS[active] ?? OCCASIONS[0];

  // Выбор с клавиатуры сразу уводит фокус на новую вкладку.
  const select = (index: number) => {
    setActive(index);
    tabs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next =
      event.key === "ArrowRight"
        ? active === LAST
          ? 0
          : active + 1
        : event.key === "ArrowLeft"
          ? active === 0
            ? LAST
            : active - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? LAST
              : null;

    if (next === null) return;

    // Иначе стрелки прокручивают саму ленту, а Home и End — страницу.
    event.preventDefault();
    select(next);
  };

  return (
    <section className="pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
      <div className="page-shell grid gap-[15px] xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-5">
        <div className="rounded-card xl:rounded-card-d border-ink flex flex-col border bg-white px-[20px] pt-[20px] pb-[25px] xl:px-[50px] xl:pt-[45px] xl:pb-[50px]">
          <div
            role="tablist"
            aria-labelledby="faq-title"
            onKeyDown={onKeyDown}
            className="flex items-center"
          >
            {OCCASIONS.map((occasion, index) => (
              <div
                key={occasion.pill}
                className={`flex items-center ${index === active ? "flex-1" : ""}`}
              >
                <button
                  ref={(element) => {
                    tabs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(index)}
                  aria-selected={index === active}
                  aria-controls={panelId}
                  // Блуждающий tabindex: ряд вкладок — один таб-стоп,
                  // внутри ходят стрелками.
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => select(index)}
                  className={counterVisual(index === active)}
                >
                  {counterNumber(index)}
                  <span className="sr-only"> {t(occasion.pill)}</span>
                </button>
                {index === active ? <CounterLine /> : null}
              </div>
            ))}
          </div>

          <p
            aria-hidden="true"
            className="font-ui text-note xl:text-note-d text-body mt-[40px] xl:mt-auto xl:pt-[80px]"
          >
            {t(current.pill)}
          </p>
          <h2
            id="faq-title"
            className="font-display text-h2 xl:text-h2-d mt-[8px] font-medium xl:mt-[12px]"
          >
            {t("faq.title")}
          </h2>

          <SliderArrows
            onPrev={() => setActive(active - 1)}
            onNext={() => setActive(active + 1)}
            canPrev={active > 0}
            canNext={active < LAST}
            className="mt-[25px] xl:mt-[40px]"
          />
        </div>

        {/* Карточка ответа: высота из старого макета (510 / 580) стала
            минимальной — список пунктов на русском переносится, и у
            четырёх поводов пункты разной длины. */}
        <div className="bg-pink-tint/10 rounded-card xl:rounded-card-d flex p-[10px] xl:p-[40px]">
          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId(active)}
            className="rounded-faq border-ink shadow-faq flex-1 border bg-white px-[15px] pt-[30px] pb-[30px] xl:min-h-[580px] xl:px-[50px] xl:pt-[50px] xl:pb-[50px]"
          >
            <h3 className="font-display text-h3 xl:text-h3-d font-medium">{t(current.title)}</h3>

            <p className="font-display text-card xl:text-card-d mt-[30px] font-medium xl:mt-[40px]">
              {t(current.lead)}
            </p>

            <ul role="list" className="mt-[30px] flex flex-col gap-[25px] xl:gap-[30px]">
              {current.items.map((key) => (
                <li key={key} className="flex items-start gap-[18px] xl:items-center xl:gap-5">
                  {/* Точка списка — кружок фоном: своего рисунка у неё нет. */}
                  <span
                    aria-hidden="true"
                    className="bg-ink mt-[6px] size-[6px] shrink-0 rounded-full xl:mt-0 xl:size-[10px]"
                  />
                  <span className="font-display text-note xl:text-card-d leading-[1.15]">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Две кнопки встают в ряд, только когда помещаются: на 1280
                правая колонка уже двух десктопных кнопок. */}
            <div className="mt-[40px] flex flex-col gap-[5px] xl:mt-[50px] 2xl:flex-row 2xl:gap-5">
              <Button href="/create" labelKey="cta.create" className="xl:w-full 2xl:flex-1" />
              {/* Каталог живёт на /cards. */}
              <GhostButton href="/cards" labelKey="cta.templates" className="2xl:flex-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
