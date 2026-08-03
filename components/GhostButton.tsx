import Link from "next/link";

import { t, type TextKey } from "@/lib/i18n";

/**
 * Вторичная кнопка: в макете без заливки и обводки, только текст.
 *
 * Появилась в карточке FAQ на лендинге, теперь та же нужна шагам
 * конструктора — «Назад» рядом с «Дальше». Классы вынесены сюда,
 * чтобы состояния не разъехались между двумя копиями.
 *
 * Наведение и фокус приходят от токенов: без них она неотличима
 * от простого текста, а в макете этих состояний нет.
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
  "font-ui text-btn xl:text-btn-header-d rounded-btn xl:rounded-faq-btn-d text-btn-ghost " +
  "min-h-tap hover:bg-pink-card flex h-[45px] w-full items-center justify-center " +
  "font-medium transition-colors xl:h-[61px]";

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
