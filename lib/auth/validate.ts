/**
 * Проверка входных данных входа по коду. Общая для форм на сайте
 * и для серверных функций functions/api/auth/*: на сервере она — граница
 * API, в браузере — только подсказка до отправки.
 *
 * Без зависимостей и без DOM: тесты гоняются `node --test`.
 */

/** Предел RFC 5321 для адреса целиком. */
export const EMAIL_MAX = 254;
export const CODE_LENGTH = 6;

/**
 * Почта приводится к одному виду: без пробелов по краям, строчными.
 * Иначе «Anna@Mail.ru» и «anna@mail.ru» стали бы двумя аккаунтами.
 */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Намеренно простая проверка: что-то@что-то.что-то, без пробелов.
 * Настоящую проверку делает письмо с кодом — дошло, значит адрес верный.
 */
export function isEmail(value: string): boolean {
  if (value.length === 0 || value.length > EMAIL_MAX) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Код из письма: ровно шесть цифр. Пробелы, которые вставились с кодом, убираются. */
export function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "");
}

export function isCode(value: string): boolean {
  return new RegExp(`^\\d{${CODE_LENGTH}}$`).test(value);
}

export type CodeRequest = { email: string; intent: "login" | "register" };
export type VerifyRequest = { email: string; code: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Тело запроса кода. Регистрация без согласия на обработку данных
 * не принимается — галочка в форме обязательна и на сервере.
 */
export function parseCodeRequest(body: unknown): CodeRequest | null {
  if (!isRecord(body)) return null;
  const { email, intent, consent } = body;
  if (typeof email !== "string") return null;
  if (intent !== "login" && intent !== "register") return null;
  if (intent === "register" && consent !== true) return null;
  const normalized = normalizeEmail(email);
  if (!isEmail(normalized)) return null;
  return { email: normalized, intent };
}

export function parseVerifyRequest(body: unknown): VerifyRequest | null {
  if (!isRecord(body)) return null;
  const { email, code } = body;
  if (typeof email !== "string" || typeof code !== "string") return null;
  const normalized = normalizeEmail(email);
  const digits = normalizeCode(code);
  if (!isEmail(normalized) || !isCode(digits)) return null;
  return { email: normalized, code: digits };
}
