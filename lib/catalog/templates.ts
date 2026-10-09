import type { CardTheme } from "@/lib/card/content";
import type { TrackId } from "@/lib/card/music";
import { TEMPLATES as EDITOR_TEMPLATES, type TemplateId } from "@/lib/editor/templates";
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
  | "catalog.filter.2"
  | "catalog.filter.3"
  | "catalog.filter.7"
  | "catalog.filter.8"
  | "catalog.filter.9"
  | "catalog.filter.10";

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
  /** Оформление открытки и обложка шаблона. У обычных шаблонов null. */
  theme: CardTheme | null;
  /** Картинка карточки в каталоге и на странице шаблона. */
  cover: string | null;
  /** Песня по умолчанию; в конструкторе её можно сменить. */
  track: TrackId | null;
};

/**
 * Первый фильтр — «Все», он ничего не отбирает и живёт отдельно.
 * Шестой — «Собрать свой +» — вообще не фильтр, а ссылка на /editor:
 * нажатие на него фильтром дало бы пустую сетку. Оба разбираются
 * в TemplateGrid.tsx, здесь их нет намеренно.
 */
export const CATALOG_ALL = "catalog.filter.1" satisfies TextKey;
export const CATALOG_CUSTOM = "catalog.filter.6" satisfies TextKey;

/**
 * Номера не сдвигаются: «Хорошие новости» (4) и «Любовь» (7) сняты
 * с сайта 08.10.2026 (просьба пользователя) вместе с их шаблонами;
 * «Любовь» вернулась 09.10.2026 с третьей серией (series-3.ts),
 * «8 марта» (5) — 09.10.2026: в нём были только серые карточки,
 * а ключи остальных фильтров уже живут в словаре и docs/PRODUCT.md.
 */
export const CATALOG_FILTERS = [
  "catalog.filter.2",
  "catalog.filter.3",
  "catalog.filter.7",
  // Темы серии по design/открытки/ (08.10.2026): 14 февраля, подруге, свадьба.
  "catalog.filter.8",
  "catalog.filter.9",
  "catalog.filter.10",
] as const satisfies ReadonlyArray<CatalogFilter>;

export const TEMPLATES = [
  {
    // Шаблон со своим оформлением: фото праздника с Unsplash, песни
    // с открытой лицензией, скретч-карта с промокодом под покрытием.
    // Третий в фильтре «День рождения» — фильтры перестают быть
    // ровно по два, пустых от этого не становится. Стоит первым:
    // он открывает каталог и мини-карточку героя на главной.
    slug: "s-dnyom-rozhdeniya",
    nameKey: "catalog.card.9",
    filter: "catalog.filter.2",
    game: "games.card.3.title",
    lead: "tpl.9.lead",
    items: ["tpl.9.item.1", "tpl.9.item.2", "tpl.9.item.3"],
    theme: "birthday",
    cover: "/assets/templates/birthday/balloons.jpg",
    track: "monk",
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

/**
 * Анимированные шаблоны редактора в каталоге (08.10.2026). Не игра,
 * а открытка-коллаж по образцу design/пример анимации и дизайна.MP4:
 * в карточке крутится её анимация, а «Выбрать» открывает её в
 * редакторе (/editor?template=…), где правят имя, фото и тексты.
 *
 * Видео и обложку рисует scripts/render-templates.mjs тем же движком,
 * что и редактор. Фон карточки под видео — фон самого шаблона:
 * открытка 3:4 вписывается в картинку карточки целиком, поля по краям
 * должны быть того же цвета, а не серой подложкой.
 */
export type AnimatedTemplate = {
  id: TemplateId;
  filter: CatalogFilter;
  nameKey: TextKey;
  lead: TextKey;
  video: string;
  poster: string;
  /** Цвет фона шаблона — содержимое открытки, а не оформление сайта. */
  background: string;
  /**
   * Фон тёмный: название карточки, лежащее на нём, пишется светлым.
   * Тёмный текст на бордо и тёмно-зелёном не читался (08.10.2026).
   */
  dark: boolean;
};

/**
 * Тёмный ли цвет `#rrggbb`: относительная яркость по WCAG ниже 0,18.
 * На таком фоне белый текст контрастнее тёмного (#141414).
 */
function isDark(hex: string): boolean {
  const channel = (at: number) => {
    const value = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5) < 0.18;
}

function animated(
  id: TemplateId,
  filter: CatalogFilter,
  nameKey: TextKey,
  lead: TextKey,
): AnimatedTemplate {
  const template = EDITOR_TEMPLATES.find((item) => item.id === id);
  const background = template?.build().background ?? "#ffffff";
  return {
    id,
    filter,
    nameKey,
    lead,
    video: `/assets/templates/editor/${id}.mp4`,
    poster: `/assets/templates/editor/${id}.webp`,
    background: background.startsWith("#") ? background : "#ffffff",
    dark: background.startsWith("#") && isDark(background),
  };
}

export const ANIMATED_TEMPLATES: readonly AnimatedTemplate[] = [
  animated("birthday", "catalog.filter.2", "anim.birthday.name", "anim.birthday.lead"),
  animated("party", "catalog.filter.2", "anim.party.name", "anim.party.lead"),
  animated("polaroid", "catalog.filter.3", "anim.polaroid.name", "anim.polaroid.lead"),
  // Серия по design/открытки/ (08.10.2026), lib/editor/series.ts.
  animated("val-wishing", "catalog.filter.8", "anim.val-wishing.name", "anim.val-wishing.lead"),
  animated("val-film", "catalog.filter.8", "anim.val-film.name", "anim.val-film.lead"),
  // «Любовь это…» (val-loveis) снят 09.10.2026: в окне заглушка-силуэт
  // вместо фото — карточка выглядела незаполненной. В редакторе остался.
  animated("val-paper", "catalog.filter.8", "anim.val-paper.name", "anim.val-paper.lead"),
  animated("val-strip", "catalog.filter.8", "anim.val-strip.name", "anim.val-strip.lead"),
  animated("bd-disco", "catalog.filter.2", "anim.bd-disco.name", "anim.bd-disco.lead"),
  animated("bd-cinema", "catalog.filter.2", "anim.bd-cinema.name", "anim.bd-cinema.lead"),
  animated("bd-kittens", "catalog.filter.2", "anim.bd-kittens.name", "anim.bd-kittens.lead"),
  animated("ny-party", "catalog.filter.3", "anim.ny-party.name", "anim.ny-party.lead"),
  animated("ny-xmas", "catalog.filter.3", "anim.ny-xmas.name", "anim.ny-xmas.lead"),
  animated("fr-memory", "catalog.filter.9", "anim.fr-memory.name", "anim.fr-memory.lead"),
  animated("fr-polaroids", "catalog.filter.9", "anim.fr-polaroids.name", "anim.fr-polaroids.lead"),
  animated("fr-disc", "catalog.filter.9", "anim.fr-disc.name", "anim.fr-disc.lead"),
  animated("wd-married", "catalog.filter.10", "anim.wd-married.name", "anim.wd-married.lead"),
  animated("wd-kids", "catalog.filter.10", "anim.wd-kids.name", "anim.wd-kids.lead"),
  // Вторая серия (09.10.2026), lib/editor/series-2.ts.
  animated("val-booth", "catalog.filter.8", "anim.val-booth.name", "anim.val-booth.lead"),
  animated("val-soulmate", "catalog.filter.8", "anim.val-soulmate.name", "anim.val-soulmate.lead"),
  animated("ny-bestie", "catalog.filter.3", "anim.ny-bestie.name", "anim.ny-bestie.lead"),
  animated("ny-film", "catalog.filter.3", "anim.ny-film.name", "anim.ny-film.lead"),
  animated("ny-natal", "catalog.filter.3", "anim.ny-natal.name", "anim.ny-natal.lead"),
  animated("ny-kevin", "catalog.filter.3", "anim.ny-kevin.name", "anim.ny-kevin.lead"),
  animated("wd-savedate", "catalog.filter.10", "anim.wd-savedate.name", "anim.wd-savedate.lead"),
  animated("wd-post", "catalog.filter.10", "anim.wd-post.name", "anim.wd-post.lead"),
  animated("wd-amor", "catalog.filter.10", "anim.wd-amor.name", "anim.wd-amor.lead"),
  // Третья серия (09.10.2026), lib/editor/series-3.ts.
  animated("bd-vogue", "catalog.filter.2", "anim.bd-vogue.name", "anim.bd-vogue.lead"),
  animated("bd-bff", "catalog.filter.2", "anim.bd-bff.name", "anim.bd-bff.lead"),
  animated("bd-kodak", "catalog.filter.2", "anim.bd-kodak.name", "anim.bd-kodak.lead"),
  animated("bd-camera", "catalog.filter.2", "anim.bd-camera.name", "anim.bd-camera.lead"),
  animated("lv-pin", "catalog.filter.7", "anim.lv-pin.name", "anim.lv-pin.lead"),
  animated("lv-polaroid", "catalog.filter.7", "anim.lv-polaroid.name", "anim.lv-polaroid.lead"),
  animated("lv-moon", "catalog.filter.7", "anim.lv-moon.name", "anim.lv-moon.lead"),
  animated("lv-home", "catalog.filter.7", "anim.lv-home.name", "anim.lv-home.lead"),
  animated("lv-grid", "catalog.filter.7", "anim.lv-grid.name", "anim.lv-grid.lead"),
  animated("lv-feeling", "catalog.filter.7", "anim.lv-feeling.name", "anim.lv-feeling.lead"),
  animated("fr-moments", "catalog.filter.9", "anim.fr-moments.name", "anim.fr-moments.lead"),
  animated("wd-quote", "catalog.filter.10", "anim.wd-quote.name", "anim.wd-quote.lead"),
];

/** Шаблоны редактора, которых нет в каталоге, — со своим поводом. */
const OFF_CATALOG_FILTERS: Partial<Record<TemplateId, CatalogFilter>> = {
  "val-loveis": "catalog.filter.8",
};

/**
 * Повод шаблона — по нему выпадающий список «Тема» во вкладке
 * «Шаблоны» редактора (09.10.2026). Берётся из каталога, чтобы темы
 * в редакторе и на главной не разошлись. null — повода нет, шаблон
 * виден только в «Все».
 */
export function templateFilter(id: TemplateId): CatalogFilter | null {
  return (
    ANIMATED_TEMPLATES.find((template) => template.id === id)?.filter ??
    OFF_CATALOG_FILTERS[id] ??
    null
  );
}
