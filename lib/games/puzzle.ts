import { seededRandom } from "./seed.ts";

/**
 * Логика фото-пазла без React: раскладка, обмен, проверка и то, какой
 * кусок фото показать в клетке. Компонент — components/games/PhotoPuzzle.tsx.
 *
 * Раскладка — массив «клетка → фрагмент»: `order[3] === 7` значит,
 * что в четвёртой клетке лежит восьмой кусок фото. Собрано, когда
 * каждый фрагмент на своей клетке.
 */

/** Сторона поля. В PRODUCT.md пазл бывает 3×3, 4×4 и 5×5, первым сделан 3×3. */
export const PUZZLE_SIZE = 3;

const PIECES = PUZZLE_SIZE * PUZZLE_SIZE;

/**
 * Сколько фрагментов минимум должно лежать не на месте. Перемешивание
 * бывает неудачным — два куска не на месте, и игра заканчивается за
 * один ход. Такое отбрасываем и тянем следующее из того же генератора.
 */
const MIN_MISPLACED = 6;

function misplaced(order: readonly number[]): number {
  return order.filter((piece, cell) => piece !== cell).length;
}

/**
 * Раскладка от зерна открытки: одна и та же при каждом открытии.
 * Math.random в игре запрещён (CLAUDE.md).
 */
export function shuffledOrder(seed: string): number[] {
  const random = seededRandom(`${seed}:puzzle`);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const order = Array.from({ length: PIECES }, (_, index) => index);
    // Тасование Фишера — Йетса.
    for (let index = PIECES - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      const a = order[index];
      const b = order[other];
      if (a === undefined || b === undefined) continue;
      order[index] = b;
      order[other] = a;
    }
    if (misplaced(order) >= MIN_MISPLACED) return order;
  }
  // Двадцать неудач подряд не случаются, но игра не должна зависеть
  // от удачи: сдвиг на одну клетку — все фрагменты не на месте.
  return Array.from({ length: PIECES }, (_, index) => (index + 1) % PIECES);
}

/** Меняет местами содержимое двух клеток. Исходный массив не трогает. */
export function swapCells(order: readonly number[], a: number, b: number): number[] {
  const next = [...order];
  const first = next[a];
  const second = next[b];
  if (first === undefined || second === undefined) return next;
  next[a] = second;
  next[b] = first;
  return next;
}

export function isSolved(order: readonly number[]): boolean {
  return order.every((piece, cell) => piece === cell);
}

/**
 * Какой кусок фото показать во фрагменте — свойства CSS-фона.
 * Фото любой формы обрезается по центру до квадрата, как object-fit:
 * cover: `aspect` — ширина фото к высоте, до загрузки считаем 1.
 *
 * Длинная сторона фона — 3·aspect клеток (или 3/aspect), квадрат
 * поля стоит посередине. Процент в background-position — это доля
 * от «фон минус клетка», отсюда деление на (extent − 1).
 */
export function pieceBackground(
  piece: number,
  aspect: number,
): { backgroundSize: string; backgroundPosition: string } {
  const safe = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const width = PUZZLE_SIZE * Math.max(safe, 1);
  const height = PUZZLE_SIZE * Math.max(1 / safe, 1);
  const axis = (extent: number, index: number) =>
    extent <= 1 ? 0 : (((extent - PUZZLE_SIZE) / 2 + index) / (extent - 1)) * 100;
  const column = piece % PUZZLE_SIZE;
  const row = Math.floor(piece / PUZZLE_SIZE);
  return {
    backgroundSize: `${width * 100}% ${height * 100}%`,
    backgroundPosition: `${axis(width, column)}% ${axis(height, row)}%`,
  };
}
