"use client";

import { useEffect, useRef, useState } from "react";

import { CrownBadge } from "@/components/CrownBadge";
import { GroupLabel, Panel, SelectField } from "@/components/editor/controls";
import { type CatalogFilter, templateFilter } from "@/lib/catalog/templates";
import { isPremium } from "@/lib/editor/premium";
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
 * Шаблоны «по подписке» помечены жёлтой короной (CrownBadge).
 *
 * Текущий шаблон подсвечен золотой рамкой и помечен aria-current.
 *
 * Сверху — выпадающий список «Тема» (09.10.2026, просьба пользователя):
 * «Все» и поводы, у которых есть шаблоны, в порядке шаблонов. Поводы
 * те же, что в каталоге на главной (templateFilter).
 *
 * Превью рисует сам редактор (невидимый StaticCanvas), поэтому они
 * появляются, когда холст готов; до того — плашки --photo того же
 * размера, чтобы панель не прыгала.
 *
 * На мобильном панель стоит под открыткой, и 21 шаблон растягивал
 * страницу. С 08.10.2026 там сначала видно три, остальные — по кнопке
 * «Смотреть ещё» без подложки (просьба пользователя). Скрытые прячутся
 * классом до 1280: на десктопе панель — своя колонка, там видны все.
 */
const COLLAPSED = 3;

const ALL = "catalog.filter.1";

type Theme = CatalogFilter | typeof ALL;

/** «Все» и поводы, у которых есть хотя бы один шаблон. */
const THEMES: readonly Theme[] = [
  ALL,
  ...new Set(TEMPLATES.flatMap((template) => templateFilter(template.id) ?? [])),
];

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
  const [expanded, setExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>(ALL);
  const shown = TEMPLATES.filter(
    (template) => theme === ALL || templateFilter(template.id) === theme,
  );
  const listRef = useRef<HTMLUListElement>(null);
  const opened = useRef(false);

  // Кнопка «Смотреть ещё» исчезает при нажатии — фокус уходит на первый
  // из открывшихся шаблонов, иначе с клавиатуры он терялся бы в body.
  useEffect(() => {
    if (!opened.current) return;
    opened.current = false;
    const buttons = Array.from(listRef.current?.querySelectorAll("button") ?? []);
    buttons
      .slice(COLLAPSED)
      .find((button) => !button.disabled)
      ?.focus();
  }, [expanded]);
  return (
    <Panel labelledBy="editor-templates" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-templates" labelKey="editor.templates" />

      <SelectField
        labelKey="editor.templates.theme"
        value={theme}
        options={THEMES}
        optionLabel={(option) => option}
        onChange={setTheme}
      />

      <ul ref={listRef} role="list" className="grid grid-cols-3 gap-[8px] xl:grid-cols-2">
        {shown.map((template, index) => {
          const preview = previews[template.id];
          const active = template.id === current;
          return (
            <li
              key={template.id}
              className={!expanded && index >= COLLAPSED ? "max-xl:hidden" : ""}
            >
              <button
                type="button"
                disabled={disabled || active}
                aria-current={active || undefined}
                onClick={() => onSelect(template.id)}
                className="group rounded-inner flex w-full flex-col gap-[6px] text-left disabled:cursor-default"
              >
                <span
                  className={[
                    "rounded-inner bg-photo relative block aspect-[3/4] w-full overflow-hidden border-2 transition-colors",
                    active ? "border-gold-deep" : "group-hover:border-muted border-transparent",
                  ].join(" ")}
                >
                  {preview === undefined ? null : (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL с холста, оптимизатор не нужен
                    <img src={preview} alt="" className="block h-full w-full" />
                  )}
                  {isPremium(template.id) ? (
                    <CrownBadge className="absolute end-[6px] top-[6px]" />
                  ) : null}
                </span>
                <span
                  className={`font-ui text-note xl:text-note-d ${active ? "text-gold-deep" : "text-ink"}`}
                >
                  {t(template.label)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {expanded || shown.length <= COLLAPSED ? null : (
        <button
          type="button"
          onClick={() => {
            opened.current = true;
            setExpanded(true);
          }}
          className="font-ui text-note text-ink hover:text-gold-deep active:text-gold-deep min-h-tap self-center px-[12px] underline underline-offset-4 transition-colors xl:hidden"
        >
          {t("editor.templates.more")}
        </button>
      )}
    </Panel>
  );
}
