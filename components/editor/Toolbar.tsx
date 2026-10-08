"use client";

import { useRef, type ChangeEvent } from "react";

import { ColorPicker, GroupLabel, Panel, ToolButton } from "@/components/editor/controls";
import type { Color, LayerKind } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";
import type { IconName } from "@/lib/icons/generated";

/**
 * Панели инструментов. Две отдельные, а не одна: на мобильном «Файл»
 * уезжает под свойства, иначе холст оказывается на втором экране.
 * На десктопе обе стоят в левой колонке, раскладку задаёт Editor.tsx.
 */

/** Кнопка, которая открывает скрытое поле выбора файла. */
function FileButton({
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

/** Добавить слой и выбрать фон. Кнопки переносятся по ширине, а не режут подписи. */
export function AddPanel({
  disabled,
  background,
  onAdd,
  onAddImage,
  onBackground,
  className,
}: {
  disabled: boolean;
  background: Color;
  onAdd: (kind: Exclude<LayerKind, "image">) => void;
  onAddImage: (file: File) => void;
  onBackground: (color: Color) => void;
  className?: string;
}) {
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
      </div>

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
