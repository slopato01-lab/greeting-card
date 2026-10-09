"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { logout, refresh, type User, useAuth } from "@/lib/auth/client";
import { ANIMATED_TEMPLATES } from "@/lib/catalog/templates";
import { type Draft, draftsSnapshot, parseDrafts, removeDraft } from "@/lib/editor/drafts";
import { TEMPLATES } from "@/lib/editor/templates";
import type { IconName } from "@/lib/icons/generated";
import { type TextKey, t } from "@/lib/i18n";
import { PLANS } from "@/lib/pricing";

/**
 * Личный кабинет (переделан 09.10.2026: «сейчас на кабинет вообще не
 * похож»). Макета нет — раскладка своя, из токенов сайта, по типовому
 * кабинету:
 *
 * - слева (с 1280px — колонкой, на телефоне — сверху) тёмная карточка
 *   профиля: инициал, почта, дата регистрации, тариф, разделы, «Выйти»;
 * - справа — открытый раздел: «Мои открытки», «Тариф», «Настройки».
 *   Разделы — вкладки (role="tablist"), выбранный пишется в адрес
 *   (#plan, #settings), чтобы ссылка вела сразу туда.
 *
 * Кабинет только для вошедших: гостя уводит на /login?next=/account.
 * Права проверяет сервер (cookie сессии), здесь — только показ.
 *
 * Черновики пока хранятся в этом браузере (lib/editor/drafts.ts) и
 * читаются через useSyncExternalStore: до гидратации — загрузка, при
 * ошибке хранилища — сообщение.
 */

type DraftsState =
  { status: "loading" } | { status: "ready"; drafts: Draft[] } | { status: "error" };

const TABS = [
  { id: "cards", label: "account.tab.cards", icon: "tabTemplates" },
  { id: "plan", label: "account.tab.plan", icon: "crown" },
  { id: "settings", label: "account.tab.settings", icon: "settings" },
] as const satisfies ReadonlyArray<{ id: string; label: TextKey; icon: IconName }>;

type TabId = (typeof TABS)[number]["id"];

const LIMITS = [
  { label: "account.limit.watermark", value: "account.limit.watermark.user" },
  { label: "account.limit.free", value: "account.limit.free.user" },
  { label: "account.limit.link", value: "account.limit.link.user" },
  { label: "account.limit.crown", value: "account.limit.crown.value" },
] as const satisfies ReadonlyArray<{ label: TextKey; value: TextKey }>;

/** Сколько бесплатных открыток даёт регистрация — для полоски «осталось». */
const FREE_TOTAL = 2;

const SOON =
  "font-ui caps text-badge bg-gold text-ink shrink-0 rounded-full px-[10px] py-[4px] font-medium";

const PANEL = "rounded-panel xl:rounded-panel-d bg-surface p-[12px] xl:p-[16px]";
const CARD = "bg-paper rounded-card xl:rounded-card-d";
const H2 = "font-display text-h2 xl:text-h2-d font-medium tracking-tight";
const H3 = "font-display text-h3 xl:text-h3-d font-semibold tracking-tight";
const NOTE = "font-ui text-note xl:text-note-d text-body leading-[1.5]";

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

// ── Черновики ───────────────────────────────────────────────

/** Черновик поменяли в другой вкладке — список обновится сам. */
function subscribeDrafts(onChange: () => void) {
  const controller = new AbortController();
  window.addEventListener("storage", onChange, { signal: controller.signal });
  return () => controller.abort();
}

/** На сервере хранилища нет: там и до гидратации — загрузка. */
const LOADING = "loading";

function useDrafts(): [DraftsState, () => void] {
  // Удаление в этой же вкладке события storage не шлёт — перерисовку
  // просим сами, а снимок React перечитает при рендере.
  const [, setVersion] = useState(0);
  const snapshot = useSyncExternalStore(subscribeDrafts, draftsSnapshot, () => LOADING);
  const state = useMemo<DraftsState>(() => {
    if (snapshot === LOADING) return { status: "loading" };
    if (snapshot === null) return { status: "error" };
    return { status: "ready", drafts: parseDrafts(snapshot) };
  }, [snapshot]);
  return [state, () => setVersion((value) => value + 1)];
}

// ── Разделы ─────────────────────────────────────────────────

/** Плитка-показатель. Слово вместо числа набирается мельче: «Бесплатный» не влез бы. */
function Stat({ value, label, word = false }: { value: string; label: TextKey; word?: boolean }) {
  return (
    <div className={`${CARD} flex min-w-0 flex-col justify-between gap-[6px] p-[12px] xl:p-[20px]`}>
      <span
        className={`font-display leading-none font-medium break-words ${
          word ? "text-note xl:text-h3-d" : "text-h3 xl:text-h2-d"
        }`}
      >
        {value}
      </span>
      <span className="font-ui caps text-badge xl:text-badge-d text-muted">{t(label)}</span>
    </div>
  );
}

function CardsSection({ user }: { user: User }) {
  const [drafts, reload] = useDrafts();
  const count = drafts.status === "ready" ? String(drafts.drafts.length) : "—";

  return (
    <div className="flex flex-col gap-[12px] xl:gap-[16px]">
      <div className="flex flex-col gap-[16px] px-[8px] pt-[10px] xl:flex-row xl:items-end xl:justify-between xl:px-[16px] xl:pt-[16px]">
        <div className="flex flex-col gap-[8px]">
          <h2 className={H2}>{t("account.cards.title")}</h2>
          <p className={`${NOTE} max-w-[560px]`}>{t("account.cards.lead")}</p>
        </div>
        <Button href="/editor" labelKey="cta.create" className="xl:w-auto xl:shrink-0" />
      </div>

      {/* На телефоне третья плитка не помещается словом — тариф есть во вкладке. */}
      <div className="grid grid-cols-2 gap-[8px] md:grid-cols-3 xl:gap-[16px]">
        <Stat value={count} label="account.stat.drafts" />
        <Stat
          value={`${user.freeLeft} ${t("account.stat.of")} ${FREE_TOTAL}`}
          label="account.stat.free"
        />
        <div className="hidden md:contents">
          <Stat value={t("account.plan.free")} label="account.stat.plan" word />
        </div>
      </div>

      {drafts.status === "loading" ? (
        <p aria-live="polite" className="font-ui text-note text-muted px-[8px] xl:px-[16px]">
          {t("account.loading")}
        </p>
      ) : null}

      {drafts.status === "error" ? (
        <p role="alert" className="font-ui text-note text-ink px-[8px] xl:px-[16px]">
          {t("account.cards.error")}
        </p>
      ) : null}

      {drafts.status === "ready" && drafts.drafts.length === 0 ? (
        <div className={`${CARD} flex flex-col items-start gap-[16px] p-[20px] xl:p-[32px]`}>
          <p className="font-ui text-card xl:text-card-d text-body">{t("account.cards.empty")}</p>
        </div>
      ) : null}

      {drafts.status === "ready" && drafts.drafts.length > 0 ? (
        <ul role="list" className="grid grid-cols-2 gap-[10px] md:grid-cols-3 xl:gap-[16px]">
          {drafts.drafts.map((draft) => (
            <DraftCard key={draft.key} draft={draft} onRemoved={reload} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PlanSection({ user }: { user: User }) {
  const share = Math.max(0, Math.min(1, user.freeLeft / FREE_TOTAL));
  return (
    <div className="flex flex-col gap-[12px] xl:gap-[16px]">
      <h2 className={`${H2} px-[8px] pt-[10px] xl:px-[16px] xl:pt-[16px]`}>
        {t("account.plan.title")}
      </h2>

      <div className={`${CARD} flex flex-col gap-[18px] p-[18px] xl:p-[28px]`}>
        <p className="flex items-center gap-[10px]">
          <span className="font-ui caps text-badge text-muted">{t("account.plan.current")}</span>
          <span className="font-ui caps text-badge bg-ink text-canvas rounded-full px-[12px] py-[5px] font-medium">
            {t("account.plan.free")}
          </span>
        </p>

        <div className="flex flex-col gap-[10px]">
          <p className="flex flex-wrap items-baseline justify-between gap-x-[12px]">
            <span className={NOTE}>{t("account.plan.left")}</span>
            <span className="font-display text-h3 xl:text-h3-d font-medium">
              {user.freeLeft} {t("account.stat.of")} {FREE_TOTAL}
            </span>
          </p>
          <div
            role="meter"
            aria-label={t("account.plan.left")}
            aria-valuemin={0}
            aria-valuemax={FREE_TOTAL}
            aria-valuenow={user.freeLeft}
            className="bg-line h-[8px] overflow-hidden rounded-full"
          >
            <div className="bg-gold h-full rounded-full" style={{ width: `${share * 100}%` }} />
          </div>
          <p className="font-ui text-note text-muted leading-[1.5]">
            {t("account.plan.note.user")}
          </p>
        </div>

        <dl className="flex flex-col">
          {LIMITS.map((limit) => (
            <div
              key={limit.label}
              className="border-line flex flex-wrap justify-between gap-x-[12px] gap-y-[2px] border-t py-[12px]"
            >
              <dt className={NOTE}>{t(limit.label)}</dt>
              <dd className="font-ui text-note xl:text-note-d text-ink font-medium">
                {t(limit.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={`${CARD} flex flex-col gap-[14px] p-[18px] xl:p-[28px]`}>
        <h3 className={H3}>{t("account.sub.title")}</h3>
        <p className={NOTE}>{t("account.sub.body")}</p>
        <ul role="list" className="grid gap-[6px] md:grid-cols-3">
          {PLANS.map((plan) => (
            <li
              key={plan.id}
              className="bg-surface rounded-inner min-h-tap flex items-center justify-between gap-[12px] px-[14px] py-[10px]"
            >
              <span className="flex flex-col">
                <span className="font-ui text-note xl:text-note-d text-ink font-medium">
                  {t(plan.nameKey)}
                </span>
                <span className="font-ui text-note text-body">
                  {plan.byn}&nbsp;{t("price.byn")} · {plan.rub}&nbsp;{t("price.rub")}
                </span>
              </span>
              <span className={SOON}>{t("account.soon")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LogoutButton({ tone }: { tone: "dark" | "light" }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-[8px]">
      <button
        type="button"
        disabled={busy}
        aria-busy={busy || undefined}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          const ok = await logout();
          setBusy(false);
          if (ok) router.replace("/");
          else setFailed(true);
        }}
        className={`font-ui caps text-btn min-h-tap flex items-center justify-center gap-[10px] rounded-full border px-[20px] font-medium transition-colors disabled:cursor-wait ${
          tone === "dark"
            ? "border-muted text-canvas hover:border-canvas hover:bg-body"
            : "border-line text-ink hover:bg-raised hover:border-muted active:bg-line"
        }`}
      >
        <Icon name="logout" size={20} />
        {t("account.logout")}
      </button>
      {failed ? (
        <p
          role="alert"
          className={`font-ui text-note ${tone === "dark" ? "text-canvas" : "text-ink"}`}
        >
          {t("account.logout.error")}
        </p>
      ) : null}
    </div>
  );
}

function SettingsSection({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-[12px] xl:gap-[16px]">
      <h2 className={`${H2} px-[8px] pt-[10px] xl:px-[16px] xl:pt-[16px]`}>
        {t("account.tab.settings")}
      </h2>
      <div className={`${CARD} flex flex-col p-[6px] xl:p-[8px]`}>
        <div className="flex flex-col gap-[6px] p-[14px] xl:p-[20px]">
          <h3 className="font-ui caps text-badge xl:text-badge-d text-muted">
            {t("account.settings.email")}
          </h3>
          <p className="font-display text-h3 xl:text-h3-d font-medium break-all">{user.email}</p>
          <p className={NOTE}>{t("account.settings.email.hint")}</p>
        </div>
        <div className="border-line flex flex-col gap-[12px] border-t p-[14px] xl:flex-row xl:items-center xl:justify-between xl:p-[20px]">
          <div className="flex flex-col gap-[6px]">
            <h3 className="font-ui caps text-badge xl:text-badge-d text-muted">
              {t("account.settings.session")}
            </h3>
            <p className={NOTE}>{t("account.settings.session.hint")}</p>
          </div>
          <LogoutButton tone="light" />
        </div>
      </div>
    </div>
  );
}

// ── Кабинет ─────────────────────────────────────────────────

const isTab = (value: string): value is TabId => TABS.some((tab) => tab.id === value);

/** Выбранный раздел живёт в адресе: #plan открывает сразу «Тариф». */
function useTab(): [TabId, (tab: TabId) => void] {
  const [tab, setTab] = useState<TabId>("cards");

  useEffect(() => {
    const controller = new AbortController();
    const read = () => {
      const hash = window.location.hash.slice(1);
      setTab(isTab(hash) ? hash : "cards");
    };
    read();
    window.addEventListener("hashchange", read, { signal: controller.signal });
    return () => controller.abort();
  }, []);

  const select = (next: TabId) => {
    setTab(next);
    window.history.replaceState(null, "", next === "cards" ? " " : `#${next}`);
  };
  return [tab, select];
}

const since = (seconds: number) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }).format(
    seconds * 1000,
  );

function Cabinet({ user }: { user: User }) {
  const [tab, select] = useTab();
  const baseId = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = TABS.findIndex((item) => item.id === tab);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = TABS.length - 1;
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const back = event.key === "ArrowUp" || event.key === "ArrowLeft";
    const next = forward
      ? index === last
        ? 0
        : index + 1
      : back
        ? index === 0
          ? last
          : index - 1
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? last
            : null;
    if (next === null) return;
    event.preventDefault();
    const target = TABS[next];
    if (target === undefined) return;
    select(target.id);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-[12px] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-[20px]">
      <aside className="bg-ink text-canvas rounded-panel xl:rounded-panel-d xl:top-header-d flex flex-col gap-[20px] p-[16px] xl:sticky xl:mt-0 xl:gap-[28px] xl:p-[24px]">
        <div className="flex items-center gap-[14px] xl:flex-col xl:items-start">
          <span
            aria-hidden="true"
            className="bg-gold text-ink font-display text-h3 xl:text-h2-d flex size-[52px] shrink-0 items-center justify-center rounded-full font-medium uppercase xl:size-[72px]"
          >
            {user.email.slice(0, 1)}
          </span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <p className="font-ui text-card xl:text-card-d font-medium break-all">{user.email}</p>
            <p className="font-ui text-note text-gold">
              {t("account.since")} {since(user.createdAt)}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label={t("account.menu")}
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-[6px] xl:flex-col"
        >
          {TABS.map((item, i) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                ref={(element) => {
                  tabs.current[i] = element;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(item.id)}
                className={`font-ui text-note xl:text-card-d min-h-tap xl:rounded-inner flex shrink-0 items-center gap-[10px] rounded-full px-[16px] font-medium whitespace-nowrap transition-colors xl:px-[14px] ${
                  selected
                    ? "bg-gold text-ink"
                    : "text-canvas border-muted hover:bg-body border xl:border-transparent"
                }`}
              >
                <Icon name={item.icon} size={20} />
                {t(item.label)}
              </button>
            );
          })}
        </div>

        <div className="hidden xl:block">
          <LogoutButton tone="dark" />
        </div>
      </aside>

      <div className={PANEL}>
        {TABS.map((item) => (
          <div
            key={item.id}
            role="tabpanel"
            id={`${baseId}-panel-${item.id}`}
            aria-labelledby={`${baseId}-tab-${item.id}`}
            hidden={item.id !== tab}
          >
            {item.id !== tab ? null : item.id === "cards" ? (
              <CardsSection user={user} />
            ) : item.id === "plan" ? (
              <PlanSection user={user} />
            ) : (
              <SettingsSection user={user} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Status({ children }: { children: ReactNode }) {
  return (
    <div className={`${PANEL} flex flex-col items-start gap-[16px]`}>
      <div className={`${CARD} flex w-full flex-col items-start gap-[16px] p-[20px] xl:p-[32px]`}>
        {children}
      </div>
    </div>
  );
}

export function Account() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "guest") router.replace("/login?next=/account");
  }, [auth.status, router]);

  if (auth.status === "user") return <Cabinet user={auth.user} />;

  if (auth.status === "offline") {
    return (
      <Status>
        <p role="alert" className="font-ui text-card xl:text-card-d text-ink">
          {t("account.offline")}
        </p>
        <Button
          type="button"
          labelKey="account.retry"
          onClick={() => void refresh()}
          className="xl:w-auto"
        />
      </Status>
    );
  }

  return (
    <Status>
      <p aria-live="polite" className="font-ui text-card xl:text-card-d text-body">
        {t(auth.status === "guest" ? "account.guest.redirect" : "account.loading.cabinet")}
      </p>
      {auth.status === "guest" ? (
        <Link
          href="/login?next=/account"
          className="font-ui text-note text-ink underline underline-offset-4"
        >
          {t("nav.login")}
        </Link>
      ) : null}
    </Status>
  );
}
