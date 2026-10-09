"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/Button";
import { IconButton, ToolButton } from "@/components/editor/controls";
import { GamePanel } from "@/components/editor/GamePanel";
import { GameStage } from "@/components/editor/GameStage";
import { PUZZLE_SAMPLE_PHOTO } from "@/components/games/PuzzleDemo";
import { AnimationPanel, Inspector } from "@/components/editor/Inspector";
import { MusicPanel } from "@/components/editor/MusicPanel";
import { Paywall, type PaywallReason } from "@/components/editor/Paywall";
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
import { claimCard, useAuth } from "@/lib/auth/client";
import { type Layer, LIMITS } from "@/lib/editor/document";
import { FONTS } from "@/lib/editor/fonts";
import { stickerInfo } from "@/lib/editor/stickers";
import { cardKey } from "@/lib/editor/premium";
import { videoSupported } from "@/lib/editor/record";
import { TEXT_PRESET_INFO, type TextPreset } from "@/lib/editor/presets";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Редактор открытки. Раскладка по образцу Canva (08.10.2026, просьба
 * пользователя: «слева вертикальный блок со всеми инструментами, всё
 * на один экран десктопа»):
 *
 * Шаблон переключается во вкладке «Шаблоны» сразу, без вопроса
 * «Заменить?»: у каждого шаблона свой черновик, правки не теряются,
 * исходные шаблоны не меняются. Адрес /editor?template=… следует
 * за шаблоном.
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
 * Вкладка, где живут свойства слоя (09.10.2026, просьба пользователя:
 * выбрал текст — сразу «Текст» со всеми шрифтами, выбрал фото или
 * заглушку под фото — сразу «Фото» с тем, что с ним можно сделать).
 * Отдельной вкладки «Изменить» больше нет.
 */
function tabFor(layer: Layer): EditorTab {
  if (layer.kind === "text") return "text";
  if (layer.kind === "image") return "photo";
  if (layer.kind === "sticker" && stickerInfo(layer.sticker)?.placeholder === true) return "photo";
  return "elements";
}

/** Подписи идущего экспорта — при них на плашке есть «Остановить». */
const EXPORT_TEXTS: readonly TextKey[] = ["editor.export.gif.busy", "editor.export.video.busy"];

type ExportKind = "gif" | "video";

/** Поддержка записи видео не меняется, пока открыта страница. */
const noSubscribe = () => () => undefined;

export function Editor() {
  const {
    hostRef,
    frameRef,
    progressRef,
    status,
    selected,
    selectionSerial,
    background,
    duration,
    still,
    music,
    game,
    gamePhoto,
    playing,
    busy,
    busyText,
    saved,
    notice,
    currentTemplate,
    startTab,
    previews,
    canUndo,
    canRedo,
    actions,
  } = useCardEditor();
  const auth = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [paywall, setPaywall] = useState<{ reason: PaywallReason; kind: ExportKind } | null>(null);
  const claimRef = useRef<AbortController | null>(null);
  const ready = status === "ready";
  const editable = ready && !playing && !busy && !claiming;

  // Ушли со страницы, пока сервер считал лимит, — запрос снимается.
  useEffect(() => () => claimRef.current?.abort(), []);

  const runExport = useCallback(
    (kind: ExportKind, watermark: boolean) => {
      void (kind === "gif" ? actions.exportGif({ watermark }) : actions.exportVideo({ watermark }));
    },
    [actions],
  );

  /**
   * GIF и видео (решение пользователя 09.10.2026): гость сохраняет
   * с водяным знаком. Вошедший сначала спрашивает сервер — тот тратит
   * бесплатную на новую открытку или говорит «нельзя», и тогда попап
   * подписки. Повторное сохранение той же открытки бесплатно.
   */
  const requestExport = useCallback(
    async (kind: ExportKind) => {
      if (auth.status !== "user") {
        runExport(kind, true);
        return;
      }
      const controller = new AbortController();
      claimRef.current = controller;
      setClaiming(true);
      actions.notify("paywall.checking");
      const result = await claimCard(cardKey(currentTemplate), controller.signal);
      if (controller.signal.aborted) return;
      claimRef.current = null;
      setClaiming(false);
      actions.notify(null);
      if (result.ok) return runExport(kind, false);
      if (result.error === "limit" || result.error === "subscription") {
        setPaywall({ reason: result.error, kind });
        return;
      }
      // Сессия кончилась — сохраняем как гость, со знаком.
      if (result.error === "unauthorized") return runExport(kind, true);
      actions.notify("auth.error.network");
    },
    [actions, auth.status, currentTemplate, runExport],
  );

  const closePaywall = useCallback(() => setPaywall(null), []);

  const [tab, setTab] = useState<EditorTab>("templates");
  const gameStage = tab === "game" && ready;

  // Адрес попросил вкладку (?game=puzzle из попапа на /games) —
  // открываем её, как при выделении слоя: во время рендера, не в эффекте.
  const [seenStartTab, setSeenStartTab] = useState(startTab);
  if (startTab !== seenStartTab) {
    setSeenStartTab(startTab);
    if (startTab !== null) setTab(startTab);
  }
  // Умеет ли браузер писать видео — известно только в браузере.
  // Сервер и первый рендер считают, что нет: кнопка оживёт после
  // гидратации, а не мигнёт включённой и выключится.
  const canRecord = useSyncExternalStore(noSubscribe, videoSupported, () => false);

  // Выделили другой элемент на холсте — панель переходит на его
  // вкладку, как контекстная панель Canva. «Анимацию» не трогаем:
  // там настраивают слои по очереди. Считается во время рендера,
  // а не в эффекте: так React советует подстраивать состояние под пропсы.
  const [seenSerial, setSeenSerial] = useState(selectionSerial);
  if (selectionSerial !== seenSerial) {
    setSeenSerial(selectionSerial);
    if (selected !== null && tab !== "animation") setTab(tabFor(selected));
  }

  // Свойства выделенного слоя — сверху его вкладки.
  const inspector = (owner: EditorTab) =>
    selected !== null && tabFor(selected) === owner ? (
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
    ) : null;

  const panel = (() => {
    switch (tab) {
      case "templates":
        return (
          <TemplatesPanel
            disabled={!ready || busy}
            current={currentTemplate}
            previews={previews}
            onSelect={(id) => void actions.switchTemplate(id)}
          />
        );
      case "elements":
        return (
          <div className="flex flex-col gap-[12px]">
            {inspector("elements")}
            <ElementsPanel
              disabled={!editable}
              onAdd={(kind) => void actions.add(kind)}
              onAddSticker={(id) => void actions.addSticker(id)}
            />
          </div>
        );
      case "text":
        return (
          <div className="flex flex-col gap-[12px]">
            {inspector("text")}
            <TextPanel
              disabled={!editable}
              presetFamilies={PRESET_FAMILIES}
              onAddText={(preset) => void actions.addText(preset)}
            />
          </div>
        );
      case "photo":
        return (
          <div className="flex flex-col gap-[12px]">
            {inspector("photo")}
            <PhotoPanel disabled={!editable} onAddImage={(file) => void actions.addImage(file)} />
          </div>
        );
      case "background":
        return <BackgroundPanel background={background} onBackground={actions.setBackground} />;
      case "animation":
        return (
          <AnimationPanel
            selected={selected}
            playing={playing}
            onAnimation={actions.setAnimation}
          />
        );
      case "music":
        return <MusicPanel music={music} disabled={!ready || busy} onMusic={actions.setMusic} />;
      case "game":
        return (
          <GamePanel
            game={game}
            photo={gamePhoto}
            disabled={!ready || busy}
            onGame={actions.setGame}
            onPhoto={actions.setGamePhoto}
          />
        );
      case "file":
        return (
          <FilePanel
            disabled={!editable}
            videoSupported={canRecord}
            onExportPng={actions.exportPng}
            onExportGif={() => void requestExport("gif")}
            onExportVideo={() => void requestExport("video")}
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
        onTab={(next) => {
          setTab(next);
          if (next === "text") actions.focusText();
        }}
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
          контейнерные единицы схлопнули бы открытку в ноль. На мобильном
          ширина = min(ширина полосы, (окно − шапка − полоса просмотра) × 3/4):
          открытка целиком в экране, а под ней остаётся место, за которое
          палец листает страницу. С 08.10.2026 и сама открытка листается
          одним пальцем (touch-pan-y), слои двигают двумя — см.
          lib/editor/gestures.ts. 72px = поле сверху + промежуток +
          ряд кнопки «Просмотр». */}
      <div className="relative order-1 flex min-h-0 items-center justify-center xl:[container-type:size] xl:order-none xl:col-start-3 xl:row-start-1 xl:p-[24px]">
        {/* Вкладка «Игра»: на сцене пазл вместо открытки (09.10.2026).
            Без игры — пример, тот же, что в попапе-пробе. */}
        {gameStage ? (
          <GameStage
            photo={gamePhoto ?? PUZZLE_SAMPLE_PHOTO}
            title={game?.title ?? t("game.demo.title")}
            caption={game?.caption ?? t("game.demo.caption")}
          />
        ) : null}
        <div
          ref={frameRef}
          tabIndex={0}
          role="group"
          aria-label={t("editor.canvas.label")}
          aria-describedby="editor-hint editor-touch-hint"
          aria-busy={status === "loading" || busy || undefined}
          // Холст прячется, но не размонтируется: Fabric держит слои.
          hidden={gameStage}
          className="rounded-inner xl:rounded-inner-d bg-photo relative aspect-[3/4] w-[min(100%,calc((100svh-var(--spacing-header)-72px)*3/4))] max-w-[600px] touch-pan-y overflow-hidden xl:w-[min(100cqw,75cqh)] xl:max-w-none"
        >
          <div ref={hostRef} className="absolute inset-0" />

          {status === "loading" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[12px]">
              <span
                aria-hidden="true"
                className="border-line border-t-gold-deep size-[28px] animate-spin rounded-full border-2"
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
              <Button labelKey="cta.retry" tone="dark" onClick={actions.retry} />
            </div>
          ) : null}
        </div>

        {/* Сообщения — плашкой поверх сцены, а не строкой под ней:
            на десктопе под открыткой нет места, а прыгающая раскладка
            сдвигала бы холст под пальцем. */}
        {notice !== null || busy ? (
          <div className="pointer-events-none absolute inset-x-0 top-[8px] flex items-start justify-center px-[16px] xl:top-[16px]">
            <p
              role={notice !== null ? "alert" : undefined}
              aria-live="polite"
              className="font-ui text-note xl:text-note-d bg-raised text-ink rounded-inner border-line pointer-events-auto max-w-[520px] border px-[14px] py-[8px] leading-[1.4]"
            >
              {t(notice ?? busyText)}
            </p>
            {/* Запись GIF и видео можно прервать: видео пишется столько,
                сколько длится открытка. */}
            {busy && notice === null && EXPORT_TEXTS.includes(busyText) ? (
              <button
                type="button"
                onClick={actions.cancelExport}
                className="font-ui text-note bg-ink text-canvas min-h-tap hover:bg-body active:bg-muted pointer-events-auto ms-[8px] shrink-0 rounded-full px-[16px] font-medium transition-colors"
              >
                {t("editor.export.cancel")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Нижняя полоса: просмотр, время, длительность, черновик. */}
      <div className="xl:border-line order-2 flex flex-col gap-[8px] xl:order-none xl:col-start-3 xl:row-start-2 xl:flex-row xl:items-center xl:gap-[20px] xl:border-t xl:px-[24px] xl:py-[10px]">
        {/* Без min-w-0: блок не сжимается уже кнопки «Просмотр» —
            иначе на 1280 её перекрывала галочка «Без анимации». */}
        <div className="flex flex-1 items-center gap-[12px]">
          {/* Отменить и вернуть (09.10.2026): до 50 шагов, на компьютере
              ещё и Ctrl+Z / Ctrl+Shift+Z — см. useCardEditor. */}
          <div className="flex shrink-0 gap-[6px]">
            <IconButton
              icon="undo"
              labelKey="editor.undo"
              disabled={!ready || busy || playing || !canUndo}
              onClick={actions.undo}
            />
            <IconButton
              icon="redo"
              labelKey="editor.redo"
              disabled={!ready || busy || playing || !canRedo}
              onClick={actions.redo}
            />
          </div>
          <ToolButton
            icon={playing ? "stop" : "play"}
            labelKey={playing ? "editor.stop" : "editor.play"}
            disabled={!ready || busy || still}
            onClick={playing ? actions.stop : actions.play}
            className="shrink-0"
          />
          <div aria-hidden="true" className="bg-line h-[6px] min-w-0 flex-1 rounded-full">
            <div ref={progressRef} className="bg-gold-deep h-full w-0 rounded-full" />
          </div>
        </div>

        {/* «Без анимации» (08.10.2026): открытка сразу целиком. Анимация
            слоёв сохраняется — выключить обратно можно в любой момент. */}
        <label className="min-h-tap flex shrink-0 cursor-pointer items-center gap-[10px] has-disabled:cursor-not-allowed has-disabled:opacity-50">
          <input
            type="checkbox"
            checked={still}
            disabled={!ready || busy}
            onChange={(event) => actions.setStill(event.target.checked)}
            aria-describedby="editor-still-hint"
            className="accent-gold-deep size-[18px] shrink-0"
          />
          <span className="font-ui caps text-badge text-ink">{t("editor.still")}</span>
          <span id="editor-still-hint" className="sr-only">
            {t("editor.still.hint")}
          </span>
        </label>

        <label className={`flex items-center gap-[10px] ${still ? "opacity-50" : ""}`}>
          <span className="font-ui caps text-badge text-muted shrink-0">
            {t("editor.duration")}
          </span>
          <input
            type="range"
            min={LIMITS.duration.min}
            max={30}
            step={1}
            value={duration}
            disabled={still}
            onChange={(event) => actions.setDuration(Number(event.target.value))}
            className="min-h-tap accent-gold-deep w-full min-w-0 xl:w-[140px]"
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
        <p
          id="editor-hint"
          className="font-ui text-note text-muted leading-[1.4] xl:sr-only pointer-coarse:sr-only"
        >
          {t("editor.canvas.hint")}
        </p>
        {/* На сенсорном экране вместо клавиш — жесты (08.10.2026). */}
        <p
          id="editor-touch-hint"
          className="font-ui text-note text-muted hidden leading-[1.4] pointer-coarse:block"
        >
          {t("editor.canvas.touchHint")}
        </p>
      </div>

      <Paywall
        reason={paywall?.reason ?? null}
        onClose={closePaywall}
        onWatermark={() => {
          if (paywall === null) return;
          const { kind } = paywall;
          setPaywall(null);
          runExport(kind, true);
        }}
      />
    </div>
  );
}
