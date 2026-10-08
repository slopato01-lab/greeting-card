"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { LoopVideo } from "@/components/site/LoopVideo";
import { ANIMATED_TEMPLATES } from "@/lib/catalog/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Четыре шага — внутренняя карточка первого экрана со стрелками,
 * как карточка «При оплате наличными…» в макете. Слева текст шага,
 * справа шаблон, который этот шаг показывает.
 *
 * Листается стрелками по кругу. Смена шага объявляется скринридеру
 * (aria-live), шаг — регион с ролью «слайд». Видео шаблона не играет
 * при prefers-reduced-motion — это решает LoopVideo.
 */
const SLIDES = [
  { title: "how.slide.1.title", body: "how.slide.1.body", template: "val-film" },
  { title: "how.slide.2.title", body: "how.slide.2.body", template: "polaroid" },
  { title: "how.slide.3.title", body: "how.slide.3.body", template: "bd-disco" },
  { title: "how.slide.4.title", body: "how.slide.4.body", template: "ny-xmas" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey; template: string }>;

const ARROW =
  "size-tap border-line text-ink hover:bg-raised hover:border-muted active:bg-line flex items-center justify-center rounded-full border transition-colors";

export function StepSlider() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index] ?? SLIDES[0];
  const template = ANIMATED_TEMPLATES.find((item) => item.id === slide.template);
  const go = (step: number) => setIndex((index + step + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("how.slides")}
      className="bg-surface rounded-card xl:rounded-card-d grid grid-cols-[minmax(0,1fr)_96px] gap-[14px] p-[14px] md:grid-cols-[minmax(0,1fr)_150px] xl:grid-cols-[minmax(0,1fr)_190px] xl:gap-[24px] xl:p-[20px]"
    >
      <div className="flex min-w-0 flex-col">
        <div aria-live="polite" className="flex flex-col gap-[8px]">
          <p className="font-ui caps text-badge xl:text-badge-d text-gold-deep font-medium">
            {t("how.slide.counter")} {index + 1} / {SLIDES.length}
          </p>
          <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
            {t(slide.title)}
          </h2>
          <p className="font-ui text-note xl:text-note-d text-body leading-[1.5]">
            {t(slide.body)}
          </p>
        </div>

        <div className="mt-auto flex gap-[6px] pt-[16px]">
          <button type="button" aria-label={t("cta.back")} onClick={() => go(-1)} className={ARROW}>
            <Icon name="prev" size={18} />
          </button>
          <button type="button" aria-label={t("cta.next")} onClick={() => go(1)} className={ARROW}>
            <Icon name="next" size={18} />
          </button>
        </div>
      </div>

      {template === undefined ? null : (
        <div
          aria-hidden="true"
          // Фон — цвет открытки, а не сайта (docs/DESIGN.md).
          style={{ backgroundColor: template.background }}
          className="rounded-inner xl:rounded-inner-d relative aspect-[3/4] self-start overflow-hidden"
        >
          <LoopVideo
            key={template.id}
            src={template.video}
            poster={template.poster}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      )}
    </section>
  );
}
