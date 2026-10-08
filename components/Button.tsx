import Link from "next/link";

import { t, type TextKey } from "@/lib/i18n";

/**
 * Кнопка. Два варианта из макета:
 *
 * - `primary` — главная кнопка. Мобильный: 45px, радиус 10, обводка 1px.
 *   Десктоп: 450×75, радиус 18.
 * - `header` — кнопка в шапке, только с 1280px: 318×62, радиус 12,
 *   без обводки. Так в макете, не унифицируем.
 *
 * Подпись приходит ключом словаря, а не строкой: придумывать текст
 * в коде нельзя.
 *
 * С `href` это ссылка, без него — кнопка, у которой есть выключенное
 * состояние и состояние загрузки. Состояний в макете нет, они
 * спроектированы от токенов: наведение и нажатие затемняют розовый
 * подмешиванием чёрного, фокус приходит из globals.css.
 *
 * Внутренние адреса идут через `next/link`, внешние остаются `<a>`:
 * переход по своему сайту не должен перезагружать страницу и терять
 * несохранённый черновик конструктора.
 */
type ButtonCommon = {
  labelKey: TextKey;
  variant?: "primary" | "header";
  className?: string;
};

type ButtonProps =
  | (ButtonCommon & { href: string })
  | (ButtonCommon & {
      href?: undefined;
      type?: "button" | "submit";
      disabled?: boolean;
      loading?: boolean;
      onClick?: () => void;
    });

const BASE =
  "font-ui tracking-base min-h-tap inline-flex items-center justify-center gap-2 " +
  "bg-pink text-white font-medium transition-colors select-none " +
  "hover:bg-[color-mix(in_oklab,var(--color-pink)_90%,var(--color-ink))] " +
  "active:bg-[color-mix(in_oklab,var(--color-pink)_80%,var(--color-ink))]";

const BY_VARIANT = {
  primary:
    "rounded-btn xl:rounded-btn-d text-btn xl:text-btn-d border-ink h-[45px] w-full border xl:h-[75px]",
  header: "rounded-btn-header-d text-btn-header-d h-[62px] w-[318px]",
} as const;

/**
 * Десктопная ширина главной кнопки из макета. Отдельно от варианта,
 * потому что её перебивают: два `xl:w-[…]` в одной строке классов
 * разрешаются порядком в собранном CSS, а не порядком в строке, —
 * и выигрывал не тот, кого просили. Поэтому макетную ширину
 * не подставляем вовсе, если вызывающий задал свою.
 *
 * Мобильная `w-full` остаётся всегда: во всю ширину кнопка стоит
 * и в макете, и у всех, кто передаёт только десктопную ширину.
 */
const PRIMARY_WIDTH_D = "xl:w-[450px]";

const DISABLED = "disabled:bg-muted disabled:cursor-not-allowed disabled:hover:bg-muted";

export function Button(props: ButtonProps) {
  const { labelKey, variant = "primary", className } = props;

  const widthGiven = className !== undefined && /(^|\s)xl:w-/.test(className);
  const width = variant === "primary" && !widthGiven ? PRIMARY_WIDTH_D : "";

  const classes = [BASE, BY_VARIANT[variant], width, className].filter(Boolean).join(" ");

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

  const { type = "button", disabled = false, loading = false, onClick } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${classes} ${DISABLED}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : null}
      {t(labelKey)}
    </button>
  );
}
