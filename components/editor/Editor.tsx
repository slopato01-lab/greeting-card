"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { ToolButton } from "@/components/editor/controls";
import { AnimationPanel, Inspector } from "@/components/editor/Inspector";
import { type EditorTab, panelId, Rail, tabId } from "@/components/editor/Rail";
import { TemplatesPanel } from "@/components/editor/Templates";
import {
  BackgroundPanel,
  ElementsPanel,
  FilePanel,
  PhotoPanel,
  TextPanel,
} from "@/components/editor/Toolbar";
import { useCardEditor } from "@/components/editor/useCardEditor";
import { type Layer, LIMITS } from "@/lib/editor/document";
import { FONTS } from "@/lib/editor/fonts";
import { TEXT_PRESET_INFO, type TextPreset } from "@/lib/editor/presets";
import { t } from "@/lib/i18n";

/**
 * Редактор открытки. Раскладка по образцу Canva (08.10.2026, просьба
 * пользователя: «слева вертикальный блок со всеми инструментами, всё
 * на один экран десктопа»):
 *
 *   ┌──────┬──────────────┬──────────────────────────────┐
 *   │рейка │ панель       │           открытка           │
 *   │вкла- │ выбранной    │      (вписана по высоте)     │
 *   │док   │ вкладки      ├──────────────────────────────┤
 *   │      │ (своя прокр.)│ просмотр · время · черновик  │
 *   └──────┴──────────────┴──────────────────────────────┘
 *
 * С 1280px редактор занимает ровно окно под шапкой сайта: страница
 * не прокручивается, прокручивается только панель. Минус 1px — рамка
 * под шапкой (border-b в Header.tsx), иначе страница едет на пиксель. Открытка вписывается
 * в оставшееся место контейнерными единицами: ширина = min(ширина
 * сцены, высота сцены × 3/4).
 *
 * Мобильный (и 768–1279, по правилу CLAUDE.md): потоком — открытка,
 * полоса просмотра, ряд вкладок, панель. Порядок задаётся order:
 * в DOM рейка и панель идут первыми, как на десктопе.
 *
 * Кто за что отвечает:
 * - lib/editor/* — формат, анимация, Fabric, шрифты, фото, стикеры;
 * - useCardEditor — жизнь холста, выделение, черновик, просмотр, файлы;
 * - этот файл, Rail, Toolbar, Inspector, Templates, controls — разметка.
 */

/** Семейства шрифтов заготовок — образец прямо на кнопках вкладки «Текст». */
const PRESET_FAMILIES = Object.fromEntries(
  (Object.keys(TEXT_PRESET_INFO) as TextPreset[]).map((preset) => [
    preset,
    FONTS.find((font) => font.id === TEXT_PRESET_INFO[preset].font)?.family ?? "inherit",
  ]),
) as Record<TextPreset, string>;

/**
 * Вкладки, где пользователь добавляет элементы. Выделение нового
 * элемента не уводит отсюда: добавлять стикеры подряд — обычное дело.
 */
const ADDING_TABS: readonly EditorTab[] = ["elements", "text", "photo"];

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

  const [tab, setTab] = useState<EditorTab>("templates");

  // Выделили элемент на холсте — панель переходит на «Изменить»,
  // как контекстная панель Canva. Считается во время рендера, а не
  // в эффекте: так React советует подстраивать состояние под пропсы.
  const [previous, setPrevious] = useState<Layer | null>(null);
  if (selected !== previous) {
    setPrevious(selected);
    if (
      selected !== null &&
      previous === null &&
      tab !== "animation" &&
      !ADDING_TABS.includes(tab)
    ) {
      setTab("edit");
    }
  }

  const panel = (() => {
    switch (tab) {
      case "templates":
        return (
          <TemplatesPanel
            disabled={!editable}
            previews={previews}
            pending={pendingTemplate}
            onPending={setPendingTemplate}
            hasContent={hasContent}
            onApply={(id) => void actions.applyTemplate(id)}
          />
        );
      case "elements":
        return (
          <ElementsPanel
            disabled={!editable}
            onAdd={(kind) => void actions.add(kind)}
            onAddSticker={(id) => void actions.addSticker(id)}
          />
        );
      case "text":
        return (
          <TextPanel
            disabled={!editable}
            presetFamilies={PRESET_FAMILIES}
            onAddText={(preset) => void actions.addText(preset)}
          />
        );
      case "photo":
        return (
          <PhotoPanel disabled={!editable} onAddImage={(file) => void actions.addImage(file)} />
        );
      case "background":
        return <BackgroundPanel background={background} onBackground={actions.setBackground} />;
      case "edit":
        return (
          <Inspector
            selected={selected}
            playing={playing}
            onFill={actions.setFill}
            onOpacity={actions.setOpacity}
            onFontSize={actions.setFontSize}
            onTextStyle={(style) => void actions.setTextStyle(style)}
            onRemove={actions.remove}
            onReplaceImage={(file) => void actions.replaceImage(file)}
            onRemoveBackground={() => void actions.removeBackground()}
            onMono={actions.setMono}
            onSpacing={actions.setSpacing}
          />
        );
      case "animation":
        return (
          <AnimationPanel
            selected={selected}
            playing={playing}
            onAnimation={actions.setAnimation}
          />
        );
      case "file":
        return (
          <FilePanel
            disabled={!editable}
            onExportPng={actions.exportPng}
            onExportJson={() => void actions.exportJson()}
            onImport={(file) => void actions.importFile(file)}
          />
        );
    }
  })();

  return (
    <div className="page-shell xl:border-line flex flex-col gap-[16px] pt-[8px] pb-[40px] xl:grid xl:h-[calc(100dvh-var(--spacing-header-d)-1px)] xl:max-w-none xl:grid-cols-[96px_360px_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)_auto] xl:gap-0 xl:border-t xl:px-0 xl:py-0">
      <Rail
        tab={tab}
        onTab={setTab}
        className="xl:border-line order-3 xl:order-none xl:row-span-2 xl:border-e"
      />

      <div
        id={panelId(tab)}
        role="tabpanel"
        aria-labelledby={tabId(tab)}
        className="xl:border-line order-4 xl:order-none xl:row-span-2 xl:min-h-0 xl:overflow-y-auto xl:border-e xl:p-[16px]"
      >
        {panel}
      </div>

      {/* Сцена: открытка вписана в свободное место. Контейнер size только
          на десктопе: на мобильном у сцены нет своей высоты, и
          контейнерные единицы схлопнули бы открытку в ноль. */}
      <div className="relative order-1 flex min-h-0 items-center justify-center xl:[container-type:size] xl:order-none xl:col-start-3 xl:row-start-1 xl:p-[24px]">
        <div
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label={t("editor.canvas.label")}
          aria-describedby="editor-hint"
          aria-busy={status === "loading" || busy || undefined}
          className="rounded-inner xl:rounded-inner-d bg-photo relative aspect-[3/4] w-full max-w-[600px] touch-none overflow-hidden xl:w-[min(100cqw,75cqh)] xl:max-w-none"
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

        {/* Сообщения — плашкой поверх сцены, а не строкой под ней:
            на десктопе под открыткой нет места, а прыгающая раскладка
            сдвигала бы холст под пальцем. */}
        {notice !== null || busy ? (
          <div className="pointer-events-none absolute inset-x-0 top-[8px] flex justify-center px-[16px] xl:top-[16px]">
            <p
              role={notice !== null ? "alert" : undefined}
              aria-live="polite"
              className="font-ui text-note xl:text-note-d bg-raised text-ink rounded-inner border-line pointer-events-auto max-w-[520px] border px-[14px] py-[8px] leading-[1.4]"
            >
              {t(notice ?? busyText)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Нижняя полоса: просмотр, время, длительность, черновик. */}
      <div className="xl:border-line order-2 flex flex-col gap-[8px] xl:order-none xl:col-start-3 xl:row-start-2 xl:flex-row xl:items-center xl:gap-[20px] xl:border-t xl:px-[24px] xl:py-[10px]">
        <div className="flex min-w-0 flex-1 items-center gap-[12px]">
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

        <label className="flex items-center gap-[10px]">
          <span className="font-ui caps text-badge text-muted shrink-0">
            {t("editor.duration")}
          </span>
          <input
            type="range"
            min={LIMITS.duration.min}
            max={30}
            step={1}
            value={duration}
            onChange={(event) => actions.setDuration(Number(event.target.value))}
            className="min-h-tap accent-gold w-full min-w-0 xl:w-[140px]"
          />
          <output className="font-ui text-note text-ink w-[4ch] shrink-0 tabular-nums">
            {duration} {t("editor.unit.seconds")}
          </output>
        </label>

        <p aria-live="polite" className="font-ui text-note text-muted xl:max-w-[220px] xl:truncate">
          {t(saved ? "create.draft.saved" : "editor.draft.local")}
        </p>
        {/* Подсказка по клавишам нужна скринридеру всегда, глазам — на
            мобильном: на десктопе ей нет места в полосе. */}
        <p id="editor-hint" className="font-ui text-note text-muted leading-[1.4] xl:sr-only">
          {t("editor.canvas.hint")}
        </p>
      </div>
    </div>
  );
}
