import type { CSSProperties, ReactNode } from "react";

import { Icon } from "@/components/Icon";
import { seededRandom } from "@/lib/games/seed";
import type { IconName } from "@/lib/icons/generated";
import { t } from "@/lib/i18n";

/**
 * Обложка открытки «С днём рождения!» — слоёная композиция, которая
 * собирается анимацией при открытии.
 *
 * Структура подсмотрена у шаблонов SUPA (supa.ru/create/events/birthday):
 * фон, крупный заголовок на плашке, фото в наклонённых рамках-полароидах,
 * наклейки по краям. Движение тоже оттуда — класс .assemble-layer
 * в globals.css. Код, картинки и раскладка наши.
 *
 * Слои стоят абсолютно в процентах от холста 3 : 4, поэтому композиция
 * одинаково выглядит на 360 и на 1920 — меняется только масштаб.
 * Холст обрезает увеличенные слои на старте анимации.
 *
 * Фото — до трёх снимков автора. Если автор не добавил ни одного,
 * в рамках фото праздника из шаблона: пустая рамка выглядела бы поломкой.
 * Наклон рамок выводится из зерна открытки (seeded), а не Math.random:
 * открытка раскладывается одинаково при каждом открытии.
 *
 * Обращение автора сюда не попадает: его длину не знает никто, а холст
 * фиксированный. Оно лежит на плашке под композицией (CardView).
 *
 * Весь холст — декор для скринридера, кроме заголовка: фото автора
 * без подписи и наклейки смысла не добавляют.
 */

/** Фото праздника для пустых рамок. Источники — CREDITS.md рядом с файлами. */
const FALLBACK_PHOTOS = [
  "/assets/templates/birthday/cake.jpg",
  "/assets/templates/birthday/balloons.jpg",
] as const;

const BACKGROUND = "/assets/templates/birthday/gifts.jpg";

/** Места рамок: положение и ширина в процентах холста, базовый наклон. */
const FRAMES = [
  { left: "6%", top: "30%", width: "50%", tilt: -6 },
  { left: "46%", top: "40%", width: "46%", tilt: 5 },
  { left: "20%", top: "60%", width: "40%", tilt: -2 },
] as const;

/** Наклейки: где, какого размера, с каким наклоном. */
const STICKERS: ReadonlyArray<{
  icon: IconName;
  position: CSSProperties;
  width: string;
  tilt: number;
}> = [
  { icon: "balloon", position: { right: "5%", top: "3%" }, width: "20%", tilt: 10 },
  { icon: "popper", position: { left: "4%", bottom: "4%" }, width: "18%", tilt: -12 },
  { icon: "cake", position: { right: "6%", bottom: "5%" }, width: "22%", tilt: 4 },
  { icon: "gift", position: { left: "64%", top: "26%" }, width: "13%", tilt: -8 },
];

/** Слой композиции: обёртка с анимацией и номером в очереди. */
function Layer({
  index,
  style,
  className = "",
  children,
}: {
  index: number;
  style: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`assemble-layer absolute ${className}`}
      style={{ ...style, "--i": index } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function BirthdayCover({ photos, seed }: { photos: ReadonlyArray<string>; seed: string }) {
  const random = seededRandom(`${seed}:cover`);
  const shown = photos.length > 0 ? photos.slice(0, FRAMES.length) : FALLBACK_PHOTOS;
  const frames = FRAMES.slice(0, shown.length);

  // Порядок влёта как у SUPA: заголовок → рамки → наклейки.
  const stickerStart = 1 + frames.length;

  return (
    <div className="rounded-card xl:rounded-card-d bg-surface relative mx-auto aspect-[3/4] w-full max-w-[560px] overflow-hidden">
      {/* Фон не влетает — он холст, на котором всё собирается. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BACKGROUND} alt="" className="absolute inset-0 size-full object-cover" />

      <Layer index={0} style={{ left: "6%", top: "6%", width: "68%" }}>
        <h2 className="bg-gold text-ink rounded-inner font-display text-h3 xl:text-h2 -rotate-3 px-[0.6em] py-[0.35em] font-medium tracking-tight">
          {t("catalog.card.9")}
        </h2>
      </Layer>

      {frames.map((frame, index) => {
        const src = shown[index];
        if (src === undefined) return null;
        // Наклон рамки — базовый плюс-минус два градуса от зерна.
        const tilt = frame.tilt + (random() - 0.5) * 4;
        return (
          <Layer
            key={frame.left}
            index={1 + index}
            style={{ left: frame.left, top: frame.top, width: frame.width }}
          >
            <div
              aria-hidden="true"
              className="bg-paper p-[5%] pb-[16%]"
              style={{ transform: `rotate(${tilt.toFixed(1)}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </div>
          </Layer>
        );
      })}

      {STICKERS.map((sticker, index) => (
        <Layer
          key={sticker.icon}
          index={stickerStart + index}
          style={{ ...sticker.position, width: sticker.width }}
        >
          <div aria-hidden="true" style={{ transform: `rotate(${sticker.tilt}deg)` }}>
            <Icon name={sticker.icon} className="block h-auto w-full" />
          </div>
        </Layer>
      ))}
    </div>
  );
}
