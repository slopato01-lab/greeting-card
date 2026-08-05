import type { TextKey } from "@/lib/i18n";

/**
 * Каталог шаблонов: какая карточка к какому фильтру относится, какая
 * игра лежит внутри и что о ней написано на её странице.
 *
 * Это данные, а не текст: с обеих сторон стоят ключи словаря, ни одной
 * строки для пользователя здесь нет. Названия карточек, вводки и пункты
 * живут в lib/i18n/ru.ts и правятся из docs/PRODUCT.md.
 *
 * Раскладка — по две карточки на фильтр, чтобы ни один не отдавал
 * пустоту. Пустого состояния у каталога поэтому нет, и строки для него
 * в словаре тоже нет: она понадобится, когда каталог станет
 * динамическим. См. docs/PRODUCT.md, раздел «Фильтры каталога».
 */

/** Фильтры, которые действительно отбирают карточки. */
export type CatalogFilter =
  "catalog.filter.2" | "catalog.filter.3" | "catalog.filter.4" | "catalog.filter.5";

/**
 * Три механики MVP. Живут здесь, а не в конструкторе: какие игры
 * существуют — такие же данные каталога, как и поводы, и нужны они
 * в трёх местах сразу (шаблон, конструктор, разбор черновика).
 */
export const GAMES = [
  "games.card.1.title",
  "games.card.2.title",
  "games.card.3.title",
] as const satisfies ReadonlyArray<TextKey>;

export type GameKey = (typeof GAMES)[number];

export type Template = {
  /** Адрес страницы: /cards/<slug>. Латиницей — кириллица в ссылке
      превращается в процентную кашу, когда её копируют из адресной
      строки в мессенджер. */
  slug: string;
  /** Название карточки. */
  nameKey: TextKey;
  filter: CatalogFilter;
  /** Механика по матрице «повод × механика» из docs/PRODUCT.md. */
  game: GameKey;
  lead: TextKey;
  items: readonly [TextKey, TextKey, TextKey];
};

/**
 * Первый фильтр — «Все», он ничего не отбирает и живёт отдельно.
 * Шестой — «Собрать свой +» — вообще не фильтр, а ссылка на /create:
 * нажатие на него фильтром дало бы пустую сетку. Оба разбираются
 * в TemplateGrid.tsx, здесь их нет намеренно.
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
  {
    slug: "dlya-vtoroy-polovinki",
    nameKey: "catalog.card.1",
    filter: "catalog.filter.2",
    game: "games.card.1.title",
    lead: "tpl.1.lead",
    items: ["tpl.1.item.1", "tpl.1.item.2", "tpl.1.item.3"],
  },
  {
    slug: "dlya-druga",
    nameKey: "catalog.card.2",
    filter: "catalog.filter.2",
    game: "games.card.2.title",
    lead: "tpl.2.lead",
    items: ["tpl.2.item.1", "tpl.2.item.2", "tpl.2.item.3"],
  },
  {
    slug: "dlya-mamy",
    nameKey: "catalog.card.3",
    filter: "catalog.filter.5",
    game: "games.card.1.title",
    lead: "tpl.3.lead",
    items: ["tpl.3.item.1", "tpl.3.item.2", "tpl.3.item.3"],
  },
  {
    slug: "dlya-babushki",
    nameKey: "catalog.card.4",
    filter: "catalog.filter.5",
    game: "games.card.1.title",
    lead: "tpl.4.lead",
    items: ["tpl.4.item.1", "tpl.4.item.2", "tpl.4.item.3"],
  },
  {
    slug: "dlya-kolleg",
    nameKey: "catalog.card.5",
    filter: "catalog.filter.3",
    game: "games.card.2.title",
    lead: "tpl.5.lead",
    items: ["tpl.5.item.1", "tpl.5.item.2", "tpl.5.item.3"],
  },
  {
    slug: "pervyy-novyy-god",
    nameKey: "catalog.card.6",
    filter: "catalog.filter.3",
    game: "games.card.1.title",
    lead: "tpl.6.lead",
    items: ["tpl.6.item.1", "tpl.6.item.2", "tpl.6.item.3"],
  },
  {
    slug: "zhdyom-malysha",
    nameKey: "catalog.card.7",
    filter: "catalog.filter.4",
    game: "games.card.3.title",
    lead: "tpl.7.lead",
    items: ["tpl.7.item.1", "tpl.7.item.2", "tpl.7.item.3"],
  },
  {
    slug: "pereezzhaem",
    nameKey: "catalog.card.8",
    filter: "catalog.filter.4",
    game: "games.card.3.title",
    lead: "tpl.8.lead",
    items: ["tpl.8.item.1", "tpl.8.item.2", "tpl.8.item.3"],
  },
] as const satisfies ReadonlyArray<Template>;

export type CatalogTemplate = (typeof TEMPLATES)[number];

/** Шаблон по адресу. Чужой slug — undefined, страница отдаёт 404. */
export function templateBySlug(slug: string): CatalogTemplate | undefined {
  return TEMPLATES.find((template) => template.slug === slug);
}

/**
 * Что показать в ряду «Ещё шаблоны»: сначала парный по поводу, дальше
 * по порядку каталога. Одна парная карточка выглядела бы как сбой
 * отбора, поэтому их три.
 */
export function relatedTemplates(current: CatalogTemplate, count = 3): CatalogTemplate[] {
  const others = TEMPLATES.filter((template) => template.slug !== current.slug);
  const sameOccasion = others.filter((template) => template.filter === current.filter);
  const rest = others.filter((template) => template.filter !== current.filter);
  return [...sameOccasion, ...rest].slice(0, count);
}
