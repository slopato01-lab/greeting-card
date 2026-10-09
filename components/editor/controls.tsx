"use client";

import { type ChangeEvent, type ReactNode, useRef, useState, useSyncExternalStore } from "react";

import { Icon } from "@/components/Icon";
import { type Color, parseColor, type HexColor } from "@/lib/editor/document";
import {
  ALL_SWATCHES,
  HUES,
  MAIN_SWATCHES,
  PALETTE,
  type Hue,
  type Swatch,
} from "@/lib/editor/palette";
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
  "aria-expanded": expanded,
  "aria-controls": controls,
}: {
  icon: IconName;
  labelKey: TextKey;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  /** Для кнопок, которые раскрывают панель, — каталог стикеров. */
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={expanded}
      aria-controls={controls}
      className={[TOOL_BASE, className].filter(Boolean).join(" ")}
    >
      <Icon name={icon} size={20} className="shrink-0" />
      <span className="min-w-0 truncate">{t(labelKey)}</span>
    </button>
  );
}

/**
 * Квадратная кнопка-переключатель с иконкой: жирный, курсив,
 * выравнивание. Подпись — для скринридера и всплывающей подсказки.
 * Включённая — белая, как выбранная пилюля.
 */
export function IconToggle({
  icon,
  labelKey,
  pressed,
  onClick,
}: {
  icon: IconName;
  labelKey: TextKey;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={t(labelKey)}
      title={t(labelKey)}
      onClick={onClick}
      className={[
        "size-tap rounded-inner flex items-center justify-center border transition-colors",
        pressed
          ? "bg-ink border-ink text-canvas"
          : "border-line text-ink hover:bg-raised hover:border-muted active:bg-line",
      ].join(" ")}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

/** Кнопка, которая открывает скрытое поле выбора файла. */
export function FileButton({
  icon,
  labelKey,
  accept,
  disabled,
  onFile,
}: {
  icon: IconName;
  labelKey: TextKey;
  accept: string;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем, чтобы повторный выбор того же файла снова сработал.
    event.target.value = "";
    if (file !== undefined) onFile(file);
  };
  return (
    <>
      <ToolButton
        icon={icon}
        labelKey={labelKey}
        disabled={disabled}
        onClick={() => input.current?.click()}
      />
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onChange}
      />
    </>
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

const LABEL = "font-ui caps text-badge xl:text-badge-d text-muted font-medium";

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

/** Ползунок с подписью и значением справа. */
export function Slider({
  labelKey,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  labelKey: TextKey;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-[4px]">
      <span className={LABEL}>{t(labelKey)}</span>
      <span className="flex items-center gap-[12px]">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-h-tap accent-gold-deep min-w-0 flex-1"
        />
        <output className="font-ui text-note xl:text-note-d text-ink w-[5ch] text-right tabular-nums">
          {display}
        </output>
      </span>
    </label>
  );
}

/** Выпадающий список. Системный: на телефоне он открывается удобным колесом. */
export function SelectField<T extends string>({
  labelKey,
  value,
  options,
  optionLabel,
  onChange,
}: {
  labelKey: TextKey;
  value: T;
  options: readonly T[];
  optionLabel: (option: T) => TextKey;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className={LABEL}>{t(labelKey)}</span>
      <select
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option === event.target.value);
          if (next !== undefined) onChange(next);
        }}
        className="font-ui text-note xl:text-note-d text-ink bg-raised border-line rounded-inner min-h-tap hover:border-muted w-full border px-[12px] transition-colors"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t(optionLabel(option))}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Палитра ─────────────────────────────────────────────────

const HUE_NAME: Record<Hue, TextKey> = {
  red: "editor.hue.red",
  orange: "editor.hue.orange",
  yellow: "editor.hue.yellow",
  green: "editor.hue.green",
  teal: "editor.hue.teal",
  blue: "editor.hue.blue",
  purple: "editor.hue.purple",
  pink: "editor.hue.pink",
  neutral: "editor.hue.neutral",
};

function swatchName({ hue, shade }: Swatch): string {
  return `${t(HUE_NAME[hue])}, ${t("editor.color.shade")} ${shade + 1}`;
}

/**
 * Недавние свои цвета — удобство одного браузера, не данные открытки:
 * поэтому localStorage, без синхронизации. Читается через
 * useSyncExternalStore: на сборке хранилища нет.
 */
const RECENT_KEY = "otkrytochka.editor.recent";
const RECENT_MAX = 8;
const recentListeners = new Set<() => void>();
let recentCache: { raw: string | null; list: HexColor[] } = { raw: null, list: [] };

function readRecent(): HexColor[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(RECENT_KEY);
  } catch {
    return recentCache.list;
  }
  if (raw === recentCache.raw) return recentCache.list;
  let list: HexColor[] = [];
  try {
    const parsed: unknown = raw === null ? [] : JSON.parse(raw);
    if (Array.isArray(parsed)) {
      list = parsed
        .map((item) => parseColor(item))
        .filter((c): c is HexColor => c !== null && c.startsWith("#"))
        .slice(0, RECENT_MAX);
    }
  } catch {
    list = [];
  }
  recentCache = { raw, list };
  return list;
}

function pushRecent(color: HexColor) {
  const next = [color, ...readRecent().filter((c) => c !== color)].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Негде хранить — просто не запоминаем.
  }
  recentListeners.forEach((listener) => listener());
}

function subscribeRecent(listener: () => void) {
  recentListeners.add(listener);
  return () => recentListeners.delete(listener);
}

const NO_RECENT: HexColor[] = [];

/** Кружок цвета. Видимые 32px внутри зоны нажатия 44px. */
function SwatchButton({
  color,
  label,
  selected,
  onClick,
}: {
  color: HexColor;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="group min-h-tap min-w-tap flex items-center justify-center rounded-full"
    >
      <span
        // Цвет — данные открытки, а не оформление сайта, поэтому
        // инлайном: docs/DESIGN.md, «Цвета содержимого открытки».
        style={{ backgroundColor: color }}
        className={[
          "border-line block size-[32px] rounded-full border transition-transform",
          "group-hover:scale-110 group-active:scale-95",
          selected ? "outline-ink outline-2 outline-offset-2 outline-solid" : "",
        ].join(" ")}
      />
    </button>
  );
}

/**
 * Выбор цвета: двенадцать основных, по кнопке — все 45, ряд недавних
 * своих и системный выбор любого цвета. Все кружки — кнопки с названием
 * цвета для скринридера и aria-pressed у выбранного.
 *
 * `byHue` — вид для вкладки «Фон» (09.10.2026, просьба пользователя):
 * все цвета сразу, семействами друг за другом — строка с названием
 * («Красный», «Синий»…) и пять оттенков от светлого к тёмному.
 */
export function ColorPicker({
  labelledBy,
  value,
  onChange,
  byHue = false,
}: {
  labelledBy: string;
  value: Color;
  onChange: (color: Color) => void;
  byHue?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const recent = useSyncExternalStore(subscribeRecent, readRecent, () => NO_RECENT);
  const swatches = expanded ? ALL_SWATCHES : MAIN_SWATCHES;
  const custom = value.startsWith("#") ? value : "#ffffff";

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex flex-col gap-[8px]">
      {byHue ? (
        <ul role="list" className="flex flex-col gap-[8px]">
          {HUES.map((hue) => (
            <li key={hue} className="flex flex-col">
              {/* Название над оттенками, а не слева: иначе пять кружков
                  не влезают в узкую панель и пятый уходит на новую строку. */}
              <span className="font-ui text-note xl:text-note-d text-ink">
                {t(hue === "neutral" ? "editor.color.row.neutral" : HUE_NAME[hue])}
              </span>
              <div className="flex flex-wrap">
                {PALETTE[hue].map((color, shade) => (
                  <SwatchButton
                    key={color}
                    color={color}
                    label={swatchName({ color, hue, shade })}
                    selected={color === value}
                    onClick={() => onChange(color)}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap">
        {(byHue ? [] : swatches).map((swatch) => (
          <SwatchButton
            key={swatch.color}
            color={swatch.color}
            label={swatchName(swatch)}
            selected={swatch.color === value}
            onClick={() => onChange(swatch.color)}
          />
        ))}

        <label
          title={t("editor.color.custom")}
          className="group min-h-tap min-w-tap relative flex cursor-pointer items-center justify-center rounded-full focus-within:outline-2 focus-within:outline-offset-2"
        >
          <span className="border-line text-ink group-hover:bg-raised flex size-[32px] items-center justify-center rounded-full border transition-colors">
            <Icon name="picker" size={18} />
          </span>
          <input
            type="color"
            aria-label={t("editor.color.custom")}
            value={custom}
            onChange={(event) => {
              const color = parseColor(event.target.value);
              if (color !== null) onChange(color);
            }}
            onBlur={(event) => {
              const color = parseColor(event.target.value);
              if (color !== null && color.startsWith("#")) pushRecent(color as HexColor);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      {recent.length === 0 ? null : (
        <div className="flex flex-col gap-[4px]">
          <span className={LABEL}>{t("editor.color.recent")}</span>
          <div className="flex flex-wrap">
            {recent.map((color) => (
              <SwatchButton
                key={color}
                color={color}
                label={color}
                selected={color === value}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>
      )}

      {byHue ? null : (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="font-ui text-note xl:text-note-d text-body hover:text-ink min-h-tap self-start underline underline-offset-4 transition-colors"
        >
          {t(expanded ? "editor.color.less" : "editor.color.more")}
        </button>
      )}
    </div>
  );
}
