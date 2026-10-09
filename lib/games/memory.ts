import { seededRandom } from "./seed.ts";

/**
 * Логика «Собери пару» (мемори) без React: раздача, переворот, пары.
 * Компонент — components/games/MemoryGame.tsx.
 *
 * Карточек вдвое меньше, чем в design/игра собери пару.MP4 (просьба
 * пользователя 09.10.2026): 12 вместо 24, то есть 6 пар. В колоде
 * лежат номера пар: `deck[5] === 2` — на шестой карточке третье фото.
 *
 * Ход — открыть две карточки. Совпали — пара остаётся открытой,
 * нет — обе закрываются: сами через паузу или сразу, как только
 * открывают третью. Проиграть нельзя, таймера нет — только ходы.
 */

/** Пар на поле. Меньше фото — меньше пар, см. dealDeck. */
export const MEMORY_PAIRS = 6;

export type MemoryState = {
  /** Номер пары на каждой карточке. */
  deck: readonly number[];
  /** Открытые, но ещё не угаданные карточки — ноль, одна или две. */
  open: readonly number[];
  /** Угаданные пары. */
  matched: readonly number[];
  moves: number;
};

/**
 * Колода от зерна открытки: одна и та же при каждом открытии.
 * Math.random в игре запрещён (CLAUDE.md). `pairs` — сколько пар
 * разложить, от 0 до MEMORY_PAIRS.
 */
export function dealDeck(seed: string, pairs: number): number[] {
  const count = Math.max(0, Math.min(MEMORY_PAIRS, Math.floor(pairs)));
  const deck = Array.from({ length: count * 2 }, (_, index) => Math.floor(index / 2));
  const random = seededRandom(`${seed}:memory`);
  // Тасование Фишера — Йетса.
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const a = deck[index];
    const b = deck[other];
    if (a === undefined || b === undefined) continue;
    deck[index] = b;
    deck[other] = a;
  }
  return deck;
}

export function newGame(seed: string, pairs: number): MemoryState {
  return { deck: dealDeck(seed, pairs), open: [], matched: [], moves: 0 };
}

/** Карточка лицом вверх: открыта сейчас или её пара угадана. */
export function isFaceUp(state: MemoryState, card: number): boolean {
  const pair = state.deck[card];
  if (pair === undefined) return false;
  return state.open.includes(card) || state.matched.includes(pair);
}

/** Две открытые карточки не совпали и ждут, когда их закроют. */
export function isMismatch(state: MemoryState): boolean {
  return state.open.length === 2;
}

/** Закрывает несовпавшую пару. Если закрывать нечего — то же состояние. */
export function settle(state: MemoryState): MemoryState {
  return isMismatch(state) ? { ...state, open: [] } : state;
}

/**
 * Открыть карточку. Возвращает новое состояние и пару, если ход её
 * угадал, — компоненту нужно показать её крупно.
 */
export function flip(
  current: MemoryState,
  card: number,
): { state: MemoryState; matched: number | null } {
  // Две несовпавшие ещё открыты — третья карточка их сразу закрывает,
  // ждать паузу не нужно.
  const state = settle(current);
  const pair = state.deck[card];
  if (pair === undefined || isFaceUp(state, card)) return { state, matched: null };

  const open = [...state.open, card];
  if (open.length < 2) return { state: { ...state, open }, matched: null };

  const moves = state.moves + 1;
  const first = open[0];
  if (first !== undefined && state.deck[first] === pair) {
    return { state: { ...state, open: [], matched: [...state.matched, pair], moves }, matched: pair };
  }
  return { state: { ...state, open, moves }, matched: null };
}

export function isComplete(state: MemoryState): boolean {
  return state.matched.length * 2 === state.deck.length;
}
