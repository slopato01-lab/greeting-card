import Link from "next/link";

import type { CatalogTemplate } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Карточка шаблона: картинка, название и «Выбрать».
 *
 * Живёт в сетке каталога (TemplateGrid) и в ряду «Ещё шаблоны» на
 * странице шаблона. Разметка у них одна, расходится только ширина:
 * в сетке карточка тянется по колонке, в ряду стоит фиксированной,
 * иначе три карточки в карусели схлопнутся.
 *
 * Ссылкой обёрнута вся карточка, а не подпись «Выбрать»: так зона
 * нажатия — вся картинка, а с клавиатуры карточка остаётся одним
 * таб-стопом. «Выбрать» внутри — подпись, как в макете.
 *
 * Наведение — та же тень, что у карточек преимуществ; нажатие
 * притапливает карточку на пиксель. Обводка фокуса общая, из
 * globals.css. При prefers-reduced-motion переход отключается там же.
 *
 * Картинок шаблонов в макете нет, там пустое белое поле; на их месте
 * плейсхолдер цветом --color-photo. Подставлять сюда случайные
 * картинки нельзя: их ещё не нарисовали.
 */
export function TemplateCard({
  template,
  className = "",
}: {
  template: CatalogTemplate;
  className?: string;
}) {
  return (
    <li className={className}>
      <Link
        href={`/cards/${template.slug}`}
        className="rounded-card xl:rounded-card-d border-ink hover:shadow-card flex h-full flex-col overflow-hidden border-2 bg-white transition-shadow active:translate-y-px"
      >
        {/* Картинки шаблона ещё нет — плейсхолдер держит пропорции
            карточки из макета, 350×368 и 390×410. */}
        <div aria-hidden="true" className="bg-photo min-h-[317px] flex-1 xl:min-h-[355px]" />

        <div className="border-ink flex min-h-[49px] items-center justify-between gap-4 border-t px-[22px] py-[14px] xl:min-h-[55px] xl:px-6">
          <span className="font-ui text-tpl xl:text-tpl-d">{t(template.nameKey)}</span>
          <span className="font-ui text-tpl-action xl:text-tpl-action-d text-caption">
            {t("catalog.choose")}
          </span>
        </div>
      </Link>
    </li>
  );
}
