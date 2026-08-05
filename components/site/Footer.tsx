import Link from "next/link";

import { Icon } from "@/components/Icon";
import { SOCIAL } from "@/components/site/social";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Подвал. Тёмная полоса во всю ширину: название, описание, соцсети,
 * навигация и способы оплаты.
 *
 * Ссылки и иконки лежат на тёмном — фокус на них белый, класс on-dark
 * из globals.css.
 *
 * Платёжные логотипы в макете — кропы одного растрового спрайта.
 * Спрайт скачан в public/assets/pay-logos.png: ссылка на хранилище
 * Figma умирает через неделю, тащить её в прод нельзя (docs/FIGMA.md).
 * Геометрия кропа задана инлайном, потому что это координаты внутри
 * картинки, а не значения дизайн-системы: множитель ширины и сдвиг
 * взяты из макета как есть.
 *
 * Состав способов оплаты в макете не финальный (см. docs/FIGMA.md),
 * поэтому у плашек нет подписей: назвать банк, которого может
 * не оказаться в списке, хуже, чем не назвать никого.
 */
/**
 * Соцсети внешние и остаются `<a>`, свои страницы идут через Link.
 *
 * «Данные и приватность» и «Контакты» стоят последними: в макете их
 * нет, но подвал — единственное место, откуда до них можно дойти.
 * Оферты и правил возврата здесь нет намеренно: страницы пустые,
 * пока их не напишет юрист, и ссылка вела бы в никуда.
 */
const NAV = [
  { href: "/faq", key: "nav.faq" },
  { href: "/cards", key: "nav.cards" },
  { href: "/how", key: "nav.how" },
  { href: "/privacy", key: "page.privacy.title" },
  { href: "/contacts", key: "page.contacts.title" },
] as const satisfies ReadonlyArray<{ href: string; key: TextKey }>;

/** Ширина кропа и сдвиг внутри спрайта в долях ширины плашки. */
const PAY = [
  { scale: 13.24, offset: 0, w: 60, wd: 90 },
  { scale: 13.24, offset: 7.8, w: 60, wd: 90 },
  { scale: 13.24, offset: 3.97, w: 60, wd: 90 },
  { scale: 13.24, offset: 8.81, w: 60, wd: 90 },
  { scale: 7.27, offset: 2.69, w: 109, wd: 164 },
  { scale: 11.92, offset: 8.99, w: 66, wd: 100 },
] as const;

export function Footer() {
  return (
    <footer className="on-dark bg-dark pt-[41px] pb-[50px] xl:pt-[60px] xl:pb-[60px]">
      <div className="page-shell">
        <div className="flex flex-col gap-[68px] xl:flex-row xl:justify-between xl:gap-10">
          {/* О проекте и соцсети */}
          <div className="xl:max-w-[520px]">
            <p className="font-display text-logo xl:text-logo-d font-medium text-white">
              {t("brand.name")}
            </p>
            <p className="font-display text-note xl:text-card-d mt-[13px] leading-[1.15] text-white xl:mt-[16px]">
              {t("footer.about")}
            </p>

            <ul
              role="list"
              className="mt-[40px] flex items-center gap-[21px] xl:mt-[45px] xl:gap-[25px]"
            >
              {SOCIAL.map((item) => {
                // Facebook в макете лежит в розовом круге и потому нарисован
                // мельче остальных двух: те идут просто контуром. Так во
                // фрейме, не унифицируем.
                const inCircle = item.icon === "facebook";

                return (
                  <li key={item.icon}>
                    {/* Подпись висит на ссылке, а не на иконке внутри.
                        Имя вложенного role="img" тоже поднялось бы наверх,
                        но называть имеет смысл то, что нажимают. */}
                    <a
                      href={item.href}
                      aria-label={t(item.label)}
                      className={`min-h-tap flex size-[37px] items-center justify-center rounded-full text-white transition-opacity hover:opacity-80 xl:size-[44px] ${
                        inCircle ? "bg-pink" : ""
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        size={inCircle ? 21 : 37}
                        className={inCircle ? "xl:size-[25px]" : "xl:size-[44px]"}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Навигация */}
          <nav>
            {/* Заголовка «Навигация» на мобильном в макете нет: там сразу
                идут ссылки. Скринридеру он нужен всегда, поэтому скрыт
                визуально, а не выброшен. */}
            <p className="font-display text-logo xl:text-logo-d sr-only font-medium text-white xl:not-sr-only">
              {t("footer.nav.title")}
            </p>
            <ul role="list" className="flex flex-col gap-[16px] xl:mt-[16px] xl:gap-[24px]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-display text-card xl:text-nav-d min-h-tap inline-flex items-center font-medium text-white transition-opacity hover:opacity-80"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Способы оплаты */}
          <div>
            <p className="font-display text-logo xl:text-logo-d font-medium text-white">
              {t("footer.pay.title")}
            </p>

            <ul
              role="list"
              className="mt-[20px] grid grid-flow-col grid-rows-2 justify-start gap-x-[12px] gap-y-[10px] xl:mt-[16px] xl:gap-x-[18px] xl:gap-y-[15px]"
            >
              {PAY.map((crop, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="pay-plate rounded-pay xl:rounded-pay-d flex h-[53px] items-center justify-center bg-white xl:h-[80px]"
                  style={
                    {
                      "--pay-w": `${crop.w}px`,
                      "--pay-w-d": `${crop.wd}px`,
                      "--pay-scale": crop.scale,
                      "--pay-offset": crop.offset,
                    } as React.CSSProperties
                  }
                >
                  <span className="block h-[35px] w-full xl:h-[52px]" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Тонкая линия внизу — она есть в обоих макетах */}
        <div className="mt-[47px] h-px bg-white/20 xl:mt-[60px]" />
      </div>
    </footer>
  );
}
