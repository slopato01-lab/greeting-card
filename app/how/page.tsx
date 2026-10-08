import type { Metadata } from "next";

import { HowEditor } from "@/components/how/HowEditor";
import { HowHero } from "@/components/how/HowHero";
import { HowPlans } from "@/components/how/HowPlans";
import { HowTemplates } from "@/components/how/HowTemplates";
import { Blocks } from "@/components/site/Blocks";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.how.title")} — ${t("brand.name")}`,
};

/**
 * «Как это работает». Структура — по design/страница как это
 * работает.jpg (08.10.2026): четыре блока подряд, у каждого фото
 * с рядом разделов-якорей. Оформление и тексты наши. Серая подложка —
 * только у первого экрана, остальные блоки на белом (просьба
 * пользователя 08.10.2026):
 *
 * 1. шаги — заголовок, что умеет редактор, четыре шага со стрелками;
 * 2. редактор — как он устроен, где хранится работа, цифры;
 * 3. шаблоны — по поводам;
 * 4. тарифы — без регистрации, после неё, подписка.
 *
 * Тексты — docs/PRODUCT.md, раздел «Страница „Как это работает“».
 */
export default function HowPage() {
  return (
    <SitePage>
      <Blocks className="page-shell pt-[8px] xl:pt-[16px]">
        <HowHero />
        <HowEditor />
        <HowTemplates />
        <HowPlans />
      </Blocks>
    </SitePage>
  );
}
