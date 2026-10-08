import { Button } from "@/components/Button";
import { t } from "@/lib/i18n";

/**
 * Тёмный блок призыва к действию перед подвалом.
 *
 * Блок не во всю ширину: он лежит в полосе страницы и скруглён.
 * По макету главной (design/главная.jpg) он выше и стоит вплотную
 * к светлому подвалу.
 * Кнопка на тёмном фоне получает белый фокус — класс on-dark
 * из globals.css.
 *
 * Подпись взята из десктопного макета: на мобильном там стояла
 * заглушка «так готовы или нет, отвечай?», см. PRODUCT.md.
 */
export function Cta() {
  return (
    <section className="pt-[40px] pb-[10px] xl:pt-[60px] xl:pb-[20px]">
      <div className="page-shell">
        <div className="on-dark rounded-panel xl:rounded-panel-d bg-dark flex min-h-[310px] flex-col items-center justify-center px-[20px] py-[50px] text-center xl:min-h-[480px] xl:px-[100px] xl:py-[70px]">
          <h2 className="font-display text-h2 xl:text-h2-d font-semibold tracking-tight text-white">
            {t("cta.title")}
          </h2>

          <p className="font-ui text-card xl:text-card-d text-photo mt-[20px] leading-[1.4] xl:mt-[24px] xl:max-w-[820px]">
            {t("cta.lead")}
          </p>

          <Button
            href="/create"
            tone="light"
            labelKey="cta.create"
            className="mt-[30px] max-w-[325px] xl:mt-[40px] xl:max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
