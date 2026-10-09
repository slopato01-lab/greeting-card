import { Icon } from "@/components/Icon";

/**
 * Жёлтая корона на шаблоне «только по подписке» (просьба пользователя
 * 09.10.2026). Золотая иконка на тёмном кружке: на светлых и тёмных
 * открытках одинаково видна. Список таких шаблонов —
 * lib/editor/premium.ts.
 *
 * На карточке каталога (`edge`, просьба пользователя 09.10.2026) —
 * крупный золотой кружок с тёмной короной и белой обводкой 2px,
 * выступает за правый край карточки: должен бросаться в глаза.
 *
 * Подпись у иконки своя («Шаблон с короной — по подписке»): внутри
 * ссылки или кнопки она дописывается к их имени.
 */
export function CrownBadge({
  className = "",
  large = false,
  edge = false,
}: {
  className?: string;
  /** Крупная — в попапе подписки; мелкая — на карточках в редакторе. */
  large?: boolean;
  /** На краю карточки каталога: золотая, крупная, с белой обводкой. */
  edge?: boolean;
}) {
  const look = edge
    ? "bg-gold text-ink border-canvas size-[36px] border-2 xl:size-[44px]"
    : `bg-ink text-gold ${large ? "size-[44px]" : "size-[28px] xl:size-[32px]"}`;
  return (
    <span className={`shadow-card grid place-items-center rounded-full ${look} ${className}`}>
      <Icon name="crown" size={large || edge ? 20 : 16} labelKey="premium.badge" />
    </span>
  );
}
