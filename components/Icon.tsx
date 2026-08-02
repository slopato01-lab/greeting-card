import { t, type TextKey } from "@/lib/i18n";
import { icons, type IconName } from "@/lib/icons/generated";

type IconProps = {
  name: IconName;
  /** Сторона квадрата в пикселях. В макете размеры иконок не заданы. */
  size?: number;
  className?: string;
  /**
   * Ключ подписи из словаря. Без него иконка декоративная и скрыта
   * от скринридера. Именно ключ, а не строка: подпись видна
   * пользователю, а значит живёт в docs/PRODUCT.md.
   */
  labelKey?: TextKey;
};

/**
 * Иконка вставляется прямо в разметку, а не через <img>: так
 * монохромные красятся токеном через currentColor и не создают
 * отдельный запрос на каждую.
 *
 * Разметка приходит из lib/icons/generated.ts — он собран из файлов
 * public/assets/icons, которые лежат в репозитории. Пользовательских
 * данных здесь нет и быть не может.
 */
export function Icon({ name, size = 24, className, labelKey }: IconProps) {
  const icon = icons[name];
  const label = labelKey === undefined ? undefined : t(labelKey);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      className={className}
      role={label === undefined ? undefined : "img"}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
