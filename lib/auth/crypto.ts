import { CODE_LENGTH } from "./validate.ts";

/**
 * Случайные коды, токены сессий и их хэши — только Web Crypto:
 * он есть и в Cloudflare Workers, и в Node 22 (для тестов).
 */

const encoder = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Шестизначный код без перекоса: числа из верхнего «хвоста» 2³²,
 * который не делится на 10⁶ нацело, отбрасываются.
 */
export function randomCode(): string {
  const range = 10 ** CODE_LENGTH;
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0] ?? limit;
    if (value < limit) return String(value % range).padStart(CODE_LENGTH, "0");
  }
}

/** Токен сессии: 32 случайных байта в base64url — он уходит в cookie. */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Хэш кода привязан к почте: один и тот же код у двух адресов даёт разные хэши. */
export function codeHash(email: string, code: string): Promise<string> {
  return sha256Hex(`${email}:${code}`);
}

/** Сравнение строк одинаковой длины за одно и то же время. */
export function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
