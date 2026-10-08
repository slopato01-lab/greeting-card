import type { ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { COLOR_TOKENS, type ColorToken } from "@/lib/editor/document";
import { type TextKey, t } from "@/lib/i18n";
import type { IconName } from "@/lib/icons/generated";

/**
 * Мелкие элементы управления редактора. Состояний в макете нет —
 * собраны от токенов по образцу GhostButton: обводка --line,
 * наведение --raised, нажатие --line, выключено --muted. Фокус общий
 * из globals.css. Высота не меньше --spacing-tap.
 */

const TOOL_BASE =
  "font-ui text-note xl:text-note-d text-ink border-line min-h-tap flex items-center gap-[10px] " +
  "rounded-full border px-[16px] font-medium transition-colors select-none " +
  "hover:bg-raised hover:border-muted active:bg-line " +
  "disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-line";

export function ToolButton({
  icon,
  labelKey,
  onClick,
  disabled = false,
  className,
}: {
  icon: IconName;
  labelKey: TextKey;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[TOOL_BASE, className].filter(Boolean).join(" ")}
    >
      <Icon name={icon} size={20} className="shrink-0" />
      <span className="min-w-0 truncate">{t(labelKey)}</span>
    </button>
  );
}

/** Подпись группы: капсом, как метки на сайте. */
export function GroupLabel({ id, labelKey }: { id: string; labelKey: TextKey }) {
  return (
    <h3 id={id} className="font-ui caps text-badge xl:text-badge-d text-muted font-medium">
      {t(labelKey)}
    </h3>
  );
}

export function Panel({
  labelledBy,
  children,
  className,
}: {
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={[
        "rounded-card xl:rounded-card-d bg-surface flex flex-col gap-[16px] p-[16px] xl:p-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}

/** Классы заливки — строками целиком, иначе Tailwind их не найдёт. */
const SWATCH_FILL: Record<ColorToken, string> = {
  paper: "bg-paper",
  body: "bg-body",
  muted: "bg-muted",
  raised: "bg-raised",
  canvas: "bg-canvas",
  gold: "bg-gold",
};

const SWATCH_NAME: Record<ColorToken, TextKey> = {
  paper: "editor.color.paper",
  body: "editor.color.body",
  muted: "editor.color.muted",
  raised: "editor.color.raised",
  canvas: "editor.color.canvas",
  gold: "editor.color.gold",
};

/**
 * Палитра — только токены из docs/DESIGN.md, свободного выбора цвета
 * нет. Каждый кружок — кнопка с названием цвета для скринридера
 * и aria-pressed у выбранного. Зазора между кнопками нет: видимый
 * кружок 32px внутри зоны нажатия 44px, разрыв 12px получается сам. Выбранный обведён 2px --ink: золотом
 * нельзя, золото само есть в палитре.
 */
export function Swatches({
  labelledBy,
  value,
  onChange,
}: {
  labelledBy: string;
  value: ColorToken;
  onChange: (token: ColorToken) => void;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap">
      {COLOR_TOKENS.map((token) => {
        const selected = token === value;
        return (
          <button
            key={token}
            type="button"
            aria-pressed={selected}
            aria-label={t(SWATCH_NAME[token])}
            title={t(SWATCH_NAME[token])}
            onClick={() => onChange(token)}
            className="group min-h-tap min-w-tap flex items-center justify-center rounded-full"
          >
            <span
              className={[
                "border-line block size-[32px] rounded-full border transition-transform",
                "group-hover:scale-110 group-active:scale-95",
                selected ? "outline-ink outline-2 outline-offset-2 outline-solid" : "",
                SWATCH_FILL[token],
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
