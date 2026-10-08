"use client";

import { useRef, type ChangeEvent } from "react";

import { GroupLabel, Panel, Swatches, ToolButton } from "@/components/editor/controls";
import type { ColorToken, LayerKind } from "@/lib/editor/document";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Панели инструментов. Две отдельные, а не одна: на мобильном «Файл»
 * уезжает под свойства, иначе холст оказывается на втором экране.
 * На десктопе обе стоят в левой колонке, раскладку задаёт Editor.tsx.
 */

/** Добавить слой и выбрать фон. Кнопки переносятся по ширине, а не режут подписи. */
export function AddPanel({
  disabled,
  background,
  onAdd,
  onBackground,
  className,
}: {
  disabled: boolean;
  background: ColorToken;
  onAdd: (kind: LayerKind) => void;
  onBackground: (token: ColorToken) => void;
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
      </div>

      <GroupLabel id="editor-background" labelKey="editor.background" />
      <Swatches labelledBy="editor-background" value={background} onChange={onBackground} />
    </Panel>
  );
}

/** PNG, сохранить и открыть шаблон. Шаг 5 гайда. */
export function FilePanel({
  disabled,
  fileError,
  onExportPng,
  onExportJson,
  onImport,
  className,
}: {
  disabled: boolean;
  fileError: TextKey | null;
  onExportPng: () => void;
  onExportJson: () => void;
  onImport: (file: File) => void;
  className?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем, чтобы повторный выбор того же файла снова сработал.
    event.target.value = "";
    if (file !== undefined) onImport(file);
  };

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
        <ToolButton
          icon="open"
          labelKey="editor.import.json"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={onFile}
        />
      </div>
      {fileError === null ? null : (
        <p role="alert" className="font-ui text-note xl:text-note-d text-ink">
          {t(fileError)}
        </p>
      )}
    </Panel>
  );
}
