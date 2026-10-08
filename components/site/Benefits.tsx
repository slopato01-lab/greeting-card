import { Icon } from "@/components/Icon";
import { SplitSlider } from "@/components/site/slider";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Больше, чем просто открытка»: четыре карточки преимуществ.
 *
 * Карточка — фото сверху, заголовок, абзац и три чек-строки. Фото
 * нет, на его месте плейсхолдер --color-photo со своим скруглением
 * внутри белой карточки — как картинки в карточках design/главная.jpg.
 *
 * Раскладка — второй блок макета главной (design/главная.jpg), тот же,
 * что у «Что спрятать внутри»: счётчик, подводка и заголовок слева,
 * лента со стрелками справа. Своего блока для преимуществ в макете
 * нет, шаблон повторён. Лента остаётся лентой и на десктопе.
 * Высота 470/530 из старого макета стала минимальной, а карточки
 * тянутся на высоту ленты: тексты разной длины, нижний край общий.
 *
 * Тексты карточек 1 и 3 в макете совпадают дословно — черновик,
 * см. PRODUCT.md.
 */
const CARDS = [
  { title: "benefits.card.1", body: "benefits.body.1" },
  { title: "benefits.card.2", body: "benefits.body.2" },
  { title: "benefits.card.3", body: "benefits.body.3" },
  { title: "benefits.card.4", body: "benefits.body.4" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey }>;

const CHECKS = [
  "benefits.check.1",
  "benefits.check.2",
  "benefits.check.3",
] as const satisfies ReadonlyArray<TextKey>;

export function Benefits() {
  return (
    <section className="pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
      <SplitSlider
        titleId="benefits-title"
        title="benefits.title"
        lead="benefits.lead"
        labels={CARDS.map((card) => card.title)}
        trackClassName="items-stretch gap-[20px] xl:gap-5"
      >
        {CARDS.map((card) => (
          <li
            key={card.title}
            className="rounded-card xl:rounded-card-d flex w-[300px] flex-col bg-white p-[8px] xl:w-[380px] xl:p-[10px]"
          >
            <div
              aria-hidden="true"
              className="bg-photo rounded-inner xl:rounded-inner-d h-[190px] shrink-0 xl:h-[210px]"
            />

            <div className="flex flex-1 flex-col px-[14px] pt-[20px] pb-[22px] xl:px-[18px] xl:pt-[24px] xl:pb-[26px]">
              <h3 className="font-display text-feat xl:text-feat-d font-semibold tracking-tight">
                {t(card.title)}
              </h3>
              <p className="font-ui text-note xl:text-note-d text-body mt-[10px] leading-[1.4]">
                {t(card.body)}
              </p>

              {/* Чек-строки прижаты к низу карточки: в ряду на десктопе
                  абзацы разной длины, а строки должны стоять в линию. */}
              <ul role="list" className="mt-auto flex flex-col gap-[10px] pt-[30px]">
                {CHECKS.map((key) => (
                  <li key={key} className="flex items-center gap-[13px] xl:gap-4">
                    <Icon name="tick" size={20} className="text-pink shrink-0 xl:size-[22px]" />
                    <span className="font-ui text-note xl:text-note-d text-body">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </SplitSlider>
    </section>
  );
}
