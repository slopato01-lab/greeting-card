import Link from "next/link";

import { Icon } from "@/components/Icon";
import { HowNav } from "@/components/how/HowNav";
import { Photo } from "@/components/how/Photo";
import { StepSlider } from "@/components/how/StepSlider";
import { Dots } from "@/components/site/Ornament";
import { PAGE_TITLE_ID } from "@/components/site/PageHead";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Первая панель — по первому блоку design/страница как это работает.jpg:
 * слева фото с разделами и подписью, справа заголовок, облако
 * пилюль-возможностей и карточка шагов со стрелками.
 *
 * Пилюли здесь — метки, а не кнопки: показывают, что умеет редактор.
 * Тёмные — то, чего нет у бумажной открытки (как выделенные в макете).
 */
const TAGS = [
  { key: "how.tag.1", dark: false },
  { key: "how.tag.2", dark: false },
  { key: "how.tag.3", dark: false },
  { key: "how.tag.4", dark: false },
  { key: "how.tag.5", dark: true },
  { key: "how.tag.6", dark: true },
  { key: "how.tag.7", dark: false },
  { key: "how.tag.8", dark: false },
  { key: "how.tag.9", dark: true },
  { key: "how.tag.10", dark: false },
] as const satisfies ReadonlyArray<{ key: TextKey; dark: boolean }>;

export function HowHero() {
  return (
    <section
      id="steps"
      aria-labelledby={PAGE_TITLE_ID}
      className="rounded-panel xl:rounded-panel-d bg-surface grid gap-[10px] p-[10px] xl:grid-cols-2 xl:gap-[16px] xl:p-[16px]"
    >
      <Photo src="/assets/benefits/balloons.webp" className="min-h-[340px] xl:min-h-[600px]">
        <HowNav current="steps" />
        <div className="absolute inset-x-[12px] bottom-[12px] flex items-end gap-[8px] xl:inset-x-[16px] xl:bottom-[16px]">
          <p className="bg-paper rounded-inner font-ui text-note xl:text-note-d text-ink max-w-[320px] px-[14px] py-[10px] leading-[1.4]">
            {t("how.hero.caption")}
          </p>
          <Link
            href="/editor"
            aria-label={t("cta.editor")}
            className="size-tap bg-ink text-canvas hover:bg-gold hover:text-ink flex shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <Icon name="next" size={18} className="-rotate-45" />
          </Link>
        </div>
      </Photo>

      <div className="bg-paper rounded-card xl:rounded-card-d flex flex-col gap-[24px] p-[18px] xl:gap-[32px] xl:p-[36px]">
        <h1
          id={PAGE_TITLE_ID}
          className="font-display text-h2 xl:text-h2-d font-medium tracking-tight"
        >
          {t("how.hero.title")} <Dots className="align-middle" />
        </h1>

        <ul
          role="list"
          aria-label={t("how.hero.tags")}
          className="flex flex-wrap gap-[6px] xl:gap-[8px]"
        >
          {TAGS.map((tag) => (
            <li
              key={tag.key}
              className={`font-ui caps text-pill xl:text-pill-d flex h-[33px] items-center rounded-full border px-[16px] font-medium whitespace-nowrap xl:h-[40px] xl:px-[20px] ${
                tag.dark ? "bg-ink border-ink text-canvas" : "border-line text-body"
              }`}
            >
              {t(tag.key)}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <StepSlider />
        </div>
      </div>
    </section>
  );
}
