import {
  BALL_RADIUS,
  gateHeight,
  type Level,
  MAZE_COLS,
  MAZE_ROWS,
  type Point,
  SPINNER_THICKNESS,
  sliderAt,
  spinnerEnds,
} from "./maze.ts";

/**
 * Рисование лабиринта на canvas — «псевдо-3D» (решение пользователя
 * 09.10.2026: без three.js). Вид сверху под углом: у стен есть высота
 * и передняя грань, всё отбрасывает тень, шарик — шар с бликом.
 * Ряды рисуются сверху вниз, поэтому ближние стены перекрывают
 * дальние и шарик за ними — как в настоящем объёме. Остальной наклон
 * даёт CSS-перспектива у холста (components/games/Maze.tsx).
 *
 * Цвета — только из токенов DESIGN.md: их значения компонент читает
 * из CSS-переменных и передаёт сюда. Пастель токенов для игры
 * «ярче» (просьба пользователя): тон берётся у токена, насыщенность
 * и светлота поднимаются здесь — см. tone(). Своих цветов нет.
 */

/** Высота стены, клетки. */
export const WALL_HEIGHT = 0.42;

/** Значения токенов, hex: читает компонент из :root. */
export type MazeTokens = {
  ink: string;
  paper: string;
  gold: string;
  goldDeep: string;
  pink: string;
  mint: string;
  sky: string;
  lilac: string;
};

type Hsl = { h: number; s: number; l: number };

function toHsl(hex: string): Hsl {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const value = match?.[1] === undefined ? 0 : parseInt(match[1], 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / d + 2) * 60
        : ((r - g) / d + 4) * 60;
  return { h, s, l };
}

/**
 * Тон токена с другой насыщенностью и светлотой, строкой hsl().
 * `alpha` — прозрачность, для теней и свечения.
 */
export function tone(hex: string, saturation: number, lightness: number, alpha = 1): string {
  const { h } = toHsl(hex);
  return `hsl(${h.toFixed(1)} ${(saturation * 100).toFixed(1)}% ${(lightness * 100).toFixed(1)}% / ${alpha})`;
}

/** Тот же токен, только прозрачнее. */
function fade(hex: string, alpha: number): string {
  const { s, l } = toHsl(hex);
  return tone(hex, s, l, alpha);
}

export type MazePalette = {
  floor: string;
  floorAlt: string;
  wallTop: string;
  wallFront: string;
  edge: string;
  shadow: string;
  block: string;
  blockFront: string;
  bar: string;
  barCap: string;
  ball: string;
  ballLight: string;
  ballDark: string;
  glow: string;
  glowEnd: string;
  gift: string;
  giftFront: string;
  ribbon: string;
};

/**
 * Палитра уровня: у каждого свой токен-основа (небо, мята, розовый),
 * препятствия — контрастным токеном, шарик и лента подарка — золото.
 */
export function levelPalette(tokens: MazeTokens, level: number): MazePalette {
  const bases = [tokens.sky, tokens.mint, tokens.pink] as const;
  const blocks = [tokens.pink, tokens.lilac, tokens.sky] as const;
  const base = bases[level % bases.length] ?? tokens.sky;
  const block = blocks[level % blocks.length] ?? tokens.pink;
  return {
    floor: base,
    floorAlt: tone(base, 0.55, 0.86),
    wallTop: tone(base, 0.78, 0.62),
    wallFront: tone(base, 0.62, 0.46),
    edge: fade(tokens.paper, 0.55),
    shadow: fade(tokens.ink, 0.2),
    block: tone(block, 0.88, 0.62),
    blockFront: tone(block, 0.7, 0.44),
    bar: tokens.ink,
    barCap: tone(tokens.gold, 0.9, 0.58),
    ball: tone(tokens.gold, 0.92, 0.56),
    ballLight: tokens.paper,
    ballDark: tokens.goldDeep,
    glow: fade(tokens.gold, 0.55),
    glowEnd: fade(tokens.gold, 0),
    gift: tone(tokens.pink, 0.85, 0.6),
    giftFront: tone(tokens.pink, 0.7, 0.45),
    ribbon: tone(tokens.gold, 0.92, 0.56),
  };
}

export type MazeView = {
  /** Сторона клетки в пикселях холста. */
  cell: number;
  /** Сдвиг поля вниз: место над верхним рядом для высоты стен. */
  top: number;
};

export function mazeView(width: number): MazeView {
  const cell = width / MAZE_COLS;
  return { cell, top: WALL_HEIGHT * cell };
}

/** Высота холста под ширину: ряды плюс запас на высоту стен. */
export function mazeHeight(width: number): number {
  return (width / MAZE_COLS) * (MAZE_ROWS + WALL_HEIGHT);
}

function box(
  ctx: CanvasRenderingContext2D,
  view: MazeView,
  x: number,
  y: number,
  w: number,
  d: number,
  height: number,
  top: string,
  front: string | null,
  edge: string | null,
) {
  const { cell } = view;
  const left = x * cell;
  const width = w * cell;
  const topY = view.top + (y - height) * cell;
  // Передняя грань: от верхней кромки до пола. Её нет, если впереди
  // такая же стена: та всё равно закроет, а на стыке был бы шов.
  if (front !== null) {
    ctx.fillStyle = front;
    ctx.fillRect(left, topY + d * cell, width, height * cell);
  }
  ctx.fillStyle = top;
  // Полпикселя внахлёст — без светлых щелей между соседними клетками.
  ctx.fillRect(left - 0.5, topY - 0.5, width + 1, d * cell + 1);
  if (edge !== null) {
    ctx.fillStyle = edge;
    ctx.fillRect(left, topY, width, Math.max(1, cell * 0.06));
  }
}

/**
 * Кадр лабиринта. `time` — секунды с начала уровня, `flash` — 0…1,
 * вспышка после касания препятствия.
 */
export function drawMaze(
  ctx: CanvasRenderingContext2D,
  view: MazeView,
  level: Level,
  time: number,
  ball: Point,
  palette: MazePalette,
  flash: number,
) {
  const { cell } = view;
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const px = (x: number) => x * cell;
  const py = (y: number, z = 0) => view.top + (y - z) * cell;

  // Пол в клетку.
  ctx.fillStyle = palette.floor;
  ctx.fillRect(0, view.top, MAZE_COLS * cell, MAZE_ROWS * cell);
  ctx.fillStyle = palette.floorAlt;
  for (let row = 0; row < MAZE_ROWS; row += 1) {
    for (let col = (row % 2) as number; col < MAZE_COLS; col += 2) {
      ctx.fillRect(px(col), py(row), cell, cell);
    }
  }

  // Тени на полу — вправо-вниз, стены потом закроют лишнее.
  ctx.fillStyle = palette.shadow;
  for (let row = 0; row < MAZE_ROWS; row += 1) {
    for (let col = 0; col < MAZE_COLS; col += 1) {
      if (level.walls[row * MAZE_COLS + col] === true) {
        ctx.fillRect(px(col + 0.22), py(row + 0.18), cell, cell);
      }
    }
  }
  for (const obstacle of level.obstacles) {
    if (obstacle.kind === "slider") {
      const at = sliderAt(obstacle, time);
      const half = obstacle.size / 2;
      ctx.fillRect(
        px(at.x - half + 0.18),
        py(at.y - half + 0.14),
        obstacle.size * cell,
        obstacle.size * cell,
      );
    } else if (obstacle.kind === "spinner") {
      const [a, b] = spinnerEnds(obstacle, time);
      ctx.strokeStyle = palette.shadow;
      ctx.lineCap = "round";
      ctx.lineWidth = SPINNER_THICKNESS * cell;
      ctx.beginPath();
      ctx.moveTo(px(a.x + 0.16), py(a.y + 0.16));
      ctx.lineTo(px(b.x + 0.16), py(b.y + 0.16));
      ctx.stroke();
    }
  }
  // Тень шарика.
  ctx.beginPath();
  ctx.ellipse(
    px(ball.x + 0.08),
    py(ball.y + 0.12),
    BALL_RADIUS * cell * 1.05,
    BALL_RADIUS * cell * 0.7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Свечение под подарком — дышит.
  const pulse = 0.5 + 0.5 * Math.sin(time * 4);
  const glow = ctx.createRadialGradient(
    px(level.exit.x),
    py(level.exit.y),
    0,
    px(level.exit.x),
    py(level.exit.y),
    cell * (0.75 + 0.15 * pulse),
  );
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, palette.glowEnd);
  ctx.fillStyle = glow;
  ctx.fillRect(px(level.exit.x - 1), py(level.exit.y - 1), cell * 2, cell * 2);

  // Контрольные точки — колечки на полу.
  ctx.strokeStyle = palette.edge;
  ctx.lineWidth = Math.max(1, cell * 0.06);
  for (const point of level.checkpoints) {
    ctx.beginPath();
    ctx.ellipse(px(point.x), py(point.y), cell * 0.3, cell * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ряд за рядом: стены, препятствия, подарок и шарик своего ряда.
  for (let row = 0; row < MAZE_ROWS; row += 1) {
    for (let col = 0; col < MAZE_COLS; col += 1) {
      if (level.walls[row * MAZE_COLS + col] !== true) continue;
      // Сплошная стена — одна плита: шов и кромка только по краям.
      const below = row + 1 < MAZE_ROWS && level.walls[(row + 1) * MAZE_COLS + col] === true;
      const above = row > 0 && level.walls[(row - 1) * MAZE_COLS + col] === true;
      box(
        ctx,
        view,
        col,
        row,
        1,
        1,
        WALL_HEIGHT,
        palette.wallTop,
        below ? null : palette.wallFront,
        above ? null : palette.edge,
      );
    }

    for (const obstacle of level.obstacles) {
      if (obstacle.kind === "gate" && obstacle.cell.y === row) {
        const raised = gateHeight(obstacle, time);
        if (raised <= 0) {
          // В полу — только щель, чтобы было видно, где ворота.
          ctx.fillStyle = palette.blockFront;
          ctx.fillRect(px(obstacle.cell.x + 0.1), py(row + 0.44), cell * 0.8, cell * 0.12);
          continue;
        }
        // Три столбика с перемычкой.
        const height = WALL_HEIGHT * 0.95 * raised;
        for (const offset of [0.12, 0.42, 0.72]) {
          box(
            ctx,
            view,
            obstacle.cell.x + offset,
            row + 0.4,
            0.16,
            0.2,
            height,
            palette.block,
            palette.blockFront,
            null,
          );
        }
        box(
          ctx,
          view,
          obstacle.cell.x + 0.08,
          row + 0.42,
          0.84,
          0.16,
          height,
          palette.block,
          palette.blockFront,
          palette.edge,
        );
      }
      if (obstacle.kind === "slider") {
        const at = sliderAt(obstacle, time);
        if (Math.floor(at.y) !== row) continue;
        const half = obstacle.size / 2;
        box(
          ctx,
          view,
          at.x - half,
          at.y - half,
          obstacle.size,
          obstacle.size,
          obstacle.size * 0.6,
          palette.block,
          palette.blockFront,
          palette.edge,
        );
      }
      if (obstacle.kind === "spinner" && Math.floor(obstacle.center.y) === row) {
        const [a, b] = spinnerEnds(obstacle, time);
        const lift = 0.26;
        // Ось.
        ctx.fillStyle = palette.bar;
        ctx.beginPath();
        ctx.ellipse(
          px(obstacle.center.x),
          py(obstacle.center.y, lift / 2),
          cell * 0.16,
          cell * 0.24,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Планка и блик.
        ctx.lineCap = "round";
        ctx.strokeStyle = palette.bar;
        ctx.lineWidth = SPINNER_THICKNESS * cell;
        ctx.beginPath();
        ctx.moveTo(px(a.x), py(a.y, lift));
        ctx.lineTo(px(b.x), py(b.y, lift));
        ctx.stroke();
        ctx.strokeStyle = palette.edge;
        ctx.lineWidth = SPINNER_THICKNESS * cell * 0.25;
        ctx.beginPath();
        ctx.moveTo(px(a.x), py(a.y, lift + 0.05));
        ctx.lineTo(px(b.x), py(b.y, lift + 0.05));
        ctx.stroke();
        // Золотые набалдашники на концах.
        ctx.fillStyle = palette.barCap;
        for (const end of [a, b]) {
          ctx.beginPath();
          ctx.arc(px(end.x), py(end.y, lift), SPINNER_THICKNESS * cell * 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Подарок на выходе — подпрыгивает.
    if (Math.floor(level.exit.y) === row) {
      const size = 0.68;
      const bob = 0.06 * pulse;
      const x = level.exit.x - size / 2;
      const y = level.exit.y - size / 2 - bob;
      box(ctx, view, x, y, size, size, size * 0.75, palette.gift, palette.giftFront, palette.edge);
      const topY = py(y, size * 0.75);
      ctx.fillStyle = palette.ribbon;
      ctx.fillRect(px(level.exit.x - 0.06), topY, cell * 0.12, cell * (size + size * 0.75));
      ctx.fillRect(px(x), topY + cell * (size / 2 - 0.06), cell * size, cell * 0.12);
      // Бант.
      ctx.beginPath();
      ctx.ellipse(
        px(level.exit.x - 0.12),
        topY + cell * size * 0.5,
        cell * 0.13,
        cell * 0.08,
        -0.5,
        0,
        Math.PI * 2,
      );
      ctx.ellipse(
        px(level.exit.x + 0.12),
        topY + cell * size * 0.5,
        cell * 0.13,
        cell * 0.08,
        0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    if (Math.floor(ball.y) === row) {
      const cx = px(ball.x);
      const cy = py(ball.y, BALL_RADIUS);
      const radius = BALL_RADIUS * cell;
      const shade = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.4,
        radius * 0.1,
        cx,
        cy,
        radius,
      );
      shade.addColorStop(0, palette.ballLight);
      shade.addColorStop(0.35, palette.ball);
      shade.addColorStop(1, palette.ballDark);
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (flash > 0) {
    ctx.fillStyle = palette.gift;
    ctx.globalAlpha = Math.min(1, flash) * 0.35;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}
