/**
 * Типы для gifenc 1.0.3 — пакет их не поставляет. Описано только то,
 * что вызывает lib/editor/record.ts; сигнатуры сверены с
 * node_modules/gifenc/src/index.js и palettize.js.
 */
declare module "gifenc" {
  export type Palette = number[][];

  export type FrameOptions = {
    palette?: Palette;
    /** Задержка кадра, мс. */
    delay?: number;
    /** -1 — один раз, 0 — по кругу, больше нуля — столько раз. */
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
    colorDepth?: number;
    dispose?: number;
  };

  export type Encoder = {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: FrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  };

  export function GIFEncoder(opts?: { initialCapacity?: number; auto?: boolean }): Encoder;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    opts?: { format?: "rgb565" | "rgb444" | "rgba4444"; oneBitAlpha?: boolean | number },
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
