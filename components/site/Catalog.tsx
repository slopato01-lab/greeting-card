import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Дизайн для каждого случая»: заголовок, фильтры и сетка
 * шаблонов.
 *
 * Фильтры, как и поводы в FAQ, пока не переключают ничего: каталог
 * с состоянием — отдельная задача. Поэтому это список, а не кнопки.
 *
 * Карточка шаблона — белый прямоугольник с нижней плашкой «Выбрать».
 * Картинок шаблонов в макете нет, там пустое белое поле; в коде на
 * их месте плейсхолдер цветом --color-photo. Подставлять сюда
 * случайные картинки нельзя: их ещё не нарисовали.
 *
 * На мобильном в макете три карточки колонкой, на десктопе восемь
 * в четыре столбца. Названия у всех восьми одинаковые — так в макете,
 * см. PRODUCT.md.
 */
const FILTERS = [
  "catalog.filter.1",
  "catalog.filter.2",
  "catalog.filter.3",
  "catalog.filter.4",
  "catalog.filter.5",
  "catalog.filter.6",
] as const satisfies ReadonlyArray<TextKey>;

const CARDS = [
  "catalog.card.1",
  "catalog.card.2",
  "catalog.card.3",
  "catalog.card.4",
  "catalog.card.5",
  "catalog.card.6",
  "catalog.card.7",
  "catalog.card.8",
] as const satisfies ReadonlyArray<TextKey>;

export function Catalog() {
  return (
    <section className="pt-[59px] pb-[70px] xl:pt-[140px] xl:pb-[120px]">
      <div className="page-shell">
        <h2 className="font-display text-h2 xl:text-h2-d font-medium">{t("catalog.title")}</h2>
        <p className="font-display text-body xl:text-body-d text-muted mt-[14px] leading-[1.15] xl:mt-[25px] xl:max-w-[738px]">
          {t("catalog.lead")}
        </p>

        <ul role="list" className="carousel mt-[38px] gap-[10px] xl:mt-20 xl:gap-5">
          {FILTERS.map((key, index) => (
            <li
              key={key}
              className={
                "min-h-tap rounded-pill xl:rounded-pill-d font-display text-pill xl:text-pill-cat-d " +
                "flex items-center px-[21px] font-medium xl:px-[30px] " +
                (index === 0 ? "bg-pink text-white" : "border-ink text-muted-2 border")
              }
            >
              {t(key)}
              {/* Последний фильтр в макете с плюсом: он не повод,
                  а приглашение собрать свой набор. */}
              {index === FILTERS.length - 1 ? <span aria-hidden="true">&nbsp;&nbsp;+</span> : null}
            </li>
          ))}
        </ul>

        <ul
          role="list"
          className="mt-[63px] grid gap-[70px] xl:mt-[75px] xl:grid-cols-4 xl:gap-x-5 xl:gap-y-[30px]"
        >
          {CARDS.map((key) => (
            <li
              key={key}
              className="rounded-card xl:rounded-card-d border-ink flex flex-col overflow-hidden border-2 bg-white"
            >
              {/* Картинки шаблона ещё нет — плейсхолдер держит
                  пропорции карточки из макета, 350×368 и 390×410. */}
              <div aria-hidden="true" className="bg-photo min-h-[317px] flex-1 xl:min-h-[355px]" />

              <div className="border-ink flex min-h-[49px] items-center justify-between gap-4 border-t px-[22px] py-[14px] xl:min-h-[55px] xl:px-6">
                <span className="font-ui text-tpl xl:text-tpl-d">{t(key)}</span>
                {/* «Выбрать» в макете — подпись, а не кнопка. Ссылкой
                    она станет, когда появится страница шаблона. */}
                <span className="font-ui text-tpl-action xl:text-tpl-action-d text-caption">
                  {t("catalog.choose")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
