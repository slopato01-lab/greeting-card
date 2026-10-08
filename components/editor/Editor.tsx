"use client";

import { Button } from "@/components/Button";
import { Slider, ToolButton } from "@/components/editor/controls";
import { Inspector } from "@/components/editor/Inspector";
import { TemplatesPanel } from "@/components/editor/Templates";
import { AddPanel, FilePanel } from "@/components/editor/Toolbar";
import { useCardEditor } from "@/components/editor/useCardEditor";
import { LIMITS } from "@/lib/editor/document";
import { t } from "@/lib/i18n";

/**
 * Редактор открытки по гайду design/postcard_editor_guide.pdf:
 * свободный холст 600 × 800, текст, фигуры и фото, панель свойств,
 * анимация с просмотром, PNG и шаблон в JSON.
 *
 * Кто за что отвечает:
 * - lib/editor/document.ts — формат шаблона и его проверка;
 * - lib/editor/animation.ts — кадр анимации по времени;
 * - lib/editor/fabric.ts — перевод формата в объекты Fabric и обратно;
 * - lib/editor/fonts.ts, palette.ts, image.ts, assets.ts — шрифты,
 *   цвета, приём фото и их хранилище;
 * - useCardEditor — жизнь холста, выделение, черновик, просмотр, файлы;
 * - этот файл, Toolbar, Inspector и controls — только разметка.
 *
 * Раскладка (утверждена 08.10.2026). Мобильный — потоком, в порядке
 * работы: шаблоны, добавить, холст с просмотром, свойства, файл.
 * С 1280px — три колонки: слева шаблоны, «добавить» и «файл» друг под
 * другом, в центре холст, справа свойства. Боковые колонки по 304px:
 * ровно шесть кружков цвета по 44px в строку плюс поля панели.
 */
export function Editor() {
  const {
    hostRef,
    frameRef,
    progressRef,
    status,
    selected,
    background,
    duration,
    playing,
    busy,
    busyText,
    saved,
    notice,
    previews,
    pendingTemplate,
    setPendingTemplate,
    hasContent,
    actions,
  } = useCardEditor();
  const ready = status === "ready";
  const editable = ready && !playing && !busy;

  return (
    <div className="page-shell pt-[16px] pb-[60px] xl:pt-[24px] xl:pb-[100px]">
      <div className="flex flex-col gap-[16px] xl:grid xl:grid-cols-[304px_minmax(0,600px)_304px] xl:grid-rows-[auto_auto_1fr] xl:items-start xl:justify-center xl:gap-[24px]">
        <TemplatesPanel
          disabled={!editable}
          previews={previews}
          pending={pendingTemplate}
          onPending={setPendingTemplate}
          hasContent={hasContent}
          onApply={(id) => void actions.applyTemplate(id)}
          className="xl:col-start-1 xl:row-start-1"
        />

        <AddPanel
          disabled={!editable}
          background={background}
          onAdd={(kind) => void actions.add(kind)}
          onAddImage={(file) => void actions.addImage(file)}
          onAddSticker={(id) => void actions.addSticker(id)}
          onBackground={actions.setBackground}
          className="xl:col-start-1 xl:row-start-2"
        />

        <div className="flex min-w-0 flex-col gap-[12px] xl:col-start-2 xl:row-span-3 xl:row-start-1">
          <div
            ref={frameRef}
            tabIndex={0}
            role="group"
            aria-label={t("editor.canvas.label")}
            aria-describedby="editor-hint"
            aria-busy={status === "loading" || busy || undefined}
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

          {/* Просмотр анимации: кнопка, полоса времени, длительность. */}
          <div className="flex items-center gap-[12px]">
            <ToolButton
              icon={playing ? "stop" : "play"}
              labelKey={playing ? "editor.stop" : "editor.play"}
              disabled={!ready || busy}
              onClick={playing ? actions.stop : actions.play}
              className="shrink-0"
            />
            <div aria-hidden="true" className="bg-line h-[6px] min-w-0 flex-1 rounded-full">
              <div ref={progressRef} className="bg-gold h-full w-0 rounded-full" />
            </div>
          </div>
          <Slider
            labelKey="editor.duration"
            value={duration}
            min={LIMITS.duration.min}
            max={30}
            step={1}
            display={`${duration} ${t("editor.unit.seconds")}`}
            onChange={actions.setDuration}
          />

          {notice === null ? null : (
            <p role="alert" className="font-ui text-note xl:text-note-d text-ink leading-[1.4]">
              {t(notice)}
            </p>
          )}
          {busy ? (
            <p aria-live="polite" className="font-ui text-note xl:text-note-d text-body">
              {t(busyText)}
            </p>
          ) : null}

          <p id="editor-hint" className="font-ui text-note xl:text-note-d text-muted leading-[1.4]">
            {t("editor.canvas.hint")}
          </p>
          <p aria-live="polite" className="font-ui text-note xl:text-note-d text-muted">
            {t(saved ? "create.draft.saved" : "editor.draft.local")}
          </p>
        </div>

        <Inspector
          selected={selected}
          playing={playing}
          onFill={actions.setFill}
          onOpacity={actions.setOpacity}
          onFontSize={actions.setFontSize}
          onTextStyle={(style) => void actions.setTextStyle(style)}
          onAnimation={actions.setAnimation}
          onRemove={actions.remove}
          onReplaceImage={(file) => void actions.replaceImage(file)}
          onRemoveBackground={() => void actions.removeBackground()}
          onMono={actions.setMono}
          onSpacing={actions.setSpacing}
          className="xl:col-start-3 xl:row-span-3 xl:row-start-1"
        />

        <FilePanel
          disabled={!editable}
          onExportPng={actions.exportPng}
          onExportJson={() => void actions.exportJson()}
          onImport={(file) => void actions.importFile(file)}
          className="xl:col-start-1 xl:row-start-3"
        />
      </div>
    </div>
  );
}
