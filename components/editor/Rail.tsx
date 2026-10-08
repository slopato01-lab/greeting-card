"use client";

import { type KeyboardEvent, useRef } from "react";

import { Icon } from "@/components/Icon";
import { t, type TextKey } from "@/lib/i18n";
import type { IconName } from "@/lib/icons/generated";

/**
 * Рейка вкладок слева — как боковая панель инструментов Canva.
 * На десктопе вертикальная колонка иконок с подписями, на мобильном —
 * горизонтальный ряд над панелью.
 *
 * Это вкладки в смысле ARIA: role="tablist", у каждой aria-selected
 * и aria-controls на панель. Клавиатура — по шаблону WAI-ARIA:
 * в рейке один таб-стоп, стрелки ходят между вкладками, Home/End —
 * к первой и последней.
 */
/**
 * Вкладки «Шаблоны» нет (с 08.10.2026): главный шаблон выбирают
 * в каталоге, и в редакторе его не меняют — у каждого свой черновик.
 */
export const EDITOR_TABS = [
  "elements",
  "text",
  "photo",
  "background",
  "edit",
  "animation",
  "file",
] as const;
export type EditorTab = (typeof EDITOR_TABS)[number];

const TAB_INFO: Record<EditorTab, { icon: IconName; label: TextKey }> = {
  elements: { icon: "tabElements", label: "editor.tab.elements" },
  text: { icon: "text", label: "editor.tab.text" },
  photo: { icon: "photo", label: "editor.tab.photo" },
  background: { icon: "tabBackground", label: "editor.tab.background" },
  edit: { icon: "tabEdit", label: "editor.tab.edit" },
  animation: { icon: "tabAnimation", label: "editor.tab.animation" },
  file: { icon: "tabFile", label: "editor.tab.file" },
};

export const tabId = (tab: EditorTab) => `editor-tab-${tab}`;
export const panelId = (tab: EditorTab) => `editor-panel-${tab}`;

export function Rail({
  tab,
  onTab,
  className,
}: {
  tab: EditorTab;
  onTab: (tab: EditorTab) => void;
  className?: string;
}) {
  const buttons = useRef(new Map<EditorTab, HTMLButtonElement>());

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = EDITOR_TABS.indexOf(tab);
    const step: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    let next: number | null = null;
    if (event.key in step)
      next = (index + (step[event.key] ?? 0) + EDITOR_TABS.length) % EDITOR_TABS.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = EDITOR_TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const target = EDITOR_TABS[next];
    if (target === undefined) return;
    onTab(target);
    buttons.current.get(target)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t("editor.tabs")}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
      className={[
        "carousel gap-[4px] xl:m-0 xl:flex-col xl:gap-[2px] xl:overflow-y-auto xl:p-[8px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {EDITOR_TABS.map((item) => {
        const { icon, label } = TAB_INFO[item];
        const selected = item === tab;
        return (
          <button
            key={item}
            ref={(node) => {
              if (node === null) buttons.current.delete(item);
              else buttons.current.set(item, node);
            }}
            id={tabId(item)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(item)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTab(item)}
            className={[
              "rounded-inner font-ui text-badge min-h-tap flex shrink-0 flex-col items-center justify-center gap-[4px] px-[10px] py-[8px] transition-colors xl:w-full xl:px-[4px]",
              selected ? "bg-raised text-ink" : "text-muted hover:text-ink hover:bg-surface",
            ].join(" ")}
          >
            <Icon name={icon} size={22} />
            <span>{t(label)}</span>
          </button>
        );
      })}
    </div>
  );
}
