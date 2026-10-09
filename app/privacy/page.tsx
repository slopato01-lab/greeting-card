import type { Metadata } from "next";
import Link from "next/link";

import { DocNotice, DocSections, type DocSection } from "@/components/site/DocPage";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.privacy.title")} — ${t("brand.name")}`,
};

/**
 * Данные и приватность.
 *
 * Это не политика обработки персональных данных и не оферта: по
 * docs/SECURITY.md юридические документы готовит юрист, а не
 * разработчик. Здесь описано, как сервис устроен на самом деле.
 *
 * Поэтому страница делится надвое. Первый раздел — что происходит
 * сегодня: сервера нет, конструктор держит всё в браузере, оплаты
 * не существует. Остальные — что появится вместе с сервером,
 * по требованиям docs/SECURITY.md. Обещать сегодняшнему посетителю
 * серверную обработку, которой нет, нельзя.
 */
const SECTIONS = [
  {
    title: "privacy.s1.title",
    items: ["privacy.s1.item.1", "privacy.s1.item.2", "privacy.s1.item.3", "privacy.s1.item.4"],
  },
  {
    title: "privacy.s2.title",
    items: ["privacy.s2.item.1", "privacy.s2.item.2", "privacy.s2.item.3"],
  },
  {
    title: "privacy.s3.title",
    items: ["privacy.s3.item.1", "privacy.s3.item.2", "privacy.s3.item.3"],
  },
  { title: "privacy.s4.title", items: ["privacy.s4.item.1", "privacy.s4.item.2"] },
  {
    title: "privacy.s5.title",
    items: ["privacy.s5.item.1", "privacy.s5.item.2", "privacy.s5.item.3"],
  },
  { title: "privacy.s6.title", items: ["privacy.s6.item.1"] },
  { title: "privacy.s7.title", items: ["privacy.s7.item.1", "privacy.s7.item.2"] },
  { title: "privacy.s8.title", items: ["privacy.s8.item.1"] },
] as const satisfies ReadonlyArray<DocSection>;

export default function PrivacyPage() {
  return (
    <SitePage>
      <PageHead title="page.privacy.title" lead="page.privacy.lead" />

      <section className="page-shell pt-[30px] pb-[70px] xl:pt-[40px] xl:pb-[120px]">
        <DocNotice textKey="legal.notice" />

        <div className="mt-[40px] xl:mt-[60px]">
          <DocSections sections={SECTIONS} />
        </div>

        {/* Чего на сайте ещё нет. Список честнее молчания: эти четыре
            документа обязаны появиться до первой продажи. */}
        <div className="rounded-card xl:rounded-card-d bg-surface mt-[40px] px-[24px] py-[28px] xl:mt-[60px] xl:max-w-[900px] xl:px-[40px] xl:py-[34px]">
          <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
            {t("legal.todo.title")}
          </h2>
          <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.4]">
            {t("legal.todo.body")}
          </p>

          <Link
            href="/contacts"
            className="font-ui text-note-d min-h-tap mt-[14px] inline-flex items-center underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {t("page.contacts.title")}
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
