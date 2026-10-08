import Link from "next/link";

import { Icon } from "@/components/Icon";
import { LoopVideo } from "@/components/site/LoopVideo";
import type { AnimatedTemplate } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Карточка анимированного шаблона — по третьей карточке блока
 * «New Ice Jewelry / By Type» из design/главная greetinh-cards.jpg
 * (просьба пользователя 08.10.2026): изображение во всю карточку,
 * сверху метка и короткий заголовок, внизу поверх — кнопка.
 *
 * Отличия от макета, и почему:
 * - метка и заголовок стоят в полосе над открыткой, на её же
 *   однотонном фоне, а не поверх изображения: у открытки сверху свой
 *   заголовок, и плашки поверх его закрывали; по docs/DESIGN.md
 *   («Работа с изображениями») текст на голом изображении не лежит;
 * - кнопка «Редактировать» — сплошная тёмная, а не белая обводка
 *   из макета: открытки светлые, белая обводка на них не видна;
 * - сердечка «в избранное», цены и рейтинга нет — у шаблонов их нет.
 *
 * Открытка под полосой — 3:4, её родная пропорция: видео без обрезки.
 * Ссылкой обёрнута вся карточка: один таб-стоп, зона нажатия — вся.
 * Наведение и фокус проявляют кнопку: она становится золотой.
 *
 * `inert` — для копий карточек в бесконечной ленте (TemplateMarquee):
 * клавиатура и скринридер видят каждую карточку один раз.
 */
export function AnimatedTemplateCard({
  template,
  className = "",
  inert = false,
}: {
  template: AnimatedTemplate;
  className?: string;
  inert?: boolean;
}) {
  return (
    <li className={className} inert={inert || undefined}>
      <Link
        href={`/editor?template=${template.id}`}
        // Фон шаблона — цвет открытки, а не оформления сайта
        // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
        style={{ backgroundColor: template.background }}
        className="group rounded-card xl:rounded-card-d flex w-full flex-col overflow-hidden transition-transform active:translate-y-px"
      >
        {/* Шапка карточки — на однотонном фоне открытки: метка повода
            и короткий заголовок. Тёмный текст на светлом фоне шаблона,
            открытку под собой не закрывает. */}
        <span className="flex flex-col items-start gap-[6px] px-[12px] pt-[12px] pb-[4px] xl:gap-[8px] xl:px-[16px] xl:pt-[16px]">
          <span className="font-ui caps text-tpl-action xl:text-tpl-action-d bg-canvas text-gold rounded-full px-[10px] py-[3px] font-medium">
            {t(template.filter)}
          </span>
          <span className="font-display text-note xl:text-tpl text-canvas max-w-full truncate font-medium tracking-tight">
            {t(template.nameKey)}
          </span>
        </span>

        <span className="relative block aspect-[3/4] w-full">
          <LoopVideo
            src={template.video}
            poster={template.poster}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="font-ui caps text-tpl-action xl:text-btn bg-canvas text-ink border-canvas group-hover:bg-gold group-hover:text-canvas group-focus-visible:bg-gold group-focus-visible:text-canvas absolute start-[10px] bottom-[10px] inline-flex min-h-[36px] items-center gap-[8px] rounded-full border px-[14px] font-medium transition-colors xl:start-[14px] xl:bottom-[14px] xl:min-h-[44px] xl:px-[20px]">
            {t("catalog.edit")}
            <Icon name="next" size={16} className="-rotate-45" />
          </span>
        </span>
      </Link>
    </li>
  );
}
