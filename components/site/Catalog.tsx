import { TemplateGrid } from "@/components/site/TemplateGrid";
import { t } from "@/lib/i18n";

/**
 * Секция «Дизайн для каждого случая» на лендинге: заголовок, подводка
 * и сетка шаблонов с фильтрами.
 *
 * Сама сетка живёт в TemplateGrid — она же наполняет страницу /cards.
 * Здесь остались только заголовок и подводка: они у секции и страницы
 * разные, всё остальное общее.
 */
export function Catalog() {
  return (
    <section className="pt-[59px] pb-[70px] xl:pt-[140px] xl:pb-[120px]">
      <div className="page-shell">
        <h2 id="catalog-title" className="font-display text-h2 xl:text-h2-d font-medium">
          {t("catalog.title")}
        </h2>
        <p className="font-display text-sub xl:text-sub-d text-muted mt-[14px] leading-[1.15] xl:mt-[25px] xl:max-w-[738px]">
          {t("catalog.lead")}
        </p>

        <TemplateGrid labelledBy="catalog-title" />
      </div>
    </section>
  );
}
