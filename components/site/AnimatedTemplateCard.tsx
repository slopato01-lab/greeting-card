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
 * сверху метка и короткий заголовок, внизу поверх — кнопка. Метки
 * повода у нас нет с 08.10.2026 — плашки делали ряд грязным.
 *
 * Отличия от макета, и почему:
 * - метка и заголовок стоят в полосе над открыткой, на её же
 *   однотонном фоне, а не поверх изображения: у открытки сверху свой
 *   заголовок, и плашки поверх его закрывали; по docs/DESIGN.md
 *   («Работа с изображениями») текст на голом изображении не лежит;
 * - вместо кнопки «Редактировать» — тёмный кружок со стрелкой в левом
 *   нижнем углу (08.10.2026): белая обводка из макета на светлых
 *   открытках не видна, а кнопка с подписью на каждой карточке пестрила;
 * - сердечка «в избранное», цены и рейтинга нет — у шаблонов их нет.
 *
 * Открытка под полосой — 3:4, её родная пропорция: видео без обрезки.
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
    <li className={className} inert={inert || undefined}>
      <Link
        href={`/editor?template=${template.id}`}
        // Фон шаблона — цвет открытки, а не оформления сайта
        // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
        style={{ backgroundColor: template.background }}
        className="group rounded-card xl:rounded-card-d flex w-full flex-col overflow-hidden transition-transform active:translate-y-px"
      >
        {/* Шапка карточки — на однотонном фоне открытки: короткий
            заголовок. Метку повода сняли 08.10.2026 (просьба пользователя:
            плашки «День рождения», «14 февраля» делали ряд грязным). Тёмный текст на светлом фоне шаблона,
            открытку под собой не закрывает. */}
        <span className="flex flex-col items-start gap-[6px] px-[8px] pt-[8px] pb-[4px] md:px-[12px] md:pt-[12px] xl:gap-[6px] xl:px-[10px] xl:pt-[10px]">
          <span
            className={`font-display text-note xl:text-note-d max-w-full truncate font-medium tracking-tight ${
              template.dark ? "text-canvas" : "text-ink"
            }`}
          >
            {t(template.nameKey)}
          </span>
        </span>

        <span className="relative block aspect-[3/4] w-full">
          <LoopVideo
            src={template.video}
            poster={template.poster}
            className="absolute inset-0 size-full object-cover"
          />
          {isPremium(template.id) ? (
            <CrownBadge className="absolute end-[10px] top-[10px] xl:end-[14px] xl:top-[14px]" />
          ) : null}
          {/* Кружок со стрелкой вместо кнопки «Редактировать» (просьба
              пользователя 08.10.2026: кнопка на каждой карточке была
              аляповатой). Подпись не нужна: имя ссылке даёт заголовок
              карточки, нажимается вся карточка. */}
          <span
            aria-hidden="true"
            className="bg-ink text-canvas group-hover:bg-gold group-hover:text-ink group-focus-visible:bg-gold group-focus-visible:text-ink absolute start-[10px] bottom-[10px] grid size-[36px] place-items-center rounded-full transition-colors xl:start-[14px] xl:bottom-[14px] xl:size-[44px]"
          >
            <Icon name="next" size={16} className="-rotate-45" />
          </span>
        </span>
      </Link>
    </li>
  );
}
