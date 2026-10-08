import Link from "next/link";

import { Icon } from "@/components/Icon";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Кнопка. Вид — из design/главная.jpg: пилюля, подпись слева,
 * справа кружок со стрелкой. Кружок розовый — это и есть точечный
 * акцент, оставленный от прежнего стиля.
 *
 * - `primary` — главная кнопка. Мобильный: 52px во всю ширину.
 *   Десктоп: 64px, ширина по содержимому.
 * - `header` — кнопка в шапке, только с 1280px: 52px.
 *
 * Тон `dark` — тёмная пилюля для светлого фона, `light` — белая
 * для тёмных блоков (герой, CTA, панель ответа FAQ).
 *
 * Подпись приходит ключом словаря, а не строкой: придумывать текст
 * в коде нельзя.
 *
 * С `href` это ссылка, без него — кнопка, у которой есть выключенное
 * состояние и состояние загрузки. Наведение и нажатие сдвигают
 * заливку на ступень: --dark → --dark-2, --white → --canvas → --line.
 * Фокус приходит из globals.css.
 *
 * Внутренние адреса идут через `next/link`, внешние остаются `<a>`:
 * переход по своему сайту не должен перезагружать страницу и терять
 * несохранённый черновик конструктора.
 */
type ButtonCommon = {
  labelKey: TextKey;
  variant?: "primary" | "header";
  tone?: "dark" | "light";
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
  "group font-ui tracking-base min-h-tap inline-flex items-center justify-between gap-4 " +
  "rounded-full ps-6 pe-[6px] font-medium transition-colors select-none";

const BY_TONE = {
  dark: "bg-dark text-white hover:bg-dark-2 active:bg-ink",
  light: "bg-white text-ink hover:bg-canvas active:bg-line",
} as const;

const BY_VARIANT = {
  primary: "text-btn xl:text-btn-d h-[52px] w-full xl:h-[64px] xl:ps-8 xl:pe-[8px]",
  header: "text-btn-header-d h-[52px]",
} as const;

/** Кружок со стрелкой. На десктопе у главной кнопки крупнее. */
const DOT_SIZE = {
  primary: "size-[40px] xl:size-[48px]",
  header: "size-[40px]",
} as const;

/**
 * Десктопная ширина главной кнопки — по содержимому. Отдельно от
 * варианта, потому что её перебивают: два `xl:w-[…]` в одной строке
 * классов разрешаются порядком в собранном CSS, а не порядком
 * в строке, — и выигрывал не тот, кого просили. Поэтому дефолт
 * не подставляем вовсе, если вызывающий задал свою.
 *
 * Мобильная `w-full` остаётся всегда: во всю ширину кнопка удобнее
 * под палец, и все, кто передаёт ширину, передают только десктопную.
 */
const PRIMARY_WIDTH_D = "xl:w-auto";

// Загрузка тоже ставит disabled, но выглядеть выключенной не должна.
const DISABLED =
  "disabled:cursor-not-allowed disabled:not-aria-busy:bg-line disabled:not-aria-busy:text-muted";

/**
 * Кружок серый только у выключенной кнопки. Во время загрузки кнопка
 * тоже disabled, но действие идёт — кружок остаётся розовым.
 */
function Dot({
  variant,
  loading = false,
  off = false,
}: {
  variant: "primary" | "header";
  loading?: boolean;
  off?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`${DOT_SIZE[variant]} ${off ? "bg-muted" : "bg-pink"} flex shrink-0 items-center justify-center rounded-full text-white`}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <Icon name="next" size={20} />
      )}
    </span>
  );
}

export function Button(props: ButtonProps) {
  const { labelKey, variant = "primary", tone = "dark", className } = props;

  const widthGiven = className !== undefined && /(^|\s)xl:w-/.test(className);
  const width = variant === "primary" && !widthGiven ? PRIMARY_WIDTH_D : "";

  const classes = [BASE, BY_TONE[tone], BY_VARIANT[variant], width, className]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    if (props.href.startsWith("/")) {
      return (
        <Link href={props.href} className={classes}>
          {t(labelKey)}
          <Dot variant={variant} />
        </Link>
      );
    }

    return (
      <a href={props.href} className={classes}>
        {t(labelKey)}
        <Dot variant={variant} />
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
      {t(labelKey)}
      <Dot variant={variant} loading={loading} off={disabled && !loading} />
    </button>
  );
}
