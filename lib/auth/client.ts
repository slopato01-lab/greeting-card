"use client";

import { useSyncExternalStore } from "react";

import type { AuthError, PublicUser } from "./server.ts";

/**
 * Вход на стороне браузера: кто вошёл, запрос кода, проверка, выход.
 * Сервер — lib/auth/server.ts, адреса /api/auth/*.
 *
 * Состояние одно на вкладку, читается через useAuth(). Первый же
 * подписчик спрашивает /api/auth/me. Пока ответа нет, шапка смотрит
 * на подсказку в localStorage «в прошлый раз вы были вошедшим» —
 * иначе у вошедшего на миг мелькали бы кнопки «Войти»
 * и «Зарегистрироваться». Подсказка ничего не открывает: права
 * проверяет только сервер по cookie.
 */

export type User = PublicUser;

export type AuthState =
  | { status: "loading"; hint: boolean }
  | { status: "guest" }
  | { status: "user"; user: User }
  /** Сервер не ответил: нет сети или локальный `next dev` без функций. */
  | { status: "offline" };

const HINT_KEY = "otkrytochka.auth.hint";

function readHint(): boolean {
  try {
    return window.localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeHint(signedIn: boolean) {
  try {
    if (signedIn) window.localStorage.setItem(HINT_KEY, "1");
    else window.localStorage.removeItem(HINT_KEY);
  } catch {
    // Приватный режим: без подсказки просто мигнёт шапка.
  }
}

const SERVER_STATE: AuthState = { status: "loading", hint: false };

let state: AuthState | null = null;
let started = false;
const listeners = new Set<() => void>();

function set(next: AuthState) {
  state = next;
  if (next.status === "user") writeHint(true);
  if (next.status === "guest") writeHint(false);
  for (const listener of listeners) listener();
}

export async function refresh(): Promise<void> {
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (response.status === 401) return set({ status: "guest" });
    if (!response.ok) return set({ status: "offline" });
    const body: unknown = await response.json();
    const user = isUserBody(body) ? body.user : null;
    set(user === null ? { status: "guest" } : { status: "user", user });
  } catch {
    set({ status: "offline" });
  }
}

function isUserBody(body: unknown): body is { user: User } {
  if (typeof body !== "object" || body === null || !("user" in body)) return false;
  const { user } = body;
  return (
    typeof user === "object" &&
    user !== null &&
    "email" in user &&
    typeof user.email === "string" &&
    "freeLeft" in user &&
    typeof user.freeLeft === "number" &&
    "createdAt" in user &&
    typeof user.createdAt === "number"
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refresh();
  }
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): AuthState {
  state ??= { status: "loading", hint: readHint() };
  return state;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER_STATE);
}

// ── Действия ────────────────────────────────────────────────

export type ActionError = AuthError | "network";

export type ActionResult<T> =
  ({ ok: true } & T) | { ok: false; error: ActionError; retryIn?: number; left?: number };

async function post(path: string, body: unknown, signal?: AbortSignal): Promise<Response | null> {
  try {
    return await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...(signal === undefined ? {} : { signal }),
    });
  } catch {
    return null;
  }
}

async function failure(response: Response | null): Promise<ActionResult<never>> {
  if (response === null) return { ok: false, error: "network" };
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "error" in body) {
      const record = body as { error: unknown; retryIn?: unknown; left?: unknown };
      const error = typeof record.error === "string" ? (record.error as AuthError) : "bad_request";
      return {
        ok: false,
        error,
        ...(typeof record.retryIn === "number" ? { retryIn: record.retryIn } : {}),
        ...(typeof record.left === "number" ? { left: record.left } : {}),
      };
    }
  } catch {
    // Не JSON — например, 404 от `next dev`, где функций нет.
  }
  return { ok: false, error: "network" };
}

export async function requestCode(
  email: string,
  intent: "login" | "register",
  consent: boolean,
  signal?: AbortSignal,
): Promise<ActionResult<{ resendIn: number }>> {
  const response = await post("/api/auth/code", { email, intent, consent }, signal);
  if (response === null || !response.ok) return failure(response);
  const body = (await response.json().catch(() => null)) as { resendIn?: unknown } | null;
  return { ok: true, resendIn: typeof body?.resendIn === "number" ? body.resendIn : 60 };
}

export async function verifyCode(
  email: string,
  code: string,
  signal?: AbortSignal,
): Promise<ActionResult<{ user: User }>> {
  const response = await post("/api/auth/verify", { email, code }, signal);
  if (response === null || !response.ok) return failure(response);
  const body: unknown = await response.json().catch(() => null);
  if (!isUserBody(body)) return { ok: false, error: "network" };
  set({ status: "user", user: body.user });
  return { ok: true, user: body.user };
}

export async function logout(): Promise<boolean> {
  const response = await post("/api/auth/logout", {});
  if (response === null || !response.ok) return false;
  set({ status: "guest" });
  return true;
}

/**
 * Куда вернуть после входа. Только свой адрес: иначе ссылка
 * /login?next=https://чужой.сайт уводила бы туда вошедшего.
 */
export function safeNext(value: string | null): string {
  if (value === null || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}
