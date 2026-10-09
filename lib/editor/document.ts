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
 *   разрешены четыре вида слоёв и только известные поля, всё остальное
 *   отбрасывается.
 * - **Обновление Fabric не ломает сохранённое.** Формат версионирован
 *   полем `version` и от версии Fabric не зависит.
 *
 * Версии:
 * - **1** — цвета только токенами сайта, два шрифта, без фото и анимации.
 * - **2** (08.10.2026) — свой цвет `#rrggbb`, двадцать шрифтов,
 *   начертание и выравнивание, прозрачность, фото, анимация, длительность.
 *   Версия 1 читается и переводится во вторую.
 *   Дополнена тем же днём, без смены номера: стикеры, чёрно-белое фото,
 *   межбуквенный интервал, анимации из design/пример анимации и дизайна.MP4.
 *   Новые поля необязательны — шаблоны 2 без них читаются как раньше.
 *   Там же `still` — «Без анимации» (08.10.2026, тоже без смены номера).
 *   И `music` — песня открытки (08.10.2026, без смены номера).
 *
 * Цвета. Имя токена (`gold`) по-прежнему допустимо: шаблоны версии 1
 * ими написаны. С 08.10.2026 значения таких цветов заморожены
 * (TOKEN_COLORS): сайт стал светлым, и открытки пользователей не должны
 * перекрашиваться вместе с ним — тёмный текст стал бы белым на белом. Новые
 * цвета — `#rrggbb` из палитры редактора: это данные пользователя,
 * а не оформление сайта, см. docs/DESIGN.md, «Цвета содержимого открытки».
 *
 * Файл намеренно без импортов: его проверяет `pnpm test` голым Node,
 * без сборщика и без алиасов `@/`.
 */

export const EDITOR_FORMAT = "otkrytochka.editor";
export const EDITOR_VERSION = 2;

/** Размер открытки в точках холста. Из гайда: 600 × 800. */
export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 800;

/** Токены `--color-*` из docs/DESIGN.md, которые понимает шаблон. */
export const COLOR_TOKENS = ["paper", "body", "muted", "raised", "canvas", "gold"] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

/**
 * Значения токенов в открытке — палитра тёмной темы сайта, какой она
 * была, когда этими именами писали шаблоны. От app/globals.css больше
 * не зависят.
 */
export const TOKEN_COLORS: Readonly<Record<ColorToken, string>> = {
  paper: "#ffffff",
  body: "#c4c4c4",
  muted: "#9a9a9a",
  raised: "#2a2a2a",
  canvas: "#141414",
  gold: "#ecd18a",
};
export type HexColor = `#${string}`;
export type Color = ColorToken | HexColor;

/**
 * Шрифты. Порядок — порядок в списке редактора. Начертания и группы —
 * в lib/editor/fonts.ts, здесь только допустимые имена.
 */
export const FONT_IDS = [
  "inter",
  "montserrat",
  "manrope",
  "rubik",
  "nunito",
  "oswald",
  "playfair",
  "lora",
  "ptserif",
  "cormorant",
  "robotoslab",
  "unbounded",
  "russo",
  "comfortaa",
  "lobster",
  "pacifico",
  "caveat",
  "marck",
  "badscript",
  "amatic",
  "shantell",
  "ptmono",
] as const;
export type FontId = (typeof FONT_IDS)[number];

export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const LAYER_KINDS = ["text", "rect", "circle", "image", "sticker"] as const;
export type LayerKind = (typeof LAYER_KINDS)[number];

/**
 * Встроенные стикеры: SVG в public/assets/stickers. Имена, темы и
 * размеры — в lib/editor/stickers.ts, здесь только допустимые id:
 * по ним шаблон из файла не сможет сослаться ни на что, кроме своих
 * картинок.
 */
export const STICKER_IDS = [
  "photo-placeholder",
  "sample-birthday",
  "sample-party",
  "paper-label",
  "heart-pink",
  "arrow-doodle",
  "cake-mono",
  "cake-photo",
  "polaroid",
  "star-gold",
  "torn-paper",
  "snowflake-line",
  "ny-photo-1",
  "ny-photo-2",
  "ny-photo-3",
  "ny-photo-4",
  "ny-photo-5",
  "ny-photo-6",
  "party-hat",
  "candle",
  "flame",
  "match",
  "tape-pink",
  "tape-mint",
  "tape-gold",
  "tape-red",
  "heart-doodle-pink",
  "heart-doodle-red",
  "heart-red",
  "sparkle-gold",
  "sparkle-pink",
  "confetti",
  "ornament-red",
  "ornament-gold",
  "snowflake",
  "gift",
  "balloon",
  "party-popper",
  "christmas-tree",
  "snowman",
  "glowing-star",
  "tulip",
  "bouquet",
  "blossom",
  "rose",
  "love-letter",
  "kiss-mark",
  "ribbon",
  "clinking-glasses",
  // Серия по design/открытки/ (08.10.2026): примеры фото трёх форм
  // и предметы коллажей.
  "sample-sq-1",
  "sample-sq-2",
  "sample-sq-3",
  "sample-sq-4",
  "sample-sq-5",
  "sample-sq-6",
  "sample-sq-7",
  "sample-sq-8",
  "sample-sq-9",
  "sample-sq-10",
  "sample-sq-11",
  "sample-sq-12",
  "sample-wide-1",
  "sample-wide-2",
  "sample-wide-3",
  "sample-wide-4",
  "sample-wide-5",
  "sample-wide-6",
  "sample-bw-1",
  "sample-bw-2",
  "sample-bw-3",
  "sample-bw-4",
  "sample-bw-5",
  "sample-bw-sq",
  "sample-groom",
  "sample-bride",
  "sample-cinema",
  "sample-disco",
  "grid-paper",
  "paperclip",
  "film-strip",
  "glasses-doodle",
  "heart-print",
  "star-red",
  "star-doodle",
  "star-doodle-white",
  "vinyl",
  "cinema-seats",
  "sticky-note",
  "reel",
  "burst",
  "gold-swirl",
  "glitter-gold",
  "frame-sketch",
  "mirror-ball",
  "cocktail",
  "popcorn",
  "cat",
  "black-cat",
  "cat-face",
  "cupcake",
  "birthday-cake",
  "sunflower",
  "strawberry",
  "cherries",
  // Вторая серия по design/открытки/ (09.10.2026), lib/editor/series-2.ts.
  "sample-love-1",
  "sample-love-2",
  "sample-love-bg",
  "sample-strip-1",
  "sample-strip-2",
  "sample-strip-3",
  "sample-strip-4",
  "sample-strip-5",
  "sample-strip-6",
  "sample-xmas-friends",
  "sample-xmas-1",
  "sample-xmas-2",
  "sample-xmas-3",
  "sample-xmas-4",
  "sample-xmas-5",
  "sample-xmas-6",
  "sample-xmas-7",
  "sample-xmas-8",
  "sample-xmas-9",
  "sample-xmas-10",
  "sample-wed-1",
  "sample-wed-2",
  "sample-amor-1",
  "sample-amor-2",
  "sample-amor-3",
  // «Любовь это…»: пара на закате вместо силуэта (09.10.2026).
  "sample-sunset",
  "kevin",
  "xmas-tree-photo",
  "gingerbread",
  "bow-red",
  "cassette",
  "holly",
  "snowflake-rust",
  "asterisk-cream",
  "film-strip-red",
  "garland",
  "candy-cane",
  "tartan",
  "instant-camera",
  "film-strip-black",
  "clapperboard",
  "arch-corner-l",
  "arch-corner-r",
  "bicycle",
  "heart-line-red",
  "gloss-sheen",
] as const;
export type StickerId = (typeof STICKER_IDS)[number];

// ── Анимация ────────────────────────────────────────────────

/**
 * Появление. `typewriter`, `letters` и `tracking` — только для текста.
 * `letters` (по буквам), `tracking` (сборка из разрядки) и `toss-*`
 * (влёт с поворотом) — из design/пример анимации и дизайна.MP4,
 * `land` (приземление: крупно и прозрачно → на место) — из записи
 * экрана с новогодней открыткой.
 */
export const ANIM_IN = [
  "none",
  "fade",
  "slide-left",
  "slide-right",
  "slide-top",
  "slide-bottom",
  "toss-left",
  "toss-right",
  "toss-top",
  "toss-bottom",
  "zoom",
  "land",
  "pop",
  "rotate",
  "typewriter",
  "letters",
  "tracking",
] as const;
export type AnimIn = (typeof ANIM_IN)[number];

/**
 * Во время показа. `marquee` — только текст, `kenburns` — только фото.
 * `flicker` — огонёк свечи, `heartbeat` — двойной удар сердца.
 */
export const ANIM_LOOP = [
  "none",
  "pulse",
  "heartbeat",
  "float",
  "swing",
  "shake",
  "blink",
  "flicker",
  "marquee",
  "kenburns",
] as const;
export type AnimLoop = (typeof ANIM_LOOP)[number];

/** Исчезание. Направление — куда слой уходит. */
export const ANIM_OUT = [
  "none",
  "fade",
  "slide-left",
  "slide-right",
  "slide-top",
  "slide-bottom",
  "zoom",
  "rotate",
] as const;
export type AnimOut = (typeof ANIM_OUT)[number];

const TEXT_ONLY_IN: readonly AnimIn[] = ["typewriter", "letters", "tracking"];

/** Какие варианты имеют смысл для какого слоя. */
export function animInFor(kind: LayerKind): readonly AnimIn[] {
  return kind === "text" ? ANIM_IN : ANIM_IN.filter((a) => !TEXT_ONLY_IN.includes(a));
}

export function isTextOnlyIn(anim: AnimIn): boolean {
  return TEXT_ONLY_IN.includes(anim);
}

export function animLoopFor(kind: LayerKind): readonly AnimLoop[] {
  return ANIM_LOOP.filter(
    (a) => (a !== "marquee" || kind === "text") && (a !== "kenburns" || kind === "image"),
  );
}

/** Секунды. Плоско, а не вложенными объектами: так проще проверять. */
export type Animation = {
  in: AnimIn;
  inDuration: number;
  delay: number;
  loop: AnimLoop;
  loopPeriod: number;
  out: AnimOut;
  outDuration: number;
};

export const NO_ANIMATION: Animation = {
  in: "none",
  inDuration: 0.8,
  delay: 0,
  loop: "none",
  loopPeriod: 2,
  out: "none",
  outDuration: 0.8,
};

// ── Пределы ─────────────────────────────────────────────────

/** Защищают и от битого файла, и от зависшей вкладки. */
export const LIMITS = {
  layers: 200,
  images: 10,
  textLength: 500,
  fontSize: { min: 8, max: 200 },
  /** Слой может выходить за край открытки, но не улетать в бесконечность. */
  position: { min: -CARD_HEIGHT, max: CARD_HEIGHT * 2 },
  scale: { min: 0.02, max: 20 },
  size: { min: 1, max: CARD_HEIGHT * 4 },
  opacity: { min: 0, max: 1 },
  /** Межбуквенный интервал, тысячные доли кегля — как charSpacing в Fabric. */
  spacing: { min: -100, max: 800 },
  /** Длительность открытки целиком, секунды. */
  duration: { min: 2, max: 60 },
  delay: { min: 0, max: 60 },
  animDuration: { min: 0.1, max: 10 },
  loopPeriod: { min: 0.3, max: 20 },
  /** Одно фото внутри файла шаблона, символов base64. Около 3 МБ. */
  assetChars: 4_200_000,
  /** Файл шаблона целиком. С десятью фото — до 30 МБ. */
  fileBytes: 32 * 1024 * 1024,
} as const;

export const DEFAULT_DURATION = 6;

// ── Типы слоёв ──────────────────────────────────────────────

type LayerBase = {
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  anim: Animation;
};

export type TextLayer = LayerBase & {
  kind: "text";
  fill: Color;
  text: string;
  fontSize: number;
  font: FontId;
  bold: boolean;
  italic: boolean;
  align: TextAlign;
  /** Межбуквенный интервал, тысячные кегля. 0 — как задумано шрифтом. */
  spacing: number;
};

export type RectLayer = LayerBase & { kind: "rect"; fill: Color; width: number; height: number };

export type CircleLayer = LayerBase & { kind: "circle"; fill: Color; radius: number };

/**
 * Фото. Само изображение лежит не в слое, а в хранилище по `asset`:
 * в черновике — в IndexedDB браузера, в файле шаблона — в `assets`.
 * Ширина и высота — размер пересохранённой картинки в точках.
 */
export type ImageLayer = LayerBase & {
  kind: "image";
  asset: string;
  width: number;
  height: number;
  /** Чёрно-белое — как фото в design/пример анимации и дизайна.MP4. */
  mono: boolean;
};

/**
 * Встроенная картинка из public/assets/stickers. Ширина и высота —
 * собственный размер SVG, масштаб — в scaleX/scaleY.
 */
export type StickerLayer = LayerBase & {
  kind: "sticker";
  sticker: StickerId;
  width: number;
  height: number;
};

export type Layer = TextLayer | RectLayer | CircleLayer | ImageLayer | StickerLayer;

/**
 * Музыка открытки — ссылка на трек, а не сам звук.
 *
 * - `library` — 15-секундный отрывок из нашей библиотеки свободной
 *   музыки, lib/editor/music.ts. Здесь проверяется только вид id:
 *   трек, которого в библиотеке нет, просто не играет.
 * - `yandex` — трек Яндекс Музыки, играет официальный плеер Яндекса
 *   во фрейме. Только числовые id: файл шаблона не может подсунуть
 *   во фрейм произвольный адрес.
 */
export type CardMusic =
  { kind: "library"; id: string } | { kind: "yandex"; album: string; track: string };

export type EditorDoc = {
  format: typeof EDITOR_FORMAT;
  version: typeof EDITOR_VERSION;
  background: Color;
  /** Длительность открытки, секунды: за это время отыгрывает вся анимация. */
  duration: number;
  /** Порядок — снизу вверх, как на холсте. */
  layers: Layer[];
  /**
   * «Без анимации»: открытка показывается сразу целиком, анимация
   * слоёв хранится, но не играет — её можно включить обратно.
   * Поле есть только когда включено: старые шаблоны его не знают.
   */
  still?: true;
  /** Песня открытки. Нет поля — открытка без музыки. */
  music?: CardMusic;
  /**
   * Фото внутри файла шаблона: id → data URL. Есть только в файле,
   * который скачали кнопкой «Сохранить шаблон». В черновике пусто:
   * там фото в IndexedDB.
   */
  assets?: Record<string, string>;
};

export function emptyDoc(): EditorDoc {
  return {
    format: EDITOR_FORMAT,
    version: EDITOR_VERSION,
    background: "paper",
    duration: DEFAULT_DURATION,
    layers: [],
  };
}

/**
 * Слой по умолчанию — то, что добавляет кнопка панели инструментов.
 * Встаёт по центру открытки. Текст подписи приходит снаружи: он из
 * словаря, а этот файл про словарь не знает. Фото добавляется
 * отдельно — ему нужен размер картинки, см. imageLayer.
 */
export function defaultLayer(kind: "text" | "rect" | "circle", text: string): Layer {
  const base = {
    x: CARD_WIDTH / 2,
    y: CARD_HEIGHT / 2,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    anim: { ...NO_ANIMATION },
  };

  switch (kind) {
    case "text":
      return {
        ...base,
        kind,
        fill: "canvas",
        text,
        fontSize: 40,
        font: "unbounded",
        bold: false,
        italic: false,
        align: "center",
        spacing: 0,
      };
    case "rect":
      return { ...base, kind, fill: "gold", width: 240, height: 160 };
    case "circle":
      return { ...base, kind, fill: "gold", radius: 80 };
  }
}

/** Фото вписывается в 400 × 400 по центру открытки. */
export function imageLayer(asset: string, width: number, height: number): ImageLayer {
  const fit = Math.min(1, 400 / width, 400 / height);
  return {
    kind: "image",
    asset,
    width,
    height,
    x: CARD_WIDTH / 2,
    y: CARD_HEIGHT / 2,
    angle: 0,
    scaleX: fit,
    scaleY: fit,
    opacity: 1,
    anim: { ...NO_ANIMATION },
    mono: false,
  };
}

/** Стикер вписывается в 200 × 200 по центру открытки. */
export function stickerLayer(sticker: StickerId, width: number, height: number): StickerLayer {
  const fit = Math.min(1, 200 / width, 200 / height);
  return {
    kind: "sticker",
    sticker,
    width,
    height,
    x: CARD_WIDTH / 2,
    y: CARD_HEIGHT / 2,
    angle: 0,
    scaleX: fit,
    scaleY: fit,
    opacity: 1,
    anim: { ...NO_ANIMATION },
  };
}

// ── Проверка ────────────────────────────────────────────────

type Obj = Record<string, unknown>;
type Range = { readonly min: number; readonly max: number };

const HEX = /^#[0-9a-f]{6}$/i;
const ASSET_ID = /^[a-z0-9]{8,40}$/;
const MUSIC_ID = /^[a-z0-9-]{1,40}$/;
const YANDEX_ID = /^[0-9]{1,12}$/;
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown, { min, max }: Range): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? value
    : null;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function isAssetId(value: unknown): value is string {
  return typeof value === "string" && ASSET_ID.test(value);
}

/** Цвет: имя токена или `#rrggbb`. Hex приводится к нижнему регистру. */
export function parseColor(value: unknown): Color | null {
  const token = oneOf(value, COLOR_TOKENS);
  if (token !== null) return token;
  return typeof value === "string" && HEX.test(value) ? (value.toLowerCase() as HexColor) : null;
}

function parseAnimation(raw: unknown): Animation | null {
  if (!isObj(raw)) return null;
  const anim = {
    in: oneOf(raw.in, ANIM_IN),
    inDuration: num(raw.inDuration, LIMITS.animDuration),
    delay: num(raw.delay, LIMITS.delay),
    loop: oneOf(raw.loop, ANIM_LOOP),
    loopPeriod: num(raw.loopPeriod, LIMITS.loopPeriod),
    out: oneOf(raw.out, ANIM_OUT),
    outDuration: num(raw.outDuration, LIMITS.animDuration),
  };
  for (const value of Object.values(anim)) if (value === null) return null;
  return anim as Animation;
}

/** Версия 1: шрифты были ролями сайта, а не именами. */
const V1_FONTS = { display: "unbounded", ui: "inter" } as const;

function parseLayer(raw: unknown, version: 1 | 2): Layer | null {
  if (!isObj(raw)) return null;
  const { position, scale } = LIMITS;

  const x = num(raw.x, position);
  const y = num(raw.y, position);
  // Угол приводим к 0…360: Fabric при вращении отдаёт и отрицательные.
  const angleRaw = num(raw.angle, { min: -3600, max: 3600 });
  const scaleX = num(raw.scaleX, scale);
  const scaleY = num(raw.scaleY, scale);
  const opacity = version === 1 ? 1 : num(raw.opacity, LIMITS.opacity);
  const anim = version === 1 ? { ...NO_ANIMATION } : parseAnimation(raw.anim);

  if (x === null || y === null || angleRaw === null || scaleX === null || scaleY === null) {
    return null;
  }
  if (opacity === null || anim === null) return null;

  const base = { x, y, angle: ((angleRaw % 360) + 360) % 360, scaleX, scaleY, opacity, anim };
  const kind = oneOf(raw.kind, LAYER_KINDS);

  if (kind === "image") {
    if (version === 1 || !isAssetId(raw.asset)) return null;
    const width = num(raw.width, LIMITS.size);
    const height = num(raw.height, LIMITS.size);
    // Необязательное: шаблоны версии 2 до стикеров его не знали.
    const mono = raw.mono === undefined ? false : bool(raw.mono);
    if (width === null || height === null || mono === null) return null;
    return { ...base, kind, asset: raw.asset, width, height, mono };
  }

  if (kind === "sticker") {
    const sticker = version === 1 ? null : oneOf(raw.sticker, STICKER_IDS);
    const width = num(raw.width, LIMITS.size);
    const height = num(raw.height, LIMITS.size);
    if (sticker === null || width === null || height === null) return null;
    return { ...base, kind, sticker, width, height };
  }

  const fill = version === 1 ? oneOf(raw.fill, COLOR_TOKENS) : parseColor(raw.fill);
  if (fill === null) return null;

  switch (kind) {
    case "text": {
      const { text } = raw;
      const fontSize = num(raw.fontSize, LIMITS.fontSize);
      if (typeof text !== "string" || text.length > LIMITS.textLength || fontSize === null) {
        return null;
      }
      if (version === 1) {
        const role = oneOf(raw.font, ["display", "ui"] as const);
        if (role === null) return null;
        return {
          ...base,
          kind,
          fill,
          text,
          fontSize,
          font: V1_FONTS[role],
          bold: false,
          italic: false,
          align: "center",
          spacing: 0,
        };
      }
      const font = oneOf(raw.font, FONT_IDS);
      const bold = bool(raw.bold);
      const italic = bool(raw.italic);
      const align = oneOf(raw.align, TEXT_ALIGNS);
      // Необязательное: шаблоны версии 2 до стикеров его не знали.
      const spacing = raw.spacing === undefined ? 0 : num(raw.spacing, LIMITS.spacing);
      if (font === null || bold === null || italic === null || align === null) return null;
      if (spacing === null) return null;
      return { ...base, kind, fill, text, fontSize, font, bold, italic, align, spacing };
    }
    case "rect": {
      const width = num(raw.width, LIMITS.size);
      const height = num(raw.height, LIMITS.size);
      if (width === null || height === null) return null;
      return { ...base, kind, fill, width, height };
    }
    case "circle": {
      const radius = num(raw.radius, LIMITS.size);
      if (radius === null) return null;
      return { ...base, kind, fill, radius };
    }
    case null:
      return null;
  }
}

function parseAssets(raw: unknown): Record<string, string> | null {
  if (raw === undefined) return {};
  if (!isObj(raw)) return null;
  const entries = Object.entries(raw);
  if (entries.length > LIMITS.images) return null;
  const assets: Record<string, string> = {};
  for (const [id, url] of entries) {
    if (!isAssetId(id) || typeof url !== "string") return null;
    if (url.length > LIMITS.assetChars || !DATA_URL.test(url)) return null;
    assets[id] = url;
  }
  return assets;
}

/**
 * Разбирает шаблон из недоверенного источника: файла, localStorage,
 * позже — ответа сервера. Возвращает только то, что прошло проверку,
 * с новыми объектами без лишних полей. Битый документ — `null`
 * целиком: молча выкинутый слой хуже честной ошибки.
 *
 * Фото в `assets`, на которые не ссылается ни один слой, отбрасываются.
 * Слой фото без картинки в `assets` проверку проходит: в черновике
 * картинки лежат в IndexedDB, и найдёт их уже загрузчик.
 */
export function parseMusic(raw: unknown): CardMusic | null {
  if (!isObj(raw)) return null;
  if (raw.kind === "library" && typeof raw.id === "string" && MUSIC_ID.test(raw.id)) {
    return { kind: "library", id: raw.id };
  }
  if (
    raw.kind === "yandex" &&
    typeof raw.album === "string" &&
    typeof raw.track === "string" &&
    YANDEX_ID.test(raw.album) &&
    YANDEX_ID.test(raw.track)
  ) {
    return { kind: "yandex", album: raw.album, track: raw.track };
  }
  return null;
}

export function parseEditorDoc(input: unknown): EditorDoc | null {
  if (!isObj(input) || input.format !== EDITOR_FORMAT) return null;
  const version = input.version === 1 || input.version === 2 ? input.version : null;
  if (version === null) return null;

  const background =
    version === 1 ? oneOf(input.background, COLOR_TOKENS) : parseColor(input.background);
  const duration = version === 1 ? DEFAULT_DURATION : num(input.duration, LIMITS.duration);
  if (background === null || duration === null) return null;

  const { layers } = input;
  if (!Array.isArray(layers) || layers.length > LIMITS.layers) return null;

  const parsed: Layer[] = [];
  for (const raw of layers) {
    const layer = parseLayer(raw, version);
    if (layer === null) return null;
    parsed.push(layer);
  }
  if (parsed.filter((l) => l.kind === "image").length > LIMITS.images) return null;

  const allAssets = parseAssets(input.assets);
  if (allAssets === null) return null;
  const used = new Set(parsed.flatMap((l) => (l.kind === "image" ? [l.asset] : [])));
  const assets = Object.fromEntries(Object.entries(allAssets).filter(([id]) => used.has(id)));

  const doc: EditorDoc = {
    format: EDITOR_FORMAT,
    version: EDITOR_VERSION,
    background,
    duration,
    layers: parsed,
  };
  if (input.still === true) doc.still = true;
  // Непонятная музыка не валит открытку: она просто будет без звука.
  const music = parseMusic(input.music);
  if (music !== null) doc.music = music;
  if (Object.keys(assets).length > 0) doc.assets = assets;
  return doc;
}

// ── Приведение к пределам ───────────────────────────────────

function clamp(value: number, { min, max }: Range): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function clampAnimation(anim: Animation): Animation {
  return {
    in: anim.in,
    inDuration: clamp(anim.inDuration, LIMITS.animDuration),
    delay: clamp(anim.delay, LIMITS.delay),
    loop: anim.loop,
    loopPeriod: clamp(anim.loopPeriod, LIMITS.loopPeriod),
    out: anim.out,
    outDuration: clamp(anim.outDuration, LIMITS.animDuration),
  };
}

/**
 * Загоняет слой с холста в пределы LIMITS. Проверка на входе строгая
 * и отвергает шаблон целиком, а холст пределов не знает: в тексте можно
 * набрать 600 знаков, стрелками увести слой далеко за край, ручкой
 * растянуть в 30 раз. Без этого такой черновик сохранился бы, а при
 * следующем открытии не прошёл бы проверку — и пропал целиком.
 * Поэтому всё, что уходит с холста, проходит через эту функцию.
 *
 * Новое числовое поле слоя = правка и в parseLayer, и здесь.
 */
export function clampLayer(layer: Layer): Layer {
  const base = {
    x: clamp(layer.x, LIMITS.position),
    y: clamp(layer.y, LIMITS.position),
    angle: Number.isFinite(layer.angle) ? ((layer.angle % 360) + 360) % 360 : 0,
    scaleX: clamp(layer.scaleX, LIMITS.scale),
    scaleY: clamp(layer.scaleY, LIMITS.scale),
    opacity: clamp(layer.opacity, LIMITS.opacity),
    anim: clampAnimation(layer.anim),
  };

  switch (layer.kind) {
    case "text":
      return {
        ...base,
        kind: "text",
        fill: layer.fill,
        text: layer.text.slice(0, LIMITS.textLength),
        fontSize: clamp(layer.fontSize, LIMITS.fontSize),
        font: layer.font,
        bold: layer.bold,
        italic: layer.italic,
        align: layer.align,
        spacing: clamp(layer.spacing, LIMITS.spacing),
      };
    case "rect":
      return {
        ...base,
        kind: "rect",
        fill: layer.fill,
        width: clamp(layer.width, LIMITS.size),
        height: clamp(layer.height, LIMITS.size),
      };
    case "circle":
      return {
        ...base,
        kind: "circle",
        fill: layer.fill,
        radius: clamp(layer.radius, LIMITS.size),
      };
    case "image":
      return {
        ...base,
        kind: "image",
        asset: layer.asset,
        width: clamp(layer.width, LIMITS.size),
        height: clamp(layer.height, LIMITS.size),
        mono: layer.mono,
      };
    case "sticker":
      return {
        ...base,
        kind: "sticker",
        sticker: layer.sticker,
        width: clamp(layer.width, LIMITS.size),
        height: clamp(layer.height, LIMITS.size),
      };
  }
}

export function clampDuration(seconds: number): number {
  return clamp(seconds, LIMITS.duration);
}

/** То же из строки: JSON.parse бросает, здесь — `null`. */
export function parseEditorJson(text: string): EditorDoc | null {
  try {
    return parseEditorDoc(JSON.parse(text));
  } catch {
    return null;
  }
}
