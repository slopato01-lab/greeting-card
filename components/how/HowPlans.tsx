import Link from "next/link";

import { Icon } from "@/components/Icon";
import { HowNav } from "@/components/how/HowNav";
import { Photo } from "@/components/how/Photo";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Четвёртая панель — по блоку «Условия сотрудничества» из макета:
 * высокое фото слева, справа заголовок и три карточки с тёмной
 * меткой, списком и стрелкой.
 *
 * Карточки — модель денег от 08.10.2026 (docs/PRODUCT.md): без
 * регистрации, после регистрации, подписка. Цен нет — они ещё
 * не назначены.
 */
const PLANS = [
  {
    label: "how.plan.free",
    items: ["how.plan.free.1", "how.plan.free.2", "how.plan.free.3", "how.plan.free.4"],
  },
  {
    label: "how.plan.account",
    items: ["how.plan.account.1", "how.plan.account.2", "how.plan.account.3", "how.plan.account.4"],
  },
  {
    label: "how.plan.sub",
    items: ["how.plan.sub.1", "how.plan.sub.2", "how.plan.sub.3", "how.plan.sub.4"],
  },
] as const satisfies ReadonlyArray<{ label: TextKey; items: readonly TextKey[] }>;

export function HowPlans() {
  return (
    <section
      id="plans"
      aria-labelledby="how-plans-title"
      className="grid gap-[20px] xl:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] xl:gap-[40px]"
    >
      <Photo src="/assets/benefits/confetti.webp" className="min-h-[300px] xl:min-h-[560px]">
        <HowNav current="plans" />
        <Link
          href="/editor"
          className="bg-paper text-ink hover:bg-raised font-ui caps text-pill min-h-tap absolute start-[12px] bottom-[12px] flex items-center gap-[10px] rounded-full ps-[18px] pe-[6px] font-medium transition-colors xl:start-[16px] xl:bottom-[16px]"
        >
          {t("cta.editor")}
          <span
            aria-hidden="true"
            className="bg-ink text-canvas grid size-[32px] place-items-center rounded-full"
          >
            <Icon name="next" size={16} className="-rotate-45" />
          </span>
        </Link>
      </Photo>

      <div className="flex flex-col gap-[20px] xl:gap-[32px] xl:pt-[8px]">
        <h2
          id="how-plans-title"
          className="font-display text-h2 xl:text-h1-d font-medium tracking-tight"
        >
          {t("how.plans.title")}
        </h2>

        <ul role="list" className="grid gap-[10px] xl:grid-cols-3 xl:gap-[16px]">
          {PLANS.map((plan) => (
            <li
              key={plan.label}
              className="bg-surface rounded-card xl:rounded-card-d flex flex-col gap-[18px] p-[16px] xl:p-[22px]"
            >
              <h3 className="font-ui caps text-badge xl:text-badge-d bg-ink text-canvas self-start rounded-full px-[14px] py-[7px] font-medium">
                {t(plan.label)}
              </h3>
              <ul role="list" className="flex flex-col gap-[12px]">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-[10px]">
                    <Icon name="tick" size={20} className="text-gold-deep mt-[1px] shrink-0" />
                    <span className="font-ui text-note xl:text-note-d text-ink leading-[1.45]">
                      {t(item)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/editor"
                aria-label={`${t(plan.label)}: ${t("cta.editor")}`}
                className="size-tap border-line text-ink hover:bg-gold hover:border-gold mt-auto flex items-center justify-center self-end rounded-full border transition-colors"
              >
                <Icon name="next" size={18} className="-rotate-45" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
