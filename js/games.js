/* ============================================================
   GAMES — 4 мини-игры: снежинки, шарики, сердечки, монеты.
   Все объекты рисуются векторно в цветах открытки — без эмодзи.
   API: startGame(type, canvas, opts), stopGame().
   ============================================================ */
'use strict';

let gameLoop = null;
let gameState = null;

function startGame(type, canvas, opts) {
  stopGame();

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth || canvas.parentElement.clientWidth || 360;
  const h = canvas.offsetHeight || 420;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  gameState = {
    type, ctx, canvas, opts,
    w, h,
    colors: [opts.accent, opts.accentLt, opts.ink],
    vinyl: opts.vinyl,
    score: 0, timeLeft: 30, running: true,
    items: [], bursts: [],
    lastSpawn: 0, spawnInterval: 750,
    lastTick: performance.now()
  };

  canvas.addEventListener('pointerdown', onPointer);

  gameState.timerInterval = setInterval(() => {
    if (!gameState || !gameState.running) return;
    gameState.timeLeft--;
    opts.onTimer(gameState.timeLeft);
    if (gameState.timeLeft <= 0) endGame();
  }, 1000);

  gameLoop = requestAnimationFrame(tick);
}

function stopGame() {
  if (gameLoop) { cancelAnimationFrame(gameLoop); gameLoop = null; }
  if (gameState) {
    clearInterval(gameState.timerInterval);
    gameState.canvas.removeEventListener('pointerdown', onPointer);
    gameState = null;
  }
}

function endGame() {
  const gs = gameState;
  gs.running = false;
  clearInterval(gs.timerInterval);
  gs.canvas.removeEventListener('pointerdown', onPointer);
  gs.opts.onEnd(gs.score);
}

window.startGame = startGame;
window.stopGame = stopGame;

/* ——— Игровой цикл ——— */
function tick(now) {
  if (!gameState || !gameState.running) return;
  const gs = gameState;
  const dt = Math.min(now - gs.lastTick, 50) / 16;
  gs.lastTick = now;

  if (now - gs.lastSpawn > gs.spawnInterval) {
    spawnItem(gs);
    gs.lastSpawn = now;
    gs.spawnInterval = Math.max(320, gs.spawnInterval - 7);
  }

  gs.items.forEach(it => {
    it.y += it.vy * dt;
    it.x += it.vx * dt;
    it.rot += it.rotSpeed * dt;
  });
  gs.items = gs.items.filter(it => it.y > -80 && it.y < gs.h + 80);

  gs.bursts.forEach(b => {
    b.life -= .04 * dt;
    b.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; });
  });
  gs.bursts = gs.bursts.filter(b => b.life > 0);

  draw(gs);
  gameLoop = requestAnimationFrame(tick);
}

function spawnItem(gs) {
  const up = gs.type === 'balloons';
  gs.items.push({
    x: 30 + Math.random() * (gs.w - 60),
    y: up ? gs.h + 50 : -50,
    vy: (up ? -1 : 1) * (1.4 + Math.random() * 1.8),
    vx: (Math.random() - .5) * 1.2,
    size: 20 + Math.random() * 14,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - .5) * .04,
    color: gs.colors[Math.floor(Math.random() * gs.colors.length)]
  });
}

/* ——— Отрисовка ——— */
function draw(gs) {
  const { ctx } = gs;
  ctx.clearRect(0, 0, gs.w, gs.h);

  gs.items.forEach(it => {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    drawShape(ctx, gs.type, it.size, it.color, gs.vinyl);
    ctx.restore();
  });

  gs.bursts.forEach(b => {
    ctx.save();
    ctx.globalAlpha = Math.max(b.life, 0);
    b.parts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    });
    if (b.life > .5) {
      ctx.font = '700 14px Onest, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = b.color;
      ctx.fillText('+1', b.x, b.y - 26 * (1 - b.life));
    }
    ctx.restore();
  });
}

function drawShape(ctx, type, s, color, vinyl) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  switch (type) {
    case 'snowflakes': {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const dx = Math.cos(a), dy = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(dx * s, dy * s);
        // насечки на луче
        ctx.moveTo(dx * s * .55 - dy * s * .2, dy * s * .55 + dx * s * .2);
        ctx.lineTo(dx * s * .75, dy * s * .75);
        ctx.lineTo(dx * s * .55 + dy * s * .2, dy * s * .55 - dx * s * .2);
        ctx.stroke();
      }
      break;
    }
    case 'balloons': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * .72, s * .88, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, s * .88);
      ctx.quadraticCurveTo(s * .25, s * 1.25, 0, s * 1.6);
      ctx.stroke();
      // блик
      ctx.fillStyle = vinyl;
      ctx.globalAlpha = .55;
      ctx.beginPath();
      ctx.ellipse(-s * .25, -s * .3, s * .16, s * .24, -.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'hearts': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, s * .85);
      ctx.bezierCurveTo(-s * 1.1, s * .15, -s * .6, -s * .75, 0, -s * .2);
      ctx.bezierCurveTo(s * .6, -s * .75, s * 1.1, s * .15, 0, s * .85);
      ctx.fill();
      break;
    }
    case 'coins': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, s * .8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = vinyl;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, s * .52, 0, Math.PI * 2);
      ctx.stroke();
      // искра на монете
      ctx.beginPath();
      ctx.moveTo(0, -s * .3);
      ctx.lineTo(0, s * .3);
      ctx.moveTo(-s * .3, 0);
      ctx.lineTo(s * .3, 0);
      ctx.stroke();
      break;
    }
  }
}

/* ——— Попадания ——— */
function onPointer(e) {
  if (!gameState || !gameState.running) return;
  e.preventDefault();
  const rect = gameState.canvas.getBoundingClientRect();
  checkHit(e.clientX - rect.left, e.clientY - rect.top);
}

function checkHit(mx, my) {
  const gs = gameState;
  for (let i = gs.items.length - 1; i >= 0; i--) {
    const it = gs.items[i];
    const dist = Math.hypot(mx - it.x, my - it.y);
    if (dist < it.size * 1.15) {
      gs.items.splice(i, 1);
      gs.score++;
      gs.opts.onScore(gs.score);
      gs.bursts.push({
        x: it.x, y: it.y,
        color: it.color,
        life: 1,
        parts: Array.from({ length: 7 }, (_, k) => {
          const a = k * Math.PI * 2 / 7;
          return { x: it.x, y: it.y, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6 };
        })
      });
      return;
    }
  }
}
