import { ru } from "./ru";

export { ru };

/** Все существующие ключи словаря. Ничего, кроме них, не существует. */
export type TextKey = keyof typeof ru;

/**
 * Достаёт строку по ключу.
 *
 * Обращение к несуществующему ключу не компилируется:
 * `t("hero.titel")` — ошибка типа, а не `undefined` в разметке.
 *
 * Функция, а не прямой доступ к объекту, — чтобы склонения
 * и подстановки, когда понадобятся, появились в одном месте.
 */
export function t(key: TextKey): string {
  return ru[key];
}

/**
 * Подпись к числу по правилам русского языка: 1 шаблон, 2 шаблона,
 * 5 шаблонов, 21 шаблон, 12 шаблонов. Формы — ключами словаря.
 */
export function plural(count: number, forms: readonly [TextKey, TextKey, TextKey]): string {
  const n = Math.abs(Math.trunc(count));
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return t(forms[0]);
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return t(forms[1]);
  return t(forms[2]);
}
