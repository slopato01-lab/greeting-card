import Link from "next/link";

import { t, type TextKey } from "@/lib/i18n";

/**
 * Вторичная кнопка: пилюля без заливки с обводкой --line, текст
 * капсом — как «Collection» в design/главная greetinh-cards.jpg,
 * только без белой заливки: белая пилюля уже есть у Button tone="light".
 * Высота та же, что у главной кнопки.
 *
 * Наведение — заливка --raised и обводка --muted, нажатие — заливка
 * --line. Фокус общий из globals.css.
 *
 * С `href` это ссылка, без него — кнопка, у которой есть выключенное
 * состояние. Форма повторяет components/Button.tsx намеренно: две
 * кнопки одного пути должны вызываться одинаково — включая переход
 * внутренних адресов через `next/link`.
 */
type GhostCommon = {
  labelKey: TextKey;
  className?: string;
};

type GhostButtonProps =
  | (GhostCommon & { href: string })
  | (GhostCommon & {
      href?: undefined;
      type?: "button" | "submit";
      disabled?: boolean;
      onClick?: () => void;
    });

const BASE =
  "font-ui caps text-btn xl:text-btn-d text-ink border-line min-h-tap flex h-[52px] w-full " +
  "items-center justify-center rounded-full border px-6 font-medium whitespace-nowrap transition-colors " +
  "hover:bg-raised hover:border-muted active:bg-line xl:h-[56px] xl:px-8";

export function GhostButton(props: GhostButtonProps) {
  const { labelKey, className } = props;
  const classes = [BASE, className].filter(Boolean).join(" ");

  if (props.href !== undefined) {
    if (props.href.startsWith("/")) {
      return (
        <Link href={props.href} className={classes}>
          {t(labelKey)}
        </Link>
      );
    }

    return (
      <a href={props.href} className={classes}>
        {t(labelKey)}
      </a>
    );
  }

  const { type = "button", disabled = false, onClick } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent`}
    >
      {t(labelKey)}
    </button>
  );
}
