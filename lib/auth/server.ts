import { codeHash, randomCode, randomToken, sameString, sha256Hex } from "./crypto.ts";
import { isPremium } from "../editor/premium.ts";
import { parseCodeRequest, parseVerifyRequest } from "./validate.ts";

/**
 * Вход по коду на почту: серверная часть (Cloudflare Pages Functions,
 * functions/api/auth/*). Схема — migrations/0001_auth.sql, правила —
 * docs/SECURITY.md, «Аккаунты».
 *
 * Вход и регистрация — один путь: почта → код → сессия. Аккаунт
 * создаётся при первом верном коде. Ответ на запрос кода одинаков,
 * есть такой адрес в базе или нет, — по нему нельзя узнать, кто
 * зарегистрирован.
 *
 * Ни почта, ни код, ни токен не пишутся в лог.
 */

// ── Типы окружения ──────────────────────────────────────────
// Своё подмножество D1, а не @cloudflare/workers-types: новая
// зависимость ради четырёх методов не нужна.

export type D1Statement = {
  bind(...values: Array<string | number | null>): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
};

export type D1Database = {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<unknown[]>;
};

export type Env = {
  DB: D1Database;
  /** Ключ Resend. Нет ключа — письма не уходят, запрос кода отвечает 503. */
  RESEND_API_KEY?: string;
  /** Отправитель. Без своего домена Resend шлёт только с onboarding@resend.dev. */
  MAIL_FROM?: string;
  /** Адрес API писем. Меняется только для локальной проверки. */
  MAIL_API_URL?: string;
};

export type Context = { request: Request; env: Env };

// ── Сроки и пределы ─────────────────────────────────────────

const CODE_TTL = 10 * 60;
const SESSION_TTL = 30 * 24 * 60 * 60;
const RESEND_AFTER = 60;
const WINDOW = 60 * 60;
const PER_WINDOW = 5;
const MAX_ATTEMPTS = 5;
const FREE_CARDS = 2;

export const COOKIE = "sid";

const now = () => Math.floor(Date.now() / 1000);

// ── Ответы ──────────────────────────────────────────────────

export type AuthError =
  | "bad_request"
  | "too_soon"
  | "too_many"
  | "mail_unavailable"
  | "mail_failed"
  | "expired"
  | "wrong"
  | "unauthorized"
  | "limit"
  | "subscription";

export type PublicUser = { email: string; freeLeft: number; createdAt: number };

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

const fail = (error: AuthError, status: number, extra: Record<string, number> = {}) =>
  json({ error, ...extra }, status);

/**
 * Запросы, меняющие состояние, принимаются только как JSON и только
 * со своего сайта: чужая страница не отправит такой запрос без
 * предварительной проверки CORS, а её здесь нет.
 */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (origin !== null && origin !== new URL(request.url).origin) return false;
  return (request.headers.get("Content-Type") ?? "").startsWith("application/json");
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function sessionCookie(token: string, maxAge: number): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (header === null) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

// ── Письмо ──────────────────────────────────────────────────

async function sendCode(env: Env, email: string, code: string): Promise<boolean> {
  const key = env.RESEND_API_KEY;
  if (key === undefined || key === "") return false;
  const text = `Ваш код для входа в Открыточку: ${code}\n\nОн действует 10 минут. Если вы не запрашивали код, просто удалите это письмо.`;
  const response = await fetch(env.MAIL_API_URL ?? "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM ?? "Открыточка <onboarding@resend.dev>",
      to: [email],
      subject: `Код для входа: ${code}`,
      text,
      html: `<p>Ваш код для входа в Открыточку:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>Он действует 10 минут. Если вы не запрашивали код, просто удалите это письмо.</p>`,
    }),
  }).catch(() => null);
  return response !== null && response.ok;
}

// ── Обработчики ─────────────────────────────────────────────

type CodeRow = {
  code_hash: string | null;
  expires_at: number;
  attempts: number;
  sent_at: number;
  window_start: number;
  window_count: number;
};

/** POST /api/auth/code — { email, intent: "login" | "register", consent? } */
export async function requestCode({ request, env }: Context): Promise<Response> {
  if (!sameOrigin(request)) return fail("bad_request", 400);
  const body = parseCodeRequest(await readJson(request));
  if (body === null) return fail("bad_request", 400);
  if (env.RESEND_API_KEY === undefined || env.RESEND_API_KEY === "") {
    return fail("mail_unavailable", 503);
  }

  const time = now();
  const row = await env.DB.prepare(
    "SELECT code_hash, expires_at, attempts, sent_at, window_start, window_count FROM login_codes WHERE email = ?",
  )
    .bind(body.email)
    .first<CodeRow>();

  if (row !== null && time - row.sent_at < RESEND_AFTER) {
    return fail("too_soon", 429, { retryIn: RESEND_AFTER - (time - row.sent_at) });
  }
  const freshWindow = row === null || time - row.window_start >= WINDOW;
  const windowStart = freshWindow ? time : row.window_start;
  const windowCount = freshWindow ? 0 : row.window_count;
  if (windowCount >= PER_WINDOW) {
    return fail("too_many", 429, { retryIn: windowStart + WINDOW - time });
  }

  const code = randomCode();
  if (!(await sendCode(env, body.email, code))) return fail("mail_failed", 502);

  await env.DB.prepare(
    `INSERT INTO login_codes (email, code_hash, expires_at, attempts, sent_at, window_start, window_count)
     VALUES (?1, ?2, ?3, 0, ?4, ?5, ?6)
     ON CONFLICT (email) DO UPDATE SET
       code_hash = ?2, expires_at = ?3, attempts = 0, sent_at = ?4, window_start = ?5, window_count = ?6`,
  )
    .bind(
      body.email,
      await codeHash(body.email, code),
      time + CODE_TTL,
      time,
      windowStart,
      windowCount + 1,
    )
    .run();

  return json({ ok: true, resendIn: RESEND_AFTER });
}

/** POST /api/auth/verify — { email, code }. Верный код ставит cookie сессии. */
export async function verifyCode({ request, env }: Context): Promise<Response> {
  if (!sameOrigin(request)) return fail("bad_request", 400);
  const body = parseVerifyRequest(await readJson(request));
  if (body === null) return fail("bad_request", 400);

  const time = now();
  const row = await env.DB.prepare(
    "SELECT code_hash, expires_at, attempts FROM login_codes WHERE email = ?",
  )
    .bind(body.email)
    .first<Pick<CodeRow, "code_hash" | "expires_at" | "attempts">>();

  if (row === null || row.code_hash === null || row.expires_at <= time) {
    return fail("expired", 400);
  }
  if (row.attempts >= MAX_ATTEMPTS) return fail("too_many", 429);

  if (!sameString(row.code_hash, await codeHash(body.email, body.code))) {
    await env.DB.prepare("UPDATE login_codes SET attempts = attempts + 1 WHERE email = ?")
      .bind(body.email)
      .run();
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return left > 0 ? fail("wrong", 400, { left }) : fail("too_many", 429);
  }

  const token = randomToken();
  await env.DB.batch([
    // Код одноразовый; строка остаётся счётчиком отправок.
    env.DB.prepare("UPDATE login_codes SET code_hash = NULL, attempts = 0 WHERE email = ?").bind(
      body.email,
    ),
    env.DB.prepare(
      "INSERT INTO users (id, email, created_at, free_left) VALUES (?, ?, ?, ?) ON CONFLICT (email) DO NOTHING",
    ).bind(crypto.randomUUID(), body.email, time, FREE_CARDS),
    env.DB.prepare(
      "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) SELECT ?, id, ?, ? FROM users WHERE email = ?",
    ).bind(await sha256Hex(token), time, time + SESSION_TTL, body.email),
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(time),
  ]);

  const user = await env.DB.prepare(
    "SELECT email, free_left AS freeLeft, created_at AS createdAt FROM users WHERE email = ?",
  )
    .bind(body.email)
    .first<PublicUser>();

  return json({ user }, 200, { "Set-Cookie": sessionCookie(token, SESSION_TTL) });
}

/** Пользователь по cookie сессии или null. */
async function sessionUser(request: Request, env: Env): Promise<SessionUser | null> {
  const token = readCookie(request, COOKIE);
  if (token === null || !/^[\w-]{20,100}$/.test(token)) return null;
  return env.DB.prepare(
    `SELECT users.id AS id, users.email AS email, users.free_left AS freeLeft, users.created_at AS createdAt
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > ?`,
  )
    .bind(await sha256Hex(token), now())
    .first<SessionUser>();
}

type SessionUser = PublicUser & { id: string };

const publicUser = ({ email, freeLeft, createdAt }: SessionUser): PublicUser => ({
  email,
  freeLeft,
  createdAt,
});

/** GET /api/auth/me — { user } или 401 { user: null }. */
export async function me({ request, env }: Context): Promise<Response> {
  const user = await sessionUser(request, env);
  return user === null ? json({ user: null }, 401) : json({ user: publicUser(user) });
}

/** POST /api/auth/logout — снимает сессию этого устройства. */
export async function logout({ request, env }: Context): Promise<Response> {
  if (!sameOrigin(request)) return fail("bad_request", 400);
  const token = readCookie(request, COOKIE);
  if (token !== null) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(await sha256Hex(token))
      .run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}

// ── Лимит открыток ──────────────────────────────────────────

/**
 * POST /api/cards/claim — { cardKey }. Можно ли сохранить эту открытку
 * без водяного знака. Вызывается перед экспортом GIF и видео.
 *
 * - шаблон с короной — только по подписке (её пока ни у кого нет): 402;
 * - открытка уже засчитана — да, лимит не тратится;
 * - иначе тратится одна бесплатная; кончились — 402 { error: "limit" }.
 *
 * Списание атомарно: UPDATE с условием free_left > 0 и вставка в
 * user_cards идут одним batch, двойной клик не спишет две.
 */
export async function claimCard({ request, env }: Context): Promise<Response> {
  if (!sameOrigin(request)) return fail("bad_request", 400);
  const body = await readJson(request);
  const key =
    typeof body === "object" && body !== null && "cardKey" in body ? body.cardKey : undefined;
  if (typeof key !== "string" || !/^[a-z0-9-]{1,40}$/.test(key)) return fail("bad_request", 400);

  const user = await sessionUser(request, env);
  if (user === null) return fail("unauthorized", 401);
  if (isPremium(key)) return fail("subscription", 402);

  const claimed = await env.DB.prepare(
    "SELECT 1 AS found FROM user_cards WHERE user_id = ? AND card_key = ?",
  )
    .bind(user.id, key)
    .first<{ found: number }>();
  if (claimed !== null) return json({ ok: true, user: publicUser(user) });
  if (user.freeLeft <= 0) return fail("limit", 402);

  const time = now();
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO user_cards (user_id, card_key, created_at) SELECT ?1, ?2, ?3 FROM users WHERE id = ?1 AND free_left > 0 ON CONFLICT DO NOTHING",
    ).bind(user.id, key, time),
    env.DB.prepare(
      "UPDATE users SET free_left = free_left - 1 WHERE id = ? AND free_left > 0 AND changes() > 0",
    ).bind(user.id),
  ]);

  const after = await env.DB.prepare(
    `SELECT u.email AS email, u.free_left AS freeLeft, u.created_at AS createdAt,
       (SELECT COUNT(*) FROM user_cards c WHERE c.user_id = u.id AND c.card_key = ?) AS found
     FROM users u WHERE u.id = ?`,
  )
    .bind(key, user.id)
    .first<PublicUser & { found: number }>();
  if (after === null || after.found === 0) return fail("limit", 402);
  return json({
    ok: true,
    user: { email: after.email, freeLeft: after.freeLeft, createdAt: after.createdAt },
  });
}
