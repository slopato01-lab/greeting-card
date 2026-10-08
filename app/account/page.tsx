import type { Metadata } from "next";

import { Account } from "@/components/account/Account";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.account.title")} — ${t("brand.name")}`,
  // Личная страница: в поиске ей делать нечего.
  robots: { index: false, follow: false },
};

/** Личный кабинет. Что в нём и почему так — components/account/Account.tsx. */
export default function AccountPage() {
  return (
    <SitePage>
      <PageHead title="page.account.title" />
      <div className="page-shell pt-[20px] pb-[60px] xl:pt-[30px] xl:pb-[100px]">
        <Account />
      </div>
    </SitePage>
  );
}
