import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/Button";
import { t } from "@/lib/i18n";

/**
 * Страница «не найдено».
 *
 * Пока готов только лендинг, а кнопки на нём ведут на маршруты,
 * которых ещё нет: сюда попадают с каждого «Создать открытку».
 * Поэтому страница не заглушка — с шапкой, подвалом и выходом
 * обратно, чтобы человек не оказался в тупике.
 *
 * Крупное «404» — не текст интерфейса, а цифра, поэтому её нет
 * в словаре и она скрыта от скринридера: он читает заголовок,
 * а не число.
 *
 * При статическом экспорте Next кладёт эту страницу в out/404.html,
 * и Cloudflare Pages сам отдаёт её на любой ненайденный путь.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="page-shell flex min-h-[60vh] flex-col items-center justify-center py-[80px] text-center xl:py-[140px]">
        {/* Цифра декоративная, поэтому приглушённым серым, а не розовым:
            розовый в системе означает действие. Заливкой карточки
            (--pink-card) её брать нельзя — на белом фоне не видно. */}
        <p aria-hidden="true" className="font-display text-h1 xl:text-h1-d text-muted font-bold">
          404
        </p>

        <h1 className="font-display text-h2 xl:text-h2-d mt-[10px] font-medium">
          {t("error.pageNotFound")}
        </h1>

        <p className="font-display text-card xl:text-sub-d text-body mt-[16px] max-w-[52ch] leading-[1.15]">
          {t("error.pageNotFoundBody")}
        </p>

        <Button href="/" labelKey="cta.home" className="mt-[30px] max-w-[325px] xl:mt-[45px]" />
      </main>
      <Footer />
    </>
  );
}
