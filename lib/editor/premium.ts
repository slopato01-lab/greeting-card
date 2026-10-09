/**
 * Шаблоны «с короной» — только по подписке (решение пользователя
 * 09.10.2026: «Один дома», «Save the date с аркой», «Soul mate»).
 *
 * Отдельный файл без зависимостей: список читает и сайт (корона на
 * карточках, попап в редакторе), и сервер (functions/api/cards/claim) —
 * там нельзя тянуть шаблоны со словарём ради трёх строк.
 */
export const PREMIUM_TEMPLATES: readonly string[] = ["ny-kevin", "wd-savedate", "val-soulmate"];

export function isPremium(id: string | null): boolean {
  return id !== null && PREMIUM_TEMPLATES.includes(id);
}

/** Ключ открытки для лимита: шаблон или свободный холст. */
export function cardKey(template: string | null): string {
  return template ?? "free";
}
