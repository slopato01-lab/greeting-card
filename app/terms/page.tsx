import type { Metadata } from "next";

import { DocSoon } from "@/components/site/DocPage";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

/**
 * Публичная оферта. Текста нет: по docs/SECURITY.md этот документ
 * готовит юрист. Страница держит адрес и закрыта от поисковых систем,
 * пока пуста, — см. DocSoon.
 */
export const metadata: Metadata = {
  title: `${t("page.terms.title")} — ${t("brand.name")}`,
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <SitePage>
      <PageHead title="page.terms.title" />

      <section className="page-shell pt-[30px] pb-[70px] xl:pt-[40px] xl:pb-[120px]">
        <DocSoon />
      </section>
    </SitePage>
  );
}
