import type { Metadata } from "next";

import { Icon } from "@/components/Icon";
import { PageHead } from "@/components/site/PageHead";
import { Blocks } from "@/components/site/Blocks";
import { SitePage } from "@/components/site/SitePage";
import { SOCIAL } from "@/components/site/social";
import { type TextKey, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.contacts.title")} — ${t("brand.name")}`,
};

/**
 * Контакты и реквизиты.
 *
 * Реквизитов пока нет: юрлицо не оформлено, и в словаре на их месте
 * стоят заглушки. Скрывать раздел нельзя — до первой продажи он
 * обязан быть заполнен, и пустое место об этом напоминает.
 *
 * Почта тоже заглушка, example.com. Ссылка mailto ведёт на неё как
 * есть: подставить чужой рабочий адрес было бы хуже, чем показать,
 * что его ещё нет.
 */
const DETAILS = [
  "legal.entity",
  "legal.tax",
  "legal.address",
] as const satisfies ReadonlyArray<TextKey>;

function Block({ title, children }: { title: TextKey; children: React.ReactNode }) {
  return (
    <section className="rounded-card xl:rounded-card-d bg-surface px-[24px] py-[28px] xl:px-[40px] xl:py-[34px]">
      <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">{t(title)}</h2>
      <div className="mt-[14px]">{children}</div>
    </section>
  );
}

export default function ContactsPage() {
  return (
    <SitePage>
      <Blocks>
        <div>
          <PageHead title="page.contacts.title" lead="page.contacts.lead" />

          <section className="page-shell pt-[30px] xl:pt-[40px]">
            <div className="grid gap-[20px] xl:max-w-[900px]">
              <Block title="contacts.mail.title">
                <a
                  href={`mailto:${t("legal.email")}`}
                  className="font-ui text-card xl:text-card-d min-h-tap inline-flex items-center font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  {t("legal.email")}
                </a>
                <p className="font-ui text-note-d text-muted mt-[8px]">{t("contacts.reply")}</p>
              </Block>

              <Block title="contacts.social.title">
                <ul role="list" className="flex items-center gap-[21px] xl:gap-[25px]">
                  {SOCIAL.map((item) => (
                    <li key={item.icon}>
                      {/* Подпись висит на ссылке, а не на иконке внутри:
                      называть имеет смысл то, что нажимают. */}
                      <a
                        href={item.href}
                        aria-label={t(item.label)}
                        className="min-h-tap flex size-[44px] items-center justify-center rounded-full transition-opacity hover:opacity-70"
                      >
                        <Icon name={item.icon} size={37} className="xl:size-[44px]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title="contacts.details.title">
                <ul role="list" className="flex flex-col gap-[8px]">
                  {DETAILS.map((key) => (
                    <li
                      key={key}
                      className="font-ui text-card xl:text-card-d text-body leading-[1.4]"
                    >
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </section>
        </div>
      </Blocks>
    </SitePage>
  );
}
