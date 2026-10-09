/**
 * «Собери пару»: колода от зерна одинаковая, в ней ровно по две
 * карточки каждой пары, ходы и закрытие несовпавших считаются верно.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  dealDeck,
  flip,
  isComplete,
  isFaceUp,
  isMismatch,
  MEMORY_PAIRS,
  type MemoryState,
  newGame,
  settle,
} from "./memory.ts";

test("одно зерно — одна колода", () => {
  assert.deepEqual(dealDeck("dlya-druga", 6), dealDeck("dlya-druga", 6));
  assert.notDeepEqual(dealDeck("dlya-druga", 6), dealDeck("dlya-kolleg", 6));
});

test("в колоде по две карточки каждой пары, не больше шести пар", () => {
  const deck = dealDeck("x", 6);
  assert.equal(deck.length, 12);
  for (let pair = 0; pair < 6; pair += 1) {
    assert.equal(deck.filter((item) => item === pair).length, 2);
  }
  assert.equal(dealDeck("x", 40).length, MEMORY_PAIRS * 2);
  assert.equal(dealDeck("x", 3).length, 6);
  assert.deepEqual(dealDeck("x", 0), []);
  assert.deepEqual(dealDeck("x", -2), []);
});

/** Карточки, на которых лежит пара. */
function cardsOf(state: MemoryState, pair: number): number[] {
  return state.deck.flatMap((item, card) => (item === pair ? [card] : []));
}

test("совпали — пара открыта, ход засчитан", () => {
  const start = newGame("x", 6);
  const [a, b] = cardsOf(start, 0);
  assert.ok(a !== undefined && b !== undefined);
  const one = flip(start, a);
  assert.deepEqual(one.state.open, [a]);
  assert.equal(one.state.moves, 0);
  const two = flip(one.state, b);
  assert.equal(two.matched, 0);
  assert.deepEqual(two.state.matched, [0]);
  assert.deepEqual(two.state.open, []);
  assert.equal(two.state.moves, 1);
  assert.ok(isFaceUp(two.state, a) && isFaceUp(two.state, b));
});

test("не совпали — ждут закрытия, третья карточка закрывает их сразу", () => {
  const start = newGame("x", 6);
  const [a] = cardsOf(start, 0);
  const [b] = cardsOf(start, 1);
  const [c] = cardsOf(start, 2);
  assert.ok(a !== undefined && b !== undefined && c !== undefined);
  const missed = flip(flip(start, a).state, b);
  assert.equal(missed.matched, null);
  assert.ok(isMismatch(missed.state));
  assert.equal(missed.state.moves, 1);
  assert.deepEqual(settle(missed.state).open, []);
  const next = flip(missed.state, c);
  assert.deepEqual(next.state.open, [c]);
});

test("открытую и угаданную карточку второй раз не открыть", () => {
  const start = newGame("x", 6);
  const [a, b] = cardsOf(start, 0);
  assert.ok(a !== undefined && b !== undefined);
  const one = flip(start, a).state;
  assert.equal(flip(one, a).state, one);
  const done = flip(one, b).state;
  assert.equal(flip(done, a).state, done);
  assert.equal(flip(done, 99).state, done);
});

test("все пары угаданы — игра пройдена", () => {
  let state = newGame("x", 6);
  assert.equal(isComplete(state), false);
  for (let pair = 0; pair < 6; pair += 1) {
    const [a, b] = cardsOf(state, pair);
    assert.ok(a !== undefined && b !== undefined);
    state = flip(flip(state, a).state, b).state;
  }
  assert.equal(isComplete(state), true);
  assert.equal(state.moves, 6);
});
