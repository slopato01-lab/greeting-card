"use client";

import {
  ColorPicker,
  FileButton,
  GroupLabel,
  IconToggle,
  Panel,
  SelectField,
  Slider,
  ToolButton,
} from "@/components/editor/controls";
import {
  type Animation,
  animInFor,
  animLoopFor,
  ANIM_OUT,
  type AnimIn,
  type AnimLoop,
  type AnimOut,
  type Color,
  type FontId,
  type Layer,
  LIMITS,
  type TextAlign,
} from "@/lib/editor/document";
import { FONT_GROUPS, FONTS, type FontGroup, type FontInfo } from "@/lib/editor/fonts";
import type { TextStyle } from "@/lib/editor/fabric";
import { stickerInfo } from "@/lib/editor/stickers";
import { pillVisual } from "@/components/site/pill";
import { type TextKey, t } from "@/lib/i18n";
import type { IconName } from "@/lib/icons/generated";

const GROUP_NAME: Record<FontGroup, TextKey> = {
  sans: "editor.fontGroup.sans",
  serif: "editor.fontGroup.serif",
  accent: "editor.fontGroup.accent",
  hand: "editor.fontGroup.hand",
  mono: "editor.fontGroup.mono",
};

const ALIGNS: { value: TextAlign; icon: IconName; label: TextKey }[] = [
  { value: "left", icon: "alignLeft", label: "editor.align.left" },
  { value: "center", icon: "alignCenter", label: "editor.align.center" },
  { value: "right", icon: "alignRight", label: "editor.align.right" },
];

/** Семейство для превью названия шрифта. Шрифты сайта — из его переменных. */
function previewFamily(font: FontInfo): string {
  if (font.family !== null) return font.family;
  return font.id === "unbounded" ? "var(--font-display)" : "var(--font-ui)";
}

const seconds = (value: number) => `${value.toFixed(1)} ${t("editor.unit.seconds")}`;

/**
 * Список шрифтов по группам. Каждое название написано своим шрифтом:
 * выбирать шрифт по имени без образца бесполезно. С 09.10.2026 список
 * без своей прокрутки — видны все шрифты, прокручивается панель. Цена — браузер
 * скачивает файлы шрифтов, когда список впервые показан, то есть
 * только на /editor и только когда выделен текст.
 */
function FontList({ value, onChange }: { value: FontId; onChange: (font: FontId) => void }) {
  return (
    <div
      role="group"
      aria-labelledby="editor-font"
      className="border-line rounded-inner border p-[4px]"
    >
      {FONT_GROUPS.map((group) => (
        <div key={group} className="flex flex-col">
          <span className="font-ui caps text-badge text-muted px-[12px] pt-[10px] pb-[2px]">
            {t(GROUP_NAME[group])}
          </span>
          {FONTS.filter((font) => font.group === group).map((font) => {
            const active = font.id === value;
            return (
              <button
                key={font.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(font.id)}
                // Шрифт — выбор пользователя, а не оформление сайта:
                // образец обязан быть написан именно им.
                style={{ fontFamily: previewFamily(font) }}
                className={[
                  "rounded-inner min-h-tap text-sub px-[12px] text-left transition-colors",
                  active ? "bg-ink text-canvas" : "text-ink hover:bg-raised active:bg-line",
                ].join(" ")}
              >
                {t(font.label)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AnimationFields({
  layer,
  onChange,
}: {
  layer: Layer;
  onChange: (change: Partial<Animation>) => void;
}) {
  const { anim } = layer;
  return (
    <>
      <GroupLabel id="editor-anim" labelKey="editor.anim" />

      <SelectField<AnimIn>
        labelKey="editor.anim.in"
        value={anim.in}
        options={animInFor(layer.kind)}
        optionLabel={(option) => `editor.anim.in.${option}`}
        onChange={(value) => onChange({ in: value })}
      />
      {anim.in === "none" ? null : (
        <>
          <Slider
            labelKey="editor.anim.delay"
            value={anim.delay}
            min={LIMITS.delay.min}
            max={10}
            step={0.1}
            display={seconds(anim.delay)}
            onChange={(delay) => onChange({ delay })}
          />
          <Slider
            labelKey="editor.anim.inDuration"
            value={anim.inDuration}
            min={0.2}
            max={3}
            step={0.1}
            display={seconds(anim.inDuration)}
            onChange={(inDuration) => onChange({ inDuration })}
          />
        </>
      )}

      <SelectField<AnimLoop>
        labelKey="editor.anim.loop"
        value={anim.loop}
        options={animLoopFor(layer.kind)}
        optionLabel={(option) => `editor.anim.loop.${option}`}
        onChange={(value) => onChange({ loop: value })}
      />
      {/* Медленный наезд идёт весь показ целиком — циклов у него нет. */}
      {anim.loop === "none" || anim.loop === "kenburns" ? null : (
        <Slider
          labelKey="editor.anim.loopPeriod"
          value={anim.loopPeriod}
          min={0.3}
          max={6}
          step={0.1}
          display={seconds(anim.loopPeriod)}
          onChange={(loopPeriod) => onChange({ loopPeriod })}
        />
      )}

      <SelectField<AnimOut>
        labelKey="editor.anim.out"
        value={anim.out}
        options={ANIM_OUT}
        optionLabel={(option) => `editor.anim.out.${option}`}
        onChange={(value) => onChange({ out: value })}
      />
      {anim.out === "none" ? null : (
        <Slider
          labelKey="editor.anim.outDuration"
          value={anim.outDuration}
          min={0.2}
          max={3}
          step={0.1}
          display={seconds(anim.outDuration)}
          onChange={(outDuration) => onChange({ outDuration })}
        />
      )}
    </>
  );
}

/**
 * Вкладка «Анимация»: появление, показ, исчезание выделенного слоя.
 * Отдельно от свойств, как кнопка «Анимировать» в Canva: свойства
 * текста и так занимают панель целиком.
 */
export function AnimationPanel({
  selected,
  playing,
  onAnimation,
  className,
}: {
  selected: Layer | null;
  playing: boolean;
  onAnimation: (change: Partial<Animation>) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-anim" {...(className === undefined ? {} : { className })}>
      {playing ? (
        <>
          <GroupLabel id="editor-anim" labelKey="editor.anim" />
          <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
            {t("editor.playing")}
          </p>
        </>
      ) : selected === null ? (
        <>
          <GroupLabel id="editor-anim" labelKey="editor.anim" />
          <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
            {t("editor.anim.empty")}
          </p>
        </>
      ) : (
        <AnimationFields layer={selected} onChange={onAnimation} />
      )}
    </Panel>
  );
}

/**
 * Панель свойств выделенного слоя. С 09.10.2026 своей вкладки нет:
 * Editor ставит её сверху вкладки слоя — «Текст», «Фото» или
 * «Элементы». Во время просмотра — сообщение, что правки на паузе.
 */
export function Inspector({
  selected,
  playing,
  onFill,
  onOpacity,
  onFontSize,
  onTextStyle,
  onRemove,
  onReplaceImage,
  onRemoveBackground,
  onMono,
  onSpacing,
  className,
}: {
  selected: Layer | null;
  playing: boolean;
  onFill: (color: Color) => void;
  onOpacity: (value: number) => void;
  onFontSize: (size: number) => void;
  onTextStyle: (style: TextStyle) => void;
  onRemove: () => void;
  onReplaceImage: (file: File) => void;
  onRemoveBackground: () => void;
  onMono: (mono: boolean) => void;
  onSpacing: (spacing: number) => void;
  className?: string;
}) {
  const sticker = selected?.kind === "sticker" ? stickerInfo(selected.sticker) : null;
  const placeholder = sticker?.placeholder === true;
  return (
    <Panel labelledBy="editor-props" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-props" labelKey="editor.props" />

      {playing ? (
        <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
          {t("editor.playing")}
        </p>
      ) : selected === null ? (
        <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
          {t("editor.props.empty")}
        </p>
      ) : (
        <>
          {/* Заглушка в шаблоне и своё фото: заменить на снимок. */}
          {placeholder || selected.kind === "image" ? (
            <div className="flex flex-col gap-[8px]">
              {placeholder ? (
                <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
                  {t(
                    sticker?.cutout === true
                      ? "editor.photo.replaceHintCutout"
                      : "editor.photo.replaceHint",
                  )}
                </p>
              ) : null}
              <FileButton
                icon="photo"
                labelKey="editor.photo.replace"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                disabled={false}
                onFile={onReplaceImage}
              />
            </div>
          ) : null}

          {selected.kind === "image" ? (
            <ToolButton icon="cutout" labelKey="editor.photo.cutout" onClick={onRemoveBackground} />
          ) : null}

          {selected.kind === "image" ? (
            <button
              type="button"
              aria-pressed={selected.mono}
              onClick={() => onMono(!selected.mono)}
              className="pill-tap self-start"
            >
              <span className={pillVisual(selected.mono)}>{t("editor.photo.mono")}</span>
            </button>
          ) : null}

          {/* Шрифты — первыми и все сразу (09.10.2026, просьба
              пользователя): выбрал текст — тут же меняешь шрифт. */}
          {selected.kind !== "text" ? null : (
            <>
              <GroupLabel id="editor-font" labelKey="editor.props.font" />
              <FontList value={selected.font} onChange={(font) => onTextStyle({ font })} />
            </>
          )}

          {selected.kind === "image" || selected.kind === "sticker" ? null : (
            <>
              <GroupLabel id="editor-color" labelKey="editor.props.color" />
              <ColorPicker labelledBy="editor-color" value={selected.fill} onChange={onFill} />
            </>
          )}

          {selected.kind !== "text" ? null : (
            <>
              <Slider
                labelKey="editor.props.fontSize"
                value={selected.fontSize}
                min={LIMITS.fontSize.min}
                max={LIMITS.fontSize.max}
                step={1}
                display={String(Math.round(selected.fontSize))}
                onChange={onFontSize}
              />

              <Slider
                labelKey="editor.props.spacing"
                value={selected.spacing}
                min={LIMITS.spacing.min}
                max={400}
                step={10}
                display={String(Math.round(selected.spacing))}
                onChange={onSpacing}
              />

              <div className="flex flex-wrap gap-x-[24px] gap-y-[12px]">
                <div className="flex flex-col gap-[8px]">
                  <GroupLabel id="editor-style" labelKey="editor.props.style" />
                  <div role="group" aria-labelledby="editor-style" className="flex gap-[4px]">
                    <IconToggle
                      icon="bold"
                      labelKey="editor.bold"
                      pressed={selected.bold}
                      onClick={() => onTextStyle({ bold: !selected.bold })}
                    />
                    <IconToggle
                      icon="italic"
                      labelKey="editor.italic"
                      pressed={selected.italic}
                      onClick={() => onTextStyle({ italic: !selected.italic })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <GroupLabel id="editor-align" labelKey="editor.props.align" />
                  <div role="group" aria-labelledby="editor-align" className="flex gap-[4px]">
                    {ALIGNS.map((align) => (
                      <IconToggle
                        key={align.value}
                        icon={align.icon}
                        labelKey={align.label}
                        pressed={selected.align === align.value}
                        onClick={() => onTextStyle({ align: align.value })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ползунок — прозрачность, а не непрозрачность: так понятнее,
              «0%» значит «как есть». В слое хранится непрозрачность. */}
          <Slider
            labelKey="editor.props.opacity"
            value={Math.round((1 - selected.opacity) * 100)}
            min={0}
            max={90}
            step={5}
            display={`${Math.round((1 - selected.opacity) * 100)}%`}
            onChange={(value) => onOpacity(1 - value / 100)}
          />

          <ToolButton icon="trash" labelKey="editor.props.delete" onClick={onRemove} />
        </>
      )}
    </Panel>
  );
}
