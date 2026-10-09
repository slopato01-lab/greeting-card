"use client";

import { useState, type CSSProperties } from "react";

import { Icon } from "@/components/Icon";
import { counterNumber } from "@/components/site/counter";
import { type IconName } from "@/lib/icons/generated";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Секция «Что спрятать внутри»: четыре сюрприза, которые прячут
 * в открытку.
 *
 * Раскладка — карточка из макета главной (design/главная greetinh-cards.jpg):
 * слева иконка в большом круге, рядом — мелкая подпись и крупный
 * заголовок, в углу кнопка-стрелка в пунктирном круге.
 *
 * С 09.10.2026 (просьба пользователя, вариант «Б» — на проверку)
 * пункты меняются сами: у каждого своя пастельная заливка и три
 * стикера вокруг круга. Время показа отсчитывает CSS-анимация
 * полоски прогресса, её конец переключает пункт — таймеров нет,
 * снимать нечего. Наведение, фокус внутри и кнопка «Пауза»
 * останавливают полоску, а с ней и смену. При reduced motion полоски
 * нет вовсе (см. globals.css), и пункты листаются только стрелкой.
 *
 * Живой регион включается после первого нажатия: сам по себе пункт
 * меняется каждые несколько секунд, и скринридер иначе не умолкал бы.
 *
 * Тексты карточек — черновые: в макете во всех четырёх стоял один
 * и тот же абзац про сертификат. Перенесены как есть, см. PRODUCT.md.
 */
const CARDS = [
  {
    icon: "certificate",
    title: "inside.card.1",
    body: "inside.body.1",
    fill: "bg-pink",
    stickers: ["gift", "ribbon", "sparkle-gold"],
  },
  {
    icon: "confession",
    title: "inside.card.2",
    body: "inside.body.2",
    fill: "bg-mint",
    stickers: ["love-letter", "rose", "heart-red"],
  },
  {
    icon: "transfer",
    title: "inside.card.3",
    body: "inside.body.3",
    fill: "bg-sky",
    stickers: ["party-popper", "star-gold", "confetti"],
  },
  {
    icon: "ticket",
    title: "inside.card.4",
    body: "inside.body.4",
    fill: "bg-lilac",
    stickers: ["clapperboard", "popcorn", "cinema-seats"],
  },
] as const satisfies ReadonlyArray<{
  icon: IconName;
  title: TextKey;
  body: TextKey;
  fill: string;
  stickers: readonly [string, string, string];
}>;

/** Места стикеров вокруг круга: сверху справа, снизу слева, снизу справа. */
const STICKER_SPOTS = [
  "-top-[10px] start-[84px] size-[48px] xl:start-[124px] xl:size-[64px]",
  "-bottom-[6px] -start-[10px] size-[44px] xl:size-[60px]",
  "bottom-[2px] start-[140px] size-[40px] xl:start-[200px] xl:size-[56px]",
] as const;

export function Inside() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const card = CARDS[active] ?? CARDS[0];
  const next = () => setActive((index) => (index + 1) % CARDS.length);

  return (
    <section
      aria-labelledby="inside-title"
      data-paused={paused ? "" : undefined}
      className={`inside rounded-panel xl:rounded-panel-d relative flex flex-col gap-[24px] overflow-hidden p-[24px] pb-[32px] transition-colors duration-700 xl:flex-row xl:items-center xl:gap-[40px] xl:p-[40px] xl:pb-[48px] ${card.fill}`}
    >
      {/* Круг с иконкой, край следующего круга и стикеры. Чисто декор.
          key — чтобы при смене пункта всё влетело заново. Иконка одна
          на оба брейкпоинта: две копии цветной иконки дублируют id
          градиентов. */}
      <div
        key={active}
        aria-hidden="true"
        className="relative flex shrink-0 items-center self-start xl:self-center"
      >
        <span className="inside-pop bg-canvas relative z-10 flex size-[120px] items-center justify-center rounded-full xl:size-[170px]">
          <Icon name={card.icon} className="size-[64px] xl:size-[88px]" />
        </span>
        <span className="bg-canvas border-ink -ms-[48px] size-[96px] rounded-full border border-dashed xl:-ms-[64px] xl:size-[130px]" />
        {card.stickers.map((sticker, index) => (
          <span
            key={sticker}
            style={{ "--i": index } as CSSProperties}
            className={`inside-sticker absolute z-20 ${STICKER_SPOTS[index] ?? ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/stickers/${sticker}.svg`}
              alt=""
              className="inside-float size-full object-contain"
            />
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1 xl:pe-[80px]">
        <h2 id="inside-title" className="font-ui caps text-badge xl:text-badge-d text-body">
          {t("inside.title")}
          <span aria-hidden="true" className="text-ink ms-[10px]">
            {counterNumber(active)}/{counterNumber(CARDS.length - 1)}
          </span>
        </h2>

        <div aria-live={announce ? "polite" : "off"}>
          <div key={active} className="inside-enter">
            <h3 className="font-display text-inside xl:text-inside-d mt-[14px] font-medium tracking-tight">
              {t(card.title)}
            </h3>
            <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.5] xl:max-w-[520px]">
              {t(card.body)}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute end-[20px] top-[20px] flex gap-[8px] xl:end-[32px] xl:top-[32px]">
        {/* Пауза автосмены. При reduced motion смены нет — кнопка
            не нужна и скрыта стилями. */}
        <button
          type="button"
          aria-label={t("inside.pause")}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
          className="inside-pause size-tap text-ink border-ink hover:bg-canvas active:bg-line aria-pressed:bg-ink aria-pressed:text-canvas flex items-center justify-center rounded-full border transition-colors xl:size-[64px]"
        >
          <Icon name={paused ? "play" : "pause"} size={18} />
        </button>

        {/* Пунктирный круг — кнопка «дальше», ходит по кругу. */}
        <button
          type="button"
          aria-label={t("cta.next")}
          onClick={() => {
            setAnnounce(true);
            next();
          }}
          className="size-tap text-ink border-ink hover:bg-canvas active:bg-line flex items-center justify-center rounded-full border border-dashed transition-colors xl:size-[64px]"
        >
          <Icon name="next" size={20} className="-rotate-45" />
        </button>
      </div>

      {/* Полоска прогресса: её анимация и есть таймер смены пункта. */}
      <span
        aria-hidden="true"
        className="inside-track bg-canvas absolute inset-x-[24px] bottom-[16px] h-[2px] overflow-hidden rounded-full xl:inset-x-[40px] xl:bottom-[24px]"
      >
        <span key={active} onAnimationEnd={next} className="inside-progress bg-ink block h-full" />
      </span>
    </section>
  );
}
