import { counterNumber } from "@/components/site/counter";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Три этапа»: как собирается открытка.
 *
 * Раскладка — блок с цифрами из макета главной (design/главная.jpg):
 * три полосы одна под другой, слева текст, справа крупная цифра.
 * В макете это счётчики «12+ / 80+ / 3K+», у нас на их месте номер
 * этапа — полос ровно три, и порядок здесь смысл.
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
    <section className="pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
      {/* role="list" не лишний: preflight Tailwind снимает маркеры через
          list-style: none, а Safari вместе с маркерами теряет и семантику
          списка. Здесь она несёт смысл — цифры скрыты от скринридера,
          и порядок остаётся только в разметке. */}
      <ol role="list" className="page-shell flex flex-col gap-[15px] xl:gap-5">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="border-ink bg-pink-card rounded-step xl:rounded-card-d flex min-h-[140px] items-center justify-between gap-[20px] border-2 px-[24px] py-[24px] xl:min-h-[170px] xl:gap-10 xl:px-[60px] xl:py-[34px]"
          >
            <div className="xl:max-w-[820px]">
              <h2 className="font-display text-h3 xl:text-h3-d font-medium">{t(step.title)}</h2>
              {/* text-card — размер, text-body — цвет, см. globals.css */}
              <p className="font-display text-card xl:text-card-d text-body mt-[10px] leading-[1.15] xl:mt-[14px]">
                {t(step.body)}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="font-display text-h1 xl:text-h1-d shrink-0 leading-none font-medium"
            >
              {counterNumber(index)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
