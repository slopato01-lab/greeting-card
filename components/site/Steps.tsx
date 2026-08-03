import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Три этапа»: как собирается открытка.
 *
 * Розовая подложка во всю ширину, внутри три карточки — на мобильном
 * колонкой, с 1280px в ряд. Номерной квадрат выступает над карточкой
 * и заезжает на её верхний край, поэтому секция не обрезает
 * переполнение, а квадрат лежит в отдельном абсолютном слое.
 *
 * Разметка — нумерованный список: порядок этапов здесь смысл, а не
 * оформление. Сами квадраты с цифрами скрыты от скринридера, они
 * дублируют нумерацию `ol`. Цифра берётся из позиции в списке,
 * а не из словаря: это номер, а не текст интерфейса.
 *
 * Заголовки карточек — h2, хотя размер взят из роли «H3 карточка».
 * Собственного заголовка у секции в макете нет, а прыгать с h1 героя
 * сразу на h3 значит сломать порядок заголовков на странице.
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
    <section className="bg-pink-tint/10 pt-[60px] pb-[71px] xl:pt-[100px] xl:pb-[101px]">
      {/* role="list" не лишний: preflight Tailwind снимает маркеры через
          list-style: none, а Safari вместе с маркерами теряет и семантику
          списка. Здесь она несёт смысл — цифры скрыты от скринридера,
          и порядок остаётся только в разметке. */}
      <ol role="list" className="page-shell grid gap-[30px] xl:grid-cols-3 xl:gap-5">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative pt-[18px] xl:pt-[21px]">
            {/* Квадрат и цифра наклонены на разный угол — так в обоих
                фреймах, цифра стоит чуть менее косо, чем подложка. */}
            <span
              aria-hidden="true"
              className="absolute top-0 left-[34px] flex size-[61px] items-center justify-center xl:left-10 xl:size-[72px]"
            >
              <span className="bg-dark-badge rounded-step-badge xl:rounded-step-badge-d absolute size-[57px] -rotate-[3.46deg] xl:size-[68px]" />
              <span className="font-display text-step xl:text-step-d relative -rotate-[4.12deg] leading-[1.15] font-medium text-white">
                {index + 1}
              </span>
            </span>

            {/* Высота карточки из макета — минимальная: русский текст
                длиннее макетного и на узких экранах даёт лишнюю строку.
                h-full тянет карточку на высоту строки сетки: в ряду
                на десктопе тексты разной длины, а нижний край общий.

                Мобильные поля на 2px меньше макетных: там координаты
                сняты от внешнего края обводки, а padding отсчитывается
                от внутреннего.

                На десктопе поля у трёх карточек в макете разные, потому
                что текстовый блок свёрстан по содержимому. Правое поле
                приравнено к левому, нижнее взято минимальным из трёх,
                см. DESIGN.md. */}
            <div className="border-ink bg-pink-card rounded-step xl:rounded-card-d h-full min-h-[205px] border-2 px-[24px] pt-[66px] pb-[42px] xl:min-h-[261px] xl:px-10 xl:pt-[73px] xl:pb-[45px]">
              <h2 className="font-display text-h3 xl:text-h3-d font-medium">{t(step.title)}</h2>
              {/* text-card — размер, text-body — цвет: --color-body
                  перекрывает одноимённый --text-body, см. globals.css */}
              <p className="font-display text-card xl:text-card-d text-body mt-[10px] leading-[1.15] xl:mt-[14px]">
                {t(step.body)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
