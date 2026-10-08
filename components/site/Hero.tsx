import { Button } from "@/components/Button";
import { SocialLinks } from "@/components/site/SocialLinks";
import { t } from "@/lib/i18n";

/**
 * Герой главной страницы.
 *
 * Раскладка и стиль — первый блок макета главной (design/главная.jpg):
 * тёмная скруглённая карточка, внутри шапка, крупный H1 слева,
 * мини-карточка справа внизу, соцсети в вырезе левого нижнего угла
 * и название продукта водяным знаком по нижнему краю (с 1280px).
 *
 * Карточка собрана из двух половин: верх рисует шапка (вариант "hero"
 * в Header), низ — эта секция. Так шапка остаётся отдельным `header`
 * над `main`, а на экране это одна карточка без шва.
 *
 * До 768px карточка идёт во всю ширину экрана, без полей полосы:
 * иначе H1 кеглем 52 теряет 40px, и «Маленький» с «открытка.»
 * вылезают за край. Поля карточки — те же 20px, что у полосы.
 *
 * Фото из макета у нас нет — фон сплошной --color-dark. Мини-карточка
 * несёт подзаголовок героя, на месте превью в ней плейсхолдер
 * --color-photo, как везде, где картинки ещё нет. Стекла из макета
 * нет: карточка непрозрачная, --color-dark-2.
 *
 * H1 разбит на строки блоками: три ключа словаря дают ровно то
 * разбиение, что задумано, перенос внутри ключа отдан браузеру.
 */
export function Hero() {
  return (
    <section className="page-shell max-md:px-0">
      <div className="on-dark bg-dark rounded-b-panel xl:rounded-b-panel-d relative flex min-h-[560px] flex-col px-[20px] pt-[30px] pb-[76px] xl:min-h-[680px] xl:px-10 xl:pt-[60px] xl:pb-[90px]">
        {/* Водяной знак лежит в своей обрезающей рамке: если обрезать
            всю карточку, вместе с ним обрежется и обводка фокуса
            у соцсетей в вырезе. */}
        <div
          aria-hidden="true"
          className="rounded-b-panel-d pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
        >
          <span className="font-display text-mark-d text-dark-2 absolute inset-x-0 -bottom-[0.18em] text-center font-semibold tracking-tight whitespace-nowrap">
            {t("brand.name")}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col">
          <h1 className="font-display text-h1 xl:text-h1-d font-semibold tracking-tight text-white xl:max-w-[1100px]">
            <span className="block">{t("hero.title.1")}</span>
            <span className="block">{t("hero.title.2")}</span>
            <span className="block">{t("hero.title.3")}</span>
          </h1>

          <p className="font-ui text-lead xl:text-lead-d text-photo mt-[19px] leading-[1.4] xl:mt-[28px] xl:max-w-[760px]">
            {t("hero.lead")}
          </p>

          <Button
            href="/create"
            tone="light"
            labelKey="cta.create"
            className="mt-[25px] xl:mt-[40px] xl:self-start"
          />

          <div className="mt-auto flex justify-end pt-[40px]">
            <div className="rounded-card bg-dark-2 flex items-center gap-[12px] p-[10px] pe-[20px] xl:max-w-[360px]">
              <span
                aria-hidden="true"
                className="bg-photo rounded-inner size-[56px] shrink-0 xl:size-[72px]"
              />
              <p className="font-ui text-note xl:text-note-d leading-[1.3] text-white">
                {t("hero.badge")}
              </p>
            </div>
          </div>
        </div>

        {/* Вырез в углу: плашка цвета основы закрывает скругление
            карточки, соцсети стоят в ней. Фокус здесь снова тёмный:
            .on-light. */}
        <div className="on-light rounded-tr-panel bg-canvas absolute bottom-0 left-0 pe-[12px] pt-[10px]">
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
