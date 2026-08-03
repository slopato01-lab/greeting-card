import type { ReactNode } from "react";

import { ru, type TextKey } from "@/lib/i18n";

// Служебная страница для вычитки. Из навигации не линкуется,
// пользователь её не видит. Правило «тексты только из словаря»
// для неё снято в eslint.config.mjs — она сам словарь и показывает.

const GROUPS: ReadonlyArray<{ title: string; keys: readonly TextKey[] }> = [
  {
    title: "Лендинг",
    keys: [
      "hero.badge",
      "hero.title.1",
      "hero.title.2",
      "hero.title.3",
      "hero.lead",
      "steps.title.1",
      "steps.title.2",
      "steps.title.3",
      "steps.body.1",
      "steps.body.2",
      "steps.body.3",
      "faq.title",
      "faq.pill.1",
      "faq.pill.2",
      "faq.pill.3",
      "faq.pill.4",
      "faq.card.title",
      "faq.card.lead",
      "faq.card.item.1",
      "faq.card.item.2",
      "faq.card.item.3",
      "faq.card.item.4",
      "inside.title",
      "inside.card.1",
      "inside.card.2",
      "inside.card.3",
      "inside.card.4",
      "inside.body.1",
      "inside.body.2",
      "inside.body.3",
      "inside.body.4",
      "catalog.title",
      "catalog.lead",
      "catalog.filter.1",
      "catalog.filter.2",
      "catalog.filter.3",
      "catalog.filter.4",
      "catalog.filter.5",
      "catalog.filter.6",
      "catalog.choose",
      "catalog.card.1",
      "catalog.card.2",
      "catalog.card.3",
      "catalog.card.4",
      "catalog.card.5",
      "catalog.card.6",
      "catalog.card.7",
      "catalog.card.8",
      "benefits.title",
      "benefits.lead",
      "benefits.card.1",
      "benefits.card.2",
      "benefits.card.3",
      "benefits.card.4",
      "benefits.body.1",
      "benefits.body.2",
      "benefits.body.3",
      "benefits.body.4",
      "benefits.check.1",
      "benefits.check.2",
      "benefits.check.3",
      "cta.title",
      "cta.lead",
      "footer.about",
      "footer.nav.title",
      "footer.pay.title",
      "footer.social.instagram",
      "footer.social.facebook",
      "footer.social.twitter",
    ],
  },
  {
    title: "Кнопки",
    keys: [
      "cta.create",
      "cta.next",
      "cta.back",
      "cta.preview",
      "cta.pay",
      "cta.copyLink",
      "cta.addPhoto",
      "cta.replacePhoto",
      "cta.retry",
      "cta.start",
      "cta.templates",
    ],
  },
  {
    title: "Шаги конструктора",
    keys: [
      "step.1.title",
      "step.2.title",
      "step.2.hint",
      "step.3.title",
      "step.3.hint",
      "step.4.title",
      "step.4.hint",
      "step.5.title",
      "step.5.hint",
      "step.6.title",
    ],
  },
  {
    title: "Внутри игр",
    keys: ["game.puzzle.hint", "game.memory.hint", "game.scratch.hint", "game.moves", "game.time"],
  },
  {
    title: "Ошибки",
    keys: [
      "error.photoTooBig",
      "error.photoFormat",
      "error.uploadFailed",
      "error.payFailed",
      "error.cardNotFound",
      "error.cardExpired",
      "error.gameFailed",
    ],
  },
  { title: "Пустые состояния", keys: ["empty.photos", "empty.drafts"] },
  { title: "Ожидание", keys: ["loading.upload", "loading.game", "loading.pay"] },
  { title: "После оплаты", keys: ["done.title", "done.body", "done.storage"] },
];

/**
 * Что в словаре стоит черновиком. Строки на странице уже есть —
 * иначе секцию нельзя было бы сверстать, — но они либо перенесены
 * из макета как есть вместе с повторами, либо написаны вместо
 * очевидной заглушки и ждут решения. Источник — docs/PRODUCT.md.
 */
const GAPS: ReadonlyArray<{ what: string; now: string; when: string }> = [
  {
    what: "Названия восьми карточек шаблонов",
    now: "все восемь подписаны «Для второй половинки» — так в макете",
    when: "нужны разные, до запуска каталога",
  },
  {
    what: "Тексты карточек «что спрятать внутри»",
    now: "во всех четырёх один абзац про сертификат — так в макете",
    when: "верен только для «Сертификата», остальным нужен свой",
  },
  {
    what: "Тексты преимуществ 1 и 3",
    now: "«Эмоции, которые не купишь» и «Подарок живёт вечно» совпадают дословно",
    when: "нужен свой текст хотя бы одному",
  },
  {
    what: "Подзаголовок каталога",
    now: "написан вместо макетного «короче топововые открытки и шаблоны к ним»",
    when: "проверить формулировку",
  },
  {
    what: "Подпись тёмного блока CTA",
    now: "взят десктопный вариант, на мобильном в макете была заглушка",
    when: "проверить формулировку",
  },
  {
    what: "Состав способов оплаты",
    now: "шесть логотипов из макета одним растровым спрайтом, без подписей",
    when: "уточнить список до подключения платёжки",
  },
];

function Row({ textKey }: { textKey: TextKey }) {
  return (
    <li className="border-ink/10 flex flex-col gap-1 border-b py-3 last:border-b-0">
      <code className="font-ui text-muted text-[12px]">{textKey}</code>
      <span className="text-card">{ru[textKey]}</span>
    </li>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-ink/10 border-t pt-6">
      <h2 className="font-display text-h3 xl:text-h3-d font-medium">{title}</h2>
      <ul className="mt-3">{children}</ul>
    </section>
  );
}

export default function TextsPage() {
  const covered = new Set<string>(GROUPS.flatMap((g) => g.keys));
  const orphans = (Object.keys(ru) as TextKey[]).filter((k) => !covered.has(k));
  const total = Object.keys(ru).length;

  return (
    <main className="px-gutter xl:px-gutter-d mx-auto max-w-[var(--container-content)] py-10">
      <header>
        <p className="font-ui text-muted text-[13px]">Служебная страница</p>
        <h1 className="font-display text-h2 xl:text-h1-d mt-2 font-medium">Тексты</h1>
        <p className="font-ui text-body mt-4 max-w-[70ch] text-[15px]">
          Всё, что видит пользователь. Источник — docs/PRODUCT.md, в коде эти строки приходят через
          t(). Сейчас в словаре {total} строк. Правки вносятся в документ, не здесь.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        {GROUPS.map((group) => (
          <Group key={group.title} title={group.title}>
            {group.keys.map((key) => (
              <Row key={key} textKey={key} />
            ))}
          </Group>
        ))}

        {orphans.length > 0 ? (
          <Group title="Не разложено по группам">
            {orphans.map((key) => (
              <Row key={key} textKey={key} />
            ))}
          </Group>
        ) : null}

        <section className="border-ink/10 border-t pt-6">
          <h2 className="font-display text-h3 xl:text-h3-d font-medium">Что стоит черновиком</h2>
          <p className="font-ui text-body mt-2 max-w-[70ch] text-[15px]">
            Эти строки на странице уже видны, но они либо перенесены из макета вместе с повторами,
            либо написаны вместо явной заглушки. Придумывать их за вас нельзя — посмотрите на
            странице и поправьте в docs/PRODUCT.md.
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {GAPS.map((gap) => (
              <li key={gap.what} className="bg-pink-card rounded-card p-4">
                <p className="text-card font-medium">{gap.what}</p>
                <p className="font-ui text-body mt-1 text-[14px]">Сейчас: {gap.now}</p>
                <p className="font-ui text-muted mt-1 text-[13px]">{gap.when}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
