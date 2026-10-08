import Link from "next/link";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { TEMPLATES } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Герой главной страницы.
 *
 * Раскладка и стиль — первый блок макета design/главная greetinh-cards.jpg:
 * большая скруглённая карточка, внизу слева плашка-подпись в рамке,
 * крупный H1 и две кнопки — золотая и белая. Справа колонка из двух
 * мини-карточек: белая и золотая.
 *
 * Белая мини-карточка — первый шаблон каталога, золотая — «Собрать
 * свой». В макете там товары с ценами; цен и рейтингов у нас нет,
 * поэтому на карточках только то, что есть в каталоге.
 *
 * Фото из макета у нас нет — карточка залита --surface, на месте
 * превью шаблона плейсхолдер --photo. Вертикальный счётчик слайдов
 * из макета не перенесён: слайд у героя один.
 *
 * H1 разбит на строки блоками: три ключа словаря дают ровно то
 * разбиение, что задумано, перенос внутри ключа отдан браузеру.
 */
const FEATURED = TEMPLATES[0];

/** Круг со стрелкой или плюсом в углу мини-карточки — как в макете. */
const CORNER =
  "size-[36px] shrink-0 items-center justify-center rounded-full border flex transition-colors";

export function Hero() {
  return (
    <section className="page-shell">
      <div className="rounded-panel xl:rounded-panel-d bg-surface grid gap-[30px] p-[20px] xl:min-h-[640px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-[40px] xl:p-[48px]">
        <div className="flex flex-col justify-end pt-[20px] xl:pt-0">
          <p className="border-line rounded-inner flex max-w-[460px] items-center gap-[12px] self-start border px-[12px] py-[10px]">
            <span
              aria-hidden="true"
              className="bg-paper text-canvas flex size-[28px] shrink-0 items-center justify-center rounded-full"
            >
              <Icon name="planet" size={18} />
            </span>
            <span className="font-ui caps text-badge xl:text-badge-d text-body leading-[1.35]">
              {t("hero.badge")}
            </span>
          </p>

          <h1 className="font-display text-h1 xl:text-h1-d mt-[20px] font-medium tracking-tight xl:mt-[28px]">
            <span className="block">{t("hero.title.1")}</span>
            <span className="block">{t("hero.title.2")}</span>
            <span className="block">{t("hero.title.3")}</span>
          </h1>

          <p className="font-ui text-lead xl:text-lead-d text-body mt-[16px] max-w-[640px] leading-[1.5] xl:mt-[24px]">
            {t("hero.lead")}
          </p>

          <div className="mt-[24px] flex flex-col gap-[10px] xl:mt-[36px] xl:flex-row xl:gap-[12px]">
            <Button href="/create" labelKey="cta.create" />
            <Button href="/cards" tone="light" labelKey="cta.templates" />
          </div>
        </div>

        {/* Мини-карточки: на мобильном рядом в две колонки, с 1280 —
            колонкой справа, прижаты к верху, как в макете. */}
        <ul role="list" className="grid grid-cols-2 gap-[10px] xl:grid-cols-1 xl:content-start">
          <li>
            <Link
              href={`/cards/${FEATURED.slug}`}
              className="group rounded-card bg-paper text-canvas on-light flex h-full flex-col p-[8px] transition-transform active:translate-y-px"
            >
              <span
                aria-hidden="true"
                className="bg-photo rounded-inner block h-[90px] xl:h-[120px]"
              />
              <span className="flex flex-1 flex-col justify-between gap-[10px] px-[6px] pt-[12px] pb-[4px] xl:flex-row xl:items-end">
                <span className="font-display caps text-badge xl:text-badge-d leading-[1.25] font-medium">
                  {t(FEATURED.nameKey)}
                </span>
                <span
                  aria-hidden="true"
                  className={`${CORNER} border-canvas group-hover:bg-canvas group-hover:text-paper self-end`}
                >
                  <Icon name="next" size={16} className="-rotate-45" />
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/create"
              className="group rounded-card bg-gold text-canvas on-light flex h-full flex-col justify-between gap-[16px] p-[14px] transition-transform active:translate-y-px xl:min-h-[150px]"
            >
              <span className="font-display caps text-badge xl:text-badge-d leading-[1.25] font-medium">
                {t("catalog.filter.6")}
              </span>
              <span
                aria-hidden="true"
                className={`${CORNER} border-canvas group-hover:bg-canvas group-hover:text-gold self-end`}
              >
                <Icon name="next" size={16} className="-rotate-45" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
