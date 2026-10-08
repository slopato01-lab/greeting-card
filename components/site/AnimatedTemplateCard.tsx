import Link from "next/link";

import { Icon } from "@/components/Icon";
import { LoopVideo } from "@/components/site/LoopVideo";
import type { AnimatedTemplate } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Карточка анимированного шаблона редактора. Разметка и состояния —
 * как у TemplateCard (одна сетка, одна лента), отличаются картинка
 * и адрес:
 *
 * - вместо обложки — зацикленная анимация шаблона (LoopVideo);
 *   открытка 3:4 вписана целиком, поля — цвета её фона;
 * - рядом с поводом — метка «Анимация»;
 * - ссылка ведёт сразу в редактор с этим шаблоном: страницы шаблона
 *   с игрой и сюрпризом у таких открыток нет, смотреть там нечего.
 */
export function AnimatedTemplateCard({
  template,
  className = "",
}: {
  template: AnimatedTemplate;
  className?: string;
}) {
  return (
    <li className={className}>
      <Link
        href={`/editor?template=${template.id}`}
        className="group rounded-card xl:rounded-card-d bg-surface border-surface hover:border-line flex h-full flex-col border p-[8px] transition-colors active:translate-y-px xl:p-[10px]"
      >
        <div
          aria-hidden="true"
          // Фон шаблона — цвет открытки, а не оформления сайта
          // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
          style={{ backgroundColor: template.background }}
          className="rounded-inner xl:rounded-inner-d relative h-[260px] shrink-0 overflow-hidden xl:h-[300px]"
        >
          <LoopVideo
            src={template.video}
            poster={template.poster}
            className="absolute inset-0 size-full object-contain"
          />
          <span className="border-canvas text-canvas bg-paper group-hover:bg-canvas group-hover:text-paper absolute start-[12px] top-[12px] flex size-[40px] items-center justify-center rounded-full border transition-colors">
            <Icon name="next" size={18} className="-rotate-45" />
          </span>
        </div>

        <div className="flex flex-1 flex-col px-[10px] pt-[16px] pb-[10px] xl:px-[12px]">
          <span className="flex flex-wrap gap-[6px]">
            <span className="font-ui caps text-tpl-action xl:text-tpl-action-d bg-gold text-canvas rounded-full px-[10px] py-[3px] font-medium">
              {t(template.filter)}
            </span>
            <span className="font-ui caps text-tpl-action xl:text-tpl-action-d bg-paper text-canvas rounded-full px-[10px] py-[3px] font-medium">
              {t("catalog.animated")}
            </span>
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
