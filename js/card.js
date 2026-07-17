/* ============================================================
   CARD — страница получателя: peel-открытие по действию,
   отсчёт, игра, поздравления, музыка, шеринг.
   ============================================================ */
'use strict';

let cardData = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const demoId = params.get('demo');
  const cardId = params.get('id');

  if (demoId) {
    cardData = buildDemoCard(demoId);
    initCard();
  } else if (cardId) {
    loadCard(cardId);
  } else {
    cardData = buildDemoCard('ny_scandinavian');
    initCard();
  }
});

function loadCard(id) {
  const raw = localStorage.getItem(`card_${id}`);
  if (!raw) { showNotFound(); return; }
  try {
    cardData = JSON.parse(raw);
    cardData.views = (cardData.views || 0) + 1;
    localStorage.setItem(`card_${id}`, JSON.stringify(cardData));
    initCard();
  } catch (e) {
    showNotFound();
  }
}

function buildDemoCard(templateId) {
  const t = getTemplate(templateId);
  const demos = {
    newyear:    { title: 'С Новым годом!',        text: 'Пусть этот год принесёт то, о чём даже загадать не решались. Обнимаю!' },
    birthday:   { title: 'С днём рождения!',      text: 'Расти большой, не будь лапшой. А серьёзно — ты лучший человек из всех, кого я знаю.' },
    valentine:  { title: 'Ты — моё всё',          text: 'Спасибо, что терпишь мой храп, мои плейлисты и меня целиком.' },
    mar8:       { title: 'С 8 Марта!',            text: 'Пусть весна начнётся прямо сегодня — с этой открытки.' },
    feb23:      { title: 'С 23 Февраля!',         text: 'За тех, на кого всегда можно положиться.' },
    wedding:    { title: 'Совет да любовь!',      text: 'Пусть ваша история будет длинной, а ссоры — короткими.' },
    graduation: { title: 'Выпуск!',               text: 'Мы правда это сделали. Дальше — только интереснее.' },
    other:      { title: 'Просто вспомнил тебя',  text: 'Без повода. Просто ты классный человек, и пусть у тебя будет хороший день.' }
  };
  const d = demos[t.occ];
  return {
    id: 'demo',
    templateId: t.id,
    recipientName: 'Саша',
    cardTitle: d.title,
    cardText: d.text,
    cardSignature: 'С любовью, Маша',
    photoUrl: null,
    game: 'auto',
    openMoment: false,
    isGroup: false,
    hasMusic: false
  };
}

/* ——— Инициализация ——— */
function initCard() {
  if (cardData.openMoment && cardData.openDate) {
    const unlockTime = new Date(cardData.openDate + 'T' + (cardData.openTime || '00:00'));
    if (new Date() < unlockTime) {
      hideLoading();
      showCountdown(unlockTime);
      return;
    }
  }
  hideLoading();
  showSealed();
}

function hideLoading() { document.getElementById('cardLoading').classList.add('hidden'); }
function showNotFound() {
  hideLoading();
  document.getElementById('cardNotFound').classList.remove('hidden');
}

/* ——— Отсчёт ——— */
let countdownInterval = null;
function showCountdown(unlockTime) {
  const cd = document.getElementById('cardCountdown');
  cd.classList.remove('hidden');
  document.getElementById('countdownDateLabel').textContent =
    unlockTime.toLocaleString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

  function tick() {
    const diff = unlockTime - new Date();
    if (diff <= 0) {
      clearInterval(countdownInterval);
      cd.classList.add('hidden');
      showSealed();
      return;
    }
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cdDays').textContent = pad(Math.floor(diff / 86400000));
    document.getElementById('cdHours').textContent = pad(Math.floor(diff % 86400000 / 3600000));
    document.getElementById('cdMinutes').textContent = pad(Math.floor(diff % 3600000 / 60000));
    document.getElementById('cdSeconds').textContent = pad(Math.floor(diff % 60000 / 1000));
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* ——— Запечатанный конверт ——— */
function showSealed() {
  const t = getTemplate(cardData.templateId);
  document.getElementById('cardMain').classList.remove('hidden');

  const cover = document.getElementById('peelCover');
  document.getElementById('coverStamp').innerHTML = motif(OCCASIONS[t.occ].motif);
  if (cardData.recipientName) {
    document.getElementById('coverName').textContent = cardData.recipientName;
  }

  document.getElementById('cardFrame').innerHTML = renderCard(t, cardData);

  cover.addEventListener('click', openCard, { once: true });
}

function openCard() {
  document.getElementById('peelStage').classList.add('peel-stage--open');
  document.getElementById('cardActions').classList.add('card-actions--show');
  bindCardControls();
}

/* ——— Кнопки под открыткой ——— */
function bindCardControls() {
  const t = getTemplate(cardData.templateId);
  const game = resolveGame(cardData.game, t);

  const btnGame = document.getElementById('btnGame');
  if (game === 'none') {
    btnGame.classList.add('hidden');
  } else {
    btnGame.addEventListener('click', () => openGame(game, t));
  }

  if (cardData.isGroup) {
    const btnGroup = document.getElementById('btnGroup');
    btnGroup.classList.remove('hidden');
    renderGroupGallery();
    btnGroup.addEventListener('click', () => showOverlay('groupOverlay'));
    document.getElementById('groupClose').addEventListener('click', () => hideOverlay('groupOverlay'));
  }

  if (cardData.hasMusic) {
    const btnMusic = document.getElementById('btnMusic');
    btnMusic.classList.remove('hidden');
    btnMusic.addEventListener('click', () => toggleMusic(btnMusic));
  }

  document.getElementById('btnShare').addEventListener('click', () => {
    const url = location.href;
    document.getElementById('shareUrlInput').value = url;
    QRCode.generate(url, document.getElementById('shareQr'), { width: 148, height: 148, colorDark: '#191814', colorLight: '#FAF9F7' });
    showOverlay('shareOverlay');
    document.getElementById('shareTg').onclick = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Тебе открытка!')}`, '_blank');
    document.getElementById('shareWa').onclick = () => window.open(`https://wa.me/?text=${encodeURIComponent('Тебе открытка! ' + url)}`, '_blank');
    document.getElementById('shareVk').onclick = () => window.open(`https://vk.com/share.php?url=${encodeURIComponent(url)}`, '_blank');
  });
  document.getElementById('shareClose').addEventListener('click', () => hideOverlay('shareOverlay'));
  document.getElementById('shareCopy').addEventListener('click', () => {
    navigator.clipboard?.writeText(document.getElementById('shareUrlInput').value);
    showToast('Ссылка скопирована');
  });

  ['groupOverlay', 'shareOverlay', 'gameOverlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) {
        hideOverlay(id);
        if (id === 'gameOverlay') stopGame();
      }
    });
  });
}

function showOverlay(id) { document.getElementById(id).classList.remove('hidden'); }
function hideOverlay(id) { document.getElementById(id).classList.add('hidden'); }

/* ——— Поздравления группы ——— */
function renderGroupGallery() {
  const participants = JSON.parse(localStorage.getItem(`group_${cardData.id}`) || '[]');
  const gallery = document.getElementById('groupGallery');
  if (participants.length === 0) {
    gallery.innerHTML = '<div class="group-empty">Пока никто не добавил поздравление.<br>Организатор ещё собирает компанию.</div>';
    return;
  }
  gallery.innerHTML = participants.map(p => `
    <div class="group-card">
      ${p.photo
        ? `<img class="group-card__photo" src="${p.photo}" alt="Фото: ${escHtml(p.name)}">`
        : `<div class="group-card__initial">${escHtml((p.name || '?')[0].toUpperCase())}</div>`}
      <div class="group-card__name">${escHtml(p.name)}</div>
      <div class="group-card__msg">${escHtml(p.message || '')}</div>
    </div>`).join('');
}

/* ——— Игра ——— */
function openGame(type, t) {
  showOverlay('gameOverlay');
  document.getElementById('gameTitle').textContent = GAMES[type].label;
  runGame(type, t);

  document.getElementById('gameClose').onclick = () => {
    hideOverlay('gameOverlay');
    stopGame();
  };
  document.getElementById('gameRestart').onclick = () => runGame(type, t);
}

function runGame(type, t) {
  document.getElementById('gameResult').classList.add('hidden');
  document.getElementById('gameScore').textContent = '0';
  document.getElementById('gameTimer').textContent = '30';

  /* Игра печатается теми же красками: оттиск, чернила, приглушённые чернила */
  const styles = getComputedStyle(document.documentElement);
  startGame(type, document.getElementById('gameCanvas'), {
    accent: styles.getPropertyValue('--stamp').trim(),
    accentLt: styles.getPropertyValue('--ink-mute').trim(),
    ink: styles.getPropertyValue('--ink').trim(),
    vinyl: styles.getPropertyValue('--paper').trim(),
    onScore: s => { document.getElementById('gameScore').textContent = s; },
    onTimer: sec => { document.getElementById('gameTimer').textContent = sec; },
    onEnd: score => {
      const texts = ['В следующий раз получится!', 'Неплохо!', 'Хороший результат!', 'Отлично!', 'Невероятно!'];
      document.getElementById('gameResultScore').textContent = score;
      document.getElementById('gameResultText').textContent = texts[Math.min(Math.floor(score / 8), texts.length - 1)];
      document.getElementById('gameResult').classList.remove('hidden');
    }
  });
}

/* ——— Музыка: короткие мелодии через WebAudio, только по нажатию ——— */
let audioCtx = null;
let musicTimer = null;
let musicPlaying = false;

const MELODIES = {
  bells:    [[659, .25], [659, .25], [659, .5], [659, .25], [659, .25], [659, .5], [659, .25], [784, .25], [523, .35], [587, .15], [659, .8]],
  birthday: [[262, .3], [262, .2], [294, .5], [262, .5], [349, .5], [330, .9]],
  romantic: [[440, .4], [523, .4], [659, .6], [523, .4], [440, .6], [392, .8]],
  wedding:  [[262, .4], [349, .3], [349, .3], [349, .8], [262, .4], [392, .3], [370, .3], [349, .8]]
};

function toggleMusic(btn) {
  if (musicPlaying) {
    stopMusic(btn);
    return;
  }
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  musicPlaying = true;
  btn.innerHTML = `${icon('close', 20)} Выключить`;
  playMelody(MELODIES[cardData.musicTrack] || MELODIES.bells, btn);
}

function playMelody(notes, btn) {
  let time = audioCtx.currentTime + .05;
  notes.forEach(([freq, dur]) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(0.18, time + .03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + dur + .05);
    time += dur;
  });
  const total = notes.reduce((s, [, d]) => s + d, 0);
  musicTimer = setTimeout(() => {
    if (musicPlaying) playMelody(notes, btn);
  }, (total + 1.2) * 1000);
}

function stopMusic(btn) {
  musicPlaying = false;
  clearTimeout(musicTimer);
  btn.innerHTML = `${icon('play', 20)} Музыка`;
}

/* ——— Утилиты ——— */
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('toast--show');
  clearTimeout(t._to);
  t._to = setTimeout(() => t.classList.remove('toast--show'), 2600);
}
