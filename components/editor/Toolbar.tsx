"use client";

import { useState } from "react";

import {
  ColorPicker,
  FileButton,
  GroupLabel,
  Panel,
  ToolButton,
} from "@/components/editor/controls";
import type { Color, StickerId } from "@/lib/editor/document";
import { STICKER_THEMES, STICKERS, stickerUrl, type StickerTheme } from "@/lib/editor/stickers";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Панели инструментов. Две отдельные, а не одна: на мобильном «Файл»
 * уезжает под свойства, иначе холст оказывается на втором экране.
 * На десктопе обе стоят в левой колонке, раскладку задаёт Editor.tsx.
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
            {STICKERS.filter((sticker) => sticker.theme === theme).map((sticker) => (
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Добавить слой и выбрать фон. Кнопки переносятся по ширине, а не режут подписи. */
export function AddPanel({
  disabled,
  background,
  onAdd,
  onAddImage,
  onAddSticker,
  onBackground,
  className,
}: {
  disabled: boolean;
  background: Color;
  onAdd: (kind: "text" | "rect" | "circle") => void;
  onAddImage: (file: File) => void;
  onAddSticker: (id: StickerId) => void;
  onBackground: (color: Color) => void;
  className?: string;
}) {
  const [stickers, setStickers] = useState(false);

  return (
    <Panel labelledBy="editor-tools" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-tools" labelKey="editor.tools" />
      <div className="flex flex-wrap gap-[8px] xl:flex-col">
        <ToolButton
          icon="text"
          labelKey="editor.add.text"
          disabled={disabled}
          onClick={() => onAdd("text")}
        />
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
        {/* HEIC принимаем: Safari его откроет. Остальные браузеры
            честно скажут, что не смогли, — см. lib/editor/image.ts. */}
        <FileButton
          icon="photo"
          labelKey="editor.add.photo"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          disabled={disabled}
          onFile={onAddImage}
        />
        <ToolButton
          icon="sticker"
          labelKey="editor.add.sticker"
          disabled={disabled}
          aria-expanded={stickers}
          aria-controls="editor-stickers"
          onClick={() => setStickers((open) => !open)}
        />
      </div>

      {stickers ? <StickerCatalog disabled={disabled} onPick={onAddSticker} /> : null}

      <GroupLabel id="editor-background" labelKey="editor.background" />
      <ColorPicker labelledBy="editor-background" value={background} onChange={onBackground} />
    </Panel>
  );
}

/** PNG, сохранить и открыть шаблон. Шаг 5 гайда. */
export function FilePanel({
  disabled,
  onExportPng,
  onExportJson,
  onImport,
  className,
}: {
  disabled: boolean;
  onExportPng: () => void;
  onExportJson: () => void;
  onImport: (file: File) => void;
  className?: string;
}) {
  return (
    <Panel labelledBy="editor-file" {...(className === undefined ? {} : { className })}>
      <GroupLabel id="editor-file" labelKey="editor.file" />
      <div className="flex flex-col gap-[8px]">
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
