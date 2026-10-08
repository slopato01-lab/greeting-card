import { Icon } from "@/components/Icon";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Больше, чем просто открытка»: четыре карточки преимуществ.
 *
 * Заголовок слева, подводка справа, ниже четыре карточки. С 1280 —
 * сеткой в четыре колонки, все в ширину экрана без прокрутки
 * (просьба пользователя 08.10.2026). На мобильном — лента пальцем.
 *
 * Карточка — фото сверху, заголовок, абзац и три чек-строки с золотыми
 * галочками. Фото — праздничные снимки Unsplash из шаблона
 * «С днём рождения!», ужатые копии в public/assets/benefits. Декор,
 * поэтому alt пустой. Карточки тянутся на высоту ряда: тексты разной
 * длины, нижний край общий.
 *
 * Тексты карточек 1 и 3 в макете совпадают дословно — черновик,
 * см. PRODUCT.md.
 */
const CARDS = [
  { title: "benefits.card.1", body: "benefits.body.1", photo: "balloons" },
  { title: "benefits.card.2", body: "benefits.body.2", photo: "confetti" },
  { title: "benefits.card.3", body: "benefits.body.3", photo: "gifts" },
  { title: "benefits.card.4", body: "benefits.body.4", photo: "cake" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey; photo: string }>;

const CHECKS = [
  "benefits.check.1",
  "benefits.check.2",
  "benefits.check.3",
] as const satisfies ReadonlyArray<TextKey>;

export function Benefits() {
  return (
    <section className="page-shell pt-[60px] pb-[60px] xl:pt-[40px] xl:pb-[40px]">
      <div className="flex flex-col gap-[16px] xl:flex-row xl:items-end xl:justify-between xl:gap-[60px]">
        <h2
          id="benefits-title"
          className="font-display text-h1 xl:text-h1-d max-w-[900px] font-medium tracking-tight"
        >
          {t("benefits.title")}
        </h2>
        <p className="font-ui text-sub xl:text-sub-d text-body max-w-[520px] leading-[1.5]">
          {t("benefits.lead")}
        </p>
      </div>

      <ul
        role="list"
        aria-labelledby="benefits-title"
        className="carousel mt-[30px] items-stretch gap-[12px] xl:mx-0 xl:mt-[30px] xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:px-0"
      >
        {CARDS.map((card) => (
          <li
            key={card.title}
            className="rounded-card xl:rounded-card-d bg-surface flex w-[280px] flex-col p-[8px] xl:w-auto xl:p-[10px]"
          >
            <div className="bg-photo rounded-inner xl:rounded-inner-d relative h-[180px] shrink-0 overflow-hidden xl:h-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/benefits/${card.photo}.webp`}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col px-[12px] pt-[20px] pb-[16px] xl:px-[14px] xl:pt-[22px] xl:pb-[18px]">
              <h3 className="font-display text-feat xl:text-feat-d font-medium tracking-tight">
                {t(card.title)}
              </h3>
              <p className="font-ui text-note xl:text-note-d text-body mt-[10px] leading-[1.5]">
                {t(card.body)}
              </p>

              {/* Чек-строки прижаты к низу карточки: абзацы разной
                  длины, а строки должны стоять в линию. */}
              <ul role="list" className="mt-auto flex flex-col gap-[10px] pt-[24px]">
                {CHECKS.map((key) => (
                  <li key={key} className="flex items-center gap-[12px]">
                    <Icon name="tick" size={20} className="text-gold-deep shrink-0" />
                    <span className="font-ui text-note xl:text-note-d text-ink">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
