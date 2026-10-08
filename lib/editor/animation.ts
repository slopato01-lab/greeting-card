import { CARD_HEIGHT, CARD_WIDTH, type Layer } from "./document.ts";

/**
 * Движок анимации редактора. Чистые функции: время → поправки к слою.
 *
 * Не `object.animate()` из Fabric, а расчёт кадра по времени, потому что:
 * - кадр можно получить для любого момента — перемотка, пауза
 *   и будущий экспорт в видео идут через одну и ту же функцию;
 * - одинаковое время всегда даёт одинаковый кадр, это проверяют тесты;
 * - три фазы слоя (появление, показ, исчезание) складываются в одном
 *   месте, а не гоняются наперегонки тремя твинами.
 *
 * Шкала слоя внутри открытки длиной `duration`:
 *
 *   0 ── delay ── [появление] ── [показ, по кругу] ── [исчезание] ── duration
 *
 * Исчезание прижато к концу открытки. До начала появления слой не виден,
 * если появление задано; без него слой виден с первого кадра.
 *
 * Файл импортирует document.ts с расширением: его гоняет `pnpm test`
 * голым Node.
 */

export type Frame = {
  /** Сдвиг от места слоя, точки холста. */
  dx: number;
  dy: number;
  /** Множитель масштаба. */
  scale: number;
  /** Добавка к углу, градусы. */
  angle: number;
  /** Множитель прозрачности слоя. */
  opacity: number;
  /** Доля видимого текста, 0…1. Только для «печатной машинки». */
  reveal: number;
};

export const IDENTITY: Frame = { dx: 0, dy: 0, scale: 1, angle: 0, opacity: 1, reveal: 1 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
const easeInOut = (p: number) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2);
/** С перелётом за 1 и возвратом — «пружинка». */
const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (p - 1) ** 3 + c1 * (p - 1) ** 2;
};
const frac = (v: number) => v - Math.floor(v);
const wave = (phase: number) => Math.sin(phase * 2 * Math.PI);

function combine(a: Frame, b: Frame): Frame {
  return {
    dx: a.dx + b.dx,
    dy: a.dy + b.dy,
    scale: a.scale * b.scale,
    angle: a.angle + b.angle,
    opacity: a.opacity * b.opacity,
    reveal: Math.min(a.reveal, b.reveal),
  };
}

/** Сдвиг «за край открытки» в нужную сторону. */
function offscreen(direction: "left" | "right" | "top" | "bottom"): { dx: number; dy: number } {
  switch (direction) {
    case "left":
      return { dx: -CARD_WIDTH, dy: 0 };
    case "right":
      return { dx: CARD_WIDTH, dy: 0 };
    case "top":
      return { dx: 0, dy: -CARD_HEIGHT };
    case "bottom":
      return { dx: 0, dy: CARD_HEIGHT };
  }
}

/**
 * Появление. `p` — прогресс 0…1, при p = 1 кадр всегда тождественный.
 * Исчезание считается этой же функцией с обратным прогрессом:
 * «уехать влево» — это «приехать слева», проигранное назад.
 */
function enter(type: Layer["anim"]["in"] | Layer["anim"]["out"], p: number): Frame {
  const e = easeOutCubic(p);
  switch (type) {
    case "none":
      return IDENTITY;
    case "fade":
      return { ...IDENTITY, opacity: e };
    case "slide-left":
    case "slide-right":
    case "slide-top":
    case "slide-bottom": {
      const { dx, dy } = offscreen(type.slice("slide-".length) as "left");
      return { ...IDENTITY, dx: dx * (1 - e), dy: dy * (1 - e) };
    }
    case "zoom":
      return { ...IDENTITY, scale: 0.3 + 0.7 * e, opacity: e };
    case "pop":
      return { ...IDENTITY, scale: Math.max(0, easeOutBack(p)), opacity: clamp01(p * 3) };
    case "rotate":
      return { ...IDENTITY, angle: -180 * (1 - e), scale: 0.2 + 0.8 * e, opacity: e };
    case "typewriter":
      return { ...IDENTITY, reveal: p };
  }
}

/** Показ. `phase` — сколько периодов прошло, `span` — доля показа 0…1. */
function loop(layer: Layer, phase: number, span: number): Frame {
  switch (layer.anim.loop) {
    case "none":
      return IDENTITY;
    case "pulse":
      return { ...IDENTITY, scale: 1 + 0.06 * wave(phase) };
    case "float":
      return { ...IDENTITY, dy: -10 * wave(phase) };
    case "swing":
      return { ...IDENTITY, angle: 6 * wave(phase) };
    case "shake":
      return { ...IDENTITY, dx: 6 * wave(phase * 4) };
    case "blink":
      return { ...IDENTITY, opacity: 0.25 + 0.75 * (0.5 + 0.5 * Math.cos(phase * 2 * Math.PI)) };
    case "marquee":
      // Бегущая строка: с места влево до края, затем снова справа.
      // Начинается с нуля, чтобы не прыгать после появления.
      if (layer.kind !== "text") return IDENTITY;
      return { ...IDENTITY, dx: CARD_WIDTH * (1 - 2 * frac(phase + 0.5)) };
    case "kenburns":
      // Медленный наезд на фото за весь показ, без повторов.
      if (layer.kind !== "image") return IDENTITY;
      return { ...IDENTITY, scale: 1 + 0.15 * easeInOut(span), dx: -12 * easeInOut(span) };
  }
}

/** Для prefers-reduced-motion: любое движение заменяется проявлением. */
function calm(layer: Layer): Layer {
  const { anim } = layer;
  return {
    ...layer,
    anim: {
      ...anim,
      in: anim.in === "none" ? "none" : "fade",
      loop: "none",
      out: anim.out === "none" ? "none" : "fade",
    },
  };
}

/**
 * Кадр слоя в момент `t` (секунды от начала открытки длиной `duration`).
 * Неприменимые к слою варианты (бегущая строка у фото, печатная
 * машинка у круга) дают тождественный кадр.
 */
export function frameAt(source: Layer, t: number, duration: number, reduced = false): Frame {
  const layer = reduced ? calm(source) : source;
  const { anim } = layer;

  const typewriterOk = anim.in !== "typewriter" || layer.kind === "text";
  const inType = typewriterOk ? anim.in : "none";

  const inStart = anim.delay;
  const inEnd = inType === "none" ? inStart : inStart + anim.inDuration;
  const outDuration = anim.out === "none" ? 0 : anim.outDuration;
  const outStart = Math.max(inEnd, duration - outDuration);

  // До появления слой спрятан — если появление вообще есть.
  if (t < inStart) return inType === "none" ? IDENTITY : enter(inType, 0);

  let frame = IDENTITY;
  if (t < inEnd) frame = enter(inType, clamp01((t - inStart) / anim.inDuration));

  if (t >= inEnd && t < outStart) {
    const showSpan = outStart - inEnd;
    const phase = (t - inEnd) / anim.loopPeriod;
    frame = combine(frame, loop(layer, phase, showSpan > 0 ? (t - inEnd) / showSpan : 0));
  }

  if (anim.out !== "none" && t >= outStart) {
    const p = clamp01((t - outStart) / outDuration);
    // Исчезание — появление, проигранное назад. Торможение появления
    // при обратном ходе само становится разгоном.
    const back = enter(anim.out, 1 - p);
    frame = combine(frame, back);
  }

  return frame;
}

/** Слой с применённым кадром — что рисовать в момент t. */
export function applyFrame<L extends Layer>(layer: L, frame: Frame): L {
  return {
    ...layer,
    x: layer.x + frame.dx,
    y: layer.y + frame.dy,
    scaleX: layer.scaleX * frame.scale,
    scaleY: layer.scaleY * frame.scale,
    angle: layer.angle + frame.angle,
    opacity: layer.opacity * frame.opacity,
  };
}

/** Видимая часть текста для «печатной машинки». */
export function revealText(text: string, reveal: number): string {
  if (reveal >= 1) return text;
  // По символам Unicode, а не по UTF-16: иначе рвётся эмодзи.
  const chars = Array.from(text);
  return chars.slice(0, Math.floor(chars.length * clamp01(reveal))).join("");
}
