import { Button } from "@/components/Button";
import { t } from "@/lib/i18n";

/**
 * Тёмный блок призыва к действию перед подвалом.
 *
 * Блок не во всю ширину: он лежит в полосе страницы и скруглён.
 * Кнопка на тёмном фоне получает белый фокус — класс on-dark
 * из globals.css.
 *
 * Подпись взята из десктопного макета: на мобильном там стояла
 * заглушка «так готовы или нет, отвечай?», см. PRODUCT.md.
 */
export function Cta() {
  return (
    <section className="pt-[60px] pb-[66px] xl:pt-[110px] xl:pb-[170px]">
      <div className="page-shell">
        <div className="on-dark rounded-card xl:rounded-cta-d bg-dark flex min-h-[310px] flex-col items-center justify-center px-[20px] py-[50px] text-center xl:min-h-[386px] xl:px-[100px] xl:py-[70px]">
          <h2 className="font-display text-h2 xl:text-h2-d font-medium text-white">
            {t("cta.title")}
          </h2>

          <p className="font-display text-card xl:text-body-d mt-[43px] leading-[1.15] font-medium text-white xl:mt-[30px] xl:max-w-[820px]">
            {t("cta.lead")}
          </p>

          <Button
            href="/create"
            labelKey="cta.create"
            className="mt-[26px] max-w-[325px] xl:mt-[45px] xl:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
