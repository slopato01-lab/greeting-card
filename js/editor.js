/* ============================================================
   EDITOR — логика визарда. Данные шаблонов в templates.js,
   иконки в icons.js, QR в qr.js.
   ============================================================ */
'use strict';

const state = {
  currentStep: 1,
  templateId: null,
  recipientName: '',
  cardTitle: '',
  cardText: '',
  cardSignature: '',
  photoUrl: null,
  game: 'auto',
  openMoment: false,
  openDate: '',
  openTime: '',
  isGroup: false,
  organizerName: '',
  hasMusic: false,
  musicTrack: 'bells',
  notifyEmail: ''
};

const MUSIC = [
  { id: 'bells',    label: 'Новогодние колокола' },
  { id: 'birthday', label: 'Happy Birthday' },
  { id: 'romantic', label: 'Романтическая' },
  { id: 'wedding',  label: 'Свадебный марш' }
];

let activeCat = 'all';

/* ——— Инициализация ——— */
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();

  const params = new URLSearchParams(location.search);
  const preTemplate = params.get('template');
  if (preTemplate && TEMPLATES.some(t => t.id === preTemplate)) {
    state.templateId = preTemplate;
  }
  if (params.get('type') === 'group') state.isGroup = true;

  renderFilter();
  renderTemplatePicker();
  renderGameGrid();
  renderMusicGrid();
  restoreFields();
  bindEvents();
  setStep(1);
});

/* ——— Навигация по шагам ——— */
function goStep(n) {
  if (n >= 2 && !state.templateId) {
    showToast('Сначала выберите шаблон');
    return;
  }
  if (n === 4) renderPreviewStep();
  if (n === 5) renderPaymentStep();
  setStep(n);
}
window.goStep = goStep;

function setStep(n) {
  state.currentStep = n;
  document.querySelectorAll('.editor-step').forEach(el => {
    el.classList.toggle('hidden', el.id !== `step${n}`);
  });
  document.querySelectorAll('.ep-step').forEach(el => {
    const num = Number(el.dataset.step);
    el.classList.toggle('ep-step--done', num < n);
    el.classList.toggle('ep-step--active', num === n);
  });
  updateLivePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ——— Шаг 1: выбор шаблона ——— */
function renderFilter() {
  const wrap = document.getElementById('step1Filter');
  wrap.innerHTML = CATEGORIES.map(c =>
    `<button class="chip${c.id === activeCat ? ' chip--active' : ''}" data-cat="${c.id}">${c.label}</button>`
  ).join('');
}

function renderTemplatePicker() {
  const picker = document.getElementById('templatePicker');
  const list = activeCat === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.cat === activeCat);
  picker.innerHTML = list.map(t => `
    <button type="button" class="tpl-card${state.templateId === t.id ? ' tpl-card--selected' : ''}"
            data-id="${t.id}" aria-pressed="${state.templateId === t.id}">
      <span class="tpl-card__mini">${renderMini(t)}</span>
      <span class="tpl-card__meta">
        <span class="tpl-card__occ">${OCCASIONS[t.occ].label}</span>
        <span class="tpl-card__name">${t.name}</span>
      </span>
    </button>`).join('');
}

/* ——— Шаг 3: сетки радио-опций ——— */
function renderGameGrid() {
  const grid = document.getElementById('gameGrid');
  /* «Без игры» — это выключенный тумблер, в сетке не нужен */
  grid.innerHTML = Object.entries(GAMES).filter(([id]) => id !== 'none').map(([id, g]) => `
    <label class="radio-card">
      <input type="radio" name="game" value="${id}" ${state.game === id ? 'checked' : ''}>
      <span class="radio-card__box">${g.icon ? icon(g.icon, 22) : icon('spark', 22)}${g.label}</span>
    </label>`).join('');
}

function renderMusicGrid() {
  const grid = document.getElementById('musicGrid');
  grid.innerHTML = MUSIC.map(m => `
    <label class="radio-card">
      <input type="radio" name="music" value="${m.id}" ${state.musicTrack === m.id ? 'checked' : ''}>
      <span class="radio-card__box">${icon('music', 22)}${m.label}</span>
    </label>`).join('');
}

/* ——— Постоянное превью: видно на любом шаге ——— */
function updateLivePreview() {
  const lp = document.getElementById('editorPreview');
  if (!lp) return;
  const t = getTemplate(state.templateId || TEMPLATES[0].id);
  lp.innerHTML = renderCard(t, state);
}

/* ——— Шаг 4: сводка ——— */
function renderPreviewStep() {
  const t = getTemplate(state.templateId);
  document.getElementById('pvTemplate').textContent = `${t.name} · ${OCCASIONS[t.occ].label}`;
  document.getElementById('pvRecipient').textContent = state.recipientName || 'не указан';

  const flags = [];
  const game = resolveGame(state.game, t);
  if (game !== 'none') flags.push(`Мини-игра: ${GAMES[game].label}`);
  if (state.openMoment && state.openDate) flags.push(`Откроется: ${formatDateTime(state.openDate, state.openTime)}`);
  if (state.isGroup) flags.push('Групповая открытка');
  if (state.hasMusic) flags.push(`Музыка: ${(MUSIC.find(m => m.id === state.musicTrack) || MUSIC[0]).label}`);
  if (state.notifyEmail) flags.push('Уведомление об открытии');
  document.getElementById('pvFlags').innerHTML =
    flags.map(f => `<span>${icon('check', 16)}${escHtml(f)}</span>`).join('');
}

function formatDateTime(date, time) {
  const d = new Date(date + (time ? 'T' + time : 'T00:00'));
  return d.toLocaleString('ru', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ——— Шаг 5: оплата ——— */
function renderPaymentStep() {
  const t = getTemplate(state.templateId);
  document.getElementById('orderTemplate').textContent = `${t.name} · ${OCCASIONS[t.occ].label}`;
  if (state.notifyEmail) document.getElementById('paymentEmail').value = state.notifyEmail;
  document.getElementById('erpCode').textContent = generateCode();
}

function handlePayment() {
  const email = document.getElementById('paymentEmail').value.trim();
  if (!email || !email.includes('@')) { showToast('Укажите email — на него придёт QR-код'); return; }
  if (!document.getElementById('agreeTerms').checked) { showToast('Нужно согласиться с условиями'); return; }

  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = 'Обрабатываем платёж…';

  setTimeout(() => completePayment(email), 1600);
}
window.handlePayment = handlePayment;

function completePayment(email) {
  const cardId = generateId();
  const card = {
    id: cardId,
    templateId: state.templateId,
    recipientName: state.recipientName,
    cardTitle: state.cardTitle,
    cardText: state.cardText,
    cardSignature: state.cardSignature,
    photoUrl: state.photoUrl,
    game: state.game,
    openMoment: state.openMoment,
    openDate: state.openDate,
    openTime: state.openTime,
    isGroup: state.isGroup,
    organizerName: state.organizerName,
    hasMusic: state.hasMusic,
    musicTrack: state.musicTrack,
    notifyEmail: email,
    createdAt: new Date().toISOString(),
    views: 0
  };
  localStorage.setItem(`card_${cardId}`, JSON.stringify(card));
  localStorage.removeItem('draft');

  const cardUrl = `${location.origin}${location.pathname.replace('editor.html', 'card.html')}?id=${cardId}`;
  const groupUrl = `${location.origin}${location.pathname.replace('editor.html', 'join.html')}?id=${cardId}`;

  document.querySelectorAll('.editor-step').forEach(el => el.classList.add('hidden'));
  document.getElementById('stepSuccess').classList.remove('hidden');
  document.querySelectorAll('.ep-step').forEach(el => { el.classList.remove('ep-step--active'); el.classList.add('ep-step--done'); });
  document.getElementById('editorGrid').classList.add('editor-grid--success');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.getElementById('successLinkInput').value = cardUrl;
  document.getElementById('openCardLink').href = cardUrl;
  if (state.isGroup) {
    document.getElementById('groupInviteBlock').classList.remove('hidden');
    document.getElementById('groupLinkInput').value = groupUrl;
  }

  QRCode.generate(cardUrl, document.getElementById('successQr'), { width: 168, height: 168, colorDark: '#191814', colorLight: '#FAF9F7' });

  document.getElementById('shareTg').onclick = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(cardUrl)}&text=${encodeURIComponent('Тебе открытка!')}`, '_blank');
  document.getElementById('shareWa').onclick = () => window.open(`https://wa.me/?text=${encodeURIComponent('Тебе открытка! ' + cardUrl)}`, '_blank');
  document.getElementById('shareVk').onclick = () => window.open(`https://vk.com/share.php?url=${encodeURIComponent(cardUrl)}`, '_blank');
}

/* ——— События ——— */
function bindEvents() {
  // Фильтр шаблонов
  document.getElementById('step1Filter').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    activeCat = btn.dataset.cat;
    renderFilter();
    renderTemplatePicker();
  });

  // Выбор шаблона
  document.getElementById('templatePicker').addEventListener('click', e => {
    const card = e.target.closest('.tpl-card');
    if (!card) return;
    state.templateId = card.dataset.id;
    renderTemplatePicker();
    setTimeout(() => goStep(2), 250);
  });

  // Текстовые поля
  [['recipientName'], ['cardTitle'], ['cardText'], ['cardSignature']].forEach(([id]) => {
    document.getElementById(id).addEventListener('input', e => {
      state[id] = e.target.value;
      if (id === 'cardText') document.getElementById('textCount').textContent = e.target.value.length;
      updateLivePreview();
    });
  });

  // Фото
  const upload = document.getElementById('photoUpload');
  const input = document.getElementById('photoInput');
  upload.addEventListener('click', () => input.click());
  upload.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  upload.addEventListener('dragover', e => { e.preventDefault(); upload.classList.add('photo-upload--drag'); });
  upload.addEventListener('dragleave', () => upload.classList.remove('photo-upload--drag'));
  upload.addEventListener('drop', e => {
    e.preventDefault();
    upload.classList.remove('photo-upload--drag');
    if (e.dataTransfer.files[0]) handlePhoto(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', e => { if (e.target.files[0]) handlePhoto(e.target.files[0]); });
  document.getElementById('photoRemove').addEventListener('click', () => {
    state.photoUrl = null;
    document.getElementById('photoPreview').classList.add('hidden');
    upload.classList.remove('hidden');
    updateLivePreview();
  });

  // Радио: игра и музыка
  document.getElementById('gameGrid').addEventListener('change', e => { state.game = e.target.value; });
  document.getElementById('musicGrid').addEventListener('change', e => { state.musicTrack = e.target.value; });

  // Тумблеры-аккордеон
  bindToggle('toggleGame', 'optGame', v => {
    state.game = v ? 'auto' : 'none';
    if (v) renderGameGrid();
  });
  bindToggle('toggleMoment', 'optMoment', v => { state.openMoment = v; updateLivePreview(); });
  bindToggle('toggleGroup', 'optGroup', v => { state.isGroup = v; });
  bindToggle('toggleMusic', 'optMusic', v => { state.hasMusic = v; });
  bindToggle('toggleNotify', 'optNotify', () => {});

  document.getElementById('openDate').addEventListener('change', e => { state.openDate = e.target.value; updateLivePreview(); });
  document.getElementById('openTime').addEventListener('change', e => { state.openTime = e.target.value; });

  // Мобайл: свернуть/развернуть превью
  const side = document.getElementById('editorSide');
  const previewToggle = document.getElementById('previewToggle');
  previewToggle.addEventListener('click', () => {
    const open = side.classList.toggle('editor-side--open');
    previewToggle.setAttribute('aria-expanded', open);
    previewToggle.querySelector('.cap').textContent = open ? 'свернуть' : 'развернуть';
  });
  document.getElementById('organizerName').addEventListener('input', e => { state.organizerName = e.target.value; });
  document.getElementById('notifyEmail').addEventListener('input', e => { state.notifyEmail = e.target.value; });

  // Оплата: способ
  document.querySelectorAll('.pm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pm-btn').forEach(b => {
        b.classList.toggle('pm-btn--active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });
      const method = btn.dataset.method;
      document.getElementById('cardForm').classList.toggle('hidden', method !== 'card');
      document.getElementById('erpForm').classList.toggle('hidden', method !== 'erip');
    });
  });

  // Маски карточных полей
  document.getElementById('cardNumber').addEventListener('input', e => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16);
    e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
  document.getElementById('cardExpiry').addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
    e.target.value = v;
  });

  // Черновик
  document.getElementById('saveDraft').addEventListener('click', () => {
    localStorage.setItem('draft', JSON.stringify(state));
    showToast('Черновик сохранён');
  });

  // Копирование ссылок
  document.getElementById('btnCopyLink').addEventListener('click', () => {
    copyToClipboard(document.getElementById('successLinkInput').value);
    showToast('Ссылка скопирована');
  });
  document.getElementById('btnCopyGroup').addEventListener('click', () => {
    copyToClipboard(document.getElementById('groupLinkInput').value);
    showToast('Ссылка-приглашение скопирована');
  });
}

function bindToggle(toggleId, optId, apply) {
  const toggle = document.getElementById(toggleId);
  toggle.addEventListener('change', e => {
    apply(e.target.checked);
    document.getElementById(optId).classList.toggle('opt--on', e.target.checked);
  });
}

function handlePhoto(file) {
  if (!file.type.startsWith('image/')) { showToast('Это не похоже на изображение'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('Файл больше 5 МБ — выберите поменьше'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    state.photoUrl = e.target.result;
    document.getElementById('photoImg').src = e.target.result;
    document.getElementById('photoPreview').classList.remove('hidden');
    document.getElementById('photoUpload').classList.add('hidden');
    updateLivePreview();
  };
  reader.readAsDataURL(file);
}

/* ——— Черновик: восстановление ——— */
function loadDraft() {
  const raw = localStorage.getItem('draft');
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    delete draft.currentStep;
    Object.assign(state, draft);
    if (state.templateId && !TEMPLATES.some(t => t.id === state.templateId)) state.templateId = null;
  } catch (e) { /* повреждённый черновик игнорируем */ }
}

function restoreFields() {
  document.getElementById('recipientName').value = state.recipientName;
  document.getElementById('cardTitle').value = state.cardTitle;
  document.getElementById('cardText').value = state.cardText;
  document.getElementById('cardSignature').value = state.cardSignature;
  document.getElementById('textCount').textContent = state.cardText.length;
  if (state.photoUrl) {
    document.getElementById('photoImg').src = state.photoUrl;
    document.getElementById('photoPreview').classList.remove('hidden');
    document.getElementById('photoUpload').classList.add('hidden');
  }
  [['toggleGame', 'optGame', state.game !== 'none'],
   ['toggleMoment', 'optMoment', state.openMoment],
   ['toggleGroup', 'optGroup', state.isGroup],
   ['toggleMusic', 'optMusic', state.hasMusic],
   ['toggleNotify', 'optNotify', Boolean(state.notifyEmail)]].forEach(([tid, oid, on]) => {
    document.getElementById(tid).checked = on;
    document.getElementById(oid).classList.toggle('opt--on', on);
  });
  document.getElementById('openDate').value = state.openDate;
  document.getElementById('openTime').value = state.openTime;
  document.getElementById('organizerName').value = state.organizerName;
  document.getElementById('notifyEmail').value = state.notifyEmail;
  updateLivePreview();
}

/* ——— Утилиты ——— */
function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
function generateCode() {
  return (Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6)).toUpperCase();
}
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}
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
