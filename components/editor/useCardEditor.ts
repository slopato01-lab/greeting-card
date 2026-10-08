"use client";

import type { Canvas, FabricObject } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  type ColorToken,
  defaultLayer,
  type EditorDoc,
  emptyDoc,
  type FontRole,
  LIMITS,
  type LayerKind,
  parseEditorJson,
} from "@/lib/editor/document";
import {
  applyFill,
  applyFont,
  canvasToDoc,
  createObject,
  type FabricModule,
  loadDocIntoCanvas,
  objectToLayer,
  readTheme,
  type Theme,
} from "@/lib/editor/fabric";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Состояние и действия редактора открытки. Компоненты в этой папке
 * только рисуют то, что отдаёт хук, и зовут его действия, — сам холст
 * Fabric за пределы хука не выходит.
 *
 * Жизненный цикл холста — один эффект. Всё, что он подписал (события
 * Fabric, клавиатура, ResizeObserver, таймер черновика), снимается
 * одним AbortController, как требует CLAUDE.md.
 *
 * Черновик раз в три секунды пишется в localStorage, если что-то
 * поменялось. На сервер — когда появится сервер, тем же форматом.
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

export type EditorStatus = "loading" | "ready" | "error";

/** Свойства выделенного слоя — то, что показывает панель свойств. */
export type EditorSelection = {
  kind: LayerKind;
  fill: ColorToken;
  fontSize: number | null;
  font: FontRole | null;
};

type Live = { fabric: FabricModule; canvas: Canvas; theme: Theme };

function readDraft(): EditorDoc | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
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

export function useCardEditor() {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const live = useRef<Live | null>(null);
  const dirty = useRef(false);

  const [status, setStatus] = useState<EditorStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  const [background, setBackgroundState] = useState<ColorToken>("paper");
  const backgroundRef = useRef<ColorToken>("paper");
  const [saved, setSaved] = useState(false);
  const [fileError, setFileError] = useState<TextKey | null>(null);

  /** Снимок выделения для панели свойств. */
  const syncSelection = useCallback(() => {
    const current = live.current;
    const object = current?.canvas.getActiveObject();
    if (current === null || object === undefined) {
      setSelection(null);
      return;
    }
    const layer = objectToLayer(current.fabric, object);
    if (layer === null) {
      setSelection(null);
      return;
    }
    setSelection({
      kind: layer.kind,
      fill: layer.fill,
      fontSize: layer.kind === "text" ? layer.fontSize : null,
      font: layer.kind === "text" ? layer.font : null,
    });
  }, []);

  const markDirty = useCallback(() => {
    dirty.current = true;
    setSaved(false);
  }, []);

  const applyBackground = useCallback((token: ColorToken) => {
    backgroundRef.current = token;
    setBackgroundState(token);
  }, []);

  /** Пишет черновик, если с прошлой записи что-то поменялось. */
  const saveDraft = useCallback(() => {
    const current = live.current;
    if (!dirty.current || current === null) return;
    try {
      const draft = canvasToDoc(current.fabric, current.canvas, backgroundRef.current);
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      dirty.current = false;
      setSaved(true);
    } catch {
      // Приватный режим Safari: сохранить некуда, но работу
      // это не останавливает.
      setSaved(false);
    }
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const frame = frameRef.current;
    if (host === null || frame === null) return;

    const controller = new AbortController();
    const { signal } = controller;
    let canvas: Canvas | null = null;
    // Свой контейнер на каждый запуск: dispose() асинхронный, и при
    // быстром перезапуске эффекта (StrictMode, «Попробовать снова»)
    // старый холст не должен убрать за собой новый.
    const mount = document.createElement("div");
    host.append(mount);

    const start = async () => {
      const fabric = await import("fabric");
      // Холст меряет текст в момент создания. Пока шрифт не скачан,
      // рамки текста посчитаются по запасному и разъедутся.
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

      const doc = readDraft() ?? emptyDoc();
      loadDocIntoCanvas(fabric, canvas, doc, theme);
      applyBackground(doc.background);

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

      // ── Клавиатура ────────────────────────────────────────
      // Стрелки двигают выделенный слой, Delete и Backspace удаляют.
      // Пока текст редактируется, клавиши принадлежат тексту.
      frame.addEventListener(
        "keydown",
        (event) => {
          const current = live.current;
          const object = current?.canvas.getActiveObject();
          if (current === null || object === undefined) return;
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
    };

    start().catch(() => {
      if (!signal.aborted) setStatus("error");
    });

    return () => {
      // Уход со страницы внутри сайта (next/link) — тоже уход:
      // сначала черновик, потом холст.
      saveDraft();
      controller.abort();
      live.current = null;
      const disposing = canvas?.dispose() ?? Promise.resolve(true);
      void disposing.finally(() => mount.remove());
    };
  }, [attempt, applyBackground, markDirty, saveDraft, syncSelection]);

  // ── Действия ──────────────────────────────────────────────

  /** Выполняет правку над выделенным слоем и обновляет всё вокруг. */
  const editActive = useCallback(
    (change: (object: FabricObject, current: Live) => void) => {
      const current = live.current;
      const object = current?.canvas.getActiveObject();
      if (current === null || object === undefined) return;
      change(object, current);
      object.setCoords();
      current.canvas.requestRenderAll();
      markDirty();
      syncSelection();
    },
    [markDirty, syncSelection],
  );

  const add = useCallback(
    (kind: LayerKind) => {
      const current = live.current;
      if (current === null) return;
      // Новые слои ложатся лесенкой, а не ровно друг на друга:
      // иначе круг одного цвета с прямоугольником пропадает под ним.
      const layer = defaultLayer(kind, t("editor.text.default"));
      const shift = (current.canvas.getObjects().length % CASCADE_STEPS) * CASCADE_OFFSET;
      layer.x += shift;
      layer.y += shift;
      const object = createObject(current.fabric, layer, current.theme);
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

  const setFill = useCallback(
    (token: ColorToken) => editActive((object, { theme }) => applyFill(object, token, theme)),
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

  const setFont = useCallback(
    (role: FontRole) =>
      editActive((object, { fabric, theme }) => {
        if (object instanceof fabric.IText) applyFont(object, role, theme);
      }),
    [editActive],
  );

  const remove = useCallback(() => {
    const current = live.current;
    const object = current?.canvas.getActiveObject();
    if (current === null || object === undefined) return;
    current.canvas.remove(object);
    current.canvas.discardActiveObject();
    current.canvas.requestRenderAll();
    markDirty();
    syncSelection();
    // Кнопка «Удалить» исчезает вместе с выделением, и фокус улетел бы
    // в начало страницы. Возвращаем его на холст.
    frameRef.current?.focus();
  }, [markDirty, syncSelection]);

  const setBackground = useCallback(
    (token: ColorToken) => {
      const current = live.current;
      if (current === null) return;
      current.canvas.backgroundColor = current.theme.colors[token];
      current.canvas.requestRenderAll();
      applyBackground(token);
      markDirty();
    },
    [applyBackground, markDirty],
  );

  const exportPng = useCallback(() => {
    const current = live.current;
    if (current === null) return;
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

  const exportJson = useCallback(() => {
    const current = live.current;
    if (current === null) return;
    const doc = canvasToDoc(current.fabric, current.canvas, backgroundRef.current);
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    download(url, "otkrytochka-template.json");
    // Ссылка нужна только на время скачивания. Отозвать сразу после
    // клика нельзя: часть браузеров начинает скачивание асинхронно.
    window.setTimeout(() => URL.revokeObjectURL(url), BLOB_TTL_MS);
  }, []);

  const importFile = useCallback(
    async (file: File) => {
      setFileError(null);
      if (file.size > LIMITS.fileBytes) {
        setFileError("editor.error.template");
        return;
      }
      let text: string;
      try {
        text = await file.text();
      } catch {
        setFileError("editor.error.template");
        return;
      }
      const doc = parseEditorJson(text);
      const current = live.current;
      if (doc === null || current === null) {
        setFileError("editor.error.template");
        return;
      }
      loadDocIntoCanvas(current.fabric, current.canvas, doc, current.theme);
      applyBackground(doc.background);
      markDirty();
      syncSelection();
    },
    [applyBackground, markDirty, syncSelection],
  );

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return {
    hostRef,
    frameRef,
    status,
    selection,
    background,
    saved,
    fileError,
    actions: {
      add,
      setFill,
      setFontSize,
      setFont,
      remove,
      setBackground,
      exportPng,
      exportJson,
      importFile,
      retry,
    },
  };
}
