import type { ReactNode } from "react";

/**
 * Фото-карточка страницы «Как это работает»: снимок во всю карточку,
 * поверх — ряд разделов и подложки. Снимки — праздничные фото Unsplash
 * из public/assets/benefits (источники — CREDITS.md там же). Декор,
 * поэтому alt пустой. Минимальная высота, а не фиксированная: рядом
 * текст, и карточка тянется вместе с ним.
 */
export function Photo({
  src,
  className = "",
  children,
}: {
  src: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`bg-photo rounded-card xl:rounded-card-d relative overflow-hidden ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- статический экспорт, оптимизатора нет */}
      <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      {children}
    </div>
  );
}
