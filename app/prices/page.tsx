import type { Metadata } from "next";

import { Cta } from "@/components/site/Cta";
import { DocNotice, DocSections, type DocSection } from "@/components/site/DocPage";
import { PAGE_TITLE_ID, PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";
import { PRICES } from "@/lib/pricing";

export const metadata: Metadata = {
  title: `${t("page.prices.title")} — ${t("brand.name")}`,
};

/**
 * Цены. Прайс из docs/PRODUCT.md, числа приходят из lib/pricing.ts.
 *
 * Оплаты в сервисе ещё нет, и страница говорит об этом прямо: цена,
 * заявленная без работающей кнопки, — обещание, которое сервис пока
 * не выполняет.
 *
 * Позиции — список, а не таблица: в двух валютах и на 390px таблица
 * из трёх колонок либо переносится в кашу, либо уезжает за экран.
 * Каждая строка читается парой «название — сколько стоит».
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
const SECTIONS = [
  {
    title: "price.free.title",
    items: ["price.free.item.1", "price.free.item.2", "price.free.item.3"],
  },
  {
    title: "price.paid.title",
    items: ["price.paid.item.1", "price.paid.item.2", "price.paid.item.3"],
  },
] as const satisfies ReadonlyArray<DocSection>;

export default function PricesPage() {
  return (
    <SitePage>
      <PageHead title="page.prices.title" lead="page.prices.lead" />

      <section className="page-shell pt-[30px] pb-[70px] xl:pt-[40px] xl:pb-[120px]">
        <DocNotice textKey="price.note" />

        {/* Цена — не просто число: у каждой суммы стоит валюта,
            иначе «12» и «390» рядом читаются как одна цена. */}
        <ul
          role="list"
          aria-labelledby={PAGE_TITLE_ID}
          className="mt-[40px] flex flex-col xl:mt-[60px] xl:max-w-[900px]"
        >
          {PRICES.map((row) => (
            <li
              key={row.nameKey}
              className="border-line flex flex-col gap-[6px] border-b py-[18px] first:border-t xl:flex-row xl:items-baseline xl:justify-between xl:gap-6 xl:py-[24px]"
            >
              <span className="font-ui text-card xl:text-card-d font-medium">{t(row.nameKey)}</span>

              <span className="font-ui text-card xl:text-card-d text-body flex gap-[16px] whitespace-nowrap">
                <span>
                  {row.byn}&nbsp;{t("price.byn")}
                </span>
                <span aria-hidden="true" className="text-muted">
                  ·
                </span>
                <span>
                  {row.rub}&nbsp;{t("price.rub")}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-[40px] xl:mt-[60px]">
          <DocSections sections={SECTIONS} />
        </div>
      </section>

      <Cta />
    </SitePage>
  );
}
