import type { Metadata } from "next";

import { Cta } from "@/components/site/Cta";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { TemplateGrid } from "@/components/site/TemplateGrid";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.cards.title")} — ${t("brand.name")}`,
};

/**
 * Каталог шаблонов. Та же сетка с фильтрами, что и в секции лендинга,
 * только без обрезки: на лендинге это витрина, здесь — сам каталог.
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
export default function CardsPage() {
  return (
    <SitePage>
      <PageHead title="page.cards.title" lead="page.cards.lead" />

      <section className="page-shell pb-[70px] xl:pb-[120px]">
        {/* Заголовок страницы уже назвал этот ряд — ссылаемся на него,
            второго заголовка над фильтрами здесь не нужно. */}
        <TemplateGrid
          labelledBy="page-title"
          rowClassName="mt-[30px] xl:mt-[50px]"
          gridClassName="mt-[50px] xl:mt-[60px]"
        />
      </section>

      <Cta />
    </SitePage>
  );
}
