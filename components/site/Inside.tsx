import { Icon } from "@/components/Icon";
import { type IconName } from "@/lib/icons/generated";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Что спрятать внутри»: четыре карточки с иконками.
 *
 * Розовая подложка во всю ширину. На мобильном карточки едут
 * горизонтальной каруселью — в макете ряд шире экрана и обрезан
 * рамкой фрейма. С 1280px это ряд из четырёх равных карточек.
 *
 * Иконки цветные и декоративные: смысл несёт заголовок карточки,
 * поэтому они скрыты от скринридера (Icon без labelKey).
 *
 * Тексты карточек — черновые: в макете во всех четырёх стоит один
 * и тот же абзац про сертификат. Перенесены как есть, см. PRODUCT.md.
 */
/**
 * Размеры иконок в макете разные у каждой карточки — так во фрейме,
 * не унифицируем. На десктопе они на 9px крупнее мобильных.
 *
 * Размер приходит классом, а не пропом `size`, и иконка рендерится
 * одна на оба брейкпоинта. Две копии с `hidden`/`xl:block` ломают
 * цветные иконки: внутри лежат градиенты с фиксированными id, при
 * втором вхождении id дублируется, и «Сертификат» на десктопе
 * терял заливку — оставались чёрный и серый из подложки.
 */
const CARDS = [
  {
    icon: "certificate",
    title: "inside.card.1",
    body: "inside.body.1",
    size: "size-[83px] xl:size-[92px]",
  },
  {
    icon: "confession",
    title: "inside.card.2",
    body: "inside.body.2",
    size: "size-[77px] xl:size-[86px]",
  },
  {
    icon: "transfer",
    title: "inside.card.3",
    body: "inside.body.3",
    size: "size-[72px] xl:size-[80px]",
  },
  {
    icon: "ticket",
    title: "inside.card.4",
    body: "inside.body.4",
    size: "size-[72px] xl:size-[80px]",
  },
] as const satisfies ReadonlyArray<{
  icon: IconName;
  title: TextKey;
  body: TextKey;
  size: string;
}>;

export function Inside() {
  return (
    <section className="bg-pink-tint/10 pt-[50px] pb-[63px] xl:pt-[72px] xl:pb-[63px]">
      <div className="page-shell">
        <h2 className="font-display text-h2 xl:text-h2-d font-medium">{t("inside.title")}</h2>

        <ul
          role="list"
          className="carousel mt-[68px] gap-[15px] xl:mt-[70px] xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible"
        >
          {CARDS.map((card) => (
            <li
              key={card.title}
              className="rounded-card border-ink bg-pink-card flex w-[340px] flex-col items-center justify-center border-2 px-[40px] py-[26px] text-center xl:w-auto xl:px-[54px] xl:py-[34px]"
            >
              <Icon name={card.icon} className={card.size} />

              <h3 className="font-display text-inside xl:text-inside-d mt-[14px] font-medium xl:mt-[15px]">
                {t(card.title)}
              </h3>
              <p className="font-display text-card xl:text-card-d text-body mt-[10px] leading-[1.15]">
                {t(card.body)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
