"use client";

import { GroupLabel, Panel, Swatches, ToolButton } from "@/components/editor/controls";
import type { EditorSelection } from "@/components/editor/useCardEditor";
import { pillVisual } from "@/components/site/pill";
import { type ColorToken, FONT_ROLES, type FontRole, LIMITS } from "@/lib/editor/document";
import { t, type TextKey } from "@/lib/i18n";

const FONT_NAME: Record<FontRole, TextKey> = {
  display: "editor.font.display",
  ui: "editor.font.ui",
};

/**
 * Панель свойств выделенного слоя. Шаг 4 гайда: цвет, размер шрифта
 * и удаление; плюс выбор из двух шрифтов DESIGN.md. Пока ничего
 * не выделено — пустое состояние с подсказкой.
 */
export function Inspector({
  selection,
  onFill,
  onFontSize,
  onFont,
  onRemove,
  className,
}: {
  selection: EditorSelection | null;
  onFill: (token: ColorToken) => void;
  onFontSize: (size: number) => void;
  onFont: (role: FontRole) => void;
  onRemove: () => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-props" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-props" labelKey="editor.props" />

      {selection === null ? (
        <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
          {t("editor.props.empty")}
        </p>
      ) : (
        <>
          <GroupLabel id="editor-color" labelKey="editor.props.color" />
          <Swatches labelledBy="editor-color" value={selection.fill} onChange={onFill} />

          {selection.fontSize === null ? null : (
            <>
              <label className="flex flex-col gap-[8px]">
                <span className="font-ui caps text-badge xl:text-badge-d text-muted font-medium">
                  {t("editor.props.fontSize")}
                </span>
                <span className="flex items-center gap-[12px]">
                  <input
                    type="range"
                    min={LIMITS.fontSize.min}
                    max={LIMITS.fontSize.max}
                    value={selection.fontSize}
                    onChange={(event) => onFontSize(Number(event.target.value))}
                    className="min-h-tap accent-gold min-w-0 flex-1"
                  />
                  <output className="font-ui text-note xl:text-note-d text-ink w-[3ch] text-right tabular-nums">
                    {Math.round(selection.fontSize)}
                  </output>
                </span>
              </label>

              <GroupLabel id="editor-font" labelKey="editor.props.font" />
              <div role="group" aria-labelledby="editor-font" className="flex flex-wrap gap-[8px]">
                {FONT_ROLES.map((role) => {
                  const active = selection.font === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onFont(role)}
                      className="pill-tap"
                    >
                      <span className={pillVisual(active)}>{t(FONT_NAME[role])}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <ToolButton icon="trash" labelKey="editor.props.delete" onClick={onRemove} />
        </>
      )}
    </Panel>
  );
}
