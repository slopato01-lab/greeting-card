import type { Metadata } from "next";

import { AuthPage } from "@/components/auth/AuthPage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.register.title")} — ${t("brand.name")}`,
  robots: { index: false, follow: true },
};

export default function Page() {
  return <AuthPage mode="register" />;
}
