"use client";

import type { Canvas, FabricObject } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

import { frameAt } from "@/lib/editor/animation";
import { getAsset, pruneAssets, putAsset } from "@/lib/editor/assets";
import {
  type Animation,
  CARD_HEIGHT,
  CARD_WIDTH,
  clampDuration,
  type Color,
  DEFAULT_DURATION,
  defaultLayer,
  type EditorDoc,
  emptyDoc,
  imageLayer,
  type Layer,
  LIMITS,
  parseEditorJson,
  type StickerId,
  stickerLayer,
} from "@/lib/editor/document";
import {
  applyAnimation,
  applyFill,
  applyMono,
  applyTextStyle,
  canvasToDoc,
  createObject,
  type FabricModule,
  loadDocIntoCanvas,
  objectToLayer,
  readTheme,
  resolveColor,
  restoreObject,
  showFrame,
  type TextStyle,
  type Theme,
  usedAssets,
} from "@/lib/editor/fabric";
import { cutoutPerson } from "@/lib/editor/cutout";
import { loadFont } from "@/lib/editor/fonts";
import {
  blobToDataUrl,
  cropToAspect,
  dataUrlToBlob,
  newAssetId,
  prepareImage,
} from "@/lib/editor/image";
import { TEXT_PRESET_INFO, type TextPreset } from "@/lib/editor/presets";
import { stickerInfo } from "@/lib/editor/stickers";
import { TEMPLATES, type TemplateId } from "@/lib/editor/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Состояние и действия редактора открытки. Компоненты в этой папке
 * только рисуют то, что отдаёт хук, и зовут его действия, — сам холст
 * Fabric за пределы хука не выходит.
 *
 * Жизненный цикл холста — один эффект. Всё, что он подписал (события
 * Fabric, клавиатура, ResizeObserver, таймер черновика, кадры просмотра),
 * снимается одним AbortController, как требует CLAUDE.md.
 *
 * Где что хранится:
 * - черновик (слои, тексты, анимация) — localStorage, раз в три секунды
 *   и при уходе со страницы;
 * - фото — IndexedDB, один раз при добавлении (lib/editor/assets.ts);
 * - файл шаблона — всё вместе, фото вшиты как data URL.
 *
 * Просмотр анимации двигает сами объекты холста. Пока он идёт, правки
 * выключены и черновик не пишется: иначе в него попал бы кадр
 * анимации, а не настоящее положение слоёв.
 */

const DRAFT_KEY = "otkrytochka.editor.draft";
const DRAFT_INTERVAL_MS = 3000;
/** PNG вдвое крупнее холста: 1200 × 1600, хватает для печати открытки A6. */
const PNG_MULTIPLIER = 2;
const NUDGE_STEP = 1;
const NUDGE_STEP_BIG = 10;
const CASCADE_OFFSET = 24;
const CASCADE_STEPS = 6;
const BLOB_TTL_MS = 10_000;
/** Превью шаблона: 180 × 240, вчетверо меньше PNG-экспорта. */
const PREVIEW_MULTIPLIER = 0.3;

export type EditorStatus = "loading" | "ready" | "error";

type Live = { fabric: FabricModule; canvas: Canvas; theme: Theme };

/** Фото, загруженное в эту вкладку: сама картинка и ссылка на неё. */
type Asset = { blob: Blob; url: string };

type Playback = { raf: number; items: { object: FabricObject; layer: Layer }[] };

/**
 * Ключ черновика. У каждого шаблона свой черновик: открыл из каталога
 * «Ёлку» — видишь свою «Ёлку», а не правки «Колпака». Свободный холст
 * (/editor без шаблона) живёт под прежним ключом — старые черновики целы.
 */
function draftKeyFor(template: TemplateId | null): string {
  return template === null ? DRAFT_KEY : `${DRAFT_KEY}.${template}`;
}

/** Шаблон страницы: /editor?template=… Чужое значение — свободный холст. */
function templateFromUrl(): TemplateId | null {
  const id = new URLSearchParams(window.location.search).get("template");
  return TEMPLATES.find((item) => item.id === id)?.id ?? null;
}

function readDraft(key: string): EditorDoc | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : parseEditorJson(raw);
  } catch {
    // Приватный режим Safari: хранилище бросает. Начинаем с чистого листа.
    return null;
  }
}

function download(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useCardEditor() {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const live = useRef<Live | null>(null);
  const dirty = useRef(false);
  const assets = useRef(new Map<string, Asset>());
  const playback = useRef<Playback | null>(null);

  const [status, setStatus] = useState<EditorStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<Layer | null>(null);
  const [background, setBackgroundState] = useState<Color>("paper");
  const backgroundRef = useRef<Color>("paper");
  const [duration, setDurationState] = useState(DEFAULT_DURATION);
  const durationRef = useRef(DEFAULT_DURATION);
  /** «Без анимации»: открытка видна сразу целиком, просмотр не нужен. */
  const [still, setStillState] = useState(false);
  const stillRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  /** Что именно сейчас занимает редактор — подпись под холстом. */
  const [busyText, setBusyText] = useState<TextKey>("loading.upload");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<TextKey | null>(null);
  /** Куда пишется черновик — зависит от шаблона страницы. */
  const draftKey = useRef(DRAFT_KEY);
  /** Открыли шаблон — проиграть его, когда холст готов: без движения шаблон не понять. */
  const playOnReady = useRef(false);
  /** Шаблон, открытый сейчас: подсвечен во вкладке «Шаблоны». */
  const [currentTemplate, setCurrentTemplate] = useState<TemplateId | null>(null);
  /** Превью шаблонов для вкладки «Шаблоны». */
  const [previews, setPreviews] = useState<Partial<Record<TemplateId, string>>>({});

  // ── Общие помощники ───────────────────────────────────────

  /** Снимок выделенного слоя для панели свойств. */
  const syncSelection = useCallback(() => {
    const current = live.current;
    const object = current?.canvas.getActiveObject();
    setSelected(
      current === null || object === undefined ? null : objectToLayer(current.fabric, object),
    );
  }, []);

  const markDirty = useCallback(() => {
    dirty.current = true;
    setSaved(false);
  }, []);

  const applyDocMeta = useCallback((doc: Pick<EditorDoc, "background" | "duration" | "still">) => {
    backgroundRef.current = doc.background;
    setBackgroundState(doc.background);
    durationRef.current = doc.duration;
    setDurationState(doc.duration);
    stillRef.current = doc.still === true;
    setStillState(doc.still === true);
  }, []);

  const assetUrl = useCallback((id: string) => assets.current.get(id)?.url ?? null, []);

  const registerAsset = useCallback((id: string, blob: Blob) => {
    const existing = assets.current.get(id);
    if (existing !== undefined) URL.revokeObjectURL(existing.url);
    assets.current.set(id, { blob, url: URL.createObjectURL(blob) });
  }, []);

  /** Пишет черновик, если с прошлой записи что-то поменялось. */
  const saveDraft = useCallback(() => {
    const current = live.current;
    if (!dirty.current || current === null || playback.current !== null) return;
    try {
      const draft = canvasToDoc(
        current.fabric,
        current.canvas,
        backgroundRef.current,
        durationRef.current,
      );
      if (stillRef.current) draft.still = true;
      window.localStorage.setItem(draftKey.current, JSON.stringify(draft));
      dirty.current = false;
      setSaved(true);
      // Фото удалённых слоёв больше не нужны — освобождаем место.
      void pruneAssets(usedAssets(current.canvas));
    } catch {
      // Приватный режим Safari или переполненное хранилище: сохранить
      // некуда, но работу это не останавливает.
      setSaved(false);
    }
  }, []);

  /** Останавливает просмотр и возвращает слои на место. */
  const stopPlayback = useCallback(() => {
    const current = live.current;
    const run = playback.current;
    if (run === null) return;
    cancelAnimationFrame(run.raf);
    playback.current = null;
    if (current !== null) {
      for (const { object, layer } of run.items) restoreObject(current.fabric, object, layer);
      current.canvas.skipTargetFind = false;
      current.canvas.requestRenderAll();
    }
    if (progressRef.current !== null) progressRef.current.style.width = "0%";
    setPlaying(false);
  }, []);

  // ── Жизнь холста ──────────────────────────────────────────

  useEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    if (host === null || frame === null) return;

    const controller = new AbortController();
    const { signal } = controller;
    const owned = assets.current;
    let canvas: Canvas | null = null;
    // Свой контейнер на каждый запуск: dispose() асинхронный, и при
    // быстром перезапуске эффекта (StrictMode, «Попробовать снова»)
    // старый холст не должен убрать за собой новый.
    const mount = document.createElement("div");
    host.append(mount);

    const start = async () => {
      const fabric = await import("fabric");
      if ("fonts" in document) await document.fonts.ready;
      if (signal.aborted) return;

      const theme = readTheme();
      const element = document.createElement("canvas");
      mount.append(element);

      canvas = new fabric.Canvas(element, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        // Рамкой можно выделить несколько слоёв сразу, но панели свойств
        // для группы нет. Выключено, пока не понадобится.
        selection: false,
        preserveObjectStacking: true,
      });
      live.current = { fabric, canvas, theme };

      // Черновик и его фото из IndexedDB.
      // Шаблон страницы — из каталога или из вкладки «Шаблоны».
      // Свой черновик этого шаблона, если он есть, иначе сам шаблон.
      const template = templateFromUrl();
      draftKey.current = draftKeyFor(template);
      playOnReady.current = template !== null;
      setCurrentTemplate(template);
      const doc =
        readDraft(draftKey.current) ??
        TEMPLATES.find((item) => item.id === template)?.build() ??
        emptyDoc();
      for (const layer of doc.layers) {
        if (layer.kind !== "image" || owned.has(layer.asset)) continue;
        const blob = await getAsset(layer.asset);
        if (blob !== null) registerAsset(layer.asset, blob);
      }
      if (signal.aborted) return;
      const missing = await loadDocIntoCanvas(fabric, canvas, doc, theme, assetUrl);
      if (signal.aborted) return;
      applyDocMeta(doc);
      if (missing > 0) setNotice("editor.error.photoMissing");

      // ── Масштаб под ширину экрана ─────────────────────────
      // Внутри холст всегда 600 × 800, меняется только CSS-размер.
      // Fabric сам пересчитывает координаты касания по реальному
      // размеру элемента.
      const fit = () => {
        const width = frame.clientWidth;
        if (width === 0 || canvas === null) return;
        const height = (width * CARD_HEIGHT) / CARD_WIDTH;
        canvas.setDimensions({ width: `${width}px`, height: `${height}px` }, { cssOnly: true });
      };
      const observer = new ResizeObserver(fit);
      observer.observe(frame);
      signal.addEventListener("abort", () => observer.disconnect());
      fit();

      // ── События Fabric ────────────────────────────────────
      const offs = [
        canvas.on("selection:created", syncSelection),
        canvas.on("selection:updated", syncSelection),
        canvas.on("selection:cleared", syncSelection),
        canvas.on("object:modified", () => {
          markDirty();
          syncSelection();
        }),
        canvas.on("text:changed", markDirty),
        // Стёртый до пустоты текст — невидимый слой, за который
        // не ухватиться. Убираем, как только из него вышли.
        canvas.on("text:editing:exited", ({ target }) => {
          if (target.text.trim() !== "") return;
          target.canvas?.remove(target);
          live.current?.canvas.requestRenderAll();
          markDirty();
          syncSelection();
        }),
      ];
      signal.addEventListener("abort", () => offs.forEach((off) => off()));

      // ── Докачанные шрифты ─────────────────────────────────
      // Подстраховка к loadFont: если файл шрифта пришёл уже после
      // отрисовки (редкий алфавит в тексте, медленная сеть), Fabric
      // держит в кэше ширины букв запасного шрифта. Сбрасываем кэш
      // и перемеряем текст.
      if ("fonts" in document) {
        document.fonts.addEventListener(
          "loadingdone",
          () => {
            const current = live.current;
            if (current === null) return;
            current.fabric.cache.clearFontCache();
            for (const object of current.canvas.getObjects()) {
              if (object instanceof current.fabric.IText) {
                object.initDimensions();
                object.setCoords();
              }
            }
            current.canvas.requestRenderAll();
          },
          { signal },
        );
      }

      // ── Клавиатура ────────────────────────────────────────
      // Стрелки двигают выделенный слой, Delete и Backspace удаляют.
      // Пока текст редактируется, клавиши принадлежат тексту.
      frame.addEventListener(
        "keydown",
        (event) => {
          const current = live.current;
          const object = current?.canvas.getActiveObject();
          if (current === null || object === undefined || playback.current !== null) return;
          if ("isEditing" in object && object.isEditing === true) return;

          const step = event.shiftKey ? NUDGE_STEP_BIG : NUDGE_STEP;
          const moves: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
          };
          const move = moves[event.key];

          if (move !== undefined) {
            event.preventDefault();
            object.set({ left: object.left + move[0], top: object.top + move[1] });
            object.setCoords();
            current.canvas.requestRenderAll();
            markDirty();
          } else if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault();
            current.canvas.remove(object);
            current.canvas.discardActiveObject();
            current.canvas.requestRenderAll();
            markDirty();
            syncSelection();
          }
        },
        { signal },
      );

      // ── Черновик ──────────────────────────────────────────
      // Раз в три секунды и ещё при уходе со страницы: иначе правки
      // последних секунд пропадают, если сразу закрыть вкладку.
      // pagehide и скрытие вкладки — единственные события, которые
      // мобильные браузеры гарантированно присылают перед выгрузкой.
      const timer = window.setInterval(saveDraft, DRAFT_INTERVAL_MS);
      signal.addEventListener("abort", () => window.clearInterval(timer));
      window.addEventListener("pagehide", saveDraft, { signal });
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.visibilityState === "hidden") saveDraft();
        },
        { signal },
      );

      setStatus("ready");

      // ── Превью шаблонов ───────────────────────────────────
      // Рисуются тем же кодом, что и холст, на невидимом StaticCanvas:
      // так превью всегда совпадает с тем, что ляжет на холст.
      // Сначала все шрифты шаблонов разом, потом сброс кэша ширин:
      // иначе первое превью меряет буквы запасным шрифтом — поймано
      // в браузере.
      const docs = TEMPLATES.map((item) => ({ item, doc: item.build() }));
      await Promise.all(
        docs.flatMap(({ doc }) =>
          doc.layers.flatMap((layer) =>
            layer.kind === "text"
              ? [loadFont(theme.fonts[layer.font], layer.bold, layer.italic)]
              : [],
          ),
        ),
      );
      if ("fonts" in document) await document.fonts.ready;
      fabric.cache.clearFontCache();
      if (signal.aborted) return;
      const shots: Partial<Record<TemplateId, string>> = {};
      for (const { item, doc } of docs) {
        const preview = new fabric.StaticCanvas(document.createElement("canvas"), {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          renderOnAddRemove: false,
        });
        await loadDocIntoCanvas(fabric, preview, doc, theme, assetUrl);
        preview.renderAll();
        shots[item.id] = preview.toDataURL({ format: "png", multiplier: PREVIEW_MULTIPLIER });
        await preview.dispose();
        if (signal.aborted) return;
      }
      setPreviews(shots);
    };

    start().catch(() => {
      if (!signal.aborted) setStatus("error");
    });

    return () => {
      // Сначала вернуть слои из кадра анимации на место, потом
      // черновик, потом холст. Уход внутри сайта (next/link) — тоже уход.
      stopPlayback();
      saveDraft();
      controller.abort();
      live.current = null;
      const disposing = canvas?.dispose() ?? Promise.resolve(true);
      void disposing.finally(() => {
        mount.remove();
        for (const { url } of owned.values()) URL.revokeObjectURL(url);
        owned.clear();
      });
    };
  }, [
    attempt,
    applyDocMeta,
    assetUrl,
    markDirty,
    registerAsset,
    saveDraft,
    stopPlayback,
    syncSelection,
  ]);

  // ── Правки выделенного слоя ───────────────────────────────

  /** Выполняет правку над выделенным слоем и обновляет всё вокруг. */
  const editActive = useCallback(
    (change: (object: FabricObject, current: Live) => void) => {
      const current = live.current;
      const object = current?.canvas.getActiveObject();
      if (current === null || object === undefined || playback.current !== null) return;
      change(object, current);
      object.setCoords();
      current.canvas.requestRenderAll();
      markDirty();
      syncSelection();
    },
    [markDirty, syncSelection],
  );

  /** Кладёт новый объект на холст лесенкой и выделяет его. */
  const placeNew = useCallback(
    (current: Live, object: FabricObject) => {
      // Новые слои ложатся лесенкой, а не ровно друг на друга:
      // иначе круг одного цвета с прямоугольником пропадает под ним.
      const shift = (current.canvas.getObjects().length % CASCADE_STEPS) * CASCADE_OFFSET;
      object.set({ left: object.left + shift, top: object.top + shift });
      object.setCoords();
      current.canvas.add(object);
      current.canvas.setActiveObject(object);
      current.canvas.requestRenderAll();
      markDirty();
      syncSelection();
      // Фокус на холст: дальше слой можно двигать стрелками.
      frameRef.current?.focus();
    },
    [markDirty, syncSelection],
  );

  const add = useCallback(
    async (kind: "text" | "rect" | "circle") => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      const layer = defaultLayer(kind, t("editor.text.default"));
      const object = await createObject(current.fabric, layer, current.theme, assetUrl);
      if (object !== null && live.current === current) placeNew(current, object);
    },
    [assetUrl, placeNew],
  );

  /** Текст по заготовке из вкладки «Текст». */
  const addText = useCallback(
    async (preset: TextPreset) => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      const info = TEXT_PRESET_INFO[preset];
      const base = defaultLayer("text", t(info.text));
      if (base.kind !== "text") return;
      const layer: Layer = {
        ...base,
        font: info.font,
        fontSize: info.fontSize,
        bold: info.bold,
        spacing: info.spacing,
      };
      const object = await createObject(current.fabric, layer, current.theme, assetUrl);
      if (object !== null && live.current === current) placeNew(current, object);
    },
    [assetUrl, placeNew],
  );

  const addImage = useCallback(
    async (file: File) => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      setNotice(null);
      if (usedAssets(current.canvas).size >= LIMITS.images) {
        setNotice("editor.error.photoLimit");
        return;
      }
      setBusyText("loading.upload");
      setBusy(true);
      try {
        const result = await prepareImage(file);
        if (!result.ok) {
          setNotice(result.error);
          return;
        }
        const { blob, width, height } = result.image;
        const id = newAssetId();
        registerAsset(id, blob);
        // Не вышло записать в IndexedDB — фото проживёт до перезагрузки.
        if (!(await putAsset(id, blob))) setNotice("editor.error.photoStorage");
        const object = await createObject(
          current.fabric,
          imageLayer(id, width, height),
          current.theme,
          assetUrl,
        );
        if (object === null) {
          setNotice("editor.error.photoDecode");
          return;
        }
        if (live.current === current) placeNew(current, object);
      } finally {
        setBusy(false);
      }
    },
    [assetUrl, placeNew, registerAsset],
  );

  const addSticker = useCallback(
    async (id: StickerId) => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      const { width, height } = stickerInfo(id);
      const object = await createObject(
        current.fabric,
        stickerLayer(id, width, height),
        current.theme,
        assetUrl,
      );
      if (object !== null && live.current === current) placeNew(current, object);
    },
    [assetUrl, placeNew],
  );

  /** Ставит новый объект на место старого: тот же слой по глубине, выделен. */
  const swapObject = useCallback(
    (current: Live, old: FabricObject, object: FabricObject) => {
      const index = current.canvas.getObjects().indexOf(old);
      current.canvas.remove(old);
      current.canvas.insertAt(Math.max(0, index), object);
      current.canvas.setActiveObject(object);
      current.canvas.requestRenderAll();
      markDirty();
      syncSelection();
    },
    [markDirty, syncSelection],
  );

  /** Убирает фон; не вышло — объясняет почему и отдаёт исходник. */
  const tryCutout = useCallback(async (blob: Blob) => {
    setBusyText("loading.cutout");
    const cut = await cutoutPerson(blob);
    if (cut.ok) return cut;
    setNotice(cut.error);
    return null;
  }, []);

  /**
   * Своё фото вместо выделенной заглушки или фото. Встаёт в ту же рамку
   * (вписывается по большей стороне), на тот же слой и с той же анимацией.
   * Чёрно-белое по умолчанию — если так помечен пример (коллажи
   * по образцу видео); выключается в свойствах. Пример с `fill`
   * (окно полароида) — своё фото обрезается по центру под его пропорцию.
   *
   * Заглушка с флагом `cutout` (пример фото в шаблоне «День рождения»)
   * сама убирает фон у нового фото: человек встаёт вместо примера.
   */
  const replaceImage = useCallback(
    async (file: File) => {
      const current = live.current;
      const old = current?.canvas.getActiveObject();
      if (current === null || old === undefined || playback.current !== null) return;
      const before = objectToLayer(current.fabric, old);
      if (before === null || (before.kind !== "image" && before.kind !== "sticker")) return;
      const info = before.kind === "sticker" ? stickerInfo(before.sticker) : null;
      const autoCutout = info?.cutout === true;

      setNotice(null);
      setBusyText("loading.upload");
      setBusy(true);
      try {
        const result = await prepareImage(file);
        if (!result.ok) {
          setNotice(result.error);
          return;
        }
        let { blob, width, height } = result.image;
        // Окно полароида: обрезать по центру под пропорцию примера.
        if (info?.fill === true) {
          const cropped = await cropToAspect(blob, before.width / before.height);
          if (cropped !== null) ({ blob, width, height } = cropped);
        }
        if (autoCutout) {
          const cut = await tryCutout(blob);
          if (cut !== null) ({ blob, width, height } = cut);
        }
        const id = newAssetId();
        registerAsset(id, blob);
        if (!(await putAsset(id, blob))) setNotice("editor.error.photoStorage");

        const boxW = before.width * before.scaleX;
        const boxH = before.height * before.scaleY;
        const fit = Math.min(boxW / width, boxH / height);
        const layer: Layer = {
          ...imageLayer(id, width, height),
          x: before.x,
          y: before.y,
          angle: before.angle,
          scaleX: fit,
          scaleY: fit,
          opacity: before.opacity,
          anim: before.anim,
          mono: before.kind === "image" ? before.mono : info?.mono === true,
        };
        const object = await createObject(current.fabric, layer, current.theme, assetUrl);
        if (object === null || live.current !== current) {
          setNotice("editor.error.photoDecode");
          return;
        }
        swapObject(current, old, object);
      } finally {
        setBusy(false);
      }
    },
    [assetUrl, registerAsset, swapObject, tryCutout],
  );

  /**
   * «Убрать фон» у выделенного фото. Вырезка меньше исходника: масштаб
   * тот же, а центр сдвигается на центр фигуры — с учётом поворота, —
   * чтобы человек остался на своём месте холста.
   */
  const removeBackground = useCallback(async () => {
    const current = live.current;
    const old = current?.canvas.getActiveObject();
    if (current === null || old === undefined || playback.current !== null) return;
    const before = objectToLayer(current.fabric, old);
    if (before === null || before.kind !== "image") return;
    const source = assets.current.get(before.asset);
    if (source === undefined) return;

    setNotice(null);
    setBusyText("loading.cutout");
    setBusy(true);
    try {
      const cut = await tryCutout(source.blob);
      if (cut === null) return;
      const id = newAssetId();
      registerAsset(id, cut.blob);
      if (!(await putAsset(id, cut.blob))) setNotice("editor.error.photoStorage");

      const rad = (before.angle * Math.PI) / 180;
      const dx = cut.offsetX * before.scaleX;
      const dy = cut.offsetY * before.scaleY;
      const layer: Layer = {
        ...before,
        asset: id,
        width: cut.width,
        height: cut.height,
        x: before.x + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: before.y + dx * Math.sin(rad) + dy * Math.cos(rad),
      };
      const object = await createObject(current.fabric, layer, current.theme, assetUrl);
      if (object === null || live.current !== current) {
        setNotice("editor.error.cutoutFailed");
        return;
      }
      swapObject(current, old, object);
    } finally {
      setBusy(false);
    }
  }, [assetUrl, registerAsset, swapObject, tryCutout]);

  const setMono = useCallback(
    (mono: boolean) => editActive((object, { fabric }) => applyMono(fabric, object, mono)),
    [editActive],
  );

  const setSpacing = useCallback(
    (spacing: number) =>
      editActive((object, { fabric }) => {
        if (!(object instanceof fabric.IText)) return;
        object.set(
          "charSpacing",
          Math.min(LIMITS.spacing.max, Math.max(LIMITS.spacing.min, spacing)),
        );
        object.initDimensions();
      }),
    [editActive],
  );

  const setFill = useCallback(
    (color: Color) => editActive((object, { theme }) => applyFill(object, color, theme)),
    [editActive],
  );

  const setOpacity = useCallback(
    (value: number) =>
      editActive((object) => object.set("opacity", Math.min(1, Math.max(0, value)))),
    [editActive],
  );

  const setFontSize = useCallback(
    (size: number) =>
      editActive((object, { fabric }) => {
        if (!(object instanceof fabric.IText)) return;
        const clamped = Math.min(LIMITS.fontSize.max, Math.max(LIMITS.fontSize.min, size));
        object.set("fontSize", clamped);
      }),
    [editActive],
  );

  /** Шрифт, жирный, курсив, выравнивание. Ждёт файл шрифта. */
  const setTextStyle = useCallback(
    async (style: TextStyle) => {
      const current = live.current;
      const object = current?.canvas.getActiveObject();
      if (current === null || object === undefined || playback.current !== null) return;
      await applyTextStyle(current.fabric, object, style, current.theme);
      current.canvas.requestRenderAll();
      markDirty();
      syncSelection();
    },
    [markDirty, syncSelection],
  );

  const setAnimation = useCallback(
    (change: Partial<Animation>) =>
      editActive((object, { fabric }) => {
        const layer = objectToLayer(fabric, object);
        if (layer !== null) applyAnimation(object, { ...layer.anim, ...change });
      }),
    [editActive],
  );

  const remove = useCallback(() => {
    const current = live.current;
    const object = current?.canvas.getActiveObject();
    if (current === null || object === undefined || playback.current !== null) return;
    current.canvas.remove(object);
    current.canvas.discardActiveObject();
    current.canvas.requestRenderAll();
    markDirty();
    syncSelection();
    // Кнопка «Удалить» исчезает вместе с выделением, и фокус улетел бы
    // в начало страницы. Возвращаем его на холст.
    frameRef.current?.focus();
  }, [markDirty, syncSelection]);

  // ── Открытка целиком ──────────────────────────────────────

  const setBackground = useCallback(
    (color: Color) => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      current.canvas.backgroundColor = resolveColor(color, current.theme);
      current.canvas.requestRenderAll();
      backgroundRef.current = color;
      setBackgroundState(color);
      markDirty();
    },
    [markDirty],
  );

  const setDuration = useCallback(
    (seconds: number) => {
      const value = clampDuration(seconds);
      durationRef.current = value;
      setDurationState(value);
      markDirty();
    },
    [markDirty],
  );

  /**
   * «Без анимации». Анимация слоёв не стирается: выключили и включили
   * обратно — всё на месте. Идущий просмотр останавливается.
   */
  const setStill = useCallback(
    (value: boolean) => {
      stopPlayback();
      stillRef.current = value;
      setStillState(value);
      markDirty();
    },
    [markDirty, stopPlayback],
  );

  /**
   * Просмотр анимации: кадр за кадром по requestAnimationFrame,
   * положение каждого слоя считает frameAt. В конце или по «Стоп»
   * слои возвращаются на место.
   */
  const play = useCallback(() => {
    const current = live.current;
    // Без анимации смотреть нечего: открытка и так целиком на холсте.
    if (current === null || playback.current !== null || stillRef.current) return;
    const { fabric, canvas } = current;

    const active = canvas.getActiveObject();
    if (active instanceof fabric.IText && active.isEditing) active.exitEditing();
    // Правки до просмотра — в черновик сейчас: во время просмотра он не пишется.
    saveDraft();
    canvas.discardActiveObject();
    canvas.skipTargetFind = true;

    const items = canvas.getObjects().flatMap((object) => {
      const layer = objectToLayer(fabric, object);
      return layer === null ? [] : [{ object, layer }];
    });
    const total = durationRef.current;
    const reduced = prefersReducedMotion();
    const started = performance.now();

    const tick = (now: number) => {
      const run = playback.current;
      if (run === null) return;
      const time = Math.min(total, (now - started) / 1000);
      for (const { object, layer } of run.items) {
        showFrame(fabric, object, layer, frameAt(layer, time, total, reduced));
      }
      canvas.renderAll();
      if (progressRef.current !== null) {
        progressRef.current.style.width = `${(time / total) * 100}%`;
      }
      if (time >= total) {
        stopPlayback();
        return;
      }
      run.raf = requestAnimationFrame(tick);
    };

    playback.current = { raf: requestAnimationFrame(tick), items };
    setPlaying(true);
    setSelected(null);
  }, [saveDraft, stopPlayback]);

  /**
   * Переключение на другой шаблон из вкладки «Шаблоны». Без вопроса
   * «Заменить?»: правки текущего сохраняются в его черновик, у выбранного
   * открывается свой черновик или сам шаблон. Исходные шаблоны правками
   * не трогаются. Адрес меняется вместе с шаблоном — обновление страницы
   * оставит на нём.
   */
  const switchTemplate = useCallback(
    async (id: TemplateId) => {
      const current = live.current;
      const template = TEMPLATES.find((item) => item.id === id);
      if (current === null || template === undefined) return;
      stopPlayback();
      saveDraft();
      setNotice(null);
      setBusyText("loading.editor");
      setBusy(true);
      try {
        draftKey.current = draftKeyFor(id);
        const doc = readDraft(draftKey.current) ?? template.build();
        for (const layer of doc.layers) {
          if (layer.kind !== "image" || assets.current.has(layer.asset)) continue;
          const blob = await getAsset(layer.asset);
          if (blob !== null) registerAsset(layer.asset, blob);
        }
        const missing = await loadDocIntoCanvas(
          current.fabric,
          current.canvas,
          doc,
          current.theme,
          assetUrl,
        );
        applyDocMeta(doc);
        if (missing > 0) setNotice("editor.error.photoMissing");
        dirty.current = false;
        syncSelection();
        setCurrentTemplate(id);
        const url = new URL(window.location.href);
        url.searchParams.set("template", id);
        window.history.replaceState(null, "", url);
      } finally {
        setBusy(false);
      }
      if (live.current === current) play();
    },
    [applyDocMeta, assetUrl, play, registerAsset, saveDraft, stopPlayback, syncSelection],
  );

  // Открытый шаблон проигрывается, как только холст готов.
  useEffect(() => {
    if (status !== "ready" || !playOnReady.current) return;
    playOnReady.current = false;
    play();
  }, [status, play]);

  // ── Файлы ─────────────────────────────────────────────────

  const exportPng = useCallback(() => {
    const current = live.current;
    if (current === null || playback.current !== null) return;
    // Текст в режиме правки рисует курсор — выходим из него.
    const object = current.canvas.getActiveObject();
    if (object instanceof current.fabric.IText && object.isEditing) object.exitEditing();
    const url = current.canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: PNG_MULTIPLIER,
    });
    download(url, "otkrytochka.png");
  }, []);

  /** Шаблон целиком: слои плюс фото, вшитые как data URL. */
  const exportJson = useCallback(async () => {
    const current = live.current;
    if (current === null || playback.current !== null) return;
    setBusy(true);
    try {
      const doc = canvasToDoc(
        current.fabric,
        current.canvas,
        backgroundRef.current,
        durationRef.current,
      );
      if (stillRef.current) doc.still = true;
      const embedded: Record<string, string> = {};
      for (const id of usedAssets(current.canvas)) {
        const asset = assets.current.get(id);
        if (asset !== undefined) embedded[id] = await blobToDataUrl(asset.blob);
      }
      if (Object.keys(embedded).length > 0) doc.assets = embedded;
      const blob = new Blob([JSON.stringify(doc)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      download(url, "otkrytochka-template.json");
      // Ссылка нужна только на время скачивания. Отозвать сразу после
      // клика нельзя: часть браузеров начинает скачивание асинхронно.
      window.setTimeout(() => URL.revokeObjectURL(url), BLOB_TTL_MS);
    } finally {
      setBusy(false);
    }
  }, []);

  const importFile = useCallback(
    async (file: File) => {
      const current = live.current;
      if (current === null || playback.current !== null) return;
      setNotice(null);
      if (file.size > LIMITS.fileBytes) {
        setNotice("editor.error.template");
        return;
      }
      setBusy(true);
      try {
        const doc = parseEditorJson(await file.text());
        if (doc === null) {
          setNotice("editor.error.template");
          return;
        }
        for (const [id, dataUrl] of Object.entries(doc.assets ?? {})) {
          const blob = dataUrlToBlob(dataUrl);
          registerAsset(id, blob);
          await putAsset(id, blob);
        }
        const missing = await loadDocIntoCanvas(
          current.fabric,
          current.canvas,
          doc,
          current.theme,
          assetUrl,
        );
        applyDocMeta(doc);
        if (missing > 0) setNotice("editor.error.photoMissing");
        markDirty();
        syncSelection();
      } catch {
        setNotice("editor.error.template");
      } finally {
        setBusy(false);
      }
    },
    [applyDocMeta, assetUrl, markDirty, registerAsset, syncSelection],
  );

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return {
    hostRef,
    frameRef,
    progressRef,
    status,
    selected,
    background,
    duration,
    still,
    playing,
    busy,
    busyText,
    saved,
    notice,
    currentTemplate,
    previews,
    actions: {
      switchTemplate,
      add,
      addText,
      addImage,
      addSticker,
      replaceImage,
      removeBackground,
      setMono,
      setSpacing,
      setFill,
      setOpacity,
      setFontSize,
      setTextStyle,
      setAnimation,
      remove,
      setBackground,
      setDuration,
      setStill,
      play,
      stop: stopPlayback,
      exportPng,
      exportJson,
      importFile,
      retry,
    },
  };
}
