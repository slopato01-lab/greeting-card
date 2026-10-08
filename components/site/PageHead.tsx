import { type TextKey, t } from "@/lib/i18n";

/**
 * Шапка содержимого внутренней страницы: заголовок и вводный абзац.
 *
 * Кегль взят от роли «H2 секция», а не «H1 герой»: девяносто пикселей
 * из героя на внутренней странице спорят с шапкой сайта, а вся
 * остальная типографика этих страниц собрана из секций лендинга.
 *
 * Вводный абзац необязателен: у конструктора его нет, там сразу шаги.
 *
 * У заголовка постоянный id `page-title`: на него ссылаются ряды
 * и списки ниже по странице. Заголовок на странице один, поэтому id
 * фиксированный, а не приходит пропом.
 */
export const PAGE_TITLE_ID = "page-title";

export function PageHead({ title, lead }: { title: TextKey; lead?: TextKey }) {
  return (
    <div className="page-shell pt-[40px] pb-[10px] xl:pt-[80px] xl:pb-[20px]">
      <h1
        id={PAGE_TITLE_ID}
        className="font-display text-h1 xl:text-h1-d font-medium tracking-tight"
      >
        {t(title)}
      </h1>

      {lead === undefined ? null : (
        <p className="font-ui text-sub xl:text-sub-d text-body mt-[14px] leading-[1.4] xl:mt-[25px] xl:max-w-[900px]">
          {t(lead)}
        </p>
      )}
    </div>
  );
}
