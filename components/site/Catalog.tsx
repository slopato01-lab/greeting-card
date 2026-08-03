"use client";

import { useState } from "react";

import { pillVisual } from "@/components/site/pill";
import {
  CATALOG_ALL,
  CATALOG_CUSTOM,
  CATALOG_FILTERS,
  TEMPLATES,
  type CatalogFilter,
} from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Секция «Дизайн для каждого случая»: заголовок, фильтры и сетка
 * шаблонов.
 *
 * Фильтр отбирает карточки в сетке — это переключатели, поэтому
 * aria-pressed, а не вкладки: панели у сетки нет, и заголовка,
 * на который она могла бы сослаться, тоже.
 *
 * Шестая пилюля «Собрать свой +» — не фильтр, а приглашение: она
 * ведёт на /create. Нажатие на неё фильтром дало бы пустую сетку.
 *
 * Раскладка карточек по фильтрам — по две на каждый, чтобы ни один
 * не отдавал пустоту. Пустого состояния у каталога поэтому нет,
 * см. lib/catalog/templates.ts.
 *
 * Карточка шаблона — белый прямоугольник с нижней плашкой «Выбрать».
 * Картинок шаблонов в макете нет, там пустое белое поле; в коде на
 * их месте плейсхолдер цветом --color-photo. Подставлять сюда
 * случайные картинки нельзя: их ещё не нарисовали.
 */
export function Catalog() {
  // null — «Все». Отдельным значением, а не первым фильтром в списке:
  // «Все» ничего не отбирает, и держать его в одном типе с поводами
  // значило бы проверять его в каждом сравнении.
  const [filter, setFilter] = useState<CatalogFilter | null>(null);

  const shown = filter === null ? TEMPLATES : TEMPLATES.filter((item) => item.filter === filter);

  return (
    <section className="pt-[59px] pb-[70px] xl:pt-[140px] xl:pb-[120px]">
      <div className="page-shell">
        <h2 id="catalog-title" className="font-display text-h2 xl:text-h2-d font-medium">
          {t("catalog.title")}
        </h2>
        <p className="font-display text-sub xl:text-sub-d text-muted mt-[14px] leading-[1.15] xl:mt-[25px] xl:max-w-[738px]">
          {t("catalog.lead")}
        </p>

        <div
          aria-labelledby="catalog-title"
          className="carousel mt-[38px] gap-[10px] xl:mt-20 xl:gap-5"
        >
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
            className="pill-tap"
          >
            <span className={pillVisual("catalog", filter === null)}>{t(CATALOG_ALL)}</span>
          </button>

          {CATALOG_FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className="pill-tap"
            >
              <span className={pillVisual("catalog", filter === key)}>{t(key)}</span>
            </button>
          ))}

          {/* Не фильтр, а ссылка: плюс в макете и означает «собрать свой».
              Плюс декоративный, скринридеру он не нужен. */}
          <a href="/create" className="pill-tap">
            <span className={pillVisual("catalog", false)}>
              {t(CATALOG_CUSTOM)}
              <span aria-hidden="true">&nbsp;&nbsp;+</span>
            </span>
          </a>
        </div>

        <ul
          role="list"
          className="mt-[63px] grid gap-[70px] xl:mt-[75px] xl:grid-cols-4 xl:gap-x-5 xl:gap-y-[30px]"
        >
          {shown.map((template) => (
            <li
              key={template.nameKey}
              className="rounded-card xl:rounded-card-d border-ink flex flex-col overflow-hidden border-2 bg-white"
            >
              {/* Картинки шаблона ещё нет — плейсхолдер держит
                  пропорции карточки из макета, 350×368 и 390×410. */}
              <div aria-hidden="true" className="bg-photo min-h-[317px] flex-1 xl:min-h-[355px]" />

              <div className="border-ink flex min-h-[49px] items-center justify-between gap-4 border-t px-[22px] py-[14px] xl:min-h-[55px] xl:px-6">
                <span className="font-ui text-tpl xl:text-tpl-d">{t(template.nameKey)}</span>
                {/* «Выбрать» в макете — подпись, а не кнопка. Ссылкой
                    она станет, когда появится страница шаблона. */}
                <span className="font-ui text-tpl-action xl:text-tpl-action-d text-caption">
                  {t("catalog.choose")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
