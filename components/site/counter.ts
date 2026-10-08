/**
 * Номер и оформление пункта счётчика «01 ——— 02 03 04».
 *
 * Отдельно от components/site/slider.tsx: тот клиентский, а номер
 * нужен и серверной секции «Три этапа».
 */

/** Номер в счётчике. Цифра — номер, а не текст интерфейса. */
export function counterNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Пункт счётчика. Кнопка не меньше 44×44, видимый номер внутри.
 * Как в design/главная.jpg: активный номер в белом кружке,
 * остальные курсивом серым. --muted на основе даёт 4.84:1.
 */
export function counterVisual(active: boolean): string {
  return (
    "font-ui text-note xl:text-note-d size-tap flex shrink-0 items-center justify-center " +
    "rounded-full font-medium transition-colors " +
    (active
      ? "border-line text-ink border bg-white"
      : "text-muted italic hover:text-ink active:bg-line")
  );
}
