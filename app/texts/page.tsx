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
      "inside.title",
      "inside.card.1",
      "inside.card.2",
      "inside.card.3",
      "inside.card.4",
      "catalog.title",
      "benefits.title",
      "benefits.lead",
      "cta.title",
      "footer.about",
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

/** Чего в словаре нет. Источник — docs/FIGMA.md, раздел про опечатки. */
const GAPS: ReadonlyArray<{ what: string; now: string; when: string }> = [
  {
    what: "Тексты этапов 1 и 3",
    now: "оба описывают сертификат, а не то, что в заголовке",
    when: "нужно к вёрстке лендинга",
  },
  {
    what: "Подзаголовок каталога",
    now: "«короче топововые»",
    when: "нужно к вёрстке лендинга",
  },
  {
    what: "Названия восьми карточек шаблонов",
    now: "все восемь подписаны «Для второй половинки»",
    when: "нужно к вёрстке лендинга",
  },
  {
    what: "Четыре карточки преимуществ: заголовок и текст",
    now: "три из четырёх одинаковые, там же «новые эиоции»",
    when: "нужно к вёрстке лендинга",
  },
  {
    what: "Пилюли фильтров",
    now: "видны три, одна с опечаткой «Поделится новостью?»",
    when: "к каталогу",
  },
  { what: "Навигация шапки и подвала", now: "есть в макете, в словарь не попала", when: "к шапке" },
  { what: "Ответы FAQ", now: "есть только заголовок вопроса", when: "к блоку FAQ" },
  {
    what: "Тексты карточек «что спрятать внутри»",
    now: "есть только названия: Сертификат, Признание, Перевод, Билет",
    when: "к блоку «что внутри»",
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
          <h2 className="font-display text-h3 xl:text-h3-d font-medium">Чего не хватает</h2>
          <p className="font-ui text-body mt-2 max-w-[70ch] text-[15px]">
            Эти тексты в макете черновые, в словарь они не попали. Придумывать их за вас нельзя —
            первые четыре нужны до того, как верстать лендинг.
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
