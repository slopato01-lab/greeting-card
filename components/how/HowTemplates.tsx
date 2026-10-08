"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { AnimatedTemplateCard } from "@/components/site/AnimatedTemplateCard";
import { pillVisual } from "@/components/site/pill";
import { ANIMATED_TEMPLATES, CATALOG_FILTERS, type CatalogFilter } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Третья панель — по блоку «Наш ассортимент» из макета: заголовок
 * слева, подводка справа, ряд фильтров и карточки. Вместо товаров —
 * анимированные шаблоны, вместо цены — кружок «в редактор» на
 * карточке (AnimatedTemplateCard, та же, что в каталоге).
 *
 * Фильтры — только поводы, у которых есть шаблоны: пустой ряд
 * карточек не показывается никогда. С 1280 — сетка в пять колонок,
 * на мобильном — лента пальцем.
 */
const FILTERS = CATALOG_FILTERS.filter((filter) =>
  ANIMATED_TEMPLATES.some((template) => template.filter === filter),
);

export function HowTemplates() {
  const [filter, setFilter] = useState<CatalogFilter | undefined>(FILTERS[0]);
  const shown = ANIMATED_TEMPLATES.filter((template) => template.filter === filter);

  return (
    <section
      id="templates"
      aria-labelledby="how-templates-title"
      className="rounded-panel xl:rounded-panel-d bg-surface flex flex-col gap-[20px] px-[10px] py-[24px] xl:gap-[28px] xl:p-[36px]"
    >
      <div className="grid gap-[12px] px-[8px] xl:grid-cols-2 xl:gap-[60px] xl:px-0">
        <h2
          id="how-templates-title"
          className="font-display text-h2 xl:text-h1-d font-medium tracking-tight"
        >
          {t("how.templates.title")}
        </h2>
        <p className="font-ui text-card xl:text-card-d text-body leading-[1.5] xl:self-end">
          {t("how.templates.lead")}
        </p>
      </div>

      <div
        role="group"
        aria-label={t("how.templates.filters")}
        className="carousel gap-[6px] px-[8px] xl:mx-0 xl:flex-wrap xl:px-0"
      >
        {FILTERS.map((key) => (
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
      </div>

      <ul
        role="list"
        aria-live="polite"
        className="carousel gap-[10px] px-[8px] xl:mx-0 xl:grid xl:grid-cols-5 xl:gap-[16px] xl:overflow-visible xl:px-0"
      >
        {shown.map((template) => (
          <AnimatedTemplateCard
            key={template.id}
            template={template}
            className="w-[210px] xl:w-auto"
          />
        ))}
      </ul>

      <div className="px-[8px] xl:px-0">
        <Button href="/cards" labelKey="cta.templates" tone="dark" className="xl:w-auto" />
      </div>
    </section>
  );
}
