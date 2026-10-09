import { seededRandom } from "./seed.ts";

/**
 * Логика лабиринта без React и без рисования: уровни, движение шарика
 * со стенами, препятствия во времени, касания, выход.
 * Компонент — components/games/Maze.tsx.
 *
 * По идее design/игра лабиринт.MP4 (09.10.2026, просьба пользователя):
 * шарик ведут пальцем по коридорам, в конце — скример. Отличия:
 * три коротких уровня вместо длинной змейки — всё прохождение
 * укладывается в 30–60 секунд; появились препятствия.
 *
 * Координаты — в клетках: клетка (c, r) занимает [c, c+1] × [r, r+1],
 * её центр — (c + 0.5, r + 0.5). Время — секунды с начала уровня.
 *
 * Проиграть нельзя (docs/PRODUCT.md): задел препятствие — шарик
 * возвращается на последнюю контрольную точку уровня, и всё.
 */

export const MAZE_COLS = 9;
export const MAZE_ROWS = 13;
export const BALL_RADIUS = 0.28;

/** Толщина вращающейся планки, клетки. */
const SPINNER_WIDTH = 0.22;
/** Ворота считаются закрытыми, пока выдвинуты больше чем наполовину. */
const GATE_SOLID = 0.5;
/** Доля периода, за которую ворота выдвигаются или уходят в пол. */
const GATE_RAMP = 0.12;
/** Самый длинный шаг шарика за раз, клетки: быстрый палец не проскочит стену. */
const MAX_STEP = 0.1;
/** Насколько близко к центру выхода нужно подкатить, клетки. */
const EXIT_REACH = 0.42;

export type Point = { x: number; y: number };

export type Obstacle =
  /** Куб, который ездит туда-обратно между двумя точками. */
  | { kind: "slider"; from: Point; to: Point; size: number; period: number; phase: number }
  /** Планка через центр, крутится; `length` — от центра до конца. */
  | { kind: "spinner"; center: Point; length: number; speed: number; phase: number }
  /** Ворота в клетке: то выдвигаются из пола, то уходят в него. */
  | { kind: "gate"; cell: Point; period: number; open: number; phase: number };

/**
 * Уровень строками: `#` стена, `.` пол, `S` старт, `E` выход (подарок),
 * `C` контрольная точка, `=` клетка ворот — пол, сами ворота в obstacles.
 */
type LevelSpec = { map: readonly string[]; obstacles: readonly Obstacle[] };

export type Level = {
  walls: readonly boolean[];
  start: Point;
  exit: Point;
  /** Центры контрольных точек. */
  checkpoints: readonly Point[];
  obstacles: readonly Obstacle[];
};

/*
 * Три уровня, каждый на 10–15 секунд. Скорости и окна подобраны так,
 * чтобы препятствие нужно было переждать раз-другой, но не дольше
 * пары секунд. Первый — разминка с кубами, второй — планка и ворота,
 * третий — всё вместе.
 */
const SPECS: readonly LevelSpec[] = [
  {
    map: [
      "#########",
      "#S......#",
      "#.......#",
      "#.......#",
      "######C.#",
      "#.......#",
      "#.......#",
      "#.......#",
      "#C.######",
      "#.......#",
      "#.......#",
      "#......E#",
      "#########",
    ],
    obstacles: [
      {
        kind: "slider",
        from: { x: 4.5, y: 5.5 },
        to: { x: 4.5, y: 7.5 },
        size: 0.8,
        period: 2.4,
        phase: 0,
      },
      {
        kind: "slider",
        from: { x: 2.5, y: 9.5 },
        to: { x: 2.5, y: 11.5 },
        size: 0.8,
        period: 2,
        phase: 0.5,
      },
      {
        kind: "slider",
        from: { x: 5.5, y: 11.5 },
        to: { x: 5.5, y: 9.5 },
        size: 0.8,
        period: 2,
        phase: 0.25,
      },
    ],
  },
  {
    map: [
      "#########",
      "#S......#",
      "#.......#",
      "#####=###",
      "##.....##",
      "##.....##",
      "##.....##",
      "##.....##",
      "##.....##",
      "###=#####",
      "#..C....#",
      "#......E#",
      "#########",
    ],
    obstacles: [
      { kind: "gate", cell: { x: 5, y: 3 }, period: 2.2, open: 0.55, phase: 0 },
      { kind: "spinner", center: { x: 4.5, y: 6.5 }, length: 1.8, speed: 1.25, phase: 0.4 },
      { kind: "gate", cell: { x: 3, y: 9 }, period: 2, open: 0.55, phase: 0.5 },
    ],
  },
  {
    map: [
      "#########",
      "#S......#",
      "#####C..#",
      "#.......#",
      "#.......#",
      "#.......#",
      "#C.######",
      "#.......#",
      "#.......#",
      "#.......#",
      "######=##",
      "#E....C.#",
      "#########",
    ],
    obstacles: [
      {
        kind: "slider",
        from: { x: 5.5, y: 3.5 },
        to: { x: 5.5, y: 5.5 },
        size: 0.8,
        period: 1.8,
        phase: 0,
      },
      {
        kind: "slider",
        from: { x: 3.5, y: 5.5 },
        to: { x: 3.5, y: 3.5 },
        size: 0.8,
        period: 1.8,
        phase: 0.3,
      },
      { kind: "spinner", center: { x: 4.5, y: 8.5 }, length: 1.35, speed: -1.6, phase: 0 },
      { kind: "gate", cell: { x: 6, y: 10 }, period: 1.8, open: 0.55, phase: 0.2 },
    ],
  },
];

export const MAZE_LEVELS = SPECS.length;

function mirrorPoint(point: Point): Point {
  return { x: MAZE_COLS - point.x, y: point.y };
}

/** Ворота задаются клеткой, а не центром: зеркалить их надо по клеткам. */
function mirrorObstacle(obstacle: Obstacle): Obstacle {
  switch (obstacle.kind) {
    case "slider":
      return { ...obstacle, from: mirrorPoint(obstacle.from), to: mirrorPoint(obstacle.to) };
    case "spinner":
      return { ...obstacle, center: mirrorPoint(obstacle.center), speed: -obstacle.speed };
    case "gate":
      return { ...obstacle, cell: { x: MAZE_COLS - 1 - obstacle.cell.x, y: obstacle.cell.y } };
  }
}

function buildLevel(spec: LevelSpec, mirrored: boolean): Level {
  const walls: boolean[] = [];
  let start: Point = { x: 1.5, y: 1.5 };
  let exit: Point = { x: 1.5, y: 1.5 };
  const checkpoints: Point[] = [];
  for (let row = 0; row < MAZE_ROWS; row += 1) {
    const line = spec.map[row] ?? "";
    for (let col = 0; col < MAZE_COLS; col += 1) {
      const char = line[mirrored ? MAZE_COLS - 1 - col : col] ?? "#";
      walls.push(char === "#");
      const center = { x: col + 0.5, y: row + 0.5 };
      if (char === "S") start = center;
      if (char === "E") exit = center;
      if (char === "C") checkpoints.push(center);
    }
  }
  const obstacles = mirrored ? spec.obstacles.map(mirrorObstacle) : spec.obstacles;
  return { walls, start, exit, checkpoints, obstacles };
}

/**
 * Уровни открытки. Зерно решает, зеркальные они или нет: у одной
 * открытки лабиринт всегда один и тот же (Math.random запрещён).
 */
export function mazeLevels(seed: string): Level[] {
  const mirrored = seededRandom(`${seed}:maze`)() < 0.5;
  return SPECS.map((spec) => buildLevel(spec, mirrored));
}

export function isWall(level: Level, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= MAZE_COLS || row >= MAZE_ROWS) return true;
  return level.walls[row * MAZE_COLS + col] ?? true;
}

/** Выталкивает шарик из стен вокруг него. */
function resolveWalls(level: Level, ball: Point): Point {
  let { x, y } = ball;
  const col = Math.floor(x);
  const row = Math.floor(y);
  // Сначала ближайшая стена: прижатый к стене шарик она выталкивает
  // прямо, и угол соседней клетки уже не тормозит его вбок.
  const cells: [number, number][] = [];
  for (let r = row - 1; r <= row + 1; r += 1) {
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (isWall(level, c, r)) cells.push([c, r]);
    }
  }
  const gap = ([c, r]: [number, number]) =>
    Math.hypot(x - Math.max(c, Math.min(x, c + 1)), y - Math.max(r, Math.min(y, r + 1)));
  cells.sort((a, b) => gap(a) - gap(b));
  for (const [c, r] of cells) {
    const nearX = Math.max(c, Math.min(x, c + 1));
    const nearY = Math.max(r, Math.min(y, r + 1));
    const dx = x - nearX;
    const dy = y - nearY;
    const distance = Math.hypot(dx, dy);
    if (distance >= BALL_RADIUS) continue;
    if (distance > 1e-9) {
      const push = BALL_RADIUS - distance;
      x += (dx / distance) * push;
      y += (dy / distance) * push;
    } else {
      // Центр внутри стены — такого не бывает при коротких шагах,
      // но на всякий случай выталкиваем к ближайшему краю клетки.
      const left = x - c;
      const right = c + 1 - x;
      const top = y - r;
      const bottom = r + 1 - y;
      const least = Math.min(left, right, top, bottom);
      if (least === left) x = c - BALL_RADIUS;
      else if (least === right) x = c + 1 + BALL_RADIUS;
      else if (least === top) y = r - BALL_RADIUS;
      else y = r + 1 + BALL_RADIUS;
    }
  }
  return { x, y };
}

/**
 * Сдвигает шарик на (dx, dy) клеток, не пуская сквозь стены: вдоль
 * стены он скользит. Шаг дробится, чтобы быстрый палец не проскочил.
 */
export function moveBall(level: Level, ball: Point, dx: number, dy: number): Point {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / MAX_STEP));
  let current = ball;
  for (let step = 0; step < steps; step += 1) {
    current = resolveWalls(level, { x: current.x + dx / steps, y: current.y });
    current = resolveWalls(level, { x: current.x, y: current.y + dy / steps });
  }
  return current;
}

/** Доля периода в [0, 1). */
function cycle(time: number, period: number, phase: number): number {
  const value = time / period + phase;
  return value - Math.floor(value);
}

/** Где куб сейчас: туда-обратно с плавным разворотом. */
export function sliderAt(obstacle: Extract<Obstacle, { kind: "slider" }>, time: number): Point {
  const u = cycle(time, obstacle.period, obstacle.phase);
  const there = u < 0.5 ? u * 2 : 2 - u * 2;
  const eased = (1 - Math.cos(Math.PI * there)) / 2;
  return {
    x: obstacle.from.x + (obstacle.to.x - obstacle.from.x) * eased,
    y: obstacle.from.y + (obstacle.to.y - obstacle.from.y) * eased,
  };
}

/** Угол планки, радианы. */
export function spinnerAngle(
  obstacle: Extract<Obstacle, { kind: "spinner" }>,
  time: number,
): number {
  return obstacle.phase + obstacle.speed * time;
}

/**
 * Насколько ворота выдвинуты: 0 — в полу, 1 — стоят. Открыты первые
 * `open` долей периода, на краях плавно выезжают и уходят.
 */
export function gateHeight(obstacle: Extract<Obstacle, { kind: "gate" }>, time: number): number {
  const u = cycle(time, obstacle.period, obstacle.phase);
  if (u < obstacle.open) {
    // Открыто; в самом начале ещё доуходят в пол.
    return u < GATE_RAMP ? 1 - u / GATE_RAMP : 0;
  }
  const rising = (u - obstacle.open) / GATE_RAMP;
  return Math.min(1, rising);
}

function distanceToSegment(point: Point, a: Point, b: Point): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const length = abx * abx + aby * aby;
  const along = length === 0 ? 0 : ((point.x - a.x) * abx + (point.y - a.y) * aby) / length;
  const clamped = Math.max(0, Math.min(1, along));
  return Math.hypot(point.x - (a.x + abx * clamped), point.y - (a.y + aby * clamped));
}

/** Концы планки в момент `time`. */
export function spinnerEnds(
  obstacle: Extract<Obstacle, { kind: "spinner" }>,
  time: number,
): [Point, Point] {
  const angle = spinnerAngle(obstacle, time);
  const dx = Math.cos(angle) * obstacle.length;
  const dy = Math.sin(angle) * obstacle.length;
  const { x, y } = obstacle.center;
  return [
    { x: x - dx, y: y - dy },
    { x: x + dx, y: y + dy },
  ];
}

function touchesSquare(ball: Point, center: Point, half: number): boolean {
  const nearX = Math.max(center.x - half, Math.min(ball.x, center.x + half));
  const nearY = Math.max(center.y - half, Math.min(ball.y, center.y + half));
  return Math.hypot(ball.x - nearX, ball.y - nearY) < BALL_RADIUS;
}

/** Задел ли шарик какое-нибудь препятствие в момент `time`. */
export function hitsObstacle(level: Level, ball: Point, time: number): boolean {
  return level.obstacles.some((obstacle) => {
    switch (obstacle.kind) {
      case "slider":
        return touchesSquare(ball, sliderAt(obstacle, time), obstacle.size / 2);
      case "spinner": {
        const [a, b] = spinnerEnds(obstacle, time);
        return distanceToSegment(ball, a, b) < BALL_RADIUS + SPINNER_WIDTH / 2;
      }
      case "gate":
        return (
          gateHeight(obstacle, time) > GATE_SOLID &&
          touchesSquare(ball, { x: obstacle.cell.x + 0.5, y: obstacle.cell.y + 0.5 }, 0.42)
        );
    }
  });
}

/** Контрольная точка, на которой сейчас шарик, или null. */
export function checkpointAt(level: Level, ball: Point): Point | null {
  return (
    level.checkpoints.find(
      (point) => Math.abs(point.x - ball.x) < 0.5 && Math.abs(point.y - ball.y) < 0.5,
    ) ?? null
  );
}

export function reachedExit(level: Level, ball: Point): boolean {
  return Math.hypot(ball.x - level.exit.x, ball.y - level.exit.y) < EXIT_REACH;
}

export const SPINNER_THICKNESS = SPINNER_WIDTH;
