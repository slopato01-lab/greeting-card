/**
 * Фото-пазл: раскладка от зерна одинаковая, никогда не собрана сразу,
 * обмен и вырезка куска фото считаются верно.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  canSwap,
  isLocked,
  isSolved,
  newlyPlaced,
  pieceBackground,
  shuffledOrder,
  swapCells,
} from "./puzzle.ts";

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

test("фрагмент на своём месте закреплён: ни утащить, ни заменить", () => {
  const order = [0, 2, 1, 3, 4, 5, 6, 8, 7];
  assert.equal(isLocked(order, 0), true);
  assert.equal(isLocked(order, 1), false);
  assert.equal(canSwap(order, 0, 1), false);
  assert.equal(canSwap(order, 1, 0), false);
  assert.equal(canSwap(order, 1, 2), true);
  assert.equal(canSwap(order, 1, 1), false);
  assert.equal(canSwap(order, 1, 42), false);
});

test("свечение — только у клеток, где фрагмент встал на место этим ходом", () => {
  const before = [0, 2, 1, 3, 4, 5, 6, 8, 7];
  assert.deepEqual(newlyPlaced(before, swapCells(before, 1, 2)), [1, 2]);
  const missed = [0, 2, 3, 1, 4, 5, 6, 7, 8];
  assert.deepEqual(newlyPlaced(missed, swapCells(missed, 1, 2)), [2]);
});

test("с закреплением пазл собирается из любой раскладки", () => {
  for (const seed of ["a", "b", "games-demo", "pervyy-novyy-god", ""]) {
    let order = shuffledOrder(seed);
    // Жадно: в первую свободную клетку ставим её фрагмент.
    for (let step = 0; step < 9 && !isSolved(order); step += 1) {
      const cell = order.findIndex((piece, index) => piece !== index);
      const from = order.indexOf(cell);
      assert.equal(canSwap(order, cell, from), true, seed);
      order = swapCells(order, cell, from);
    }
    assert.equal(isSolved(order), true, seed);
  }
});
