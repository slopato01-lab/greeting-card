/**
 * Seeded-генератор для игр. Math.random в игре запрещён (CLAUDE.md):
 * открытка обязана раскладываться одинаково при каждом открытии,
 * поэтому всё «случайное» выводится из зерна — slug открытки.
 *
 * Хеш строки — FNV-1a 32 бита, генератор — mulberry32. Оба короткие,
 * быстрые и дают одинаковую последовательность в любом браузере.
 */

function hash(text: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** Генератор чисел в [0, 1), одинаковый для одного и того же зерна. */
export function seededRandom(seed: string): () => number {
  let state = hash(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
