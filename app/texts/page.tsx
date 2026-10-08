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
      "hero.note.pick",
      "hero.note.free",
      "hero.cards",
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
      "faq.card.1.title",
      "faq.card.1.lead",
      "faq.card.1.item.1",
      "faq.card.1.item.2",
      "faq.card.1.item.3",
      "faq.card.1.item.4",
      "faq.card.2.title",
      "faq.card.2.lead",
      "faq.card.2.item.1",
      "faq.card.2.item.2",
      "faq.card.2.item.3",
      "faq.card.2.item.4",
      "faq.card.3.title",
      "faq.card.3.lead",
      "faq.card.3.item.1",
      "faq.card.3.item.2",
      "faq.card.3.item.3",
      "faq.card.3.item.4",
      "faq.card.4.title",
      "faq.card.4.lead",
      "faq.card.4.item.1",
      "faq.card.4.item.2",
      "faq.card.4.item.3",
      "faq.card.4.item.4",
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
      "footer.col.help",
      "footer.col.service",
      "footer.copyright",
      "footer.pay.title",
      "footer.social.instagram",
      "footer.social.facebook",
      "footer.social.twitter",
    ],
  },
  {
    title: "Заголовки страниц",
    keys: [
      "page.cards.title",
      "page.cards.lead",
      "page.games.title",
      "page.games.lead",
      "page.faq.title",
      "page.faq.lead",
      "page.how.title",
      "page.how.lead",
      "page.privacy.title",
      "page.privacy.lead",
      "page.contacts.title",
      "page.contacts.lead",
      "page.terms.title",
      "page.refund.title",
      "page.prices.title",
      "page.prices.lead",
    ],
  },
  {
    title: "Цены",
    keys: [
      "price.byn",
      "price.rub",
      "price.item.1",
      "price.item.2",
      "price.item.3",
      "price.item.4",
      "price.item.5",
      "price.free.title",
      "price.free.item.1",
      "price.free.item.2",
      "price.free.item.3",
      "price.paid.title",
      "price.paid.item.1",
      "price.paid.item.2",
      "price.paid.item.3",
      "price.note",
    ],
  },
  {
    title: "Документы",
    keys: [
      "legal.notice",
      "legal.soon",
      "legal.todo.title",
      "legal.todo.body",
      "legal.entity",
      "legal.tax",
      "legal.address",
      "legal.email",
      "privacy.s1.title",
      "privacy.s1.item.1",
      "privacy.s1.item.2",
      "privacy.s1.item.3",
      "privacy.s2.title",
      "privacy.s2.item.1",
      "privacy.s2.item.2",
      "privacy.s2.item.3",
      "privacy.s3.title",
      "privacy.s3.item.1",
      "privacy.s3.item.2",
      "privacy.s3.item.3",
      "privacy.s4.title",
      "privacy.s4.item.1",
      "privacy.s4.item.2",
      "privacy.s5.title",
      "privacy.s5.item.1",
      "privacy.s5.item.2",
      "privacy.s5.item.3",
      "privacy.s6.title",
      "privacy.s6.item.1",
      "privacy.s7.title",
      "privacy.s7.item.1",
      "privacy.s7.item.2",
      "privacy.s8.title",
      "privacy.s8.item.1",
      "contacts.mail.title",
      "contacts.social.title",
      "contacts.details.title",
      "contacts.reply",
    ],
  },
  {
    title: "Страница «Игры»",
    keys: [
      "games.card.1.title",
      "games.card.1.body",
      "games.card.1.photos",
      "games.card.1.level",
      "games.card.2.title",
      "games.card.2.body",
      "games.card.2.photos",
      "games.card.2.level",
      "games.card.3.title",
      "games.card.3.body",
      "games.card.3.photos",
      "games.card.3.level",
      "games.photos.label",
      "games.level.label",
      "games.suits.label",
      "games.note.title",
      "games.note.body",
      "games.tag.birthday",
      "games.tag.confession",
      "games.tag.anniversary",
      "games.tag.invite",
      "games.tag.news",
      "games.tag.distance",
      "games.tag.parents",
      "games.tag.thanks",
      "games.tag.sorry",
      "games.tag.corporate",
    ],
  },
  {
    title: "Вопросы и ответы на главной",
    keys: [
      "qa.q.1",
      "qa.a.1",
      "qa.q.2",
      "qa.a.2",
      "qa.q.3",
      "qa.a.3",
      "qa.q.4",
      "qa.a.4",
      "qa.q.5",
      "qa.a.5",
      "qa.q.6",
      "qa.a.6",
    ],
  },
  {
    title: "Страница «Как это работает»",
    keys: [
      "how.steps.title",
      "how.step.1.body",
      "how.step.2.body",
      "how.step.3.body",
      "how.step.4.body",
      "how.step.5.body",
      "how.step.6.body",
      "how.player.title",
      "how.player.body",
    ],
  },
  {
    title: "Страница шаблона",
    keys: [
      "tpl.occasion",
      "tpl.game",
      "tpl.inside",
      "tpl.more",
      "tpl.back",
      "tpl.1.lead",
      "tpl.1.item.1",
      "tpl.1.item.2",
      "tpl.1.item.3",
      "tpl.2.lead",
      "tpl.2.item.1",
      "tpl.2.item.2",
      "tpl.2.item.3",
      "tpl.3.lead",
      "tpl.3.item.1",
      "tpl.3.item.2",
      "tpl.3.item.3",
      "tpl.4.lead",
      "tpl.4.item.1",
      "tpl.4.item.2",
      "tpl.4.item.3",
      "tpl.5.lead",
      "tpl.5.item.1",
      "tpl.5.item.2",
      "tpl.5.item.3",
      "tpl.6.lead",
      "tpl.6.item.1",
      "tpl.6.item.2",
      "tpl.6.item.3",
      "tpl.7.lead",
      "tpl.7.item.1",
      "tpl.7.item.2",
      "tpl.7.item.3",
      "tpl.8.lead",
      "tpl.8.item.1",
      "tpl.8.item.2",
      "tpl.8.item.3",
    ],
  },
  {
    title: "Конструктор",
    keys: [
      "create.title",
      "create.step",
      "create.of",
      "create.draft.saved",
      "create.draft.local",
      "create.photos.pick",
      "create.photos.limit",
      "create.photos.count",
      "create.photos.remove",
      "create.words.greeting",
      "create.words.sign",
      "create.surprise.kind",
      "create.surprise.text",
      "create.surprise.link",
      "create.surprise.code",
      "create.surprise.value",
      "create.done.lead",
      "create.pay.soon",
      "create.summary.occasion",
      "create.summary.game",
      "create.summary.photos",
      "create.summary.words",
      "create.summary.surprise",
      "create.summary.empty",
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
      "cta.home",
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
      "error.pageNotFound",
      "error.pageNotFoundBody",
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
    what: "Все тексты страниц /cards, /games, /how",
    now: "написаны целиком 03.08.2026 — макетов у этих страниц нет",
    when: "вычитать подряд: это первый текст, который никто не проверял",
  },
  {
    what: "Реквизиты и почта на /contacts",
    now: "юрлица нет, стоят заглушки, почта — hello@example.com",
    when: "заменить до первой продажи: ключи legal.entity, legal.tax, legal.address, legal.email",
  },
  {
    what: "Оферта, политика ПДн, соглашение и правила возврата",
    now: "страниц /terms и /refund две, текста в них нет — по SECURITY.md его пишет юрист",
    when: "без них нельзя принимать первый платёж",
  },
  {
    what: "Страница «Данные и приватность»",
    now: "описывает сервис по SECURITY.md, но половина — про сервер, которого ещё нет",
    when: "перечитать целиком, когда сохранение и оплата заработают",
  },
  {
    what: "Восемь описаний шаблонов на /cards/<slug>",
    now: "написаны 05.08.2026 — вводка и три пункта на каждый шаблон",
    when: "проверить, что ни один пункт не обещает того, чего в конструкторе нет",
  },
  {
    what: "Цены",
    now: "живут в трёх местах: docs/PRODUCT.md, lib/pricing.ts и строка faq.a.3",
    when: "меняется прайс — правятся все три, числа в faq.a.3 стоят внутри предложения",
  },
  {
    what: "Экран получателя",
    now: "собран 05.08.2026 из готовых строк, ни одной новой. Место игры — заглушка, показывается только превью из конструктора",
    when: "перечитать, когда появятся игровой модуль и адрес открытки",
  },
  {
    what: "Экран «Открытка готова», жалоба и состояния открытки",
    now: "строки done.*, cta.copyLink, error.cardNotFound и error.cardExpired написаны, но нигде не показываются",
    when: "показывать вместе с оплатой и сервером — раньше это обещание, которого сервис не выполнит",
  },
  {
    what: "Карточки поводов в FAQ, три из четырёх",
    now: "в макете нарисована одна — «Друг за границей». Остальные три написаны",
    when: "проверить формулировки: это ответы от лица сервиса",
  },
  {
    what: "Названия восьми карточек шаблонов",
    now: "написаны вместо восьми одинаковых «Для второй половинки» из макета",
    when: "проверить поводы и раскладку по фильтрам",
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
              <li key={gap.what} className="bg-gold-card rounded-card p-4">
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
