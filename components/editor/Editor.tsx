"use client";

import { Button } from "@/components/Button";
import { Inspector } from "@/components/editor/Inspector";
import { AddPanel, FilePanel } from "@/components/editor/Toolbar";
import { useCardEditor } from "@/components/editor/useCardEditor";
import { t } from "@/lib/i18n";

/**
 * Редактор открытки по гайду design/postcard_editor_guide.pdf:
 * свободный холст 600 × 800, текст и фигуры, панель свойств,
 * PNG и шаблон в JSON.
 *
 * Кто за что отвечает:
 * - lib/editor/document.ts — формат шаблона и его проверка;
 * - lib/editor/fabric.ts — перевод формата в объекты Fabric и обратно;
 * - useCardEditor — жизнь холста, выделение, черновик, файлы;
 * - этот файл, Toolbar и Inspector — только разметка.
 *
 * Раскладка. Мобильный — потоком, в порядке работы: добавить, холст,
 * свойства, файл. С 1280px — три колонки: слева «добавить» и «файл»
 * друг под другом, в центре холст, справа свойства. Боковые колонки
 * по 304px: ровно шесть цветов по 44px в строку плюс поля панели. В макетах из design/ такого экрана
 * нет, раскладка собрана из токенов и ждёт утверждения.
 */
export function Editor() {
  const { hostRef, frameRef, status, selection, background, saved, fileError, actions } =
    useCardEditor();
  const ready = status === "ready";

  return (
    <div className="page-shell pt-[16px] pb-[60px] xl:pt-[24px] xl:pb-[100px]">
      <div className="flex flex-col gap-[16px] xl:grid xl:grid-cols-[304px_minmax(0,600px)_304px] xl:grid-rows-[auto_1fr] xl:items-start xl:justify-center xl:gap-[24px]">
        <AddPanel
          disabled={!ready}
          background={background}
          onAdd={actions.add}
          onBackground={actions.setBackground}
          className="xl:col-start-1 xl:row-start-1"
        />

        <div className="flex min-w-0 flex-col gap-[12px] xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <div
            ref={frameRef}
            tabIndex={0}
            role="group"
            aria-label={t("editor.canvas.label")}
            aria-describedby="editor-hint"
            aria-busy={status === "loading" || undefined}
            className="rounded-inner xl:rounded-inner-d bg-photo relative mx-auto aspect-[3/4] w-full max-w-[600px] touch-none overflow-hidden"
          >
            <div ref={hostRef} className="absolute inset-0" />

            {status === "loading" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[12px]">
                <span
                  aria-hidden="true"
                  className="border-line border-t-gold size-[28px] animate-spin rounded-full border-2"
                />
                <p className="font-ui text-note xl:text-note-d text-body">{t("loading.editor")}</p>
              </div>
            ) : null}

            {status === "error" ? (
              <div
                role="alert"
                className="absolute inset-0 flex flex-col items-center justify-center gap-[16px] p-[20px] text-center"
              >
                <p className="font-ui text-sub xl:text-sub-d text-ink">{t("error.editorFailed")}</p>
                <Button labelKey="cta.retry" tone="light" onClick={actions.retry} />
              </div>
            ) : null}
          </div>

          <p id="editor-hint" className="font-ui text-note xl:text-note-d text-muted leading-[1.4]">
            {t("editor.canvas.hint")}
          </p>
          <p aria-live="polite" className="font-ui text-note xl:text-note-d text-muted">
            {t(saved ? "create.draft.saved" : "editor.draft.local")}
          </p>
        </div>

        <Inspector
          selection={selection}
          onFill={actions.setFill}
          onFontSize={actions.setFontSize}
          onFont={actions.setFont}
          onRemove={actions.remove}
          className="xl:col-start-3 xl:row-span-2 xl:row-start-1"
        />

        <FilePanel
          disabled={!ready}
          fileError={fileError}
          onExportPng={actions.exportPng}
          onExportJson={actions.exportJson}
          onImport={(file) => void actions.importFile(file)}
          className="xl:col-start-1 xl:row-start-2"
        />
      </div>
    </div>
  );
}
