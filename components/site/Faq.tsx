"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import Link from "next/link";

import { Button } from "@/components/Button";
import { GhostButton } from "@/components/GhostButton";
import { Icon } from "@/components/Icon";
import { counterNumber } from "@/components/site/counter";
import { Dots } from "@/components/site/Ornament";
import { pillVisual } from "@/components/site/pill";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Какие поздравления/открытки можно сделать».
 *
 * Раскладка — блок «Uncover Our Most Coveted» из макета
 * design/главная greetinh-cards.jpg: широкий заголовок с одним словом
 * на золотой плашке и кружками за ним. Ниже слева карточка в тонкой
 * рамке — крупный номер повода, его название и подводка; справа ряд
 * пилюль-поводов и горизонтальный аккордеон: раскрытая карточка ответа
 * и свёрнутые в узкие вертикальные полоски остальные поводы (с 1280px).
 *
 * Пилюли переключают карточку — это вкладки, поэтому role="tablist"
 * и блуждающий tabindex: выбран всегда ровно один повод. У каждого
 * повода своя панель; закрытые — inert, скринридер и Tab их не видят.
 * Полоски — тот же выбор мышью; с клавиатуры хватает вкладок.
 *
 * Выделенное слово заголовка берётся из ключа словаря по номеру
 * слова — текст не меняется. Если слова с таким номером нет,
 * заголовок выводится без плашки.
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

/** Номер выделенного слова в faq.title: «открытки». */
const ACCENT_WORD = 3;

function AccentTitle({ text }: { text: string }) {
  const words = text.split(" ");
  const accent = words[ACCENT_WORD];
  if (accent === undefined) return <>{text}</>;

  return (
    <>
      {words.slice(0, ACCENT_WORD).join(" ")}{" "}
      <span className="bg-gold text-ink rounded-inner [box-decoration-break:clone] px-[0.2em]">
        {accent}
      </span>
      <Dots className="ms-[0.15em] align-[-0.1em]" /> {words.slice(ACCENT_WORD + 1).join(" ")}
    </>
  );
}

export function Faq() {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;
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
    <section className="page-shell pt-[60px] pb-[60px] xl:pt-[32px] xl:pb-[32px]">
      <h2
        id="faq-title"
        className="font-display text-h1 xl:text-h1-d max-w-[1300px] font-medium tracking-tight"
      >
        <AccentTitle text={t("faq.title")} />
      </h2>

      <div className="mt-[30px] grid gap-[20px] xl:mt-[24px] xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        {/* Карточка в рамке: номер и подводка выбранного повода. */}
        <div className="border-line rounded-panel xl:rounded-panel-d flex flex-col border p-[24px] xl:p-[32px]">
          <div className="flex items-start justify-between">
            <Icon name="planet" className="text-gold-deep size-[48px] xl:size-[72px]" />
            <Link
              href="/faq"
              aria-label={t("page.faq.title")}
              className="size-tap bg-ink text-canvas hover:bg-gold hover:text-ink flex items-center justify-center rounded-full transition-colors"
            >
              <Icon name="next" size={20} className="-rotate-45" />
            </Link>
          </div>

          <p
            aria-hidden="true"
            className="font-display text-display xl:text-display-d mt-[30px] leading-none font-medium xl:mt-auto xl:pt-[24px]"
          >
            {counterNumber(active)}
          </p>
          <p
            aria-hidden="true"
            className="font-ui caps text-badge xl:text-badge-d text-gold-deep mt-[16px]"
          >
            {t(current.pill)}
          </p>

          <div aria-hidden="true" className="bg-line mt-[20px] h-px xl:mt-[28px]" />

          <p className="font-ui text-card xl:text-card-d text-body mt-[20px] leading-[1.5] xl:mt-[28px]">
            {t(current.lead)}
          </p>
        </div>

        <div className="flex min-w-0 flex-col">
          <div
            role="tablist"
            aria-labelledby="faq-title"
            onKeyDown={onKeyDown}
            className="carousel gap-[8px]"
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
                aria-controls={panelId(index)}
                // Блуждающий tabindex: ряд вкладок — один таб-стоп,
                // внутри ходят стрелками.
                tabIndex={index === active ? 0 : -1}
                onClick={() => select(index)}
                className="pill-tap"
              >
                <span className={pillVisual(index === active)}>{t(occasion.pill)}</span>
              </button>
            ))}
          </div>

          {/* Горизонтальный аккордеон (с 1280px, просьба пользователя
              08.10.2026): поводы стоят в постоянном порядке, открытый —
              широкий, остальные — узкие полоски. Нажали на полоску — она
              выплывает вширь, открытый одновременно сжимается.
              Анимируются flex-grow и flex-basis; содержимое не
              переверстывается на ходу: у него минимальная ширина, лишнее
              срезает overflow, а проявляется оно, когда карточка почти
              раскрылась. Высота ряда — по самой длинной карточке: панели
              закрытых поводов стоят в потоке невидимыми, ряд не прыгает.
              На телефоне полоскам нет места — видна только открытая. */}
          <div className="mt-[16px] flex flex-1 gap-[12px]">
            {OCCASIONS.map((occasion, index) => {
              const open = index === active;
              return (
                <div
                  key={occasion.pill}
                  className={`rounded-card xl:rounded-card-d bg-surface relative min-w-0 overflow-hidden transition-[flex-grow,flex-basis,background-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none ${
                    open
                      ? "flex shrink grow basis-0"
                      : "hover:bg-raised hidden shrink-0 grow-0 basis-[72px] xl:flex"
                  }`}
                >
                  <div
                    role="tabpanel"
                    id={panelId(index)}
                    aria-labelledby={tabId(index)}
                    inert={!open || undefined}
                    className={`flex w-full min-w-0 flex-col p-[8px] transition-opacity duration-300 motion-reduce:transition-none xl:min-w-[420px] xl:p-[10px] ${
                      open ? "opacity-100 delay-200" : "opacity-0"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className="bg-photo rounded-inner xl:rounded-inner-d h-[140px] xl:hidden"
                    />

                    <div className="flex flex-1 flex-col px-[12px] pt-[20px] pb-[14px] xl:px-[20px] xl:pt-[18px] xl:pb-[16px]">
                      <h3 className="font-display text-h3 xl:text-h3-d font-medium tracking-tight">
                        {t(occasion.title)}
                      </h3>

                      <ul
                        role="list"
                        className="mt-[20px] flex flex-col gap-[14px] xl:mt-[14px] xl:gap-[8px]"
                      >
                        {occasion.items.map((key) => (
                          <li key={key} className="flex items-start gap-[14px]">
                            {/* Точка списка — кружок фоном: своего рисунка у неё нет. */}
                            <span
                              aria-hidden="true"
                              className="bg-gold-deep mt-[8px] size-[6px] shrink-0 rounded-full"
                            />
                            <span className="font-ui text-card xl:text-card-d text-body leading-[1.5]">
                              {t(key)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-[28px] flex flex-col gap-[10px] xl:mt-auto xl:flex-row xl:pt-[18px]">
                        <Button href="/editor" labelKey="cta.create" className="xl:w-auto" />
                        {/* Каталог живёт на /cards. */}
                        <GhostButton href="/cards" labelKey="cta.templates" className="xl:w-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Полоска закрытого повода: подпись снизу вверх. Тот же
                      выбор мышью, что и вкладка; с клавиатуры хватает вкладок. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-controls={panelId(index)}
                    onClick={() => setActive(index)}
                    className={`absolute inset-y-0 start-0 hidden w-[72px] flex-col items-center justify-between py-[20px] transition-opacity duration-300 motion-reduce:transition-none xl:flex ${
                      open ? "pointer-events-none opacity-0" : "opacity-100 delay-200"
                    }`}
                  >
                    <Icon name="next" size={18} className="text-ink -rotate-90" />
                    <span className="font-display text-note-d text-ink rotate-180 font-medium whitespace-nowrap [writing-mode:vertical-rl]">
                      {t(occasion.pill)}
                    </span>
                    <Icon name="planet" size={24} className="text-gold-deep" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
