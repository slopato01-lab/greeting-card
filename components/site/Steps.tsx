import { counterNumber } from "@/components/site/counter";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Три этапа»: как собирается открытка.
 *
 * Раскладка — золотая карточка из макета главной
 * (design/главная greetinh-cards.jpg), вторая в ряду под героем,
 * справа от тёмной карточки «что внутри». В макете на ней аватарки
 * в кружках; у нас в тех же тёмных кружках номера этапов.
 *
 * Разметка — нумерованный список. Крупные цифры скрыты от скринридера,
 * они дублируют нумерацию `ol`. Цифра берётся из позиции в списке,
 * а не из словаря: это номер, а не текст интерфейса.
 *
 * Заголовки полос — h2, хотя размер взят из роли «H3 карточка».
 * Собственного заголовка у секции нет, а прыгать с h1 героя сразу
 * на h3 значит сломать порядок заголовков на странице.
 *
 * Интерактивных элементов в секции нет, поэтому нет и состояний
 * наведения, нажатия, загрузки и ошибки: показывать нечего.
 */
const STEPS = [
  { title: "steps.title.1", body: "steps.body.1" },
  { title: "steps.title.2", body: "steps.body.2" },
  { title: "steps.title.3", body: "steps.body.3" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey }>;

export function Steps() {
  return (
    <section className="on-light rounded-panel xl:rounded-panel-d bg-gold text-canvas p-[24px] xl:p-[40px]">
      {/* role="list" не лишний: preflight Tailwind снимает маркеры через
          list-style: none, а Safari вместе с маркерами теряет и семантику
          списка. Здесь она несёт смысл — цифры скрыты от скринридера,
          и порядок остаётся только в разметке. */}
      <ol role="list" className="flex flex-col gap-[24px] xl:gap-[28px]">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-[16px] xl:gap-[20px]">
            <span
              aria-hidden="true"
              className="bg-canvas text-gold font-display text-note xl:text-note-d size-tap flex shrink-0 items-center justify-center rounded-full font-medium"
            >
              {counterNumber(index)}
            </span>
            <div>
              <h2 className="font-display text-h3 xl:text-h3-d font-medium tracking-tight">
                {t(step.title)}
              </h2>
              {/* text-card — размер, text-canvas — цвет: тёмный текст на золоте */}
              <p className="font-ui text-card xl:text-card-d mt-[8px] leading-[1.5]">
                {t(step.body)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
