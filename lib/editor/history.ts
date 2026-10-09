/**
 * История правок редактора для «Отменить» и «Вернуть» (09.10.2026).
 *
 * Каждый шаг — снимок открытки целиком в том же формате, что и черновик
 * (JSON строкой). Снимки, а не список обратных операций: правок в
 * редакторе два десятка видов, и у каждой пришлось бы писать отмену.
 * Снимок покрывает всё сразу — слои, фон, длительность, музыку.
 *
 * Функции чистые и ничего не меняют на месте: хук хранит историю
 * в ref и заменяет целиком.
 */

/** Сколько шагов назад помнит редактор. Пользователь просил минимум 15. */
export const HISTORY_LIMIT = 50;

export type History = {
  /** Прошлые состояния, последнее — ближайшее. */
  past: readonly string[];
  /** То, что сейчас на холсте. null — холст ещё не загружен. */
  present: string | null;
  /** Отменённые шаги, которые можно вернуть, последний — ближайший. */
  future: readonly string[];
};

export function createHistory(present: string | null): History {
  return { past: [], present, future: [] };
}

/**
 * Новое состояние после правки. Если ничего не поменялось — история
 * та же (клик по уже выбранному цвету не должен становиться шагом).
 * Новая правка обрывает ветку «вперёд», как в любом редакторе.
 */
export function record(history: History, snapshot: string): History {
  if (snapshot === history.present) return history;
  if (history.present === null) return createHistory(snapshot);
  return {
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: snapshot,
    future: [],
  };
}

/** Шаг назад; null — отменять нечего. */
export function undo(history: History): History | null {
  const previous = history.past.at(-1);
  if (previous === undefined || history.present === null) return null;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [...history.future, history.present],
  };
}

/** Шаг вперёд; null — возвращать нечего. */
export function redo(history: History): History | null {
  const next = history.future.at(-1);
  if (next === undefined || history.present === null) return null;
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(0, -1),
  };
}

/**
 * Фото, на которые ссылается история. Их нельзя удалять из IndexedDB
 * при уборке: иначе «Отменить» вернёт слой с фото, которого уже нет.
 * Поле `asset` есть только у фото-слоёв, поэтому хватает поиска по
 * строке — разбирать полсотни снимков ради одного поля незачем.
 */
export function historyAssets(history: History): Set<string> {
  const ids = new Set<string>();
  for (const snapshot of [...history.past, history.present ?? "", ...history.future]) {
    for (const match of snapshot.matchAll(/"asset":"([^"\\]+)"/g)) {
      const id = match[1];
      if (id !== undefined) ids.add(id);
    }
  }
  return ids;
}
