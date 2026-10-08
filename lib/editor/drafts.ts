import { type EditorDoc, parseEditorJson } from "@/lib/editor/document";
import { TEMPLATES, type TemplateId } from "@/lib/editor/templates";

/**
 * Черновики редактора в localStorage браузера. Пишет их редактор
 * (useCardEditor), читает ещё и личный кабинет — список «Мои открытки».
 *
 * У каждого шаблона свой черновик: открыл из каталога «Ёлку» — видишь
 * свою «Ёлку», а не правки «Колпака». Свободный холст (/editor без
 * шаблона) живёт под прежним ключом — старые черновики целы.
 *
 * Черновик появляется только после первой правки: редактор пишет его,
 * когда что-то поменялось. Поэтому каждый найденный черновик — работа
 * человека, а не просто открытый шаблон.
 */
export const DRAFT_KEY = "otkrytochka.editor.draft";

export function draftKeyFor(template: TemplateId | null): string {
  return template === null ? DRAFT_KEY : `${DRAFT_KEY}.${template}`;
}

export function readDraft(key: string): EditorDoc | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : parseEditorJson(raw);
  } catch {
    // Приватный режим Safari: хранилище бросает. Начинаем с чистого листа.
    return null;
  }
}

export type Draft = { key: string; template: TemplateId | null; doc: EditorDoc };

/** Где могут лежать черновики: свободный холст, потом шаблоны по порядку каталога. */
const SLOTS: readonly { key: string; template: TemplateId | null }[] = [
  { key: DRAFT_KEY, template: null },
  ...TEMPLATES.map((item) => ({ key: draftKeyFor(item.id), template: item.id })),
];

/**
 * Снимок хранилища одной строкой — для useSyncExternalStore: строки
 * сравниваются по значению, и React не перерисовывает впустую.
 * Хранилище недоступно — null.
 */
export function draftsSnapshot(): string | null {
  try {
    return JSON.stringify(SLOTS.map(({ key }) => window.localStorage.getItem(key)));
  } catch {
    return null;
  }
}

/** Черновики из снимка; битые и чужие записи пропускаются. */
export function parseDrafts(snapshot: string): Draft[] {
  const raws: unknown = JSON.parse(snapshot);
  if (!Array.isArray(raws)) return [];
  return SLOTS.flatMap(({ key, template }, index) => {
    const raw: unknown = raws[index];
    const doc = typeof raw === "string" ? parseEditorJson(raw) : null;
    return doc === null ? [] : [{ key, template, doc }];
  });
}

/**
 * Удаляет черновик. Фото черновика остаются в IndexedDB — их убирает
 * редактор при следующей записи (pruneAssets), когда видит, что они
 * больше нигде не нужны.
 */
export function removeDraft(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
