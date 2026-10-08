import { Button } from "@/components/Button";
import { Sun } from "@/components/site/Ornament";
import { t } from "@/lib/i18n";

/**
 * Блок призыва к действию перед подвалом.
 *
 * В макете design/главная greetinh-cards.jpg такого блока нет —
 * собран из его же элементов: тёмная скруглённая панель в тонкой
 * рамке, широкий заголовок, «солнце» над ним и золотая кнопка.
 *
 * Подпись взята из десктопного макета Figma: на мобильном там стояла
 * заглушка «так готовы или нет, отвечай?», см. PRODUCT.md.
 */
export function Cta() {
  return (
    <section className="page-shell pt-[40px] pb-[10px] xl:pt-[60px] xl:pb-[20px]">
      <div className="rounded-panel xl:rounded-panel-d bg-surface border-line flex min-h-[320px] flex-col items-center justify-center border px-[20px] py-[50px] text-center xl:min-h-[440px] xl:px-[100px] xl:py-[70px]">
        <Sun className="text-gold-deep h-[40px] w-[80px] xl:h-[60px] xl:w-[120px]" />

        <h2 className="font-display text-h1 xl:text-h1-d mt-[24px] max-w-[1100px] font-medium tracking-tight">
          {t("cta.title")}
        </h2>

        <p className="font-ui text-card xl:text-card-d text-body mt-[16px] leading-[1.5] xl:mt-[20px] xl:max-w-[720px]">
          {t("cta.lead")}
        </p>

        <Button
          href="/create"
          labelKey="cta.create"
          className="mt-[30px] max-w-[325px] xl:mt-[40px] xl:max-w-none"
        />
      </div>
    </section>
  );
}
