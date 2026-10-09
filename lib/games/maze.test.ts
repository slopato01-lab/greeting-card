/**
 * Лабиринт: уровни проходимы, раскладка от зерна одинаковая, стены
 * не пускают, препятствия задевают, выход срабатывает.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BALL_RADIUS,
  checkpointAt,
  gateHeight,
  hitsObstacle,
  isWall,
  type Level,
  MAZE_COLS,
  MAZE_LEVELS,
  MAZE_ROWS,
  mazeLevels,
  moveBall,
  reachedExit,
  sliderAt,
} from "./maze.ts";

/** Путь по клеткам от старта до выхода, без учёта препятствий. */
function reachable(level: Level): boolean {
  const key = (c: number, r: number) => r * MAZE_COLS + c;
  const start = { c: Math.floor(level.start.x), r: Math.floor(level.start.y) };
  const goal = key(Math.floor(level.exit.x), Math.floor(level.exit.y));
  const seen = new Set([key(start.c, start.r)]);
  const queue = [start];
  while (queue.length > 0) {
    const cell = queue.shift();
    if (cell === undefined) break;
    if (key(cell.c, cell.r) === goal) return true;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const c = cell.c + dc;
      const r = cell.r + dr;
      if (isWall(level, c, r) || seen.has(key(c, r))) continue;
      seen.add(key(c, r));
      queue.push({ c, r });
    }
  }
  return false;
}

test("три уровня, у каждого есть путь от старта к выходу — и в зеркале тоже", () => {
  assert.equal(MAZE_LEVELS, 3);
  // Подбираем зерна обеих ориентаций.
  const seeds = ["a", "b", "c", "d", "e", "f"].map((seed) => mazeLevels(seed));
  const starts = new Set(seeds.map((levels) => levels[0]?.start.x));
  assert.equal(starts.size, 2, "среди зерен есть и обычный, и зеркальный лабиринт");
  for (const levels of seeds) {
    for (const level of levels) {
      assert.equal(level.walls.length, MAZE_COLS * MAZE_ROWS);
      assert.ok(reachable(level));
    }
  }
});

test("одно зерно — один лабиринт", () => {
  assert.deepEqual(mazeLevels("dlya-druga"), mazeLevels("dlya-druga"));
});

test("стена не пускает, вдоль стены шарик скользит", () => {
  const level = mazeLevels("x")[0];
  assert.ok(level !== undefined);
  const start = level.start;
  // Вверх — стена границы: шарик упирается радиусом в край клетки.
  const up = moveBall(level, start, 0, -3);
  assert.ok(Math.abs(up.y - (1 + BALL_RADIUS)) < 1e-6);
  // Вверх и вбок: вверх упёрся, вбок проехал.
  const slide = moveBall(level, start, start.x < 4 ? 2 : -2, -3);
  assert.ok(Math.abs(slide.x - start.x) > 1.9);
  // Огромный рывок вниз не проскакивает стену под коридором.
  const down = moveBall(level, start, 0, 50);
  assert.ok(down.y < 4);
});

test("куб ездит туда-обратно и задевает шарик", () => {
  const level = mazeLevels("x")[0];
  const slider = level?.obstacles[0];
  assert.ok(level !== undefined && slider?.kind === "slider");
  assert.deepEqual(sliderAt(slider, 0), slider.from);
  const middle = sliderAt(slider, slider.period / 2);
  assert.ok(Math.abs(middle.y - slider.to.y) < 1e-9);
  assert.equal(hitsObstacle(level, sliderAt(slider, 0.3), 0.3), true);
  assert.equal(hitsObstacle(level, level.start, 0), false);
});

test("ворота открыты, потом выдвигаются и задевают", () => {
  const level = mazeLevels("x")[1];
  const gate = level?.obstacles.find((item) => item.kind === "gate");
  assert.ok(level !== undefined && gate?.kind === "gate");
  const center = { x: gate.cell.x + 0.5, y: gate.cell.y + 0.5 };
  const openTime = ((0.3 - gate.phase + 1) % 1) * gate.period;
  const closedTime = ((0.9 - gate.phase + 1) % 1) * gate.period;
  assert.equal(gateHeight(gate, openTime), 0);
  assert.equal(gateHeight(gate, closedTime), 1);
  assert.equal(hitsObstacle(level, center, closedTime), true);
});

test("контрольная точка и выход находятся", () => {
  const level = mazeLevels("x")[0];
  assert.ok(level !== undefined);
  const point = level.checkpoints[0];
  assert.ok(point !== undefined);
  assert.deepEqual(checkpointAt(level, { x: point.x + 0.2, y: point.y - 0.2 }), point);
  assert.equal(checkpointAt(level, level.start), null);
  assert.equal(reachedExit(level, level.exit), true);
  assert.equal(reachedExit(level, level.start), false);
});
