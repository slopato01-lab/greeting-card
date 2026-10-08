import { TemplateGrid } from "@/components/site/TemplateGrid";
import { t } from "@/lib/i18n";

/**
 * Секция «Дизайн для каждого случая» на лендинге: заголовок, подводка
 * и сетка шаблонов с фильтрами.
 *
 * Раскладка — скруглённая панель из макета главной (design/главная.jpg):
 * крупный заголовок и подводка по центру в два тона, под ними
 * содержимое. В макете там видео и отзыв, у нас — сетка шаблонов.
 *
 * Панель залита розовым тинтом секций и держит своё боковое поле
 * в --shell-pad (класс .inset-panel в globals.css): лента фильтров
 * внутри вырывается к краям панели, а не экрана.
 *
 * Подводка цветом --color-body, а не --muted: на розовом тинте
 * --muted не дотягивает до 4.5:1.
 *
 * Сама сетка живёт в TemplateGrid — она же наполняет страницу /cards.
 */
export function Catalog() {
  return (
    <section className="pt-[20px] pb-[40px] xl:pt-[40px] xl:pb-[60px]">
      <div className="page-shell">
        <div className="inset-panel bg-pink-tint/10 rounded-card xl:rounded-card-d pt-[40px] pb-[50px] xl:pt-[90px] xl:pb-[80px]">
          <h2
            id="catalog-title"
            className="font-display text-h2 xl:text-h2-d mx-auto text-center font-medium xl:max-w-[1100px]"
          >
            {t("catalog.title")}
          </h2>
          <p className="font-display text-sub xl:text-sub-d text-body mx-auto mt-[14px] text-center leading-[1.15] xl:mt-[25px] xl:max-w-[900px]">
            {t("catalog.lead")}
          </p>

          <TemplateGrid labelledBy="catalog-title" />
        </div>
      </div>
    </section>
  );
}
