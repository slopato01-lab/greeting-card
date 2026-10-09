/**
 * Фото-пазл: раскладка от зерна одинаковая, никогда не собрана сразу,
 * обмен и вырезка куска фото считаются верно.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { isSolved, pieceBackground, shuffledOrder, swapCells } from "./puzzle.ts";

test("одно зерно — одна раскладка", () => {
  assert.deepEqual(shuffledOrder("dlya-mamy"), shuffledOrder("dlya-mamy"));
  assert.notDeepEqual(shuffledOrder("dlya-mamy"), shuffledOrder("dlya-babushki"));
});

test("раскладка — перестановка девяти фрагментов, далёкая от собранной", () => {
  for (const seed of ["a", "b", "games-demo", "pervyy-novyy-god", ""]) {
    const order = shuffledOrder(seed);
    assert.deepEqual(
      [...order].sort((x, y) => x - y),
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
    );
    assert.ok(order.filter((piece, cell) => piece !== cell).length >= 6, seed);
    assert.equal(isSolved(order), false);
  }
});

test("обмен клеток не меняет исходный массив", () => {
  const order = [1, 0, 2, 3, 4, 5, 6, 7, 8];
  const next = swapCells(order, 0, 1);
  assert.deepEqual(order, [1, 0, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(isSolved(next), true);
  assert.deepEqual(swapCells(order, 0, 42), order);
});

test("квадратное фото режется ровно на три по каждой оси", () => {
  assert.deepEqual(pieceBackground(0, 1), {
    backgroundSize: "300% 300%",
    backgroundPosition: "0% 0%",
  });
  assert.deepEqual(pieceBackground(4, 1), {
    backgroundSize: "300% 300%",
    backgroundPosition: "50% 50%",
  });
  assert.deepEqual(pieceBackground(8, 1), {
    backgroundSize: "300% 300%",
    backgroundPosition: "100% 100%",
  });
});

test("широкое фото обрезается по центру, высота целиком", () => {
  // Фото 2:1 — фон шириной шесть клеток, поле занимает клетки 1.5…4.5.
  const left = pieceBackground(0, 2);
  assert.equal(left.backgroundSize, "600% 300%");
  assert.equal(left.backgroundPosition, `${(1.5 / 5) * 100}% 0%`);
  assert.equal(pieceBackground(2, 2).backgroundPosition, `${(3.5 / 5) * 100}% 0%`);
  // Битое соотношение не роняет игру — считаем фото квадратным.
  assert.equal(pieceBackground(0, Number.NaN).backgroundSize, "300% 300%");
});
