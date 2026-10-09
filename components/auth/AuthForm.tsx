"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { type ActionError, requestCode, safeNext, useAuth, verifyCode } from "@/lib/auth/client";
import { isCode, isEmail, normalizeCode, normalizeEmail } from "@/lib/auth/validate";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Вход и регистрация — одна форма в два шага: почта → код из письма.
 * Отличие регистрации — галочка согласия на обработку данных
 * (обязательна и на сервере) и подписи. Аккаунт создаётся при первом
 * верном коде, поэтому «Войти» с новой почтой тоже работает.
 *
 * Макета нет: панель и поля собраны из токенов страниц сайта
 * (серая панель, белая карточка, пилюли-кнопки).
 *
 * Состояния: ввод, отправка (кнопка в загрузке), ошибка под полем
 * (role="alert"), ожидание повторной отправки со счётчиком, успех —
 * переход в кабинет. Уже вошедшего сразу уводит туда же.
 */

type Mode = "login" | "register";

const FIELD =
  "font-ui text-card xl:text-card-d text-ink bg-paper border-line hover:border-muted " +
  "rounded-inner min-h-[52px] w-full border px-[16px] transition-colors " +
  "aria-invalid:border-ink disabled:cursor-not-allowed disabled:opacity-60";

const LABEL = "font-ui caps text-badge xl:text-badge-d text-body";

const LINK =
  "font-ui text-note xl:text-note-d text-ink min-h-tap inline-flex items-center " +
  "underline underline-offset-4 hover:text-gold-deep transition-colors";

function errorKey(error: ActionError, step: "email" | "code"): TextKey {
  if (error === "too_many" && step === "code") return "auth.error.too_many.code";
  return `auth.error.${error}`;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const auth = useAuth();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(() => Date.now());

  const emailId = useId();
  const codeId = useId();
  const consentId = useId();
  const errorId = useId();
  const codeRef = useRef<HTMLInputElement>(null);
  const requests = useRef<AbortController | null>(null);

  // Вошедшему здесь делать нечего.
  useEffect(() => {
    if (auth.status === "user") router.replace(next);
  }, [auth.status, next, router]);

  // Незавершённый запрос снимается вместе с формой.
  useEffect(() => () => requests.current?.abort(), []);

  // Счётчик до повторной отправки тикает, только пока он нужен.
  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  const fresh = () => {
    requests.current?.abort();
    requests.current = new AbortController();
    return requests.current.signal;
  };

  const send = async () => {
    const normalized = normalizeEmail(email);
    if (!isEmail(normalized)) return setError(t("auth.error.email"));
    if (mode === "register" && !consent) return setError(t("auth.error.consent"));
    setBusy(true);
    setError(null);
    const signal = fresh();
    const result = await requestCode(normalized, mode, consent, signal);
    // Пока ждали, нажали «Изменить почту» — ответ уже никому не нужен.
    if (signal.aborted) return;
    setBusy(false);
    if (!result.ok) {
      if (result.retryIn !== undefined) setResendAt(Date.now() + result.retryIn * 1000);
      // Код уже ушёл недавно — он в почте, можно сразу вводить.
      if (result.error === "too_soon" && step === "email") setStep("code");
      return setError(t(errorKey(result.error, "email")));
    }
    setEmail(normalized);
    setCode("");
    setResendAt(Date.now() + result.resendIn * 1000);
    setClock(Date.now());
    setStep("code");
  };

  const verify = async () => {
    const digits = normalizeCode(code);
    if (!isCode(digits)) return setError(t("auth.error.code"));
    setBusy(true);
    setError(null);
    const signal = fresh();
    const result = await verifyCode(normalizeEmail(email), digits, signal);
    if (signal.aborted) return;
    if (result.ok) return router.replace(next);
    setBusy(false);
    setError(
      result.error === "wrong" && result.left !== undefined
        ? `${t("auth.error.wrong")} ${result.left}`
        : t(errorKey(result.error, "code")),
    );
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    void (step === "email" ? send() : verify());
  };

  const waitSeconds = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  const describedBy = error === null ? undefined : errorId;

  if (auth.status === "user") {
    return (
      <p aria-live="polite" className="font-ui text-card xl:text-card-d text-body">
        {t("auth.done")}
      </p>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-[18px]">
      {step === "email" ? (
        <>
          <div className="flex flex-col gap-[8px]">
            <label htmlFor={emailId} className={LABEL}>
              {t("auth.email")}
            </label>
            <input
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              placeholder={t("auth.email.placeholder")}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
              aria-invalid={error !== null || undefined}
              aria-describedby={describedBy}
              className={FIELD}
            />
          </div>

          {mode === "register" ? (
            <div className="flex items-start gap-[12px]">
              <input
                id={consentId}
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                disabled={busy}
                className="accent-gold-deep mt-[3px] size-[20px] shrink-0"
              />
              <label
                htmlFor={consentId}
                className="font-ui text-note xl:text-note-d text-body leading-[1.5]"
              >
                {t("auth.consent")}.{" "}
                <Link href="/privacy" className="text-ink underline underline-offset-4">
                  {t("auth.consent.link")}
                </Link>
              </label>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="bg-paper rounded-inner flex items-start gap-[12px] p-[16px]">
            <Icon name="mail" size={24} className="text-gold-deep shrink-0" />
            <span className="font-ui text-note xl:text-note-d text-body leading-[1.5]">
              {t("auth.code.sent")} <strong className="text-ink break-all">{email}</strong>.{" "}
              {t("auth.code.hint")}
            </span>
          </p>
          <div className="flex flex-col gap-[8px]">
            <label htmlFor={codeId} className={LABEL}>
              {t("auth.code")}
            </label>
            <input
              ref={codeRef}
              id={codeId}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={7}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              disabled={busy}
              aria-invalid={error !== null || undefined}
              aria-describedby={describedBy}
              className={`${FIELD} font-display text-h3 tracking-[0.4em]`}
            />
          </div>
        </>
      )}

      {error === null ? null : (
        <p id={errorId} role="alert" className="font-ui text-note xl:text-note-d text-ink">
          {error}
        </p>
      )}

      <Button
        type="submit"
        labelKey={
          step === "email"
            ? busy
              ? "auth.sending"
              : "auth.send"
            : busy
              ? "auth.verifying"
              : "auth.verify"
        }
        loading={busy}
        disabled={busy}
      />

      {step === "code" ? (
        <div className="flex flex-wrap items-center justify-between gap-x-[16px]">
          {waitSeconds > 0 ? (
            <p aria-live="polite" className="font-ui text-note xl:text-note-d text-muted">
              {t("auth.resend.in")} {waitSeconds} {t("auth.seconds")}
            </p>
          ) : (
            <button type="button" onClick={() => void send()} disabled={busy} className={LINK}>
              {t("auth.resend")}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              requests.current?.abort();
              setBusy(false);
              setError(null);
              setStep("email");
            }}
            className={LINK}
          >
            {t("auth.change")}
          </button>
        </div>
      ) : (
        <p className="font-ui text-note xl:text-note-d text-body flex flex-wrap items-center gap-x-[8px]">
          {t(mode === "login" ? "auth.to-register" : "auth.to-login")}
          <Link
            href={`${mode === "login" ? "/register" : "/login"}${
              next === "/account" ? "" : `?next=${encodeURIComponent(next)}`
            }`}
            className={LINK}
          >
            {t(mode === "login" ? "nav.register" : "nav.login")}
          </Link>
        </p>
      )}
    </form>
  );
}
