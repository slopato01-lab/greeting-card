import type { CSSProperties, ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { icons, type IconName } from "@/lib/icons/generated";

// Служебная страница. Тексты здесь — названия токенов и подписи
// состояний, в словарь docs/PRODUCT.md они не идут: пользователь
// эту страницу не видит, из навигации она не линкуется.

const SAMPLE = "Съешь ещё этих мягких булок";

const COLORS: ReadonlyArray<{ name: string; value: string; role: string }> = [
  { name: "canvas", value: "#ffffff", role: "основа страницы" },
  { name: "surface", value: "#f5f5f5", role: "карточки и панели" },
  { name: "raised", value: "#ebebeb", role: "ступень выше: наведение, вложенные плашки" },
  { name: "line", value: "#dedede", role: "тонкие обводки и линии, декор" },
  { name: "photo", value: "#e4e4e4", role: "плейсхолдер изображения" },
  { name: "ink", value: "#141414", role: "основной текст, тёмные пилюли" },
  { name: "body", value: "#3a3a3a", role: "текст абзацев" },
  { name: "muted", value: "#666666", role: "второстепенный текст, обводки полей" },
  { name: "gold", value: "#ecd18a", role: "акцент-заливка: главная кнопка, золотая карточка" },
  { name: "gold-deep", value: "#7d6219", role: "золото текстом и значками на светлом" },
  { name: "paper", value: "#ffffff", role: "белые плашки на сером" },
];

const TYPE_SCALE: ReadonlyArray<{
  role: string;
  mobile: string;
  desktop: string;
  className: string;
  font: "display" | "ui";
}> = [
  {
    role: "Огромный заголовок секции",
    mobile: "40 / 1.05",
    desktop: "64–112 / 1.05, от ширины окна",
    className: "text-display xl:text-display-d",
    font: "display",
  },
  {
    role: "H1 герой",
    mobile: "36 / 1.1",
    desktop: "48–80 / 1.1, от ширины окна",
    className: "text-h1 xl:text-h1-d",
    font: "display",
  },
  {
    role: "H2 секция",
    mobile: "26 / 1.15",
    desktop: "48 / 1.15",
    className: "text-h2 xl:text-h2-d",
    font: "display",
  },
  {
    role: "H3 карточка",
    mobile: "20 / 1.2",
    desktop: "28 / 1.2",
    className: "text-h3 xl:text-h3-d",
    font: "display",
  },
  {
    role: "«Что внутри»",
    mobile: "22",
    desktop: "32",
    className: "text-inside xl:text-inside-d",
    font: "display",
  },
  {
    role: "Вводный абзац героя",
    mobile: "15",
    desktop: "18",
    className: "text-lead xl:text-lead-d",
    font: "ui",
  },
  {
    role: "Основной текст",
    mobile: "16",
    desktop: "18",
    className: "text-sub xl:text-sub-d",
    font: "ui",
  },
  {
    role: "Текст карточки",
    mobile: "15",
    desktop: "17",
    className: "text-card xl:text-card-d",
    font: "ui",
  },
  {
    role: "Подпись, чек-строка",
    mobile: "14",
    desktop: "15",
    className: "text-note xl:text-note-d",
    font: "ui",
  },
  {
    role: "Капс-подпись",
    mobile: "12",
    desktop: "13",
    className: "caps text-badge xl:text-badge-d",
    font: "ui",
  },
  {
    role: "Кнопка, капсом",
    mobile: "14",
    desktop: "15 / 13 в шапке",
    className: "caps text-btn xl:text-btn-d",
    font: "ui",
  },
];

const RADII: ReadonlyArray<{ token: string; px: string; role: string }> = [
  { token: "radius-inner", px: "12", role: "поле ввода, плашка, мини-превью" },
  { token: "radius-inner-d", px: "16", role: "то же, десктоп" },
  { token: "radius-card", px: "20", role: "карточка" },
  { token: "radius-card-d", px: "24", role: "карточка, десктоп" },
  { token: "radius-panel", px: "24", role: "панель секции, герой, CTA" },
  { token: "radius-panel-d", px: "32", role: "то же, десктоп" },
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-line scroll-mt-6 border-t pt-8">
      <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">{title}</h2>
      {note ? <p className="font-ui text-body mt-2 max-w-[70ch] text-[15px]">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="font-ui text-muted text-[13px]">{children}</span>;
}

/** Кнопка в конкретном состоянии: золотая пилюля, подпись капсом
 *  и стрелка «↗». Состояния спроектированы от токенов. */
function Button({
  state,
  live = false,
}: {
  state: "normal" | "hover" | "active" | "focus" | "disabled" | "loading";
  live?: boolean;
}) {
  const base =
    "caps text-canvas inline-flex min-h-tap h-[52px] items-center justify-center gap-2 rounded-full px-6 font-ui text-btn font-medium";

  const hover = "bg-[color-mix(in_oklab,var(--color-gold)_88%,var(--color-canvas))]";
  const active = "bg-[color-mix(in_oklab,var(--color-gold)_76%,var(--color-canvas))]";

  const byState: Record<typeof state, string> = {
    normal: "bg-gold",
    hover,
    active,
    focus: "bg-gold outline-2 outline-offset-2 outline-ink",
    disabled: "bg-raised text-muted",
    loading: "bg-gold",
  };

  const interactive = live
    ? `bg-gold hover:${hover} active:${active} transition-colors`
    : byState[state];

  return (
    <button
      type="button"
      className={`${base} ${interactive}`}
      disabled={state === "disabled"}
      aria-busy={state === "loading"}
      aria-label={state === "loading" ? "Загрузка" : undefined}
    >
      Создать открытку
      {state === "loading" ? (
        <span
          aria-hidden="true"
          className="border-canvas/30 border-t-canvas size-4 animate-spin rounded-full border-2"
        />
      ) : (
        <Icon name="next" size={18} className="-rotate-45" />
      )}
    </button>
  );
}

/** Пилюля фильтра. В макете 31–33px по высоте — область нажатия
 *  добирается невидимой зоной сверху и снизу до 44px. */
function Pill({
  state,
  children,
}: {
  state: "active" | "normal" | "hover" | "pressed" | "focus" | "disabled";
  children: ReactNode;
}) {
  const byState: Record<typeof state, string> = {
    active: "bg-ink border-ink text-canvas",
    normal: "border-line text-body",
    hover: "border-muted text-ink",
    pressed: "border-line bg-raised text-ink",
    focus: "border-line text-body outline-2 outline-offset-2 outline-ink",
    disabled: "border-line text-line",
  };

  return (
    <button
      type="button"
      disabled={state === "disabled"}
      // tap-zone: невидимая область нажатия, подсвечивается переключателем ниже
      className={`tap-zone font-ui relative inline-flex h-[33px] items-center rounded-full px-5 text-[14px] xl:h-[44px] xl:px-[26px] xl:text-[16px] ${byState[state]} before:h-tap before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:content-['']`}
    >
      {children}
    </button>
  );
}

export default function StyleguidePage() {
  return (
    <main className="px-gutter xl:px-gutter-d mx-auto max-w-[var(--container-content)] py-10">
      <header>
        <p className="font-ui tracking-base text-muted text-[13px]">Служебная страница</p>
        <h1 className="font-display text-h2 xl:text-h1-d mt-2 font-medium">Дизайн-система</h1>
        <p className="font-ui text-body mt-4 max-w-[70ch] text-[15px]">
          Все значения взяты из docs/DESIGN.md. Мобильные кегли базовые, десктопные включаются с
          1280px — меняйте ширину окна, чтобы увидеть переключение.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-12">
        <Section
          id="fonts"
          title="Шрифты и шкала"
          note="Montserrat Alternates — заголовки, карточки, навигация подвала. Inter — кнопки, навигация шапки, вводный абзац героя. Трекинг 1% кегля задан на body одной строкой."
        >
          <div className="flex flex-col gap-6">
            {TYPE_SCALE.map((row) => (
              <div key={row.role} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <Label>{row.role}</Label>
                  <Label>
                    моб. {row.mobile} · дес. {row.desktop}
                  </Label>
                </div>
                <p className={`${row.className} ${row.font === "ui" ? "font-ui" : "font-display"}`}>
                  {SAMPLE}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="color"
          title="Цвет"
          note="Светлая тема с 08.10.2026: цвета прежние, тёмная основа стала текстом. Золото #ecd18a — заливка, золото текстом — --gold-deep. Контраст: --muted на --raised 4.8:1, --body на --surface 10.4:1, тёмный текст на золоте 12.3:1."
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {COLORS.map((c) => (
              <li key={c.name} className="flex items-start gap-3">
                <span
                  className="border-line mt-0.5 size-12 shrink-0 rounded-full border"
                  style={{ background: c.value } satisfies CSSProperties}
                />
                <span className="flex flex-col">
                  <span className="font-ui text-[15px]">--color-{c.name}</span>
                  <span className="font-ui text-muted text-[13px]">{c.value}</span>
                  <span className="font-ui text-body text-[13px]">{c.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="radius"
          title="Радиусы"
          note="Три ступени. Кнопки и пилюли — полные пилюли, rounded-full. Обводки только 1px и 2px."
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {RADII.map((r) => (
              <li key={r.token} className="flex flex-col gap-2">
                <span
                  className="bg-surface border-line h-16 w-full border"
                  style={{ borderRadius: `${r.px}px` } satisfies CSSProperties}
                />
                <span className="font-ui text-[13px]">--{r.token}</span>
                <span className="font-ui text-muted text-[12px]">
                  {r.px}px · {r.role}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="shadow"
          title="Тени"
          note="Теней нет: ничего полупрозрачного. Наведение — сменой заливки и обводки, белое на белом отделяет обводка --line."
        >
          <span />
        </Section>

        <Section
          id="button"
          title="Кнопка"
          note="Золотая пилюля, подпись капсом, стрелка «↗». Наведение и нажатие — золото с --ink 88% и 76%. Фокус — обводка 2px --ink со смещением 2px. Выключенная — заливка --raised, текст --muted. Второй тон — тёмная пилюля --ink с белым 88% и 76%."
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>живая, можно потрогать</Label>
              <div>
                <Button state="normal" live />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              {(["normal", "hover", "active", "focus", "disabled", "loading"] as const).map((s) => (
                <div key={s} className="flex flex-col gap-2">
                  <Label>
                    {
                      {
                        normal: "обычное",
                        hover: "наведение",
                        active: "нажатие",
                        focus: "фокус",
                        disabled: "выключено",
                        loading: "загрузка",
                      }[s]
                    }
                  </Label>
                  <Button state={s} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="pill"
          title="Пилюля фильтра"
          note="В макете высота 31px на мобильном и 47px на десктопе — по области нажатия это не проходит. Добавлена невидимая зона до 44px сверху и снизу. Включите переключатель, чтобы увидеть её границы."
        >
          <div className="[&:has(:checked)_.tap-zone]:before:outline-gold-deep [&:has(:checked)_.tap-zone]:before:outline [&:has(:checked)_.tap-zone]:before:outline-1 [&:has(:checked)_.tap-zone]:before:outline-dashed">
            <label className="min-h-tap mb-6 inline-flex items-center gap-3">
              <input type="checkbox" className="accent-gold-deep size-5" />
              <span className="font-ui text-[15px]">Показать зону нажатия</span>
            </label>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-6">
              {(
                [
                  ["active", "активная"],
                  ["normal", "обычная"],
                  ["hover", "наведение"],
                  ["pressed", "нажатие"],
                  ["focus", "фокус"],
                  ["disabled", "выключено"],
                ] as const
              ).map(([state, caption]) => (
                <div key={state} className="flex flex-col gap-2">
                  <Label>{caption}</Label>
                  <Pill state={state}>Признаться в любви</Pill>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="icons"
          title="Иконки"
          note="Одиннадцать иконок из docs/FIGMA.md, скачаны в public/assets/icons и вставляются прямо в разметку. Монохромные красятся токеном — показаны тёмной и золотой. Цветные иллюстрации перекрасить нельзя. Бургер, декор FAQ и планета заменены на аналоги из Tabler: в макете стояли наборы под CC BY, а она требует указания авторства на видном месте."
        >
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
            {(Object.keys(icons) as IconName[]).map((name) => (
              <li key={name} className="flex flex-col gap-2">
                <span className="flex items-center gap-3">
                  <Icon name={name} size={32} />
                  {icons[name].mono ? (
                    <Icon name={name} size={32} className="text-gold-deep" />
                  ) : null}
                </span>
                <span className="font-ui text-[13px]">{name}</span>
                <span className="font-ui text-muted text-[12px]">{icons[name].source}</span>
                <span className="font-ui text-body text-[12px]">{icons[name].where}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="grid"
          title="Сетка"
          note="Нарисованы ровно два состояния: 390 и 1920. Промежуток 768–1279 получает мобильную раскладку с увеличенными полями."
        >
          <dl className="font-ui grid grid-cols-2 gap-4 text-[15px] sm:grid-cols-4">
            {[
              ["Ширина макета", "390 / 1920"],
              ["Боковое поле", "20 / 150"],
              ["Ширина контента", "350 / 1620"],
              ["Колонок в сетке", "1 / 4"],
              ["Шаг между карточками", "15–25 / 20"],
              ["Десктоп включается", "с 1280px"],
              ["Минимальная зона нажатия", "44 × 44"],
              ["Трекинг", "0.01em"],
            ].map(([term, value]) => (
              <div key={term} className="flex flex-col">
                <dt className="text-muted text-[13px]">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </main>
  );
}
