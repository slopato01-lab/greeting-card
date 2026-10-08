"use client";

import { useState } from "react";

import { GroupLabel, Panel } from "@/components/editor/controls";
import { TEMPLATES, type TemplateId } from "@/lib/editor/templates";
import { t } from "@/lib/i18n";

/**
 * Готовые шаблоны по образцу design/пример анимации и дизайна.MP4.
 *
 * Превью рисует сам редактор (useCardEditor, невидимый StaticCanvas),
 * поэтому они появляются, когда холст готов; до того — плашки
 * --photo того же размера, чтобы панель не прыгала.
 *
 * Шаблон заменяет всё на холсте. Если там что-то есть — переспрашиваем
 * прямо в панели: системных диалогов на сайте нет, а молча стереть
 * чужую работу хуже, чем лишний клик.
 */
export function TemplatesPanel({
  disabled,
  previews,
  hasContent,
  onApply,
  className,
}: {
  disabled: boolean;
  previews: Partial<Record<TemplateId, string>>;
  hasContent: () => boolean;
  onApply: (id: TemplateId) => void;
  className?: string;
}) {
  const [pending, setPending] = useState<TemplateId | null>(null);

  const pick = (id: TemplateId) => {
    if (hasContent()) setPending(id);
    else onApply(id);
  };

  return (
    <Panel labelledBy="editor-templates" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-templates" labelKey="editor.templates" />

      <ul role="list" className="grid grid-cols-4 gap-[8px] xl:grid-cols-2">
        {TEMPLATES.map((template) => {
          const preview = previews[template.id];
          return (
            <li key={template.id}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={pending === template.id}
                onClick={() => pick(template.id)}
                className="group rounded-inner flex w-full flex-col gap-[6px] text-left disabled:cursor-not-allowed"
              >
                <span
                  className={[
                    "rounded-inner bg-photo block aspect-[3/4] w-full overflow-hidden border-2 transition-colors",
                    pending === template.id
                      ? "border-gold"
                      : "group-hover:border-muted border-transparent",
                  ].join(" ")}
                >
                  {preview === undefined ? null : (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL с холста, оптимизатор не нужен
                    <img src={preview} alt="" className="block h-full w-full" />
                  )}
                </span>
                <span className="font-ui text-note xl:text-note-d text-ink">
                  {t(template.label)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {pending === null ? null : (
        <div role="alert" className="bg-raised rounded-inner flex flex-col gap-[12px] p-[12px]">
          <p className="font-ui text-note xl:text-note-d text-ink leading-[1.4]">
            {t("editor.templates.replace")}
          </p>
          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={() => {
                onApply(pending);
                setPending(null);
              }}
              className="font-ui text-note bg-gold text-canvas min-h-tap rounded-full px-[18px] font-medium transition-colors hover:bg-[color-mix(in_oklab,var(--color-gold)_88%,var(--color-canvas))]"
            >
              {t("editor.templates.confirm")}
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="font-ui text-note text-ink border-line hover:bg-line min-h-tap rounded-full border px-[18px] font-medium transition-colors"
            >
              {t("editor.templates.cancel")}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
