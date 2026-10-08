import Link from "next/link";

import { Icon } from "@/components/Icon";
import type { CatalogTemplate } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Карточка шаблона: картинка, метка повода, название, подводка
 * и «Выбрать».
 *
 * Живёт в каталоге (TemplateGrid — сеткой на /cards и лентой на
 * главной) и в ряду «Ещё шаблоны» на странице шаблона. Разметка
 * одна, расходится только ширина.
 *
 * Вид — карточки товаров из design/главная greetinh-cards.jpg: тёмная
 * карточка, круг со стрелкой в углу картинки, метки-пилюли над
 * названием. Цены, рейтинга и «в избранное» у шаблонов нет — эти
 * элементы макета не перенесены. Текст в макете лежит прямо на фото;
 * у нас под картинкой, на --surface: на голом фото текст не лежит
 * нигде (docs/DESIGN.md, «Работа с изображениями»).
 *
 * Ссылкой обёрнута вся карточка: зона нажатия — вся карточка,
 * а с клавиатуры она остаётся одним таб-стопом. Наведение
 * проявляет обводку и заливает круг со стрелкой, нажатие
 * притапливает карточку на пиксель.
 *
 * Картинка есть только у шаблонов со своим оформлением (`cover`),
 * у остальных на её месте плейсхолдер --photo.
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
        className="group rounded-card xl:rounded-card-d bg-surface border-surface hover:border-line flex h-full flex-col border p-[8px] transition-colors active:translate-y-px xl:p-[10px]"
      >
        <div
          aria-hidden="true"
          className="bg-photo rounded-inner xl:rounded-inner-d relative h-[260px] shrink-0 overflow-hidden xl:h-[300px]"
        >
          {/* Обложка есть только у шаблонов со своим оформлением.
              Обычный img: оптимизатор Next в статическом экспорте
              недоступен, файл уже ужат до 1600px. */}
          {template.cover === null ? null : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.cover}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <span className="border-ink text-ink group-hover:bg-ink group-hover:text-canvas absolute start-[12px] top-[12px] flex size-[40px] items-center justify-center rounded-full border transition-colors">
            <Icon name="next" size={18} className="-rotate-45" />
          </span>
        </div>

        <div className="flex flex-1 flex-col px-[10px] pt-[16px] pb-[10px] xl:px-[12px]">
          <span className="font-ui caps text-tpl-action xl:text-tpl-action-d bg-gold text-ink max-w-full self-start truncate rounded-full px-[10px] py-[3px] font-medium whitespace-nowrap">
            {t(template.filter)}
          </span>
          <span className="font-display text-tpl xl:text-tpl-d mt-[12px] font-medium tracking-tight">
            {t(template.nameKey)}
          </span>
          <span className="font-ui text-note xl:text-note-d text-body mt-[8px] leading-[1.5]">
            {t(template.lead)}
          </span>
          <span className="font-ui caps text-tpl-action xl:text-tpl-action-d text-ink mt-auto inline-flex items-center gap-[6px] pt-[14px] font-medium">
            {t("catalog.choose")}
            <Icon name="next" size={16} />
          </span>
        </div>
      </Link>
    </li>
  );
}
