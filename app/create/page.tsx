import type { Metadata } from "next";

import { Constructor } from "@/components/create/Constructor";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("create.title")} — ${t("brand.name")}`,
};

/**
 * Конструктор открытки. Вводного абзаца у страницы нет: здесь работают,
 * а не читают — сразу шаги.
 *
 * Подвала тоже нет намеренно: длинная тёмная полоса со способами оплаты
 * под шагом «Загрузите фото» уводит из потока, а конструктор — путь
 * к оплате, а не витрина. Шапка остаётся: из неё есть выход.
 *
 * Что в конструкторе настоящее и чего в нём нет — в шапке
 * components/create/Constructor.tsx.
 */
export default function CreatePage() {
  return (
    <SitePage withFooter={false}>
      <PageHead title="create.title" />
      <Constructor />
    </SitePage>
  );
}
