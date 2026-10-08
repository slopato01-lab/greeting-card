"use client";

import { GroupLabel, Panel } from "@/components/editor/controls";
import { TEMPLATES, type TemplateId } from "@/lib/editor/templates";
import { t } from "@/lib/i18n";

/**
 * Вкладка «Шаблоны»: переключение между анимированными шаблонами.
 *
 * Нажатие сразу открывает выбранный шаблон — без вопроса «Заменить?»:
 * у каждого шаблона свой черновик (useCardEditor), поэтому правки
 * текущего не теряются, а сами шаблоны не меняются — вернёшься,
 * и там твои правки поверх нетронутого образца.
 *
 * Текущий шаблон подсвечен золотой рамкой и помечен aria-current.
 *
 * Превью рисует сам редактор (невидимый StaticCanvas), поэтому они
 * появляются, когда холст готов; до того — плашки --photo того же
 * размера, чтобы панель не прыгала.
 */
export function TemplatesPanel({
  disabled,
  current,
  previews,
  onSelect,
  className,
}: {
  disabled: boolean;
  current: TemplateId | null;
  previews: Partial<Record<TemplateId, string>>;
  onSelect: (id: TemplateId) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-templates" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-templates" labelKey="editor.templates" />

      <ul role="list" className="grid grid-cols-3 gap-[8px] xl:grid-cols-2">
        {TEMPLATES.map((template) => {
          const preview = previews[template.id];
          const active = template.id === current;
          return (
            <li key={template.id}>
              <button
                type="button"
                disabled={disabled || active}
                aria-current={active || undefined}
                onClick={() => onSelect(template.id)}
                className="group rounded-inner flex w-full flex-col gap-[6px] text-left disabled:cursor-default"
              >
                <span
                  className={[
                    "rounded-inner bg-photo block aspect-[3/4] w-full overflow-hidden border-2 transition-colors",
                    active ? "border-gold" : "group-hover:border-muted border-transparent",
                  ].join(" ")}
                >
                  {preview === undefined ? null : (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL с холста, оптимизатор не нужен
                    <img src={preview} alt="" className="block h-full w-full" />
                  )}
                </span>
                <span
                  className={`font-ui text-note xl:text-note-d ${active ? "text-gold" : "text-ink"}`}
                >
                  {t(template.label)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
