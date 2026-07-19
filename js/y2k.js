/* ============================================================
   Y2K — рантайм шаблона «Плеер» (birthday_y2k), только card.html.
   Спектр рисуется по фактическому звуку: синт играет через
   AnalyserNode, столбцы — transform: scaleY, фото пульсирует
   по энергии баса. AudioContext создаётся строго после жеста.
   Без Web Audio — CSS-фолбэк (.y2k--anim), без падения.
   ============================================================ */
'use strict';

const Y2K = (() => {
  const BAR_COUNT = 27;
  const MASTER_VOL = 0.55;
  const BEAT = 0.5; /* сетка ритм-секции, 120 BPM */

  /* Happy Birthday, до мажор — своя аранжировка длиннее, чем MELODIES */
  const HBD = [
    [392, .40], [392, .35], [440, .75], [392, .75], [523, .75], [494, 1.4],
    [392, .40], [392, .35], [440, .75], [392, .75], [587, .75], [523, 1.4],
    [392, .40], [392, .35], [784, .75], [659, .75], [523, .75], [494, .75], [440, 1.4],
    [698, .40], [698, .35], [659, .75], [523, .75], [587, .75], [523, 1.6]
  ];

  let ctx = null, master = null, analyser = null, muteGain = null, freqData = null, noiseBuf = null;
  let els = null, cardData = null, reduced = false;
  let playing = false, muted = false, fallbackMode = false;
  let rafId = 0, loopTimer = 0, lcdTimer = 0;
  let startedAt = 0, elapsedBase = 0, nextLoopAt = 0;
  let baseLevels = [], bassSmooth = 0;
  const liveNodes = new Set();

  /* ——— Разбор трека ——— */
  function pickTune() {
    if (cardData.hasMusic && typeof MELODIES !== 'undefined' && MELODIES[cardData.musicTrack]) {
      /* отправитель выбрал мелодию — плеер играет её */
      if (cardData.musicTrack !== 'birthday') return MELODIES[cardData.musicTrack];
    }
    return HBD;
  }

  function buildTimeline(notes) {
    const events = [];
    let t = 0;
    notes.forEach(([f, d]) => { events.push({ t, f, d }); t += d; });
    return { events, total: t };
  }

  /* ——— Голоса синта ——— */
  function voice(node, t0, stopAt) {
    liveNodes.add(node);
    node.onended = () => liveNodes.delete(node);
    node.start(t0);
    node.stop(stopAt);
  }

  function tone(type, freq, t0, dur, vol) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + .025);
    /* сустейн до конца ноты: тон держится, спектр не проседает между атаками */
    gain.gain.linearRampToValueAtTime(vol * .55, t0 + dur * .8);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(master);
    voice(osc, t0, t0 + dur + .05);
  }

  function kick(t0) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, t0);
    osc.frequency.exponentialRampToValueAtTime(44, t0 + .12);
    gain.gain.setValueAtTime(.5, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + .2);
    osc.connect(gain).connect(master);
    voice(osc, t0, t0 + .22);
  }

  function hat(t0) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(.09, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + .05);
    src.connect(hp).connect(gain).connect(master);
    voice(src, t0, t0 + .06);
  }

  /* Один проход трека: мелодия + бас по текущей ноте + бит по сетке */
  function scheduleLoop(when) {
    const { events, total } = buildTimeline(pickTune());
    events.forEach(({ t, f, d }) => {
      tone('triangle', f, when + t, d, .16);
      const bass = f >= 240 ? f / 4 : f / 2;
      tone('triangle', bass, when + t, Math.min(d, .5), .2);
    });
    for (let b = 0; b * BEAT < total; b++) {
      const t0 = when + b * BEAT;
      if (b % 2 === 0) kick(t0); else hat(t0);
    }
    nextLoopAt = when + total + BEAT;
    loopTimer = setTimeout(() => {
      if (playing) scheduleLoop(nextLoopAt);
    }, (nextLoopAt - ctx.currentTime - .2) * 1000);
  }

  /* ——— Аудиограф ——— */
  function ensureContext() {
    if (ctx || fallbackMode) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = MASTER_VOL;
      analyser = ctx.createAnalyser();
      /* 2048 → бин ≈ 23 Гц: бас и кик отделяются от мелодии */
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = .78;
      /* мьют стоит после анализатора: без звука спектр остаётся живым */
      muteGain = ctx.createGain();
      muteGain.gain.value = muted ? 0 : 1;
      master.connect(analyser).connect(muteGain).connect(ctx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .08, ctx.sampleRate);
      const ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    } catch (e) {
      /* Web Audio недоступен: спектр по фиксированному паттерну, без звука */
      fallbackMode = true;
      ctx = null;
    }
  }

  /* ——— Визуализация ——— */
  function frame() {
    if (!playing || !analyser) return;
    analyser.getByteFrequencyData(freqData);

    /* столбцы: бины до ~5 кГц с лог-распределением по полосе */
    const bars = els.bars;
    for (let i = 0; i < bars.length; i++) {
      const from = 1 + Math.floor(Math.pow(i / bars.length, 1.8) * 215);
      const to = 1 + Math.floor(Math.pow((i + 1) / bars.length, 1.8) * 215);
      let sum = 0;
      for (let b = from; b <= to; b++) sum += freqData[b];
      const lv = Math.max(.05, (sum / (to - from + 1)) / 255);
      bars[i].style.setProperty('--lv', lv.toFixed(3));
    }

    /* бас (бины 1–7 ≈ 23–165 Гц: кик и басовый голос) → пульс фото */
    let bass = 0;
    for (let b = 1; b <= 7; b++) bass += freqData[b];
    bassSmooth += ((bass / 7 / 255) - bassSmooth) * .3;
    els.stage.style.setProperty('--pulse', (1 + bassSmooth * .07).toFixed(4));

    rafId = requestAnimationFrame(frame);
  }

  function restoreBars() {
    els.bars.forEach((bar, i) => bar.style.setProperty('--lv', baseLevels[i]));
    els.stage.style.setProperty('--pulse', '1');
  }

  /* ——— LCD-таймер ——— */
  function elapsed() {
    return elapsedBase + (playing ? (performance.now() - startedAt) / 1000 : 0);
  }
  function drawTime() {
    const s = Math.floor(elapsed());
    const pad = n => String(n).padStart(2, '0');
    els.time.textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }

  /* ——— Транспорт ——— */
  function play() {
    if (playing) { pause(); return; }
    ensureContext();
    playing = true;
    startedAt = performance.now();
    if (ctx) {
      ctx.resume();
      scheduleLoop(Math.max(ctx.currentTime + .06, nextLoopAt));
      if (!reduced) rafId = requestAnimationFrame(frame);
    } else {
      els.root.classList.add('y2k--anim');
    }
    lcdTimer = setInterval(drawTime, 500);
    setKey(els.play, Y2K_GLYPHS.pause, 'Пауза', true);
  }

  function pause() {
    playing = false;
    elapsedBase += (performance.now() - startedAt) / 1000;
    clearTimeout(loopTimer);
    clearInterval(lcdTimer);
    cancelAnimationFrame(rafId);
    if (ctx) ctx.suspend();
    els.root.classList.remove('y2k--anim');
    setKey(els.play, Y2K_GLYPHS.play, 'Играть', false);
  }

  function stop() {
    const wasPlaying = playing;
    playing = false;
    clearTimeout(loopTimer);
    clearInterval(lcdTimer);
    cancelAnimationFrame(rafId);
    elapsedBase = 0;
    nextLoopAt = 0;
    els.root.classList.remove('y2k--anim');
    if (ctx) {
      liveNodes.forEach(n => { try { n.stop(); } catch (e) { /* уже остановлен */ } });
      liveNodes.clear();
      if (wasPlaying) ctx.resume();
    }
    setTimeout(restoreBars, 260); /* даём хвосту спектра догаснуть */
    drawTime();
    setKey(els.play, Y2K_GLYPHS.play, 'Играть', false);
  }

  function toggleMute() {
    muted = !muted;
    if (muteGain) muteGain.gain.value = muted ? 0 : 1;
    setKey(els.mute, muted ? Y2K_GLYPHS.mute : Y2K_GLYPHS.sound,
      muted ? 'Включить звук' : 'Выключить звук', muted);
  }

  function setKey(el, glyph, label, pressed) {
    el.innerHTML = glyph;
    el.setAttribute('aria-label', label);
    el.setAttribute('aria-pressed', String(pressed));
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

  /* ——— Вход: root — контейнер с .pcard--y2k, data — открытка ——— */
  function init(root, data) {
    cardData = data;
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    els = {
      root: root.querySelector('.pcard--y2k'),
      play: root.querySelector('[data-y2k="play"]'),
      stopBtn: root.querySelector('[data-y2k="stop"]'),
      mute: root.querySelector('[data-y2k="mute"]'),
      stage: root.querySelector('[data-y2k="stage"]'),
      time: root.querySelector('[data-y2k="time"]'),
      bars: Array.from(root.querySelectorAll('.y2k__bars i'))
    };
    baseLevels = els.bars.map(bar => bar.style.getPropertyValue('--lv') || '.15');
    enliven(els.play, play);
    enliven(els.stopBtn, stop);
    enliven(els.mute, toggleMute);
  }

  return { init };
})();
