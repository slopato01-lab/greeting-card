/**
 * Оформление пилюли. Общее для фильтров каталога и выбора повода
 * и сюрприза в конструкторе.
 *
 * ARIA живёт в самих рядах, а не здесь.
 * Здесь только классы: иначе состояния разъедутся на первой же правке.
 *
 * Состояния спроектированы от токенов, в макете нарисованы только две
 * крайние точки. Разбор — docs/DESIGN.md, раздел «Состояния пилюль».
 */

/** Поверхность под рядом пилюль: основа страницы или белая панель. */
export type PillSurface = "canvas" | "white";

/**
 * Видимая пилюля: 33px на мобильном, 44px на десктопе. До 44px на
 * мобильном её добирает невидимое поле кнопки-обёртки, класс
 * `.pill-tap` в globals.css.
 *
 * Стиль с 08.10.2026 — из design/главная.jpg: без обводки, серая
 * заливка на белой панели. Выбранная — розовая, это один из трёх
 * оставленных точечных акцентов.
 */
const BASE =
  "rounded-full font-ui flex h-[33px] items-center justify-center " +
  "font-medium whitespace-nowrap transition-colors select-none xl:h-[44px]";

const SIZE = "text-pill xl:text-pill-d px-[20px] xl:px-[26px]";

// Розовый темнеет подмешиванием чёрного — одно действие выглядит
// одинаково по всей странице.
const SELECTED =
  "bg-pink text-white " +
  "hover:bg-[color-mix(in_oklab,var(--color-pink)_90%,var(--color-ink))] " +
  "active:bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))]";

// Невыбранная пилюля отличается от фона под ней одной ступенью:
// на основе она белая, на белой панели — цвета основы.
// --body на любой из трёх светлых заливок даёт больше 7:1.
const UNSELECTED: Record<PillSurface, string> = {
  canvas: "bg-white text-body hover:text-ink active:bg-line active:text-ink",
  white: "bg-canvas text-body hover:bg-line hover:text-ink active:bg-line active:text-ink",
};

export function pillVisual(surface: PillSurface, selected: boolean): string {
  return `${BASE} ${SIZE} ${selected ? SELECTED : UNSELECTED[surface]}`;
}

/**
 * Плавность прокрутки к выбранной пилюле спрашивается у matchMedia,
 * а не берётся из CSS: правило scroll-behavior в globals.css
 * до scrollIntoView не дотягивается.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
