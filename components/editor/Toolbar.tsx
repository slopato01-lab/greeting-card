"use client";

import {
  ColorPicker,
  FileButton,
  GroupLabel,
  Panel,
  ToolButton,
} from "@/components/editor/controls";
import type { Color, StickerId } from "@/lib/editor/document";
import type { TextPreset } from "@/lib/editor/presets";
import { STICKER_THEMES, STICKERS, stickerUrl, type StickerTheme } from "@/lib/editor/stickers";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Панели вкладок редактора: «Элементы», «Текст», «Фото», «Фон», «Файл».
 * Какая видна — решает рейка вкладок в Editor.tsx, как боковая
 * панель в Canva.
 */

const THEME_NAME: Record<StickerTheme, TextKey> = {
  common: "editor.stickerTheme.common",
  birthday: "editor.stickerTheme.birthday",
  newyear: "editor.stickerTheme.newyear",
  march8: "editor.stickerTheme.march8",
  love: "editor.stickerTheme.love",
};

/**
 * Каталог стикеров по темам. Раскрывается по кнопке «Стикер»: сетка
 * из 32 картинок на мобильном заняла бы экран целиком. Картинки —
 * обычные <img>, грузятся только когда каталог открыт.
 */
function StickerCatalog({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (id: StickerId) => void;
}) {
  return (
    <div id="editor-stickers" className="flex flex-col gap-[12px]">
      {STICKER_THEMES.map((theme) => (
        <div key={theme} className="flex flex-col gap-[6px]">
          <span className="font-ui caps text-badge text-muted">{t(THEME_NAME[theme])}</span>
          <div className="flex flex-wrap gap-[4px]">
            {STICKERS.filter((sticker) => sticker.theme === theme && sticker.hidden !== true).map(
              (sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  disabled={disabled}
                  aria-label={t(sticker.label)}
                  title={t(sticker.label)}
                  onClick={() => onPick(sticker.id)}
                  className="rounded-inner bg-raised hover:bg-line active:bg-photo flex size-[56px] items-center justify-center p-[6px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* Подпись у кнопки, картинка декоративная. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG из public, оптимизатор не нужен */}
                  <img
                    src={stickerUrl(sticker.id)}
                    alt=""
                    loading="lazy"
                    className="max-h-full max-w-full"
                  />
                </button>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Вкладка «Элементы»: фигуры и каталог стикеров по темам. */
export function ElementsPanel({
  disabled,
  onAdd,
  onAddSticker,
  className,
}: {
  disabled: boolean;
  onAdd: (kind: "rect" | "circle") => void;
  onAddSticker: (id: StickerId) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-elements" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-elements" labelKey="editor.tab.elements" />
      <div className="flex flex-wrap gap-[8px]">
        <ToolButton
          icon="rect"
          labelKey="editor.add.rect"
          disabled={disabled}
          onClick={() => onAdd("rect")}
        />
        <ToolButton
          icon="circle"
          labelKey="editor.add.circle"
          disabled={disabled}
          onClick={() => onAdd("circle")}
        />
      </div>
      <StickerCatalog disabled={disabled} onPick={onAddSticker} />
    </Panel>
  );
}

/**
 * Вкладка «Текст»: три заготовки, как «Добавить заголовок» в Canva.
 * Каждая кнопка написана тем начертанием, которое добавит: заголовок —
 * маркерным, основной текст — моноширинным, как в шаблонах.
 */
const PRESETS: { preset: TextPreset; label: TextKey; className: string }[] = [
  {
    preset: "title",
    label: "editor.text.preset.title",
    className: "text-h3 xl:text-h3-d font-bold",
  },
  {
    preset: "subtitle",
    label: "editor.text.preset.subtitle",
    className: "text-sub xl:text-sub-d font-medium",
  },
  { preset: "body", label: "editor.text.preset.body", className: "text-note xl:text-note-d" },
];

export function TextPanel({
  disabled,
  presetFamilies,
  onAddText,
  className,
}: {
  disabled: boolean;
  /** Семейства шрифтов заготовок — для образца прямо на кнопке. */
  presetFamilies: Record<TextPreset, string>;
  onAddText: (preset: TextPreset) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-text" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-text" labelKey="editor.tab.text" />
      <div className="flex flex-col gap-[8px]">
        {PRESETS.map(({ preset, label, className: size }) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onAddText(preset)}
            // Шрифт — образец того, что ляжет на открытку, а не оформление сайта.
            style={{ fontFamily: presetFamilies[preset] }}
            className={`${size} text-ink border-line rounded-inner bg-raised hover:border-muted active:bg-line min-h-tap border px-[14px] py-[10px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {t(label)}
          </button>
        ))}
      </div>
    </Panel>
  );
}

/** Вкладка «Фото»: загрузка и что с ним можно сделать дальше. */
export function PhotoPanel({
  disabled,
  onAddImage,
  className,
}: {
  disabled: boolean;
  onAddImage: (file: File) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-photo" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-photo" labelKey="editor.tab.photo" />
      {/* HEIC принимаем: Safari его откроет. Остальные браузеры
          честно скажут, что не смогли, — см. lib/editor/image.ts. */}
      <FileButton
        icon="photo"
        labelKey="editor.add.photo"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        disabled={disabled}
        onFile={onAddImage}
      />
      <p className="font-ui text-note xl:text-note-d text-body leading-[1.4]">
        {t("editor.photo.hint")}
      </p>
    </Panel>
  );
}

/** Вкладка «Фон»: цвет открытки — все семейства с оттенками сразу. */
export function BackgroundPanel({
  background,
  onBackground,
  className,
}: {
  background: Color;
  onBackground: (color: Color) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-background" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-background" labelKey="editor.background" />
      <ColorPicker
        labelledBy="editor-background"
        value={background}
        onChange={onBackground}
        byHue
      />
    </Panel>
  );
}

/** PNG, сохранить и открыть шаблон. Шаг 5 гайда. */
export function FilePanel({
  disabled,
  videoSupported,
  onExportPng,
  onExportGif,
  onExportVideo,
  onExportJson,
  onImport,
  className,
}: {
  disabled: boolean;
  /** Браузер умеет записывать видео (MediaRecorder над холстом). */
  videoSupported: boolean;
  onExportPng: () => void;
  onExportGif: () => void;
  onExportVideo: () => void;
  onExportJson: () => void;
  onImport: (file: File) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-file" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-file" labelKey="editor.file" />
      <div className="flex flex-col gap-[8px]">
        <ToolButton
          icon="gif"
          labelKey="editor.export.gif"
          disabled={disabled}
          onClick={onExportGif}
        />
        <ToolButton
          icon="video"
          labelKey="editor.export.video"
          disabled={disabled || !videoSupported}
          onClick={onExportVideo}
        />
        <p className="font-ui text-note text-muted leading-[1.4]">
          {t(videoSupported ? "editor.export.hint" : "editor.export.video.unsupported")}
        </p>
        <ToolButton
          icon="download"
          labelKey="editor.export.png"
          disabled={disabled}
          onClick={onExportPng}
        />
        <ToolButton
          icon="save"
          labelKey="editor.export.json"
          disabled={disabled}
          onClick={onExportJson}
        />
        <FileButton
          icon="open"
          labelKey="editor.import.json"
          accept="application/json,.json"
          disabled={disabled}
          onFile={onImport}
        />
      </div>
    </Panel>
  );
}
