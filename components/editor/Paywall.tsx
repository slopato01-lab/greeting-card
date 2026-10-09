"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/Button";
import { CrownBadge } from "@/components/CrownBadge";
import { t, type TextKey } from "@/lib/i18n";
import { PLANS } from "@/lib/pricing";

/**
 * Попап подписки (просьба пользователя 09.10.2026): вошедший сохраняет
 * GIF или видео, а без водяного знака нельзя — бесплатные кончились
 * или шаблон с короной.
 *
 * Оплаты пока нет (bePaid и ЮKassa ждут договоров), поэтому тарифы
 * с ценами настоящие, а кнопка оплаты выключена: «Оплата скоро».
 * Выход есть всегда — скачать с водяным знаком.
 *
 * Нативный <dialog> через showModal(): фокус заперт внутри, Esc
 * закрывает, остальная страница inert — без своих ловушек фокуса.
 * Нажатие на затемнение вокруг тоже закрывает.
 */
export type PaywallReason = "limit" | "subscription";

const TEXTS = {
  limit: { title: "paywall.limit.title", body: "paywall.limit.body" },
  subscription: { title: "paywall.subscription.title", body: "paywall.subscription.body" },
} as const satisfies Record<PaywallReason, { title: TextKey; body: TextKey }>;

const NOTES = {
  week: "paywall.week.note",
  month: "paywall.month.note",
  single: "paywall.single.note",
} as const satisfies Record<(typeof PLANS)[number]["id"], TextKey>;

export function Paywall({
  reason,
  onClose,
  onWatermark,
}: {
  reason: PaywallReason | null;
  onClose: () => void;
  onWatermark: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    if (reason !== null && !dialog.open) dialog.showModal();
    if (reason === null && dialog.open) dialog.close();
  }, [reason]);

  // Esc закрывает <dialog> сам — состояние догоняет по событию close.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;
    const controller = new AbortController();
    dialog.addEventListener("close", onClose, { signal: controller.signal });
    return () => controller.abort();
  }, [onClose]);

  // Шаблон с короной за штуку не продаётся — только подписка.
  const plans = PLANS.filter((plan) => reason !== "subscription" || plan.crown);
  const texts = TEXTS[reason ?? "limit"];

  return (
    <dialog
      ref={ref}
      aria-labelledby="paywall-title"
      aria-describedby="paywall-body"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="bg-paper text-ink rounded-panel xl:rounded-panel-d backdrop:bg-ink/60 m-auto w-[calc(100%-32px)] max-w-[440px] p-0"
    >
      {reason === null ? null : (
        <div className="flex flex-col gap-[16px] p-[20px] xl:p-[28px]">
          <CrownBadge large />
          <div className="flex flex-col gap-[8px]">
            <h2
              id="paywall-title"
              className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight"
            >
              {t(texts.title)}
            </h2>
            <p
              id="paywall-body"
              className="font-ui text-note xl:text-note-d text-body leading-[1.5]"
            >
              {t(texts.body)}
            </p>
          </div>

          <ul role="list" className="flex flex-col gap-[6px]">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="bg-surface rounded-inner min-h-tap flex items-center justify-between gap-[12px] px-[14px] py-[10px]"
              >
                <span className="flex flex-col">
                  <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                    {t(plan.nameKey)}
                  </span>
                  <span className="font-ui text-note text-body">{t(NOTES[plan.id])}</span>
                </span>
                <span className="font-ui text-note xl:text-note-d text-ink shrink-0 text-end font-medium">
                  {plan.byn}&nbsp;{t("price.byn")}
                  <span className="text-body block font-normal">
                    {plan.rub}&nbsp;{t("price.rub")}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-[8px]">
            <Button labelKey="paywall.soon" disabled className="xl:w-full" />
            <Button
              labelKey="paywall.watermark"
              tone="dark"
              className="xl:w-full"
              onClick={onWatermark}
            />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="font-ui text-note xl:text-note-d text-ink hover:text-gold-deep active:text-gold-deep min-h-tap self-center px-[12px] underline underline-offset-4 transition-colors"
            >
              {t("paywall.close")}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
