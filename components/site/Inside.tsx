"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { counterNumber } from "@/components/site/counter";
import { type IconName } from "@/lib/icons/generated";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Что спрятать внутри»: четыре сюрприза, которые прячут
 * в открытку.
 *
 * Раскладка — тёмная карточка из макета главной
 * (design/главная greetinh-cards.jpg), первая в ряду под героем:
 * слева иконка в большом круге, рядом — мелкая подпись и крупный
 * заголовок, в углу кнопка-стрелка в пунктирном круге. Пунктов
 * четыре, а карточка одна, поэтому стрелка листает их по кругу.
 *
 * Пункт меняется в живом регионе: скринридер прочитает новый
 * заголовок и абзац после нажатия.
 *
 * Иконки цветные и декоративные: смысл несёт заголовок.
 *
 * Тексты карточек — черновые: в макете во всех четырёх стоял один
 * и тот же абзац про сертификат. Перенесены как есть, см. PRODUCT.md.
 */
const CARDS = [
  { icon: "certificate", title: "inside.card.1", body: "inside.body.1" },
  { icon: "confession", title: "inside.card.2", body: "inside.body.2" },
  { icon: "transfer", title: "inside.card.3", body: "inside.body.3" },
  { icon: "ticket", title: "inside.card.4", body: "inside.body.4" },
] as const satisfies ReadonlyArray<{ icon: IconName; title: TextKey; body: TextKey }>;

export function Inside() {
  const [active, setActive] = useState(0);
  const card = CARDS[active] ?? CARDS[0];

  return (
    <section
      aria-labelledby="inside-title"
      className="rounded-panel xl:rounded-panel-d bg-surface relative flex flex-col gap-[24px] p-[24px] xl:flex-row xl:items-center xl:gap-[40px] xl:p-[40px]"
    >
      {/* Два круга внахлёст, как в макете: текущий пункт и край
          следующего. Чисто декор. Иконка одна на оба брейкпоинта:
          две копии цветной иконки дублируют id градиентов. */}
      <div aria-hidden="true" className="flex shrink-0 items-center">
        <span className="bg-canvas relative z-10 flex size-[120px] items-center justify-center rounded-full xl:size-[170px]">
          <Icon name={card.icon} className="size-[64px] xl:size-[88px]" />
        </span>
        <span className="bg-raised -ms-[48px] size-[96px] rounded-full xl:-ms-[64px] xl:size-[130px]" />
      </div>

      <div className="min-w-0 flex-1 xl:pe-[80px]">
        <h2 id="inside-title" className="font-ui caps text-badge xl:text-badge-d text-muted">
          {t("inside.title")}
          <span aria-hidden="true" className="text-ink ms-[10px]">
            {counterNumber(active)}/{counterNumber(CARDS.length - 1)}
          </span>
        </h2>

        <div aria-live="polite">
          <h3 className="font-display text-inside xl:text-inside-d mt-[14px] font-medium tracking-tight">
            {t(card.title)}
          </h3>
          <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.5] xl:max-w-[520px]">
            {t(card.body)}
          </p>
        </div>
      </div>

      {/* Пунктирный круг — кнопка «дальше», ходит по кругу. */}
      <button
        type="button"
        aria-label={t("cta.next")}
        onClick={() => setActive((active + 1) % CARDS.length)}
        className="size-tap text-ink border-muted hover:bg-raised hover:border-ink active:bg-line absolute end-[20px] top-[20px] flex items-center justify-center rounded-full border border-dashed transition-colors xl:end-[32px] xl:top-[32px] xl:size-[64px]"
      >
        <Icon name="next" size={20} className="-rotate-45" />
      </button>
    </section>
  );
}
