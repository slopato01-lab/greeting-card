/* ============================================================
   GAMES — 8 мини-игр на четырёх механиках:
   тап        — снежинки, шарики, сердечки, монеты;
   ловля      — букет (8 Марта): ваза следует за пальцем;
   тайминг    — салют (23 Февраля), кольцо (свадьба);
   жонглирование — шапочка (выпускной).
   Все объекты рисуются векторно в цветах открытки — без эмодзи.
   API: startGame(type, canvas, opts), stopGame().
   ============================================================ */
'use strict';

const GAME_MODES = {
  snowflakes: 'tap', balloons: 'tap', hearts: 'tap', coins: 'tap',
  bouquet: 'catch', salute: 'salute', rings: 'rings', caps: 'juggle'
};

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
    type, mode: GAME_MODES[type] || 'tap', ctx, canvas, opts,
    w, h,
    colors: [opts.accent, opts.accentLt, opts.ink],
    vinyl: opts.vinyl,
    score: 0, timeLeft: 30, running: true,
    items: [], bursts: [],
    lastSpawn: 0, spawnInterval: 750,
    lastTick: performance.now()
  };

  initMode(gameState);

  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointermove', onPointerMove);

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
    gameState.canvas.removeEventListener('pointermove', onPointerMove);
    gameState = null;
  }
}

function endGame() {
  const gs = gameState;
  gs.running = false;
  clearInterval(gs.timerInterval);
  gs.canvas.removeEventListener('pointerdown', onPointer);
  gs.canvas.removeEventListener('pointermove', onPointerMove);
  gs.opts.onEnd(gs.score);
}

window.startGame = startGame;
window.stopGame = stopGame;

function initMode(gs) {
  switch (gs.mode) {
    case 'catch':
      gs.vaseX = gs.w / 2;
      gs.spawnInterval = 950;
      break;
    case 'salute':
      gs.rocket = null;
      gs.launched = 0;
      gs.nextLaunch = performance.now() + 500;
      gs.bandTop = gs.h * .16;
      gs.bandBot = gs.h * .34;
      break;
    case 'rings':
      gs.pegX = gs.w / 2;
      gs.pegTop = gs.h - 108;
      gs.stack = 0;
      gs.fails = [];
      newRing(gs);
      break;
    case 'juggle':
      gs.nextCap = 0;
      spawnCap(gs, gs.w / 2);
      break;
  }
}

/* ——— Игровой цикл ——— */
function tick(now) {
  if (!gameState || !gameState.running) return;
  const gs = gameState;
  const dt = Math.min(now - gs.lastTick, 50) / 16;
  gs.lastTick = now;

  switch (gs.mode) {
    case 'tap': updateTap(gs, dt, now); break;
    case 'catch': updateCatch(gs, dt, now); break;
    case 'salute': updateSalute(gs, dt, now); break;
    case 'rings': updateRings(gs, dt); break;
    case 'juggle': updateJuggle(gs, dt, now); break;
  }

  gs.bursts.forEach(b => {
    b.life -= .04 * dt;
    b.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; });
  });
  gs.bursts = gs.bursts.filter(b => b.life > 0);

  draw(gs);
  gameLoop = requestAnimationFrame(tick);
}

function addScore(gs, pts) {
  gs.score += pts;
  gs.opts.onScore(gs.score);
}

function addBurst(gs, x, y, color, label, n = 7, speed = 2.6) {
  gs.bursts.push({
    x, y, color, label, life: 1,
    parts: Array.from({ length: n }, (_, k) => {
      const a = k * Math.PI * 2 / n;
      return { x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed };
    })
  });
}

/* ——— Тап: предметы летят, попадание — по касанию ——— */
function updateTap(gs, dt, now) {
  if (now - gs.lastSpawn > gs.spawnInterval) {
    spawnTapItem(gs);
    gs.lastSpawn = now;
    gs.spawnInterval = Math.max(320, gs.spawnInterval - 7);
  }
  gs.items.forEach(it => {
    it.y += it.vy * dt;
    it.x += it.vx * dt;
    it.rot += it.rotSpeed * dt;
  });
  gs.items = gs.items.filter(it => it.y > -80 && it.y < gs.h + 80);
}

function spawnTapItem(gs) {
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

/* ——— Ловля: веточки мимозы падают, ваза следует за пальцем ——— */
function updateCatch(gs, dt, now) {
  if (now - gs.lastSpawn > gs.spawnInterval) {
    gs.items.push({
      x: 40 + Math.random() * (gs.w - 80),
      y: -40,
      vy: 1.8 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      size: 18 + Math.random() * 8,
      rot: (Math.random() - .5) * .5,
      color: gs.colors[0]
    });
    gs.lastSpawn = now;
    gs.spawnInterval = Math.max(480, gs.spawnInterval - 12);
  }
  gs.items.forEach(it => {
    it.y += it.vy * dt;
    it.x += Math.sin(now / 420 + it.phase) * .6 * dt;
    if (it.y > gs.h - 56 && it.y < gs.h - 30 && Math.abs(it.x - gs.vaseX) < 40) {
      it.caught = true;
      addScore(gs, 1);
      addBurst(gs, it.x, gs.h - 56, gs.colors[0], '+1', 6, 2);
    }
  });
  gs.items = gs.items.filter(it => !it.caught && it.y < gs.h + 40);
}

/* ——— Салют: залп летит вверх, тап — взрыв; в зоне между линиями — вдвое дороже ——— */
function updateSalute(gs, dt, now) {
  if (!gs.rocket && now >= gs.nextLaunch) {
    gs.rocket = {
      x: gs.w * (.2 + Math.random() * .6),
      y: gs.h + 16,
      vy: -(4.4 + Math.min(gs.launched * .09, 1.8))
    };
  }
  const r = gs.rocket;
  if (r) {
    r.y += r.vy * dt;
    if (r.y < -24) { gs.rocket = null; gs.launched++; gs.nextLaunch = now + 280; }
  }
}

function resolveSalute(gs) {
  const r = gs.rocket;
  gs.rocket = null;
  gs.launched++;
  gs.nextLaunch = performance.now() + 280;
  if (r.y >= gs.bandTop && r.y <= gs.bandBot) {
    addScore(gs, 2);
    addBurst(gs, r.x, r.y, gs.colors[0], '+2', 12, 3.6);
  } else {
    /* вне зоны — пшик без очков, иначе спам выгоднее прицельного тапа */
    addBurst(gs, r.x, r.y, gs.colors[1], '', 5, 1.6);
  }
}

/* ——— Кольцо: ездит по горизонтали, тап — сброс на стойку ——— */
function newRing(gs) {
  gs.ring = {
    x: 40, y: 58,
    vx: 3 + Math.min(gs.stack * .3, 2.4),
    vy: 0, dropping: false
  };
}

function updateRings(gs, dt) {
  const r = gs.ring;
  if (r) {
    if (!r.dropping) {
      r.x += r.vx * dt;
      if (r.x < 38 || r.x > gs.w - 38) { r.vx *= -1; r.x = Math.max(38, Math.min(gs.w - 38, r.x)); }
    } else {
      r.vy += .5 * dt;
      r.y += r.vy * dt;
      if (r.y >= gs.pegTop) {
        if (Math.abs(r.x - gs.pegX) < 20) {
          gs.stack++;
          addScore(gs, 1);
          addBurst(gs, gs.pegX, gs.pegTop, gs.colors[0], '+1', 8, 2.4);
        } else {
          gs.fails.push({ x: r.x, y: r.y, vy: r.vy, alpha: 1 });
        }
        newRing(gs);
      }
    }
  }
  gs.fails.forEach(f => {
    f.vy += .5 * dt;
    f.y += f.vy * dt;
    f.alpha -= .05 * dt;
  });
  gs.fails = gs.fails.filter(f => f.alpha > 0 && f.y < gs.h + 30);
}

/* ——— Жонглирование: шапочка падает, тап подбрасывает её ——— */
function spawnCap(gs, x) {
  gs.items.push({
    x, y: gs.h + 30,
    vy: -(9 + Math.random() * 1.5),
    vx: (Math.random() - .5) * 1.6,
    size: 26,
    rot: (Math.random() - .5) * .3,
    rotSpeed: (Math.random() - .5) * .05,
    color: gs.colors[gs.items.length % 3]
  });
}

function updateJuggle(gs, dt, now) {
  gs.items.forEach(it => {
    it.vy += .16 * dt;
    it.y += it.vy * dt;
    it.x += it.vx * dt;
    if (it.x < 30 || it.x > gs.w - 30) { it.vx *= -1; it.x = Math.max(30, Math.min(gs.w - 30, it.x)); }
    it.rot += it.rotSpeed * dt;
  });
  gs.items = gs.items.filter(it => it.y < gs.h + 50);

  /* со временем шапочек становится больше */
  const allowed = gs.timeLeft > 20 ? 1 : gs.timeLeft > 10 ? 2 : 3;
  if (gs.items.length < allowed && now > gs.nextCap) {
    spawnCap(gs, gs.w * (.3 + Math.random() * .4));
    gs.nextCap = now + 600;
  }
}

/* ——— Отрисовка ——— */
function draw(gs) {
  const { ctx } = gs;
  ctx.clearRect(0, 0, gs.w, gs.h);

  switch (gs.mode) {
    case 'salute': drawSaluteScene(gs); break;
    case 'rings': drawRingsScene(gs); break;
  }

  gs.items.forEach(it => {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    drawShape(ctx, gs.type, it.size, it.color, gs.vinyl);
    ctx.restore();
  });

  if (gs.mode === 'catch') drawVase(gs);

  gs.bursts.forEach(b => {
    ctx.save();
    ctx.globalAlpha = Math.max(b.life, 0);
    b.parts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    });
    if (b.life > .5 && b.label) {
      ctx.font = "500 14px 'Golos Text', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = b.color;
      ctx.fillText(b.label, b.x, b.y - 26 * (1 - b.life));
    }
    ctx.restore();
  });
}

function drawVase(gs) {
  const { ctx, h } = gs;
  const x = gs.vaseX;
  /* собранные веточки торчат из вазы */
  const n = Math.min(gs.score, 7);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * .3;
    const ex = x + Math.cos(a) * 27, ey = h - 44 + Math.sin(a) * 27;
    ctx.strokeStyle = gs.colors[2];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, h - 42);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = gs.colors[0];
    ctx.fill();
  }
  ctx.strokeStyle = gs.colors[2];
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 30, h - 46);
  ctx.lineTo(x - 20, h - 10);
  ctx.lineTo(x + 20, h - 10);
  ctx.lineTo(x + 30, h - 46);
  ctx.closePath();
  ctx.fillStyle = gs.vinyl;
  ctx.fill();
  ctx.stroke();
}

function drawSaluteScene(gs) {
  const { ctx, w } = gs;
  ctx.save();
  ctx.strokeStyle = gs.colors[1];
  ctx.globalAlpha = .7;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 8]);
  [gs.bandTop, gs.bandBot].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(w - 16, y);
    ctx.stroke();
  });
  ctx.restore();

  const r = gs.rocket;
  if (r) {
    ctx.save();
    ctx.strokeStyle = gs.colors[1];
    ctx.globalAlpha = .7;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + 22);
    ctx.lineTo(r.x, r.y + 6);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(r.x, r.y, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = gs.colors[0];
    ctx.fill();
  }
}

function drawRingsScene(gs) {
  const { ctx, h } = gs;
  /* стойка */
  ctx.strokeStyle = gs.colors[2];
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(gs.pegX, h - 20);
  ctx.lineTo(gs.pegX, h - 104);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(gs.pegX, h - 16, 26, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  /* надетые кольца */
  ctx.strokeStyle = gs.colors[0];
  ctx.lineWidth = 3.5;
  for (let i = 0; i < Math.min(gs.stack, 9); i++) {
    ctx.beginPath();
    ctx.ellipse(gs.pegX, h - 28 - i * 7, 20, 6.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  /* летящее кольцо */
  const r = gs.ring;
  if (r) {
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, 22, 7.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  /* промахи падают и тают */
  gs.fails.forEach(f => {
    ctx.save();
    ctx.globalAlpha = Math.max(f.alpha, 0);
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, 22, 7.5, 0, 0, Math.PI * 2);
    ctx.stroke();
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
    case 'bouquet': {
      // веточка мимозы: стебель и гроздь
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * .2, s * .9);
      ctx.quadraticCurveTo(s * .1, s * .1, s * .35, -s * .55);
      ctx.stroke();
      ctx.fillStyle = color;
      const dots = [[.35, -.6], [.6, -.35], [.08, -.32], [.42, -.12], [.72, -.05]];
      dots.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * s, dy * s, s * .17, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'caps': {
      // конфедератка: доска, тулья, кисточка
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(0, -s * .42);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s * .42);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = .82;
      ctx.beginPath();
      ctx.moveTo(-s * .42, s * .22);
      ctx.lineTo(-s * .42, s * .6);
      ctx.lineTo(s * .42, s * .6);
      ctx.lineTo(s * .42, s * .22);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = vinyl;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -s * .38);
      ctx.lineTo(s * .74, -s * .18);
      ctx.lineTo(s * .74, s * .3);
      ctx.stroke();
      ctx.fillStyle = vinyl;
      ctx.beginPath();
      ctx.arc(s * .74, s * .34, 2.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

/* ——— Касания ——— */
function onPointer(e) {
  if (!gameState || !gameState.running) return;
  e.preventDefault();
  const gs = gameState;
  const rect = gs.canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  switch (gs.mode) {
    case 'tap': checkTapHit(gs, mx, my); break;
    case 'catch': gs.vaseX = Math.max(34, Math.min(gs.w - 34, mx)); break;
    case 'salute': if (gs.rocket) resolveSalute(gs); break;
    case 'rings': if (gs.ring && !gs.ring.dropping) { gs.ring.dropping = true; gs.ring.vy = 2; } break;
    case 'juggle': checkJuggleHit(gs, mx, my); break;
  }
}

function onPointerMove(e) {
  if (!gameState || !gameState.running || gameState.mode !== 'catch') return;
  const rect = gameState.canvas.getBoundingClientRect();
  gameState.vaseX = Math.max(34, Math.min(gameState.w - 34, e.clientX - rect.left));
}

function checkTapHit(gs, mx, my) {
  for (let i = gs.items.length - 1; i >= 0; i--) {
    const it = gs.items[i];
    const dist = Math.hypot(mx - it.x, my - it.y);
    if (dist < it.size * 1.15) {
      gs.items.splice(i, 1);
      addScore(gs, 1);
      addBurst(gs, it.x, it.y, it.color, '+1');
      return;
    }
  }
}

function checkJuggleHit(gs, mx, my) {
  for (let i = gs.items.length - 1; i >= 0; i--) {
    const it = gs.items[i];
    /* бить можно только падающую шапочку — иначе её выгодно прижать
       к верху и фармить очки частыми тапами */
    if (it.vy > 0 && Math.hypot(mx - it.x, my - it.y) < it.size * 1.5) {
      addScore(gs, 1);
      addBurst(gs, it.x, it.y, it.color, '+1', 5, 2);
      /* сила подброса ограничена так, чтобы пик траектории не ушёл выше поля */
      const ceil = Math.sqrt(2 * .16 * Math.max(it.y - 34, 0));
      it.vy = -Math.min(8 + Math.random() * 2, ceil);
      it.vx = Math.max(-3, Math.min(3, it.vx + (it.x - mx) * .25));
      it.rotSpeed = (Math.random() - .5) * .08;
      return;
    }
  }
}
