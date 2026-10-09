import assert from "node:assert/strict";
import { test } from "node:test";

import { codeHash, randomCode, randomToken, sameString, sha256Hex } from "./crypto.ts";
import {
  isCode,
  isEmail,
  normalizeEmail,
  parseCodeRequest,
  parseVerifyRequest,
} from "./validate.ts";

test("почта приводится к одному виду", () => {
  assert.equal(normalizeEmail("  Anna@Mail.RU "), "anna@mail.ru");
});

test("почта: простая проверка формы и длины", () => {
  assert.ok(isEmail("anna@mail.ru"));
  assert.ok(!isEmail("anna@mail"));
  assert.ok(!isEmail("anna mail@mail.ru"));
  assert.ok(!isEmail(""));
  assert.ok(!isEmail(`${"a".repeat(250)}@b.ru`));
});

test("код — ровно шесть цифр", () => {
  assert.ok(isCode("012345"));
  assert.ok(!isCode("12345"));
  assert.ok(!isCode("12345a"));
});

test("регистрация без согласия не принимается", () => {
  assert.equal(parseCodeRequest({ email: "a@b.ru", intent: "register" }), null);
  assert.deepEqual(parseCodeRequest({ email: "A@b.ru", intent: "register", consent: true }), {
    email: "a@b.ru",
    intent: "register",
  });
  assert.deepEqual(parseCodeRequest({ email: "a@b.ru", intent: "login" }), {
    email: "a@b.ru",
    intent: "login",
  });
});

test("чужие тела запросов отвергаются", () => {
  for (const body of [null, [], "a@b.ru", { email: 1, intent: "login" }, { email: "a@b.ru" }]) {
    assert.equal(parseCodeRequest(body), null);
  }
  assert.equal(parseVerifyRequest({ email: "a@b.ru", code: "12 34" }), null);
  assert.deepEqual(parseVerifyRequest({ email: "a@b.ru", code: "123 456" }), {
    email: "a@b.ru",
    code: "123456",
  });
});

test("случайный код: шесть цифр, разные значения", () => {
  const codes = new Set(Array.from({ length: 200 }, randomCode));
  for (const code of codes) assert.ok(isCode(code));
  assert.ok(codes.size > 190);
});

test("токен сессии: base64url, 43 знака, не повторяется", () => {
  const a = randomToken();
  assert.match(a, /^[\w-]{43}$/);
  assert.notEqual(a, randomToken());
});

test("хэш кода зависит от почты", async () => {
  assert.notEqual(await codeHash("a@b.ru", "123456"), await codeHash("c@d.ru", "123456"));
  assert.equal((await sha256Hex("")).length, 64);
});

test("сравнение строк", () => {
  assert.ok(sameString("abc", "abc"));
  assert.ok(!sameString("abc", "abd"));
  assert.ok(!sameString("abc", "ab"));
});
