import Link from "next/link";

import { Icon } from "@/components/Icon";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Кнопка. Вид — из design/главная greetinh-cards.jpg: пилюля, подпись
 * капсом, за ней стрелка «↗».
 *
 * - `primary` — главная кнопка. Мобильный: 52px во всю ширину.
 *   Десктоп: 56px, ширина по содержимому.
 * - `header` — кнопка в шапке, только с 1280px: 44px.
 *
 * Тон `gold` — главное действие, текст на нём тёмный. `dark` — тёмная
 * пилюля со светлым текстом, второе по важности действие и кнопка
 * в шапке (до 08.10.2026 белая — на светлом сайте она пропала бы).
 *
 * Подпись приходит ключом словаря, а не строкой: придумывать текст
 * в коде нельзя.
 *
 * С `href` это ссылка, без него — кнопка, у которой есть выключенное
 * состояние и состояние загрузки. Наведение и нажатие подмешивают
 * к золоту тёмный --ink, к тёмной пилюле — белую основу, на 12% и 24%. Фокус приходит из globals.css.
 *
 * Внутренние адреса идут через `next/link`, внешние остаются `<a>`:
 * переход по своему сайту не должен перезагружать страницу и терять
 * несохранённый черновик конструктора.
 */
type ButtonCommon = {
  labelKey: TextKey;
  variant?: "primary" | "header";
  tone?: "gold" | "dark";
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
  "font-ui caps min-h-tap inline-flex items-center justify-center gap-2 rounded-full px-6 " +
  "font-medium whitespace-nowrap transition-colors select-none";

const BY_TONE = {
  gold:
    "bg-gold text-ink hover:bg-[color-mix(in_oklab,var(--color-gold)_88%,var(--color-ink))] " +
    "active:bg-[color-mix(in_oklab,var(--color-gold)_76%,var(--color-ink))]",
  dark:
    "bg-ink text-canvas hover:bg-[color-mix(in_oklab,var(--color-ink)_88%,var(--color-canvas))] " +
    "active:bg-[color-mix(in_oklab,var(--color-ink)_76%,var(--color-canvas))]",
} as const;

const BY_VARIANT = {
  primary: "text-btn xl:text-btn-d h-[52px] w-full xl:h-[56px] xl:px-8",
  header: "text-btn-header-d h-[44px]",
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
  "disabled:cursor-not-allowed disabled:not-aria-busy:bg-raised disabled:not-aria-busy:text-muted";

/** Стрелка «↗»: та же иконка «дальше», повёрнутая на 45°. */
function Arrow({ loading = false }: { loading?: boolean }) {
  return loading ? (
    <span
      aria-hidden="true"
      className="border-current/30 border-t-current size-4 shrink-0 animate-spin rounded-full border-2"
    />
  ) : (
    <Icon name="next" size={18} className="shrink-0 -rotate-45" />
  );
}

export function Button(props: ButtonProps) {
  const { labelKey, variant = "primary", tone = "gold", className } = props;

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
          <Arrow />
        </Link>
      );
    }

    return (
      <a href={props.href} className={classes}>
        {t(labelKey)}
        <Arrow />
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
      <Arrow loading={loading} />
    </button>
  );
}
