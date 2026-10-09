/**
 * История правок: отмена и возврат по шагам, лимит, обрыв ветки
 * «вперёд» новой правкой, фото из истории не теряются.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { createHistory, HISTORY_LIMIT, historyAssets, record, redo, undo } from "./history.ts";

test("отмена и возврат проходят шаги по порядку", () => {
  let history = createHistory("a");
  history = record(history, "b");
  history = record(history, "c");

  const back = undo(history);
  assert.equal(back?.present, "b");
  const backTwice = back === null ? null : undo(back);
  assert.equal(backTwice?.present, "a");
  assert.equal(backTwice === null ? "" : undo(backTwice), null);

  const forward = backTwice === null ? null : redo(backTwice);
  assert.equal(forward?.present, "b");
  assert.equal(forward === null ? null : redo(forward)?.present, "c");
});

test("то же состояние не становится шагом", () => {
  const history = record(createHistory("a"), "a");
  assert.equal(undo(history), null);
});

test("новая правка после отмены обрывает «вперёд»", () => {
  const history = undo(record(record(createHistory("a"), "b"), "c"));
  assert.ok(history !== null);
  const branched = record(history, "x");
  assert.equal(redo(branched), null);
  assert.equal(undo(branched)?.present, "b");
});

test("помнит не меньше 15 шагов и не больше лимита", () => {
  assert.ok(HISTORY_LIMIT >= 15);
  let history = createHistory("0");
  for (let step = 1; step <= HISTORY_LIMIT + 10; step += 1) history = record(history, String(step));
  assert.equal(history.past.length, HISTORY_LIMIT);
  let steps = 0;
  for (let back = undo(history); back !== null; back = undo(back)) steps += 1;
  assert.equal(steps, HISTORY_LIMIT);
});

test("до загрузки холста первая запись — начало истории", () => {
  const history = record(createHistory(null), "a");
  assert.equal(history.present, "a");
  assert.equal(undo(history), null);
});

test("фото из отменённых и прошлых шагов остаются нужными", () => {
  const photo = (id: string) => JSON.stringify({ layers: [{ kind: "image", asset: id }] });
  const history = undo(record(record(createHistory(photo("p1")), photo("p2")), photo("p3")));
  assert.ok(history !== null);
  assert.deepEqual([...historyAssets(history)].sort(), ["p1", "p2", "p3"]);
});
