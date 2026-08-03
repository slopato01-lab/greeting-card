import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Какие поздравления/открытки можно сделать».
 *
 * Ряд пилюль-поводов и белая карточка с ответом. Пилюли в макете
 * статичны: активна первая, остальные выключены. Переключение поводов
 * — отдельная задача с состоянием, здесь их роль чисто визуальная,
 * поэтому это `ul`, а не набор кнопок: нажимать пока не на что,
 * а фальшивая кнопка ломает клавиатурную навигацию.
 *
 * На мобильном ряд пилюль шире экрана и прокручивается пальцем.
 *
 * Пилюля в макете 33px высотой — этого мало для пальца. Область
 * нажатия добирается невидимым полем до 44px, см. DESIGN.md.
 */
const PILLS = [
  "faq.pill.1",
  "faq.pill.2",
  "faq.pill.3",
  "faq.pill.4",
] as const satisfies ReadonlyArray<TextKey>;

const ITEMS = [
  "faq.card.item.1",
  "faq.card.item.2",
  "faq.card.item.3",
  "faq.card.item.4",
] as const satisfies ReadonlyArray<TextKey>;

export function Faq() {
  return (
    <section className="pt-[61px] pb-[60px] xl:pt-[140px] xl:pb-[130px]">
      <div className="page-shell">
        <h2 id="faq-title" className="font-display text-h2 xl:text-h2-d font-medium">
          {t("faq.title")}
        </h2>

        <ul
          role="list"
          tabIndex={0}
          aria-labelledby="faq-title"
          className="carousel mt-[81px] gap-[10px] xl:mt-[70px] xl:gap-[15px]"
        >
          {PILLS.map((key, index) => (
            <li
              key={key}
              className={
                "min-h-tap rounded-pill xl:rounded-pill-d font-display text-pill xl:text-pill-d " +
                "flex items-center px-[25px] font-medium xl:px-[35px] " +
                (index === 0 ? "bg-pink text-white" : "border-muted text-muted border")
              }
            >
              {t(key)}
            </li>
          ))}
        </ul>

        {/* Карточка в макете 510px высотой на мобильном и 580 на десктопе.
            Обе стали минимальными: список пунктов на русском переносится. */}
        <div className="rounded-faq border-ink shadow-faq relative mt-[64px] min-h-[510px] overflow-hidden border bg-white px-[15px] pt-[35px] pb-[40px] xl:mt-[50px] xl:min-h-[580px] xl:px-[70px] xl:pt-[55px] xl:pb-[57px]">
          {/* Декор из макета: маршрут с прозрачностью 0.05, только
              на десктопе — на мобильном его в макете нет. */}
          <Icon
            name="path"
            size={365}
            className="pointer-events-none absolute top-1/2 right-[145px] hidden -translate-y-1/2 opacity-[0.05] xl:block"
          />

          <div className="relative xl:max-w-[817px]">
            <h3 className="font-display text-h3 xl:text-h3-d font-medium">{t("faq.card.title")}</h3>

            <p className="font-display text-card xl:text-card-d mt-[52px] font-medium xl:mt-[45px]">
              {t("faq.card.lead")}
            </p>

            <ul role="list" className="mt-[35px] flex flex-col gap-[35px]">
              {ITEMS.map((key) => (
                <li key={key} className="flex items-start gap-[18px] xl:items-center xl:gap-5">
                  {/* Точка списка в макете — отдельная картинка 6/10px.
                      В коде это кружок фоном: своего рисунка у неё нет,
                      а лишний файл в сборке ни к чему. */}
                  <span
                    aria-hidden="true"
                    className="bg-ink mt-[6px] size-[6px] shrink-0 rounded-full xl:mt-0 xl:size-[10px]"
                  />
                  <span className="font-display text-note xl:text-card-d leading-[1.15]">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-[46px] flex flex-col gap-[5px] xl:mt-[70px] xl:flex-row xl:gap-5">
              <Button href="/create" labelKey="cta.create" className="xl:w-[360px]" />
              {/* Вторичная кнопка: в макете без заливки и обводки.
                  Фокус и наведение приходят от токенов — без них
                  она неотличима от простого текста. */}
              <a
                href="/templates"
                className="font-ui text-btn xl:text-btn-header-d rounded-btn xl:rounded-faq-btn-d text-btn-ghost min-h-tap hover:bg-pink-card flex h-[45px] w-full items-center justify-center font-medium transition-colors xl:h-[61px] xl:w-[360px]"
              >
                {t("cta.templates")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
