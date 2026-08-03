"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/Button";
import { GhostButton } from "@/components/GhostButton";
import { Icon } from "@/components/Icon";
import { pillVisual, scrollBehavior } from "@/components/site/pill";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Какие поздравления/открытки можно сделать».
 *
 * Ряд пилюль-поводов и белая карточка с ответом. Пилюля переключает
 * карточку под собой — это вкладки, поэтому role="tablist" и блуждающий
 * tabindex, а не набор переключателей: выбран всегда ровно один повод.
 *
 * В макете нарисована одна карточка, «Друг за границей». Она встала
 * на повод 2, которому отвечает по смыслу; три остальные написаны,
 * см. docs/PRODUCT.md. Подсвечена в макете при этом первая пилюля —
 * расхождение разрешено в пользу подсветки, по умолчанию открыт повод 1.
 *
 * На мобильном ряд пилюль шире экрана и прокручивается пальцем.
 * Пилюля в макете 33px — этого мало для пальца, до 44px её добирает
 * невидимое поле кнопки, класс .pill-tap в globals.css.
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

  // Выбор с клавиатуры сразу уводит фокус на новую вкладку и подтягивает
  // её в видимую часть ленты: на мобильном четвёртый повод стоит за
  // краем экрана, и без прокрутки фокус уезжает в никуда.
  const select = (index: number) => {
    setActive(index);

    const tab = tabs.current[index];
    tab?.focus();
    tab?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: scrollBehavior() });
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
    <section className="pt-[61px] pb-[60px] xl:pt-[140px] xl:pb-[130px]">
      <div className="page-shell">
        <h2 id="faq-title" className="font-display text-h2 xl:text-h2-d font-medium">
          {t("faq.title")}
        </h2>

        <div
          role="tablist"
          aria-labelledby="faq-title"
          onKeyDown={onKeyDown}
          className="carousel mt-[81px] gap-[10px] xl:mt-[70px] xl:gap-[15px]"
        >
          {OCCASIONS.map((occasion, index) => (
            <button
              key={occasion.pill}
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
              className="pill-tap"
            >
              <span className={pillVisual("faq", index === active)}>{t(occasion.pill)}</span>
            </button>
          ))}
        </div>

        {/* Карточка в макете 510px высотой на мобильном и 580 на десктопе.
            Обе стали минимальными: список пунктов на русском переносится,
            и у четырёх поводов пункты разной длины. */}
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={tabId(active)}
          className="rounded-faq border-ink shadow-faq relative mt-[64px] min-h-[510px] overflow-hidden border bg-white px-[15px] pt-[35px] pb-[40px] xl:mt-[50px] xl:min-h-[580px] xl:px-[70px] xl:pt-[55px] xl:pb-[57px]"
        >
          {/* Декор из макета: маршрут с прозрачностью 0.05, только
              на десктопе — на мобильном его в макете нет. */}
          <Icon
            name="path"
            size={365}
            className="pointer-events-none absolute top-1/2 right-[145px] hidden -translate-y-1/2 opacity-[0.05] xl:block"
          />

          <div className="relative xl:max-w-[817px]">
            <h3 className="font-display text-h3 xl:text-h3-d font-medium">{t(current.title)}</h3>

            <p className="font-display text-card xl:text-card-d mt-[52px] font-medium xl:mt-[45px]">
              {t(current.lead)}
            </p>

            <ul role="list" className="mt-[35px] flex flex-col gap-[35px]">
              {current.items.map((key) => (
                <li key={key} className="flex items-start gap-[18px] xl:items-center xl:gap-5">
                  {/* Точка списка в макете — отдельная картинка 6/10px.
                      В коде это кружок фоном: своего рисунка у неё нет,
                      а лишний файл в сборке ни к чему. */}
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

            <div className="mt-[46px] flex flex-col gap-[5px] xl:mt-[70px] xl:flex-row xl:gap-5">
              <Button href="/create" labelKey="cta.create" className="xl:w-[360px]" />
              {/* Каталог живёт на /cards. Раньше здесь стоял /templates —
                  маршрута с таким именем не появилось, а «Открытки»
                  в шапке ведут именно на /cards. */}
              <GhostButton href="/cards" labelKey="cta.templates" className="xl:w-[360px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
