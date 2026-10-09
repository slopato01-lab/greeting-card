import { Icon } from "@/components/Icon";

/**
 * Жёлтая корона на шаблоне «только по подписке» (просьба пользователя
 * 09.10.2026). Золотая иконка на тёмном кружке: на светлых и тёмных
 * открытках одинаково видна. Список таких шаблонов —
 * lib/editor/premium.ts.
 *
 * Подпись у иконки своя («Шаблон с короной — по подписке»): внутри
 * ссылки или кнопки она дописывается к их имени.
 */
export function CrownBadge({
  className = "",
  large = false,
}: {
  className?: string;
  /** Крупная — в попапе подписки; мелкая — на карточках шаблонов. */
  large?: boolean;
}) {
  const size = large ? "size-[44px]" : "size-[28px] xl:size-[32px]";
  return (
    <span
      className={`bg-ink text-gold shadow-card grid place-items-center rounded-full ${size} ${className}`}
    >
      <Icon name="crown" size={large ? 22 : 16} labelKey="premium.badge" />
    </span>
  );
}
