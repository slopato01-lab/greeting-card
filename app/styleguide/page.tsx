import type { CSSProperties, ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { icons, type IconName } from "@/lib/icons/generated";

// Служебная страница. Тексты здесь — названия токенов и подписи
// состояний, в словарь docs/PRODUCT.md они не идут: пользователь
// эту страницу не видит, из навигации она не линкуется.

const SAMPLE = "Съешь ещё этих мягких булок";

const COLORS: ReadonlyArray<{ name: string; value: string; role: string }> = [
  { name: "pink", value: "#c9356f", role: "акцент: кнопки, активные фильтры, подложка H1" },
  { name: "pink-tint", value: "#ff3d89", role: "только с opacity 0.1 — заливка секций" },
  { name: "pink-card", value: "#ffecf3", role: "фон карточек внутри розовых секций" },
  { name: "dark", value: "#2d2b32", role: "тёмные блоки: CTA и подвал" },
  { name: "dark-badge", value: "#23202b", role: "номерные квадраты этапов" },
  { name: "ink", value: "#000000", role: "текст и все обводки" },
  { name: "nav", value: "#3a3a3a", role: "навигация в шапке (десктоп)" },
  { name: "btn-ghost", value: "#363636", role: "текст вторичной кнопки (мобильный)" },
  { name: "muted", value: "#7a7a7a", role: "второстепенный текст, обводки неактивных пилюль" },
  { name: "muted-2", value: "#6c6c6c", role: "неактивные пилюли фильтров (десктоп)" },
  { name: "body", value: "#5c5c5c", role: "тело текста в карточках" },
  { name: "caption", value: "#5a5a5a", role: "подписи, чек-строки" },
  { name: "photo", value: "#909090", role: "плейсхолдер изображения" },
  { name: "white", value: "#ffffff", role: "фон" },
];

const TYPE_SCALE: ReadonlyArray<{
  role: string;
  mobile: string;
  desktop: string;
  className: string;
  font: "display" | "ui";
}> = [
  {
    role: "H1 герой",
    mobile: "52 / 1.1",
    desktop: "90 / 1.15",
    className: "text-h1 xl:text-h1-d",
    font: "display",
  },
  {
    role: "H2 секция",
    mobile: "30 / 1.15",
    desktop: "48 / 1.15",
    className: "text-h2 xl:text-h2-d",
    font: "display",
  },
  {
    role: "H3 карточка",
    mobile: "24 / 1.15",
    desktop: "32 / 1.15",
    className: "text-h3 xl:text-h3-d",
    font: "display",
  },
  {
    role: "«Что внутри»",
    mobile: "29",
    desktop: "32",
    className: "text-inside xl:text-inside-d",
    font: "display",
  },
  {
    role: "Вводный абзац героя",
    mobile: "15",
    desktop: "32",
    className: "text-lead xl:text-lead-d",
    font: "ui",
  },
  {
    role: "Основной текст",
    mobile: "20",
    desktop: "24",
    className: "text-sub xl:text-sub-d",
    font: "display",
  },
  {
    role: "Текст карточки",
    mobile: "16",
    desktop: "20",
    className: "text-card xl:text-card-d",
    font: "display",
  },
  {
    role: "Подпись, чек-строка",
    mobile: "14–15",
    desktop: "16",
    className: "text-note xl:text-note-d",
    font: "display",
  },
  {
    role: "Кнопка",
    mobile: "16",
    desktop: "29 / 24 в шапке",
    className: "text-btn xl:text-btn-d",
    font: "ui",
  },
  {
    role: "Номер этапа",
    mobile: "36",
    desktop: "43",
    className: "text-step xl:text-step-d",
    font: "display",
  },
];

const RADII: ReadonlyArray<{ token: string; px: string; role: string }> = [
  { token: "radius-h1", px: "5", role: "подложка H1, мобильный" },
  { token: "radius-h1-d", px: "9", role: "подложка H1, десктоп" },
  { token: "radius-btn", px: "10", role: "кнопка, мобильный" },
  { token: "radius-btn-header-d", px: "12", role: "кнопка шапки, десктоп" },
  { token: "radius-faq", px: "12", role: "белая карточка FAQ" },
  { token: "radius-faq-btn-d", px: "14", role: "кнопки в карточке FAQ" },
  { token: "radius-badge", px: "16", role: "наклонная плашка, мобильный" },
  { token: "radius-btn-d", px: "18", role: "главная кнопка, десктоп" },
  { token: "radius-card", px: "20", role: "карточка шаблона, мобильный" },
  { token: "radius-benefit-d", px: "20", role: "карточка преимущества, десктоп" },
  { token: "radius-cta-d", px: "22", role: "тёмный блок CTA, десктоп" },
  { token: "radius-step", px: "25", role: "карточка этапа, мобильный" },
  { token: "radius-strip-d", px: "28", role: "плашка карточки шаблона" },
  { token: "radius-card-d", px: "30", role: "карточки, десктоп" },
  { token: "radius-badge-d", px: "36", role: "наклонная плашка, десктоп" },
  { token: "radius-pill", px: "31", role: "пилюля фильтра, мобильный" },
  { token: "radius-pill-d", px: "47", role: "пилюля фильтра, десктоп" },
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
    <section id={id} className="border-ink/10 scroll-mt-6 border-t pt-8">
      <h2 className="font-display text-h3 xl:text-h3-d font-medium">{title}</h2>
      {note ? <p className="font-ui text-body mt-2 max-w-[70ch] text-[15px]">{note}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="font-ui text-muted text-[13px]">{children}</span>;
}

/** Кнопка в конкретном состоянии. Состояний в макете нет —
 *  все, кроме обычного, спроектированы от токенов и требуют утверждения. */
function Button({
  state,
  live = false,
}: {
  state: "normal" | "hover" | "active" | "focus" | "disabled" | "loading";
  live?: boolean;
}) {
  const base =
    "inline-flex min-h-tap items-center justify-center gap-2 rounded-btn px-6 font-ui text-btn font-medium text-white xl:rounded-btn-d xl:px-8 xl:text-btn-d";

  const byState: Record<typeof state, string> = {
    normal: "bg-pink",
    hover: "bg-[color-mix(in_oklab,var(--color-pink)_90%,var(--color-ink))]",
    active: "bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))]",
    focus: "bg-pink outline-2 outline-offset-2 outline-ink",
    disabled: "bg-muted",
    loading: "bg-pink",
  };

  const interactive = live
    ? "bg-pink hover:bg-[color-mix(in_oklab,var(--color-pink)_90%,var(--color-ink))] active:bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))] transition-colors"
    : byState[state];

  return (
    <button
      type="button"
      className={`${base} ${interactive}`}
      disabled={state === "disabled"}
      aria-busy={state === "loading"}
      aria-label={state === "loading" ? "Загрузка" : undefined}
    >
      {state === "loading" ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : null}
      Создать открытку
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
    active: "bg-pink text-white border-pink",
    normal: "bg-white text-muted-2 border-muted",
    hover: "bg-pink-card text-ink border-ink",
    pressed: "bg-pink-card text-ink border-ink",
    focus: "bg-white text-muted-2 border-muted outline-2 outline-offset-2 outline-ink",
    disabled: "bg-white text-muted/50 border-muted/40",
  };

  return (
    <button
      type="button"
      disabled={state === "disabled"}
      // tap-zone: невидимая область нажатия, подсвечивается переключателем ниже
      className={`tap-zone rounded-pill font-ui xl:rounded-pill-d relative inline-flex h-[31px] items-center border px-4 text-[14px] xl:h-[47px] xl:px-6 xl:text-[16px] ${byState[state]} before:h-tap before:absolute before:inset-x-0 before:top-1/2 before:-translate-y-1/2 before:content-['']`}
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
          note="Акцент один — розовый #c9356f. Он маркирует действие и подложку заголовка, больше нигде. Контраст #7a7a7a на белом — 4.6:1, ниже этого серого опускаться нельзя."
        >
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {COLORS.map((c) => (
              <li key={c.name} className="flex items-start gap-3">
                <span
                  className="rounded-btn border-ink/15 mt-0.5 size-12 shrink-0 border"
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
          note="Берутся из макета как есть и не унифицируются. Обводки только 1px и 2px: дробные значения в макете — артефакт масштабирования фрейма."
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {RADII.map((r) => (
              <li key={r.token} className="flex flex-col gap-2">
                <span
                  className="border-ink bg-pink-card h-16 w-full border"
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

        <Section id="shadow" title="Тени" note="Обе почти незаметные — так и задумано.">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-benefit-d shadow-card bg-white p-6">
              <span className="font-ui text-[15px]">--shadow-card</span>
              <p className="font-ui text-muted text-[13px]">карточка преимущества</p>
            </div>
            <div className="rounded-faq shadow-faq bg-white p-6">
              <span className="font-ui text-[15px]">--shadow-faq</span>
              <p className="font-ui text-muted text-[13px]">белая карточка FAQ</p>
            </div>
          </div>
        </Section>

        <Section
          id="button"
          title="Кнопка"
          note="Состояний в макете нет. Наведение и нажатие — розовый, смешанный с --color-ink на 10% и 20%. Фокус — обводка 2px цветом --ink со смещением 2px. Выключенная — --color-muted. Это предложение, его надо утвердить."
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
          <div className="[&:has(:checked)_.tap-zone]:before:outline-pink [&:has(:checked)_.tap-zone]:before:outline [&:has(:checked)_.tap-zone]:before:outline-1 [&:has(:checked)_.tap-zone]:before:outline-dashed">
            <label className="min-h-tap mb-6 inline-flex items-center gap-3">
              <input type="checkbox" className="accent-pink size-5" />
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
          note="Одиннадцать иконок из docs/FIGMA.md, скачаны в public/assets/icons и вставляются прямо в разметку. Монохромные красятся токеном — показаны чёрной и розовой. Цветные иллюстрации перекрасить нельзя. Бургер, декор FAQ и планета заменены на аналоги из Tabler: в макете стояли наборы под CC BY, а она требует указания авторства на видном месте."
        >
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
            {(Object.keys(icons) as IconName[]).map((name) => (
              <li key={name} className="flex flex-col gap-2">
                <span className="flex items-center gap-3">
                  <Icon name={name} size={32} />
                  {icons[name].mono ? <Icon name={name} size={32} className="text-pink" /> : null}
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
