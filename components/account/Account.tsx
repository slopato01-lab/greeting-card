"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ANIMATED_TEMPLATES } from "@/lib/catalog/templates";
import { type Draft, draftsSnapshot, parseDrafts, removeDraft } from "@/lib/editor/drafts";
import { TEMPLATES } from "@/lib/editor/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Личный кабинет (08.10.2026). Макета нет — собран из панелей
 * страницы «Как это работает»: серая панель, белые карточки с тенью,
 * тёмные метки-пилюли.
 *
 * Аккаунтов пока нет, поэтому здесь только настоящее:
 * - «Мои открытки» — черновики редактора из этого браузера
 *   (lib/editor/drafts.ts): продолжить или удалить;
 * - тариф гостя и его лимиты — по модели денег из docs/PRODUCT.md;
 * - вход и подписка видны, но выключены и помечены «Скоро».
 *
 * Черновики читаются из localStorage через useSyncExternalStore: на
 * сервере и до гидратации — загрузка, при ошибке хранилища — сообщение.
 */

type State = { status: "loading" } | { status: "ready"; drafts: Draft[] } | { status: "error" };

const LIMITS = [
  { label: "account.limit.watermark", value: "account.limit.watermark.value" },
  { label: "account.limit.free", value: "account.limit.free.value" },
  { label: "account.limit.link", value: "account.limit.link.value" },
  { label: "account.limit.crown", value: "account.limit.crown.value" },
] as const satisfies ReadonlyArray<{ label: TextKey; value: TextKey }>;

const SUBSCRIPTIONS = [
  "account.sub.week",
  "account.sub.month",
  "account.sub.single",
] as const satisfies ReadonlyArray<TextKey>;

const SOON =
  "font-ui caps text-badge bg-gold text-ink shrink-0 rounded-full px-[10px] py-[4px] font-medium";

const PANEL = "rounded-panel xl:rounded-panel-d bg-surface p-[12px] xl:p-[16px]";

function DraftCard({ draft, onRemoved }: { draft: Draft; onRemoved: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const animated = ANIMATED_TEMPLATES.find((item) => item.id === draft.template);
  const info = TEMPLATES.find((item) => item.id === draft.template);
  const name = animated?.nameKey ?? info?.label ?? "account.card.free";
  const href = draft.template === null ? "/editor" : `/editor?template=${draft.template}`;
  const { doc } = draft;

  return (
    <li className="bg-paper shadow-card rounded-card xl:rounded-card-d flex flex-col overflow-hidden">
      <div
        // Фон — цвет открытки, а не сайта (docs/DESIGN.md).
        style={animated === undefined ? undefined : { backgroundColor: animated.background }}
        className="bg-photo relative aspect-[3/4]"
      >
        {animated === undefined ? (
          <Icon name="tabTemplates" size={40} className="text-muted absolute inset-0 m-auto" />
        ) : (
          // Обложка шаблона, а не снимок черновика: снимок требует
          // поднять Fabric с фото из IndexedDB ради одной картинки.
          // eslint-disable-next-line @next/next/no-img-element -- статический экспорт
          <img
            src={animated.poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[10px] p-[12px] xl:p-[16px]">
        <h3 className="font-display text-note xl:text-card-d font-semibold tracking-tight">
          {t(name)}
        </h3>
        <ul role="list" className="flex flex-wrap gap-[4px]">
          {[
            `${t(doc.still === true ? "account.card.still" : "account.card.animated")}${
              doc.still === true ? "" : ` · ${doc.duration} ${t("account.card.seconds")}`
            }`,
            ...(doc.music === undefined ? [] : [t("account.card.music")]),
          ].map((chip) => (
            <li
              key={chip}
              className="font-ui text-badge text-body border-line rounded-full border px-[8px] py-[3px]"
            >
              {chip}
            </li>
          ))}
        </ul>

        {confirming ? (
          <div role="group" className="mt-auto flex flex-col gap-[8px] pt-[4px]">
            <p className="font-ui text-note text-ink leading-[1.4]">{t("account.card.confirm")}</p>
            <div className="flex flex-wrap gap-[6px]">
              <button
                type="button"
                onClick={() => {
                  if (removeDraft(draft.key)) onRemoved();
                }}
                className="font-ui text-note bg-ink text-canvas hover:bg-body active:bg-muted min-h-tap rounded-full px-[16px] font-medium transition-colors"
              >
                {t("account.card.yes")}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirming(false)}
                className="font-ui text-note text-ink border-line hover:bg-raised active:bg-line min-h-tap rounded-full border px-[16px] font-medium transition-colors"
              >
                {t("account.card.no")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex items-center gap-[6px] pt-[4px]">
            <Link
              href={href}
              className="font-ui text-note bg-ink text-canvas hover:bg-gold hover:text-ink min-h-tap flex flex-1 items-center justify-center gap-[8px] rounded-full px-[14px] font-medium transition-colors"
            >
              {t("account.card.continue")}
              <Icon name="next" size={16} className="-rotate-45" />
            </Link>
            <button
              type="button"
              aria-label={`${t("account.card.delete")}: ${t(name)}`}
              title={t("account.card.delete")}
              onClick={() => setConfirming(true)}
              className="size-tap border-line text-ink hover:bg-raised hover:border-muted active:bg-line flex shrink-0 items-center justify-center rounded-full border transition-colors"
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

/** Черновик поменяли в другой вкладке — список обновится сам. */
function subscribe(onChange: () => void) {
  const controller = new AbortController();
  window.addEventListener("storage", onChange, { signal: controller.signal });
  return () => controller.abort();
}

/** На сервере хранилища нет: там и до гидратации — загрузка. */
const LOADING = "loading";

export function Account() {
  // Удаление в этой же вкладке события storage не шлёт — перерисовку
  // просим сами, а снимок React перечитает при рендере.
  const [, setVersion] = useState(0);
  const snapshot = useSyncExternalStore(subscribe, draftsSnapshot, () => LOADING);
  const state = useMemo<State>(() => {
    if (snapshot === LOADING) return { status: "loading" };
    if (snapshot === null) return { status: "error" };
    return { status: "ready", drafts: parseDrafts(snapshot) };
  }, [snapshot]);
  const load = () => setVersion((value) => value + 1);

  return (
    <div className="grid gap-[12px] xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] xl:gap-[20px]">
      <section aria-labelledby="account-cards" className={PANEL}>
        <div className="flex flex-col gap-[8px] px-[8px] pt-[10px] pb-[20px] xl:px-[16px] xl:pt-[16px] xl:pb-[28px]">
          <h2
            id="account-cards"
            className="font-display text-h2 xl:text-h2-d font-medium tracking-tight"
          >
            {t("account.cards.title")}
          </h2>
          <p className="font-ui text-note xl:text-note-d text-body max-w-[640px] leading-[1.5]">
            {t("account.cards.lead")}
          </p>
        </div>

        {state.status === "loading" ? (
          <p
            aria-live="polite"
            className="font-ui text-note text-muted px-[8px] pb-[16px] xl:px-[16px]"
          >
            {t("account.loading")}
          </p>
        ) : null}

        {state.status === "error" ? (
          <p role="alert" className="font-ui text-note text-ink px-[8px] pb-[16px] xl:px-[16px]">
            {t("account.cards.error")}
          </p>
        ) : null}

        {state.status === "ready" && state.drafts.length === 0 ? (
          <div className="bg-paper rounded-card xl:rounded-card-d flex flex-col items-start gap-[16px] p-[20px] xl:p-[32px]">
            <p className="font-ui text-card xl:text-card-d text-body">{t("account.cards.empty")}</p>
            <Button href="/editor" labelKey="cta.create" className="xl:w-auto" />
          </div>
        ) : null}

        {state.status === "ready" && state.drafts.length > 0 ? (
          <ul role="list" className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:gap-[16px]">
            {state.drafts.map((draft) => (
              <DraftCard key={draft.key} draft={draft} onRemoved={load} />
            ))}
          </ul>
        ) : null}
      </section>

      <div className="flex flex-col gap-[12px] xl:gap-[20px]">
        <section
          aria-labelledby="account-guest"
          className="bg-ink text-canvas rounded-panel xl:rounded-panel-d flex flex-col gap-[14px] p-[20px] xl:p-[28px]"
        >
          <Icon name="user" size={40} className="text-gold" />
          <h2
            id="account-guest"
            className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight"
          >
            {t("account.guest.title")}
          </h2>
          <p className="font-ui text-note xl:text-note-d text-canvas leading-[1.5]">
            {t("account.guest.body")}
          </p>
          <div className="flex flex-wrap items-center gap-[10px]">
            <button
              type="button"
              disabled
              aria-describedby="account-login-soon"
              className="font-ui caps text-btn bg-raised text-muted min-h-tap cursor-not-allowed rounded-full px-[22px] font-medium"
            >
              {t("account.login")}
            </button>
            <span id="account-login-soon" className={SOON}>
              {t("account.soon")}
            </span>
          </div>
        </section>

        <section aria-labelledby="account-plan" className={PANEL}>
          <div className="bg-paper rounded-card xl:rounded-card-d flex flex-col gap-[16px] p-[18px] xl:p-[24px]">
            <h2
              id="account-plan"
              className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight"
            >
              {t("account.plan.title")}
            </h2>
            <p className="flex items-center gap-[10px]">
              <span className="font-ui caps text-badge text-muted">
                {t("account.plan.current")}
              </span>
              <span className="font-ui caps text-badge bg-ink text-canvas rounded-full px-[12px] py-[5px] font-medium">
                {t("account.plan.guest")}
              </span>
            </p>
            <dl className="flex flex-col">
              {LIMITS.map((limit) => (
                <div
                  key={limit.label}
                  className="border-line flex flex-wrap justify-between gap-x-[12px] gap-y-[2px] border-t py-[10px]"
                >
                  <dt className="font-ui text-note xl:text-note-d text-body">{t(limit.label)}</dt>
                  <dd className="font-ui text-note xl:text-note-d text-ink font-medium">
                    {t(limit.value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="account-sub" className={PANEL}>
          <div className="bg-paper rounded-card xl:rounded-card-d flex flex-col gap-[14px] p-[18px] xl:p-[24px]">
            <h2
              id="account-sub"
              className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight"
            >
              {t("account.sub.title")}
            </h2>
            <p className="font-ui text-note xl:text-note-d text-body leading-[1.5]">
              {t("account.sub.body")}
            </p>
            <ul role="list" className="flex flex-col gap-[6px]">
              {SUBSCRIPTIONS.map((key) => (
                <li
                  key={key}
                  className="bg-surface rounded-inner min-h-tap flex items-center justify-between gap-[12px] px-[14px] py-[8px]"
                >
                  <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                    {t(key)}
                  </span>
                  <span className={SOON}>{t("account.soon")}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
