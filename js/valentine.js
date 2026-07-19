/* ============================================================
   VALENTINE — рантайм шаблона «Футляр» (valentine_case), только
   card.html. Запечатывает футляр лентой и ведёт один непрерывный
   жест открытия: лента натягивается за пальцем, развязывается,
   створки разъезжаются, фото садится, подпись проявляется.
   Музыка — камерный синт (пэд + редкое фортепиано), вход ~3 с,
   строго по нажатию. Reduced motion: футляр сразу раскрыт.
   ============================================================ */
'use strict';

const VAL = (() => {
  const OPEN_MS = 1750;     /* полная траектория открытия + хвост */
  const PULL_OPEN_PX = 40;  /* уверенное вытягивание ленты */
  const TAP_PX = 6;         /* всё короче — это тап, тоже открывает */
  const MASTER_VOL = 0.5;
  const FADE_IN = 3;        /* плавный вход громкости, с */

  /* Ля-минорный круг 4×4 с: пэд держит аккорд, фортепиано — редкие ноты */
  const PAD = [
    [[110.00, 220.00, 261.63, 329.63], 4],  /* Am */
    [[87.31, 174.61, 220.00, 261.63], 4],   /* F  */
    [[130.81, 261.63, 329.63, 392.00], 4],  /* C  */
    [[98.00, 196.00, 246.94, 293.66], 4]    /* G  */
  ];
  const MELODY = [
    [659.25, 1.5], [523.25, .5], [493.88, 1], [440.00, 1],
    [523.25, 2], [440.00, 1.5], [392.00, .5],
    [392.00, 1.5], [329.63, .5], [392.00, 1], [523.25, 1],
    [493.88, 2], [587.33, 1], [493.88, 1]
  ];

  let els = null, onOpenCb = null, reduced = false, opened = false;
  let ctx = null, master = null, playing = false, loopTimer = 0;

  /* ——— Жест: лента следует за пальцем, отпускание доигрывает ——— */
  function seal() {
    els.root.classList.add('val--sealed');
    const ribbon = els.ribbon;
    ribbon.setAttribute('tabindex', '0');
    let startY = null;

    ribbon.addEventListener('pointerdown', e => {
      if (opened) return;
      startY = e.clientY;
      ribbon.setPointerCapture(e.pointerId);
      ribbon.classList.add('val--dragging');
    });
    ribbon.addEventListener('pointermove', e => {
      if (startY === null || opened) return;
      /* px → % высоты viewBox, с сопротивлением и упором на 4% */
      const pull = Math.min(4, Math.max(0, e.clientY - startY) / 18);
      els.root.style.setProperty('--val-pull', pull.toFixed(2));
    });
    const release = e => {
      ribbon.classList.remove('val--dragging');
      if (startY === null || opened) return;
      const dy = Math.max(0, e.clientY - startY);
      startY = null;
      if (dy > PULL_OPEN_PX || dy < TAP_PX) open();
      else els.root.style.setProperty('--val-pull', '0');
    };
    ribbon.addEventListener('pointerup', release);
    ribbon.addEventListener('pointercancel', () => {
      ribbon.classList.remove('val--dragging');
      startY = null;
      els.root.style.setProperty('--val-pull', '0');
    });
    ribbon.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  function open() {
    if (opened) return;
    opened = true;
    els.root.style.setProperty('--val-pull', '0');
    els.root.classList.remove('val--sealed');
    els.root.classList.add('val--opening');
    setTimeout(finishOpen, OPEN_MS);
  }

  function finishOpen() {
    opened = true;
    els.root.classList.remove('val--sealed', 'val--opening');
    els.root.classList.add('val--open');
    onOpenCb();
  }

  /* ——— Музыка: пэд со струнным характером + фортепианный голос ——— */
  function padTone(freq, t0, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    lp.type = 'lowpass';
    lp.frequency.value = 760;
    /* смычковый вход и длинное затухание — ничего не щёлкает */
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(.055, t0 + 1.3);
    gain.gain.setValueAtTime(.055, t0 + dur - .9);
    gain.gain.linearRampToValueAtTime(0.0001, t0 + dur + .4);
    osc.connect(lp).connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + .5);
  }

  function pianoTone(freq, t0, dur) {
    const decay = Math.min(dur * 1.9, 3);
    [[1, .11], [2, .035]].forEach(([mult, vol]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * mult;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + .02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      osc.connect(gain).connect(master);
      osc.start(t0);
      osc.stop(t0 + decay + .1);
    });
  }

  function scheduleLoop(when) {
    let t = 0;
    PAD.forEach(([chord, dur]) => {
      chord.forEach(f => padTone(f, when + t, dur));
      t += dur;
    });
    let m = 0;
    MELODY.forEach(([f, dur]) => {
      pianoTone(f, when + m, dur);
      m += dur;
    });
    const next = when + t;
    loopTimer = setTimeout(() => {
      if (playing) scheduleLoop(next);
    }, (next - ctx.currentTime - .3) * 1000);
  }

  function toggleMusic() {
    if (playing) {
      playing = false;
      clearTimeout(loopTimer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + .6);
      setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 700);
      setSound(false);
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = ctx || new AC();
    } catch (e) {
      return; /* без Web Audio кнопка молчит, открытка живёт */
    }
    ctx.resume();
    if (!master) {
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    playing = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(MASTER_VOL, ctx.currentTime + FADE_IN);
    scheduleLoop(ctx.currentTime + .1);
    setSound(true);
  }

  function setSound(on) {
    els.sound.innerHTML = on ? Y2K_GLYPHS.mute : Y2K_GLYPHS.sound;
    els.sound.setAttribute('aria-label', on ? 'Выключить музыку' : 'Включить музыку');
    els.sound.setAttribute('aria-pressed', String(on));
  }

  /* span[role=button] из общей разметки становится настоящей кнопкой */
  function enliven(el, handler) {
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  }

  /* ——— Вход: root — контейнер с .pcard--valentine, onOpen — после жеста ——— */
  function init(root, data, onOpen) {
    onOpenCb = onOpen || (() => {});
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els = {
      root: root.querySelector('.pcard--valentine'),
      ribbon: root.querySelector('[data-val="ribbon"]'),
      sound: root.querySelector('[data-val="sound"]')
    };
    enliven(els.sound, toggleMusic);
    /* reduced motion: без запечатывания — всё видно сразу, музыка молчит */
    if (reduced) { finishOpen(); return; }
    seal();
  }

  return { init };
})();
