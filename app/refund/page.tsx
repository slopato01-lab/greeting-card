import type { Metadata } from "next";

import { DocSoon } from "@/components/site/DocPage";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

/**
 * Правила возврата средств за цифровой товар. Текста нет по той же
 * причине, что у оферты: документ готовит юрист, см. docs/SECURITY.md.
 */
export const metadata: Metadata = {
  title: `${t("page.refund.title")} — ${t("brand.name")}`,
  robots: { index: false, follow: false },
};

export default function RefundPage() {
  return (
    <SitePage>
      <PageHead title="page.refund.title" />

      <section className="page-shell pt-[30px] pb-[70px] xl:pt-[40px] xl:pb-[120px]">
        <DocSoon />
      </section>
    </SitePage>
  );
}
