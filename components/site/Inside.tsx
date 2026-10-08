import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { counterNumber } from "@/components/site/counter";
import { SplitSlider } from "@/components/site/slider";
import { type IconName } from "@/lib/icons/generated";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Что спрятать внутри»: четыре карточки с иконками.
 *
 * Раскладка — второй блок макета главной (design/главная.jpg):
 * счётчик, заголовок и кнопка слева, лента карточек со стрелками
 * справа. На мобильном всё колонкой, лента прокручивается пальцем.
 * Сама раскладка живёт в SplitSlider, здесь только карточки.
 *
 * Карточка по стилю макета — белая, текст слева, крупный тонкий
 * номер в правом нижнем углу. Номер декоративный и скрыт от
 * скринридера: порядок уже есть в списке и в счётчике.
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
    <section className="pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
      <SplitSlider
        titleId="inside-title"
        title="inside.title"
        labels={CARDS.map((card) => card.title)}
        action={<Button href="/create" labelKey="cta.create" className="mt-[25px] xl:w-[360px]" />}
        trackClassName="gap-[15px] xl:gap-5"
      >
        {CARDS.map((card, index) => (
          <li
            key={card.title}
            className="rounded-card xl:rounded-card-d relative flex min-h-[340px] w-[300px] flex-col overflow-hidden bg-white px-[24px] pt-[24px] pb-[90px] xl:min-h-[460px] xl:w-[380px] xl:px-[32px] xl:pt-[32px] xl:pb-[120px]"
          >
            <Icon name={card.icon} className={card.size} />

            <h3 className="font-display text-inside xl:text-inside-d mt-[20px] font-semibold tracking-tight xl:mt-[24px]">
              {t(card.title)}
            </h3>
            <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.4]">
              {t(card.body)}
            </p>

            <span
              aria-hidden="true"
              className="font-ui text-h1 xl:text-h1-d text-line absolute -end-[4px] -bottom-[0.12em] leading-none font-light"
            >
              {counterNumber(index)}
            </span>
          </li>
        ))}
      </SplitSlider>
    </section>
  );
}
