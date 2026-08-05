import type { TextKey } from "@/lib/i18n";

/**
 * Прайс из docs/PRODUCT.md, раздел «Модель денег».
 *
 * Числа — данные, названия приходят ключами словаря: строк для
 * пользователя здесь нет. Валюты две, потому что рынок два —
 * Беларусь и Россия.
 *
 * Это второе место, где живут цены, и есть третье: строка `faq.a.3`
 * в словаре, где числа стоят внутри предложения и вытащить их без
 * разметки нельзя. При смене прайса правятся все три — напоминание
 * висит на /texts.
 *
 * Ниже 10 BYN не опускаемся: комиссия платёжки съедает экономику.
 */
export type PriceRow = {
  nameKey: TextKey;
  byn: number;
  rub: number;
};

export const PRICES = [
  { nameKey: "price.item.1", byn: 12, rub: 390 },
  { nameKey: "price.item.2", byn: 19, rub: 590 },
  { nameKey: "price.item.3", byn: 29, rub: 890 },
  { nameKey: "price.item.4", byn: 6, rub: 190 },
  { nameKey: "price.item.5", byn: 6, rub: 190 },
] as const satisfies ReadonlyArray<PriceRow>;
