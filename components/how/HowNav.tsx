import { type TextKey, t } from "@/lib/i18n";

/**
 * Пилюли разделов поверх фото — как ряд «О компании / Ассортимент…»
 * на каждом фото design/страница как это работает.jpg. Это якоря на
 * секции страницы; текущая секция — тёмная пилюля с aria-current.
 *
 * Пилюли стоят на сплошной подложке (белая или тёмная), а не на голом
 * фото: docs/DESIGN.md, «Работа с изображениями». Не помещается в ширину
 * фото — переносится на вторую строку, а не прячется за край.
 */
export const HOW_SECTIONS = [
  { id: "steps", label: "how.nav.steps" },
  { id: "editor", label: "how.nav.editor" },
  { id: "templates", label: "how.nav.templates" },
  { id: "plans", label: "how.nav.plans" },
] as const satisfies ReadonlyArray<{ id: string; label: TextKey }>;

export type HowSection = (typeof HOW_SECTIONS)[number]["id"];

export function HowNav({ current }: { current: HowSection }) {
  return (
    <nav aria-label={t("how.nav")} className="absolute inset-x-0 top-0 z-10">
      <ul
        role="list"
        className="flex flex-wrap gap-x-[6px] px-[12px] pt-[6px] xl:px-[16px] xl:pt-[10px]"
      >
        {HOW_SECTIONS.map((section) => {
          const active = section.id === current;
          return (
            <li key={section.id} className="shrink-0">
              {/* Зона нажатия 44px, видимая пилюля 33 — как у фильтров. */}
              <a
                href={`#${section.id}`}
                aria-current={active ? "location" : undefined}
                className="pill-tap"
              >
                <span
                  className={`font-ui caps text-pill flex h-[33px] items-center rounded-full px-[16px] font-medium whitespace-nowrap transition-colors ${
                    active ? "bg-ink text-canvas" : "bg-paper text-ink hover:bg-raised"
                  }`}
                >
                  {t(section.label)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
