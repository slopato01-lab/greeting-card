import type { ReactNode } from "react";

/**
 * Блоки страницы друг под другом с одним промежутком на весь сайт —
 * токены --spacing-block (100 / 160 с 768 / 250 с 1280). Тот же
 * промежуток стоит после последнего блока, до подвала.
 *
 * Секции внутри своих вертикальных полей не держат: иначе промежутки
 * снова разъедутся. Заголовок страницы и её первая секция — один блок.
 */
export function Blocks({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`gap-block pb-block md:gap-block-md md:pb-block-md xl:gap-block-d xl:pb-block-d flex flex-col ${className}`}
    >
      {children}
    </div>
  );
}
