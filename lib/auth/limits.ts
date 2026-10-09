import type { D1Database } from "./server.ts";
import { sha256Hex } from "./crypto.ts";

/**
 * Лимиты частоты: фиксированное окно в таблице rate_limits
 * (migrations/0003_rate_limits.sql). Правила — docs/SECURITY.md,
 * «Лимиты запросов».
 *
 * Счётчик увеличивается одним UPSERT ... RETURNING: два параллельных
 * запроса не прочитают одно и то же значение.
 *
 * Нет таблицы (миграция ещё не применена) или база ответила ошибкой —
 * запрос пропускается: лимит не должен ломать вход.
 */

export type Limit = { window: number; max: number };

export const LIMITS = {
  /** Запрос кода с одного IP. */
  code: { window: 60 * 60, max: 10 },
  /** Проверка кода с одного IP. */
  verify: { window: 60, max: 20 },
  /** Списание бесплатной открытки с одного IP. */
  claim: { window: 60, max: 30 },
  /** Писем в сутки на весь сайт — ниже бесплатных 100 у Resend. */
  mail: { window: 24 * 60 * 60, max: 80 },
} satisfies Record<string, Limit>;

/** Самое длинное окно: строки старше него больше не нужны. */
const LONGEST = Math.max(...Object.values(LIMITS).map((limit) => limit.window));

export type LimitResult = { ok: true } | { ok: false; retryIn: number };

export async function hit(
  db: D1Database,
  key: string,
  { window, max }: Limit,
  time: number,
): Promise<LimitResult> {
  try {
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
         ON CONFLICT (key) DO UPDATE SET
           window_start = CASE WHEN ?2 - window_start >= ?3 THEN ?2 ELSE window_start END,
           count = CASE WHEN ?2 - window_start >= ?3 THEN 1 ELSE count + 1 END
         RETURNING window_start, count`,
      )
      .bind(key, time, window)
      .first<{ window_start: number; count: number }>();
    if (row === null || row.count <= max) return { ok: true };
    return { ok: false, retryIn: Math.max(1, row.window_start + window - time) };
  } catch {
    return { ok: true };
  }
}

/** Ключ лимита по IP. Cloudflare кладёт адрес клиента в CF-Connecting-IP. */
export function ipKey(scope: string, request: Request): Promise<string> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  return sha256Hex(`${scope}:${ip}`);
}

export const MAIL_KEY = "mail:day";

/** Удаляет отжившие строки лимитов и кодов входа. */
export async function sweep(db: D1Database, time: number, codeWindow: number): Promise<void> {
  try {
    await db
      .prepare("DELETE FROM rate_limits WHERE window_start <= ?")
      .bind(time - LONGEST)
      .run();
  } catch {
    // Таблицы ещё нет — чистить нечего.
  }
  await db
    .prepare("DELETE FROM login_codes WHERE window_start <= ?1 AND expires_at <= ?2")
    .bind(time - codeWindow, time)
    .run();
}
