"use client";

import { useState } from "react";
import Link from "next/link";

import { pillVisual } from "@/components/site/pill";
import { Ribbon } from "@/components/site/slider";
import { AnimatedTemplateCard } from "@/components/site/AnimatedTemplateCard";
import { TemplateCard } from "@/components/site/TemplateCard";
import {
  ANIMATED_TEMPLATES,
  CATALOG_ALL,
  CATALOG_CUSTOM,
  CATALOG_FILTERS,
  type CatalogFilter,
  type TEMPLATES,
} from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Ряд фильтров и сетка карточек шаблонов.
 *
 * Живёт двумя жизнями: секцией лендинга (components/site/Catalog.tsx)
 * и содержимым страницы /cards. Отбор, состояния и разметка у них
 * общие — расходятся только заголовок и подводка над рядом.
 *
 * Фильтр отбирает карточки в сетке — это переключатели, поэтому
 * aria-pressed, а не вкладки: панели у сетки нет, и заголовка,
 * на который она могла бы сослаться, тоже.
 *
 * Шестая пилюля «Собрать свой +» — не фильтр, а приглашение: она
 * ведёт в редактор /editor. Нажатие на неё фильтром дало бы пустую сетку.
 *
 * Раскладка карточек по фильтрам — по две на каждый, чтобы ни один
 * не отдавал пустоту. Пустого состояния у сетки поэтому нет,
 * см. lib/catalog/templates.ts.
 *
 * На главной карточки идут лентой со счётчиком «1/8» и стрелками,
 * как ряд товаров в design/главная greetinh-cards.jpg (`layout="ribbon"`),
 * на /cards — сеткой. Смена фильтра пересоздаёт ленту: прокрутка
 * и счётчик начинаются с первой карточки.
 *
 * Сама карточка — в components/site/TemplateCard.tsx: она общая
 * с рядом «Ещё шаблоны» на странице шаблона.
 *
 * С 08.10.2026 в сетке два вида карточек: шаблоны-игры (TemplateCard)
 * и анимированные шаблоны редактора (AnimatedTemplateCard). Анимированные
 * идут первыми в своём поводе: живая карточка — лучший вход в каталог.
 */
type Entry =
  | {
      kind: "animated";
      key: string;
      filter: CatalogFilter;
      item: (typeof ANIMATED_TEMPLATES)[number];
    }
  | { kind: "game"; key: string; filter: CatalogFilter; item: (typeof TEMPLATES)[number] };

const ENTRIES: readonly Entry[] = [
  ...ANIMATED_TEMPLATES.map((item): Entry => ({
    kind: "animated",
    key: `anim-${item.id}`,
    filter: item.filter,
    item,
  })),
  // Шаблоны-игры (TEMPLATES) из сетки убраны 09.10.2026 по просьбе
  // пользователя: «С днём рождения!» со скретч-картой был единственным
  // и выглядел в блоке «День рождения» карточкой без открытки. Страница
  // /cards/<slug> и сама игра остались — ветка "game" ждёт новых.
];

function Card({ entry, className }: { entry: Entry; className?: string }) {
  return entry.kind === "animated" ? (
    <AnimatedTemplateCard
      template={entry.item}
      {...(className === undefined ? {} : { className })}
    />
  ) : (
    <TemplateCard template={entry.item} {...(className === undefined ? {} : { className })} />
  );
}
export function TemplateGrid({
  labelledBy,
  layout = "grid",
  rowClassName = "mt-[38px] xl:mt-20",
  gridClassName = "mt-[63px] xl:mt-[75px]",
}: {
  /** id заголовка, которому подчинён ряд фильтров. */
  labelledBy: string;
  layout?: "grid" | "ribbon";
  rowClassName?: string;
  gridClassName?: string;
}) {
  // null — «Все». Отдельным значением, а не первым фильтром в списке:
  // «Все» ничего не отбирает, и держать его в одном типе с поводами
  // значило бы проверять его в каждом сравнении.
  const [filter, setFilter] = useState<CatalogFilter | null>(null);

  const shown = filter === null ? ENTRIES : ENTRIES.filter((entry) => entry.filter === filter);

  return (
    <>
      <div aria-labelledby={labelledBy} className={`carousel gap-[8px] ${rowClassName}`}>
        <button
          type="button"
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
          className="pill-tap"
        >
          <span className={pillVisual(filter === null)}>{t(CATALOG_ALL)}</span>
        </button>

        {CATALOG_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className="pill-tap"
          >
            <span className={pillVisual(filter === key)}>{t(key)}</span>
          </button>
        ))}

        {/* Не фильтр, а ссылка: плюс в макете и означает «собрать свой».
            Плюс декоративный, скринридеру он не нужен. */}
        <Link href="/editor" className="pill-tap">
          <span className={pillVisual(false)}>
            {t(CATALOG_CUSTOM)}
            <span aria-hidden="true">&nbsp;&nbsp;+</span>
          </span>
        </Link>
      </div>

      {layout === "ribbon" ? (
        <div className={gridClassName}>
          <Ribbon
            key={filter ?? CATALOG_ALL}
            labelledBy={labelledBy}
            count={shown.length}
            trackClassName="gap-[12px] xl:gap-5"
          >
            {shown.map((entry) => (
              <Card
                key={entry.key}
                entry={entry}
                className="w-[280px] xl:w-[calc((100%-60px)/4)]"
              />
            ))}
          </Ribbon>
        </div>
      ) : (
        <ul
          role="list"
          className={`grid grid-cols-2 gap-x-[12px] gap-y-[16px] md:grid-cols-3 md:gap-x-[16px] md:gap-y-[20px] xl:grid-cols-5 xl:gap-x-5 xl:gap-y-[30px] ${gridClassName}`}
        >
          {shown.map((entry) => (
            <Card key={entry.key} entry={entry} />
          ))}
        </ul>
      )}
    </>
  );
}
