/**
 * Оформление пилюли. Общее для двух рядов на лендинге: поводов в FAQ
 * и фильтров каталога.
 *
 * Роль в разметке у них разная — поводы это вкладки, фильтры это
 * переключатели, — поэтому ARIA живёт в самих секциях, а не здесь.
 * Здесь только классы: иначе состояния разъедутся на первой же правке.
 *
 * Состояния спроектированы от токенов, в макете нарисованы только две
 * крайние точки. Разбор — docs/DESIGN.md, раздел «Состояния пилюль».
 */

export type PillTone = "faq" | "catalog";

/**
 * Видимая пилюля: 33px на мобильном, 50px на десктопе — ровно как
 * в эталонах. До 44px её добирает невидимое поле кнопки-обёртки,
 * класс `.pill-tap` в globals.css.
 */
const BASE =
  "rounded-pill xl:rounded-pill-d font-display flex h-[33px] items-center justify-center " +
  "font-medium whitespace-nowrap transition-colors select-none xl:h-[50px]";

const SIZE: Record<PillTone, string> = {
  faq: "text-pill xl:text-pill-d px-[25px] xl:px-[35px]",
  catalog: "text-pill xl:text-pill-cat-d px-[21px] xl:px-[30px]",
};

// Розовый темнеет подмешиванием чёрного — та же формула, что у кнопки
// в components/Button.tsx. Одно действие выглядит одинаково по всей
// странице, и правится оно в двух местах, а не в десяти.
const SELECTED =
  "bg-pink text-white " +
  "hover:bg-[color-mix(in_oklab,var(--color-pink)_90%,var(--color-ink))] " +
  "active:bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))]";

// Обводка у двух рядов своя, так в макете. При наведении текст темнеет
// до --ink — это не украшение: --muted на --pink-card даёт 3.8:1
// и не проходит порог 4.5:1.
const UNSELECTED: Record<PillTone, string> = {
  faq:
    "border-muted text-muted border " +
    "hover:bg-pink-card hover:text-ink " +
    "active:border-ink active:bg-pink-card active:text-ink",
  catalog:
    "border-ink text-muted-2 border " +
    "hover:bg-pink-card hover:text-ink " +
    "active:bg-pink-card active:text-ink",
};

export function pillVisual(tone: PillTone, selected: boolean): string {
  return `${BASE} ${SIZE[tone]} ${selected ? SELECTED : UNSELECTED[tone]}`;
}

/**
 * Плавность прокрутки к выбранной пилюле спрашивается у matchMedia,
 * а не берётся из CSS: правило scroll-behavior в globals.css
 * до scrollIntoView не дотягивается.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
