/**
 * Формат шаблона редактора открытки.
 *
 * Гайд (design/postcard_editor_guide.pdf) сохраняет шаблон через
 * `canvas.toJSON()` — сырой снимок Fabric. Мы храним свой формат,
 * а Fabric только рисует. Причины:
 *
 * - **Проверка на входе.** Шаблон приходит из файла пользователя,
 *   а позже — с сервера. Сырой JSON Fabric умеет ссылаться на картинки
 *   по любому адресу и создавать любой класс по полю `type`. Здесь
 *   разрешены три вида слоёв и только известные поля, всё остальное
 *   отбрасывается.
 * - **Цвета — токены, а не hex.** Правило CLAUDE.md: ни одного цвета
 *   в явном виде. В шаблоне лежит имя токена, значение приходит
 *   из CSS при отрисовке. Поменяется палитра в DESIGN.md — старые
 *   шаблоны перекрасятся сами.
 * - **Обновление Fabric не ломает сохранённое.** Формат версионирован
 *   полем `version` и от версии Fabric не зависит.
 *
 * Файл намеренно без импортов: его проверяет `pnpm test` голым Node,
 * без сборщика и без алиасов `@/`.
 */

export const EDITOR_FORMAT = "otkrytochka.editor";
export const EDITOR_VERSION = 1;

/** Размер открытки в точках холста. Из гайда: 600 × 800. */
export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 800;

/**
 * Цвета, которые можно выбрать в редакторе. Имена — токены
 * `--color-*` из docs/DESIGN.md. Взяты те, что заметно различаются
 * между собой: surface/raised/line и ink/paper на открытке не отличить.
 */
export const COLOR_TOKENS = ["paper", "body", "muted", "raised", "canvas", "gold"] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/** Шрифты — роли из DESIGN.md: заголовочный Unbounded и основной Inter. */
export const FONT_ROLES = ["display", "ui"] as const;
export type FontRole = (typeof FONT_ROLES)[number];

export const LAYER_KINDS = ["text", "rect", "circle"] as const;
export type LayerKind = (typeof LAYER_KINDS)[number];

/** Пределы. Защищают и от битого файла, и от зависшей вкладки. */
export const LIMITS = {
  layers: 200,
  textLength: 500,
  fontSize: { min: 8, max: 200 },
  /** Слой может выходить за край открытки, но не улетать в бесконечность. */
  position: { min: -CARD_HEIGHT, max: CARD_HEIGHT * 2 },
  scale: { min: 0.05, max: 20 },
  size: { min: 1, max: CARD_HEIGHT * 4 },
  /** Размер файла шаблона при открытии. 200 слоёв — это около 40 КБ. */
  fileBytes: 1024 * 1024,
} as const;

type LayerBase = {
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  fill: ColorToken;
};

export type TextLayer = LayerBase & {
  kind: "text";
  text: string;
  fontSize: number;
  font: FontRole;
};

export type RectLayer = LayerBase & { kind: "rect"; width: number; height: number };

export type CircleLayer = LayerBase & { kind: "circle"; radius: number };

export type Layer = TextLayer | RectLayer | CircleLayer;

export type EditorDoc = {
  format: typeof EDITOR_FORMAT;
  version: typeof EDITOR_VERSION;
  background: ColorToken;
  /** Порядок — снизу вверх, как на холсте. */
  layers: Layer[];
};

export function emptyDoc(): EditorDoc {
  return { format: EDITOR_FORMAT, version: EDITOR_VERSION, background: "paper", layers: [] };
}

/**
 * Слой по умолчанию — то, что добавляет кнопка панели инструментов.
 * Встаёт по центру открытки. Текст подписи приходит снаружи: он из
 * словаря, а этот файл про словарь не знает.
 */
export function defaultLayer(kind: LayerKind, text: string): Layer {
  const base = { angle: 0, scaleX: 1, scaleY: 1 };

  switch (kind) {
    case "text":
      return {
        ...base,
        kind,
        x: CARD_WIDTH / 2,
        y: CARD_HEIGHT / 2,
        fill: "canvas",
        text,
        fontSize: 40,
        font: "display",
      };
    case "rect":
      return {
        ...base,
        kind,
        x: CARD_WIDTH / 2,
        y: CARD_HEIGHT / 2,
        fill: "gold",
        width: 240,
        height: 160,
      };
    case "circle":
      return { ...base, kind, x: CARD_WIDTH / 2, y: CARD_HEIGHT / 2, fill: "gold", radius: 80 };
  }
}

// ── Проверка ────────────────────────────────────────────────

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

function parseBase(raw: Obj): LayerBase | null {
  const { position, scale } = LIMITS;
  const x = num(raw.x, position.min, position.max);
  const y = num(raw.y, position.min, position.max);
  // Угол приводим к 0…360: Fabric при вращении отдаёт и отрицательные.
  const angleRaw = num(raw.angle, -3600, 3600);
  const scaleX = num(raw.scaleX, scale.min, scale.max);
  const scaleY = num(raw.scaleY, scale.min, scale.max);
  const fill = oneOf(raw.fill, COLOR_TOKENS);

  if (x === null || y === null || angleRaw === null) return null;
  if (scaleX === null || scaleY === null || fill === null) return null;

  return { x, y, angle: ((angleRaw % 360) + 360) % 360, scaleX, scaleY, fill };
}

function parseLayer(raw: unknown): Layer | null {
  if (!isObj(raw)) return null;
  const base = parseBase(raw);
  if (base === null) return null;

  switch (oneOf(raw.kind, LAYER_KINDS)) {
    case "text": {
      const { text } = raw;
      const fontSize = num(raw.fontSize, LIMITS.fontSize.min, LIMITS.fontSize.max);
      const font = oneOf(raw.font, FONT_ROLES);
      if (typeof text !== "string" || text.length > LIMITS.textLength) return null;
      if (fontSize === null || font === null) return null;
      return { ...base, kind: "text", text, fontSize, font };
    }
    case "rect": {
      const width = num(raw.width, LIMITS.size.min, LIMITS.size.max);
      const height = num(raw.height, LIMITS.size.min, LIMITS.size.max);
      if (width === null || height === null) return null;
      return { ...base, kind: "rect", width, height };
    }
    case "circle": {
      const radius = num(raw.radius, LIMITS.size.min, LIMITS.size.max);
      if (radius === null) return null;
      return { ...base, kind: "circle", radius };
    }
    case null:
      return null;
  }
}

/**
 * Разбирает шаблон из недоверенного источника: файла, localStorage,
 * позже — ответа сервера. Возвращает только то, что прошло проверку,
 * с новыми объектами без лишних полей. Битый документ — `null`
 * целиком: молча выкинутый слой хуже честной ошибки.
 */
export function parseEditorDoc(input: unknown): EditorDoc | null {
  if (!isObj(input)) return null;
  if (input.format !== EDITOR_FORMAT || input.version !== EDITOR_VERSION) return null;

  const background = oneOf(input.background, COLOR_TOKENS);
  if (background === null) return null;

  const { layers } = input;
  if (!Array.isArray(layers) || layers.length > LIMITS.layers) return null;

  const parsed: Layer[] = [];
  for (const raw of layers) {
    const layer = parseLayer(raw);
    if (layer === null) return null;
    parsed.push(layer);
  }

  return { format: EDITOR_FORMAT, version: EDITOR_VERSION, background, layers: parsed };
}

/** То же из строки: JSON.parse бросает, здесь — `null`. */
export function parseEditorJson(text: string): EditorDoc | null {
  try {
    return parseEditorDoc(JSON.parse(text));
  } catch {
    return null;
  }
}
