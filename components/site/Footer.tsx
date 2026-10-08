import Link from "next/link";

import { SocialLinks } from "@/components/site/SocialLinks";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Подвал. Наполнение своё — название, описание, навигация, способы
 * оплаты, соцсети. Вид — из макета главной (design/главная.jpg):
 * светлая полоса без заливки, внизу строка с соцсетями тёмными
 * кружками справа.
 *
 * Сверху: название с описанием слева, навигация строкой справа.
 * Под линией: способы оплаты слева, соцсети справа. На мобильном
 * всё колонкой.
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
 * «Цены», «Данные и приватность» и «Контакты» стоят последними:
 * в макете их нет, но подвал — единственное место, откуда до них
 * можно дойти. В шапке четыре пункта из макета, и пятым «Цены»
 * туда не дописываются: это уже другая раскладка.
 * Оферты и правил возврата здесь нет намеренно: страницы пустые,
 * пока их не напишет юрист, и ссылка вела бы в никуда.
 */
const NAV = [
  { href: "/faq", key: "nav.faq" },
  { href: "/cards", key: "nav.cards" },
  { href: "/how", key: "nav.how" },
  { href: "/prices", key: "page.prices.title" },
  { href: "/privacy", key: "page.privacy.title" },
  { href: "/contacts", key: "page.contacts.title" },
] as const satisfies ReadonlyArray<{ href: string; key: TextKey }>;

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

export function Footer() {
  return (
    <footer className="pt-[30px] pb-[30px] xl:pt-[50px] xl:pb-[40px]">
      <div className="page-shell">
        <div className="flex flex-col gap-[30px] xl:flex-row xl:items-start xl:justify-between xl:gap-10">
          {/* О проекте */}
          <div className="xl:max-w-[520px]">
            <p className="font-display text-logo xl:text-logo-d font-medium">{t("brand.name")}</p>
            <p className="font-display text-note xl:text-card-d text-body mt-[10px] leading-[1.15] xl:mt-[14px]">
              {t("footer.about")}
            </p>
          </div>

          {/* Навигация. Заголовок «Навигация» в макете не виден,
              скринридеру он нужен — скрыт визуально, а не выброшен. */}
          <nav aria-labelledby="footer-nav-title">
            <p id="footer-nav-title" className="sr-only">
              {t("footer.nav.title")}
            </p>
            <ul
              role="list"
              className="flex flex-col gap-x-[30px] xl:max-w-[760px] xl:flex-row xl:flex-wrap xl:justify-end"
            >
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-display text-card xl:text-card-d min-h-tap min-w-tap hover:text-pink active:text-pink inline-flex items-center font-medium transition-colors"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-ink mt-[30px] flex flex-col gap-[25px] border-t pt-[25px] xl:mt-[40px] xl:flex-row xl:items-end xl:justify-between xl:pt-[30px]">
          {/* Способы оплаты */}
          <div>
            <p className="font-display text-note xl:text-note-d text-body font-medium">
              {t("footer.pay.title")}
            </p>

            <ul
              role="list"
              className="mt-[12px] flex flex-wrap gap-x-[10px] gap-y-[10px] xl:mt-[14px] xl:gap-x-[12px]"
            >
              {PAY.map((crop, index) => (
                <li
                  key={index}
                  aria-hidden="true"
                  className="pay-plate rounded-pay xl:rounded-pay-d border-ink flex h-[44px] items-center justify-center border bg-white xl:h-[52px]"
                  style={
                    {
                      "--pay-w": `${crop.w}px`,
                      "--pay-w-d": `${crop.wd}px`,
                      "--pay-scale": crop.scale,
                      "--pay-offset": crop.offset,
                    } as React.CSSProperties
                  }
                >
                  <span className="block h-[29px] w-full xl:h-[34px]" />
                </li>
              ))}
            </ul>
          </div>

          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
