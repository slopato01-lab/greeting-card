/**
 * Номер «01», «02»… для этапов, пунктов «что внутри» и поводов.
 *
 * Отдельно от components/site/slider.tsx: тот клиентский, а номер
 * нужен и серверной секции «Три этапа».
 */

/** Номер в счётчике. Цифра — номер, а не текст интерфейса. */
export function counterNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
