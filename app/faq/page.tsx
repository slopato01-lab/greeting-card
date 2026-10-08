import type { Metadata } from "next";

import { Cta } from "@/components/site/Cta";
import { PAGE_TITLE_ID, PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { type TextKey, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.faq.title")} — ${t("brand.name")}`,
};

/**
 * Вопросы и ответы.
 *
 * Раскрывающиеся блоки — на `details`/`summary`, а не на своём
 * аккордеоне с состоянием. Нативный элемент уже умеет клавиатуру,
 * скринридер и раскрытие без JS, и переживает статический экспорт
 * без единой строки гидратации. Правило «простые решения побеждают
 * умные» из CLAUDE.md — ровно про такой случай.
 *
 * Плюс справа декоративный: он поворачивается в крестик при
 * раскрытии, но состояние сообщает сам `details`, а не значок.
 * Поэтому он скрыт от скринридера.
 *
 * Цены в третьем ответе продублированы из docs/PRODUCT.md, раздел
 * «Модель денег». При изменении прайса правится и словарь.
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
const QA = [
  { q: "faq.q.1", a: "faq.a.1" },
  { q: "faq.q.2", a: "faq.a.2" },
  { q: "faq.q.3", a: "faq.a.3" },
  { q: "faq.q.4", a: "faq.a.4" },
  { q: "faq.q.5", a: "faq.a.5" },
  { q: "faq.q.6", a: "faq.a.6" },
  { q: "faq.q.7", a: "faq.a.7" },
  { q: "faq.q.8", a: "faq.a.8" },
] as const satisfies ReadonlyArray<{ q: TextKey; a: TextKey }>;

export default function FaqPage() {
  return (
    <SitePage>
      <PageHead title="page.faq.title" lead="page.faq.lead" />

      <section className="page-shell pt-[30px] pb-[60px] xl:pt-[50px] xl:pb-[100px]">
        <ul
          role="list"
          aria-labelledby={PAGE_TITLE_ID}
          className="flex flex-col gap-[15px] xl:max-w-[1100px] xl:gap-5"
        >
          {QA.map((item) => (
            <li key={item.q}>
              <details className="group rounded-card bg-white">
                {/* min-h-tap на summary, а не на тексте внутри: нажимают
                    всю строку целиком, а не только заголовок. */}
                <summary className="min-h-tap flex cursor-pointer list-none items-center justify-between gap-[16px] px-[20px] py-[18px] xl:px-[40px] xl:py-[26px] [&::-webkit-details-marker]:hidden">
                  <h2 className="font-display text-card xl:text-h3-d font-semibold tracking-tight">
                    {t(item.q)}
                  </h2>

                  <span
                    aria-hidden="true"
                    className="font-display text-h3 text-pink shrink-0 leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>

                <p className="font-ui text-note xl:text-card-d text-body px-[20px] pb-[22px] leading-[1.4] xl:max-w-[900px] xl:px-[40px] xl:pb-[32px]">
                  {t(item.a)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <Cta />
    </SitePage>
  );
}
