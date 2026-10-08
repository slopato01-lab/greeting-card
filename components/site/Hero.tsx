import { Button } from "@/components/Button";
import { SocialLinks } from "@/components/site/SocialLinks";
import { t } from "@/lib/i18n";

/**
 * Герой главной страницы.
 *
 * Раскладка — первый блок макета главной (design/главная.jpg): тёмная
 * скруглённая карточка, внутри шапка, крупный H1 слева, мини-карточка
 * справа внизу и соцсети в вырезе левого нижнего угла.
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
 * несёт подзаголовок героя, на месте превью в ней серый плейсхолдер
 * --color-photo, как везде, где картинки ещё нет.
 *
 * H1 разбит на строки блоками: три ключа словаря дают ровно то
 * разбиение, что задумано, перенос внутри ключа отдан браузеру.
 */
export function Hero() {
  return (
    <section className="page-shell max-md:px-0">
      <div className="on-dark bg-dark rounded-b-card xl:rounded-b-card-d relative flex min-h-[560px] flex-col px-[20px] pt-[30px] pb-[76px] xl:min-h-[640px] xl:px-10 xl:pt-[60px] xl:pb-[90px]">
        <h1 className="font-display text-h1 xl:text-h1-d font-medium text-white xl:max-w-[1100px]">
          <span className="block">{t("hero.title.1")}</span>
          <span className="block">
            <span className="h1-mark font-semibold xl:font-bold">{t("hero.title.2")}</span>
          </span>
          <span className="block">{t("hero.title.3")}</span>
        </h1>

        <p className="font-ui text-lead xl:text-lead-d mt-[19px] leading-[1.15] text-white xl:mt-[32px] xl:max-w-[1031px]">
          {t("hero.lead")}
        </p>

        <Button href="/create" labelKey="cta.create" className="mt-[25px] xl:mt-[50px]" />

        <div className="mt-auto flex justify-end pt-[40px]">
          <div className="rounded-card flex items-center gap-[12px] bg-white p-[10px] pe-[20px] xl:max-w-[360px]">
            <span
              aria-hidden="true"
              className="bg-photo rounded-btn size-[56px] shrink-0 xl:size-[72px]"
            />
            <p className="font-ui text-note xl:text-note-d leading-[1.15]">{t("hero.badge")}</p>
          </div>
        </div>

        {/* Вырез в углу: белая плашка закрывает скругление карточки,
            соцсети стоят в ней. Фокус здесь снова чёрный: .on-light. */}
        <div className="on-light rounded-tr-card absolute bottom-0 left-0 bg-white pe-[12px] pt-[10px]">
          <SocialLinks />
        </div>
      </div>
    </section>
  );
}
