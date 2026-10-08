/**
 * Оформление пилюли. Общее для фильтров каталога, поводов на главной
 * и выбора повода и сюрприза в конструкторе.
 *
 * ARIA живёт в самих рядах, а не здесь.
 * Здесь только классы: иначе состояния разъедутся на первой же правке.
 *
 * Состояния спроектированы от токенов, в макете нарисованы только две
 * крайние точки. Разбор — docs/DESIGN.md, раздел «Состояния пилюль».
 */

/**
 * Видимая пилюля: 33px на мобильном, 40px на десктопе. До 44px её
 * добирает невидимое поле кнопки-обёртки, класс `.pill-tap`
 * в globals.css.
 *
 * Вид — из design/главная greetinh-cards.jpg: тонкая обводка, текст
 * капсом. Выбранная — белая заливка, тёмный текст.
 */
const BASE =
  "rounded-full font-ui caps text-pill xl:text-pill-d flex h-[33px] items-center justify-center " +
  "px-[18px] font-medium whitespace-nowrap transition-colors select-none xl:h-[40px] xl:px-[22px]";

const SELECTED = "bg-paper border-paper text-canvas border";

// --body на основе даёт 10:1; наведение поднимает текст до --ink
// и проявляет обводку до --muted.
const UNSELECTED =
  "border-line text-body border hover:border-muted hover:text-ink active:bg-raised active:text-ink";

export function pillVisual(selected: boolean): string {
  return `${BASE} ${selected ? SELECTED : UNSELECTED}`;
}

/**
 * Плавность прокрутки к выбранной пилюле спрашивается у matchMedia,
 * а не берётся из CSS: правило scroll-behavior в globals.css
 * до scrollIntoView не дотягивается.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
