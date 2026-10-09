import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

import { hit, sweep } from "./limits.ts";
import type { D1Database, D1Statement } from "./server.ts";

/** D1 поверх node:sqlite — те же запросы, что уйдут в Cloudflare. */
function database(withTable = true): D1Database {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("../../migrations/0001_auth.sql", import.meta.url), "utf8"));
  if (withTable) {
    db.exec(
      readFileSync(new URL("../../migrations/0003_rate_limits.sql", import.meta.url), "utf8"),
    );
  }
  const statement = (query: string, values: Array<string | number | null>): D1Statement => ({
    bind: (...next) => statement(query, next),
    first: <T>() => Promise.resolve((db.prepare(query).get(...values) as T | undefined) ?? null),
    run: () => Promise.resolve(db.prepare(query).run(...values)),
  });
  return {
    prepare: (query) => statement(query, []),
    batch: (list) => Promise.all(list.map((item) => item.run())),
  };
}

const limit = { window: 60, max: 3 };

test("лимит: пропускает max запросов в окне, дальше — отказ со сроком", async () => {
  const db = database();
  for (let i = 0; i < 3; i += 1)
    assert.deepEqual(await hit(db, "k", limit, 1000 + i), { ok: true });
  assert.deepEqual(await hit(db, "k", limit, 1010), { ok: false, retryIn: 50 });
});

test("лимит: новое окно обнуляет счётчик", async () => {
  const db = database();
  for (let i = 0; i < 4; i += 1) await hit(db, "k", limit, 1000);
  assert.deepEqual(await hit(db, "k", limit, 1060), { ok: true });
  assert.deepEqual(await hit(db, "k", limit, 1061), { ok: true });
});

test("лимит: разные ключи считаются отдельно", async () => {
  const db = database();
  for (let i = 0; i < 4; i += 1) await hit(db, "a", limit, 1000);
  assert.deepEqual(await hit(db, "b", limit, 1000), { ok: true });
});

test("лимит: без таблицы запрос пропускается", async () => {
  assert.deepEqual(await hit(database(false), "k", limit, 1000), { ok: true });
});

test("уборка: удаляет только отжившие строки", async () => {
  const db = database();
  await hit(db, "old", limit, 0);
  await hit(db, "new", limit, 100_000);
  await sweep(db, 100_000, 3600);
  assert.deepEqual(await hit(db, "new", { window: 60, max: 1 }, 100_001), {
    ok: false,
    retryIn: 59,
  });
  const left = await db.prepare("SELECT COUNT(*) AS n FROM rate_limits").first<{ n: number }>();
  assert.equal(left?.n, 1);
});
