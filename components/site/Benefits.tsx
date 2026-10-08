import { Icon } from "@/components/Icon";
import { Ribbon } from "@/components/site/slider";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Больше, чем просто открытка»: четыре карточки преимуществ.
 *
 * Своего блока у преимуществ в макете design/главная greetinh-cards.jpg
 * нет — повторён ряд товаров: заголовок слева, подводка справа, ниже
 * лента тёмных карточек со счётчиком «1/4» и стрелками.
 *
 * Карточка — фото сверху, заголовок, абзац и три чек-строки с золотыми
 * галочками. Фото нет, на его месте плейсхолдер --photo. Карточки
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
    <section className="page-shell pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
      <div className="flex flex-col gap-[16px] xl:flex-row xl:items-end xl:justify-between xl:gap-[60px]">
        <h2
          id="benefits-title"
          className="font-display text-h2 xl:text-h2-d max-w-[900px] font-medium tracking-tight"
        >
          {t("benefits.title")}
        </h2>
        <p className="font-ui text-sub xl:text-sub-d text-body max-w-[520px] leading-[1.5]">
          {t("benefits.lead")}
        </p>
      </div>

      <div className="mt-[30px] xl:mt-[50px]">
        <Ribbon
          labelledBy="benefits-title"
          count={CARDS.length}
          trackClassName="items-stretch gap-[12px] xl:gap-5"
        >
          {CARDS.map((card) => (
            <li
              key={card.title}
              className="rounded-card xl:rounded-card-d bg-surface flex w-[280px] flex-col p-[8px] xl:w-[calc((100%-40px)/3)] xl:p-[10px]"
            >
              <div
                aria-hidden="true"
                className="bg-photo rounded-inner xl:rounded-inner-d h-[180px] shrink-0 xl:h-[240px]"
              />

              <div className="flex flex-1 flex-col px-[12px] pt-[20px] pb-[16px] xl:px-[16px] xl:pt-[24px] xl:pb-[20px]">
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
                      <Icon name="tick" size={20} className="text-gold shrink-0" />
                      <span className="font-ui text-note xl:text-note-d text-ink">{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Ribbon>
      </div>
    </section>
  );
}
