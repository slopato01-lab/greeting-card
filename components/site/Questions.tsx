import { type TextKey, t } from "@/lib/i18n";

/**
 * «Вопросы и ответы» — последний блок главной, после CTA. С 08.10.2026
 * вместо отдельной страницы /faq (просьба пользователя: только
 * действительно важные вопросы, аккордеоном). Якорь — /#faq, на него
 * ведут шапка и подвал.
 *
 * Раскладка (с 09.10.2026, просьба пользователя): заголовок и подводка
 * сверху, под ними аккордеон на всю ширину полосы страницы, без
 * подложки — вопросы разделены линиями 1px `--line`.
 *
 * Аккордеон — на `details`/`summary`: клавиатура, скринридер и
 * раскрытие без JS уже есть у браузера. Общее `name` делает их
 * эксклюзивными — открыт один ответ, как в аккордеоне; браузеры без
 * поддержки просто разрешат открыть несколько.
 *
 * Кружок справа серый, у открытого вопроса — золотой, плюс
 * поворачивается в крестик. Состояние сообщает сам `details`, поэтому
 * значок скрыт от скринридера.
 */
const QA = [
  { q: "qa.q.1", a: "qa.a.1" },
  { q: "qa.q.2", a: "qa.a.2" },
  { q: "qa.q.3", a: "qa.a.3" },
  { q: "qa.q.4", a: "qa.a.4" },
  { q: "qa.q.5", a: "qa.a.5" },
  { q: "qa.q.6", a: "qa.a.6" },
] as const satisfies ReadonlyArray<{ q: TextKey; a: TextKey }>;

export function Questions() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-list-title"
      className="page-shell flex flex-col gap-[32px] xl:gap-[56px]"
    >
      <div className="flex flex-col gap-[16px]">
        <h2
          id="faq-list-title"
          className="font-display text-h1 xl:text-h1-d font-medium tracking-tight"
        >
          {t("page.faq.title")}
        </h2>
        <p className="font-ui text-sub xl:text-sub-d text-body max-w-[640px] leading-[1.5]">
          {t("page.faq.lead")}
        </p>
      </div>

      <ul role="list" className="border-line border-b">
        {QA.map((item, index) => (
          <li key={item.q} className="border-line border-t">
            <details name="faq" className="group">
              {/* Нажимается вся строка, а не только текст вопроса. */}
              <summary className="min-h-tap flex cursor-pointer list-none items-center gap-[14px] py-[20px] xl:gap-[24px] xl:py-[32px] [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden="true"
                  className="font-display text-note xl:text-card-d text-gold-deep w-[24px] shrink-0 font-medium tabular-nums xl:w-[32px]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="font-display text-card xl:text-h3-d min-w-0 flex-1 font-semibold tracking-tight">
                  {t(item.q)}
                </h3>

                <span
                  aria-hidden="true"
                  className="bg-raised group-open:bg-gold text-ink flex size-[36px] shrink-0 items-center justify-center rounded-full transition-colors xl:size-[44px]"
                >
                  <span className="font-display text-h3 leading-none transition-transform group-open:rotate-45 motion-reduce:transition-none">
                    +
                  </span>
                </span>
              </summary>

              <p className="font-ui text-note xl:text-card-d text-body ps-[38px] pe-[50px] pb-[24px] leading-[1.5] xl:max-w-[1016px] xl:ps-[56px] xl:pe-[68px] xl:pb-[36px]">
                {t(item.a)}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
