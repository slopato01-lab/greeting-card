import Link from "next/link";

import { CrownBadge } from "@/components/CrownBadge";
import { Icon } from "@/components/Icon";
import { LoopVideo } from "@/components/site/LoopVideo";
import type { AnimatedTemplate } from "@/lib/catalog/templates";
import { isPremium } from "@/lib/editor/premium";
import { t } from "@/lib/i18n";

/**
 * Карточка анимированного шаблона — по третьей карточке блока
 * «New Ice Jewelry / By Type» из design/главная greetinh-cards.jpg
 * (просьба пользователя 08.10.2026): изображение во всю карточку,
 * внизу поверх — кнопка.
 *
 * Отличия от макета, и почему:
 * - текстов на карточке нет совсем: метку повода сняли 08.10.2026,
 *   заголовок над открыткой — 09.10.2026 (просьба пользователя:
 *   не помещался и делал карточку грязной). Только анимация открытки,
 *   название — в aria-label ссылки;
 * - вместо кнопки «Редактировать» — тёмный кружок со стрелкой в левом
 *   нижнем углу (08.10.2026): белая обводка из макета на светлых
 *   открытках не видна, а кнопка с подписью на каждой карточке пестрила;
 * - сердечка «в избранное», цены и рейтинга нет — у шаблонов их нет.
 *
 * Открытка — 3:4, её родная пропорция: видео без обрезки.
 * Ссылкой обёрнута вся карточка: один таб-стоп, зона нажатия — вся.
 * Наведение и фокус проявляют кружок: он становится золотым.
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
    <li className={`relative ${className}`} inert={inert || undefined}>
      <Link
        href={`/editor?template=${template.id}`}
        // Видимого заголовка нет (09.10.2026), имя ссылке — для скринридера.
        aria-label={t(template.nameKey)}
        // Фон шаблона — цвет открытки, а не оформления сайта
        // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
        style={{ backgroundColor: template.background }}
        className="group rounded-card xl:rounded-card-d flex w-full flex-col overflow-hidden transition-transform active:translate-y-px"
      >
        <span className="relative block aspect-[3/4] w-full">
          <LoopVideo
            src={template.video}
            poster={template.poster}
            className="absolute inset-0 size-full object-cover"
          />
          {/* Кружок со стрелкой вместо кнопки «Редактировать» (просьба
              пользователя 08.10.2026: кнопка на каждой карточке была
              аляповатой). Подпись не нужна: имя ссылке даёт aria-label,
              нажимается вся карточка. */}
          <span
            aria-hidden="true"
            className="bg-ink text-canvas group-hover:bg-gold group-hover:text-ink group-focus-visible:bg-gold group-focus-visible:text-ink absolute start-[10px] bottom-[10px] grid size-[36px] place-items-center rounded-full transition-colors xl:start-[14px] xl:bottom-[14px] xl:size-[44px]"
          >
            <Icon name="next" size={16} className="-rotate-45" />
          </span>
        </span>
      </Link>
      {/* Корона — снаружи ссылки: у той overflow-hidden, а кружок
          выступает за правый край (09.10.2026). Выступ меньше
          промежутка между карточками — на соседнюю не наезжает. */}
      {isPremium(template.id) ? (
        <CrownBadge
          edge
          className="pointer-events-none absolute -end-[10px] top-[14px] z-10 xl:-end-[14px] xl:top-[20px]"
        />
      ) : null}
    </li>
  );
}
