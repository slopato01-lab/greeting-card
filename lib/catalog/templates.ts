import type { TextKey } from "@/lib/i18n";

/**
 * Каталог шаблонов: какая карточка к какому фильтру относится.
 *
 * Это данные, а не текст: с обеих сторон стоят ключи словаря, ни одной
 * строки для пользователя здесь нет. Названия карточек и подписи
 * фильтров живут в lib/i18n/ru.ts и правятся из docs/PRODUCT.md.
 *
 * Раскладка — по две карточки на фильтр, чтобы ни один не отдавал
 * пустоту. Пустого состояния у каталога поэтому нет, и строки для него
 * в словаре тоже нет: она понадобится, когда каталог станет
 * динамическим. См. docs/PRODUCT.md, раздел «Фильтры каталога».
 */

/** Фильтры, которые действительно отбирают карточки. */
export type CatalogFilter =
  "catalog.filter.2" | "catalog.filter.3" | "catalog.filter.4" | "catalog.filter.5";

export type Template = {
  /** Название карточки. */
  nameKey: TextKey;
  filter: CatalogFilter;
};

/**
 * Первый фильтр — «Все», он ничего не отбирает и живёт отдельно.
 * Шестой — «Собрать свой +» — вообще не фильтр, а ссылка на /create:
 * нажатие на него фильтром дало бы пустую сетку. Оба разбираются
 * в Catalog.tsx, здесь их нет намеренно.
 */
export const CATALOG_ALL = "catalog.filter.1" satisfies TextKey;
export const CATALOG_CUSTOM = "catalog.filter.6" satisfies TextKey;

export const CATALOG_FILTERS = [
  "catalog.filter.2",
  "catalog.filter.3",
  "catalog.filter.4",
  "catalog.filter.5",
] as const satisfies ReadonlyArray<CatalogFilter>;

export const TEMPLATES = [
  { nameKey: "catalog.card.1", filter: "catalog.filter.2" },
  { nameKey: "catalog.card.2", filter: "catalog.filter.2" },
  { nameKey: "catalog.card.3", filter: "catalog.filter.5" },
  { nameKey: "catalog.card.4", filter: "catalog.filter.5" },
  { nameKey: "catalog.card.5", filter: "catalog.filter.3" },
  { nameKey: "catalog.card.6", filter: "catalog.filter.3" },
  { nameKey: "catalog.card.7", filter: "catalog.filter.4" },
  { nameKey: "catalog.card.8", filter: "catalog.filter.4" },
] as const satisfies ReadonlyArray<Template>;
