/**
 * Коллажи, где окон для фото больше обычного лимита: в них можно
 * 30 своих фото (решение пользователя 09.10.2026 — «по подписке
 * 30 фоток, именно в тех шаблонах, где это подразумевается»).
 * Поэтому они же — с короной.
 */
const COLLAGE_TEMPLATES: readonly string[] = ["lv-moon", "lv-home"];
export const COLLAGE_PHOTO_LIMIT = 30;

/**
 * Шаблоны «с короной» — только по подписке (решение пользователя
 * 09.10.2026: «Один дома», «Save the date с аркой», «Soul mate»).
 *
 * Отдельный файл без зависимостей: список читает и сайт (корона на
 * карточках, попап в редакторе), и сервер (functions/api/cards/claim) —
 * там нельзя тянуть шаблоны со словарём ради трёх строк.
 */
export const PREMIUM_TEMPLATES: readonly string[] = [
  "ny-kevin",
  "wd-savedate",
  "val-soulmate",
  // Коллажи на 30 фото (третья серия, 09.10.2026): только по подписке.
  ...COLLAGE_TEMPLATES,
];

/** Сколько своих фото в открытке. */
export const PHOTO_LIMIT = 10;

export function photoLimit(template: string | null): number {
  return template !== null && COLLAGE_TEMPLATES.includes(template)
    ? COLLAGE_PHOTO_LIMIT
    : PHOTO_LIMIT;
}

export function isPremium(id: string | null): boolean {
  return id !== null && PREMIUM_TEMPLATES.includes(id);
}

/** Ключ открытки для лимита: шаблон или свободный холст. */
export function cardKey(template: string | null): string {
  return template ?? "free";
}
