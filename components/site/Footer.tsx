import Link from "next/link";

import { Icon } from "@/components/Icon";
import { SocialLinks } from "@/components/site/SocialLinks";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Подвал — структура из design/футер.jpg (08.10.2026), оформление
 * и наполнение наши. Макет тёмный; у нас светлый сайт, поэтому
 * подвал — панель --surface со скруглением панели.
 *
 * Сверху: колонки ссылок с заголовками и последней колонкой —
 * способы оплаты; справа карточка проекта (в макете там карточка
 * поста из соцсети): знак, название, описание. Под линией: знак
 * с названием и годом слева, соцсети справа. На мобильном колонки
 * идут по две, карточка и низ — колонкой.
 *
 * Платёжные логотипы — кропы одного растрового спрайта
 * public/assets/pay-logos.png: ссылка на хранилище Figma умирает
 * через неделю (docs/FIGMA.md). Геометрия кропа инлайном — это
 * координаты внутри картинки, а не значения дизайн-системы. Состав
 * способов не финальный, поэтому у плашек нет подписей.
 */
/**
 * Ширина кропа и сдвиг внутри спрайта в долях ширины плашки.
 * Сами плашки мельче, чем в старом макете: в светлой строке подвала
 * из design/главная.jpg они вторичны. Пропорции сохранены.
 */
const PAY = [
  { scale: 13.24, offset: 0, w: 50, wd: 60 },
  { scale: 13.24, offset: 7.8, w: 50, wd: 60 },
  { scale: 13.24, offset: 3.97, w: 50, wd: 60 },
  { scale: 13.24, offset: 8.81, w: 50, wd: 60 },
  { scale: 7.27, offset: 2.69, w: 91, wd: 109 },
  { scale: 11.92, offset: 8.99, w: 55, wd: 66 },
] as const;

/**
 * Колонки ссылок. Оферты и правил возврата здесь нет намеренно:
 * страницы пустые, пока их не напишет юрист.
 */
const COLUMNS = [
  {
    title: "nav.cards",
    links: [
      { href: "/cards", key: "cta.templates" },
      { href: "/games", key: "nav.games" },
      { href: "/editor", key: "cta.create" },
    ],
  },
  {
    title: "footer.col.help",
    links: [
      { href: "/how", key: "nav.how" },
      { href: "/#faq", key: "nav.faq" },
      { href: "/prices", key: "page.prices.title" },
    ],
  },
  {
    title: "footer.col.service",
    links: [
      { href: "/contacts", key: "page.contacts.title" },
      { href: "/privacy", key: "page.privacy.title" },
    ],
  },
] as const satisfies ReadonlyArray<{
  title: TextKey;
  links: ReadonlyArray<{ href: string; key: TextKey }>;
}>;

const HEADING = "font-display text-feat xl:text-feat-d font-medium tracking-tight";

export function Footer() {
  return (
    <footer className="page-shell pt-[30px] pb-[20px] xl:pt-[50px] xl:pb-[30px]">
      <div className="rounded-panel xl:rounded-panel-d bg-surface px-[20px] pt-[28px] pb-[20px] xl:px-[48px] xl:pt-[48px] xl:pb-[28px]">
        <div className="flex flex-col gap-[32px] xl:flex-row xl:items-start xl:justify-between xl:gap-[40px]">
          <nav aria-labelledby="footer-nav-title" className="min-w-0">
            <p id="footer-nav-title" className="sr-only">
              {t("footer.nav.title")}
            </p>
            <div className="grid grid-cols-2 gap-x-[20px] gap-y-[28px] xl:flex xl:gap-[56px]">
              {COLUMNS.map((column) => (
                <div key={column.title}>
                  <p className={HEADING}>{t(column.title)}</p>
                  <ul role="list" className="mt-[8px] xl:mt-[12px]">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="font-ui text-note xl:text-note-d min-h-tap text-body hover:text-ink active:text-ink inline-flex items-center transition-colors xl:whitespace-nowrap"
                        >
                          {t(link.key)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Способы оплаты — четвёртая колонка, как «Legal» в макете. */}
              <div className="col-span-2 xl:col-span-1">
                <p className={HEADING}>{t("footer.pay.title")}</p>
                <ul
                  role="list"
                  className="mt-[16px] flex max-w-[260px] flex-wrap gap-[8px] xl:mt-[20px]"
                >
                  {PAY.map((crop, index) => (
                    <li
                      key={index}
                      aria-hidden="true"
                      className="pay-plate rounded-inner bg-paper flex h-[40px] items-center justify-center"
                      style={
                        {
                          "--pay-w": `${crop.w}px`,
                          "--pay-w-d": `${crop.wd}px`,
                          "--pay-scale": crop.scale,
                          "--pay-offset": crop.offset,
                        } as React.CSSProperties
                      }
                    >
                      <span className="block h-[26px] w-full" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>

          {/* Карточка проекта — на месте карточки поста из макета. */}
          <div className="rounded-card bg-canvas border-line border p-[16px] xl:w-[300px] xl:shrink-0 xl:p-[20px]">
            <p className="flex items-center gap-[12px]">
              <span
                aria-hidden="true"
                className="bg-gold text-ink flex size-[40px] shrink-0 items-center justify-center rounded-full"
              >
                <Icon name="planet" size={22} />
              </span>
              <span className="font-display text-card font-medium">{t("brand.name")}</span>
            </p>
            <p className="font-ui text-note text-body mt-[12px] leading-[1.45]">
              {t("footer.about")}
            </p>
          </div>
        </div>

        <div className="border-line mt-[32px] flex flex-col gap-[16px] border-t pt-[20px] xl:mt-[48px] xl:flex-row xl:items-center xl:justify-between xl:pt-[24px]">
          <p className="font-display text-note xl:text-note-d flex items-center gap-[10px] font-medium">
            <Icon name="planet" size={24} className="text-gold-deep" />
            {t("footer.copyright")}
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
