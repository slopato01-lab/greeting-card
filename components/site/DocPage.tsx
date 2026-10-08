import Link from "next/link";

import { type TextKey, t } from "@/lib/i18n";

/**
 * Вёрстка документа: разделы с заголовком и списком пунктов.
 *
 * Колонка узкая: длинная строка через всю ширину десктопа не читается,
 * а документ читают подряд, а не проглядывают. Ограничение то же,
 * что у вводного абзаца в PageHead, — 900px.
 *
 * Макета у документов нет, раскладка собрана из готовых секций
 * и токенов DESIGN.md. Ни одного нового приёма здесь не изобретено.
 */
export type DocSection = {
  title: TextKey;
  items: readonly TextKey[];
};

/**
 * Плашка над документом: чем этот текст является и чем не является.
 * Тот же розовый блок, что у примечания на странице «Игры».
 */
export function DocNotice({ textKey }: { textKey: TextKey }) {
  return (
    <div className="rounded-card xl:rounded-card-d bg-surface px-[24px] py-[24px] xl:max-w-[900px] xl:px-[40px] xl:py-[30px]">
      <p className="font-ui text-card xl:text-card-d leading-[1.4]">{t(textKey)}</p>
    </div>
  );
}

/**
 * Документ, которого ещё нет: оферта и правила возврата. Страница
 * существует, потому что адрес понадобится платёжному провайдеру
 * и переписывать его потом по всем ссылкам не хочется, — но текста
 * в ней нет и выдумывать его нельзя (docs/SECURITY.md).
 *
 * Из подвала на такие страницы не ссылаемся, пока они пустые,
 * и закрываем их от поисковых систем: пустой документ в выдаче
 * выглядит как брошенный сервис.
 */
export function DocSoon() {
  return (
    <div className="xl:max-w-[900px]">
      <DocNotice textKey="legal.soon" />

      <Link
        href="/contacts"
        className="font-ui text-note-d min-h-tap mt-[20px] inline-flex items-center underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        {t("page.contacts.title")}
      </Link>
    </div>
  );
}

export function DocSections({ sections }: { sections: readonly DocSection[] }) {
  return (
    <div className="flex flex-col gap-[40px] xl:max-w-[900px] xl:gap-[60px]">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
            {t(section.title)}
          </h2>

          <ul role="list" className="mt-[14px] flex flex-col gap-[12px] xl:mt-[20px]">
            {section.items.map((item) => (
              <li
                key={item}
                className="font-ui text-card xl:text-card-d text-body flex gap-[10px] leading-[1.4]"
              >
                {/* Маркер декоративный: роль списка уже несёт сам список. */}
                <span aria-hidden="true" className="text-gold">
                  —
                </span>
                {t(item)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
