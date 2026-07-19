/* ============================================================
   TEMPLATES — общие данные шаблонов и поводов.
   Шаблон = архетип (вёрстка) × мотив (оттиск повода).
   Архетип одинаков для всех поводов; мотив печатается одной
   краской --stamp. Палитра и типографика не меняются никогда.
   Подключается на всех страницах до editor.js / card.js.
   ============================================================ */
'use strict';

const OCCASIONS = {
  newyear:    { label: 'Новый год',      motif: 'snowflake', game: 'snowflakes' },
  birthday:   { label: 'День рождения',  motif: 'candle',    game: 'balloons' },
  valentine:  { label: '14 февраля',     motif: 'heart',     game: 'hearts' },
  mar8:       { label: '8 Марта',        motif: 'mimosa',    game: 'hearts' },
  feb23:      { label: '23 Февраля',     motif: 'star',      game: 'coins' },
  wedding:    { label: 'Свадьба',        motif: 'rings',     game: 'coins' },
  graduation: { label: 'Выпускной',      motif: 'laurel',    game: 'balloons' },
  other:      { label: 'Просто так',     motif: 'raydot',    game: 'balloons' }
};

/* Категории фильтра каталога (mar8 + feb23 объединены в «Праздники») */
const CATEGORIES = [
  { id: 'all',        label: 'Все' },
  { id: 'newyear',    label: 'Новый год' },
  { id: 'birthday',   label: 'День рождения' },
  { id: 'valentine',  label: '14 февраля' },
  { id: 'holidays',   label: '8 Марта / 23 Февраля' },
  { id: 'wedding',    label: 'Свадьба' },
  { id: 'graduation', label: 'Выпускной' },
  { id: 'other',      label: 'Просто так' }
];

/* Пять архетипов — это и есть весь дизайн */
const ARCHETYPES = {
  editorial: 'Разворот',
  poster:    'Афиша',
  photo:     'Кадр',
  note:      'Письмо',
  motif:     'Оттиск'
};

/* 5 архетипов × 8 поводов = 40 шаблонов, и все родственники */
const TEMPLATES = Object.keys(OCCASIONS).flatMap(occ =>
  Object.keys(ARCHETYPES).map(arch => ({
    id: `${occ}_${arch}`,
    name: ARCHETYPES[arch],
    occ,
    arch,
    cat: (occ === 'mar8' || occ === 'feb23') ? 'holidays' : occ
  }))
);

/* Спец-серия: скины вне общей матрицы. Y2K «Плеер» — только день рождения,
   «Футляр» — только 14 февраля, «Полночь» — только Новый год */
TEMPLATES.unshift({ id: 'birthday_y2k', name: 'Плеер', occ: 'birthday', arch: 'y2k', cat: 'birthday' });
TEMPLATES.unshift({ id: 'valentine_case', name: 'Футляр', occ: 'valentine', arch: 'valentine', cat: 'valentine' });
TEMPLATES.unshift({ id: 'newyear_midnight', name: 'Полночь', occ: 'newyear', arch: 'midnight', cat: 'newyear' });

const GAMES = {
  auto:       { label: 'По теме открытки' },
  snowflakes: { label: 'Поймай снежинки', icon: 'snowflake' },
  balloons:   { label: 'Лопни шарики',    icon: 'balloon' },
  hearts:     { label: 'Найди сердечки',  icon: 'heart' },
  coins:      { label: 'Лови монеты',     icon: 'coin' },
  none:       { label: 'Без игры' }
};

/* Прежние id шаблонов (до системы архетипов) — по префиксу к поводу */
const LEGACY_PREFIXES = {
  ny_: 'newyear', bday_: 'birthday', val_: 'valentine', mar8_: 'mar8',
  feb23_: 'feb23', wed_: 'wedding', grad_: 'graduation', just_: 'other'
};

function getTemplate(id) {
  const found = TEMPLATES.find(t => t.id === id);
  if (found) return found;
  const prefix = Object.keys(LEGACY_PREFIXES).find(p => String(id).startsWith(p));
  if (prefix) return TEMPLATES.find(t => t.id === `${LEGACY_PREFIXES[prefix]}_editorial`);
  return TEMPLATES[0];
}

/* Классы открытки для .pcard-элемента */
function tplClasses(t) {
  return `pcard pcard--${t.arch}`;
}

/* Игра шаблона с учётом выбора отправителя */
function resolveGame(cardGame, t) {
  return (cardGame === 'auto' || !cardGame) ? OCCASIONS[t.occ].game : cardGame;
}

/* ——— Общий рендер открытки: превью редактора, каталог, страница получателя ——— */

function escCard(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Оверсайз-элемент афиши: дата открытия, дата повода или год */
const POSTER_DATES = { newyear: '01.01', valentine: '14.02', mar8: '08.03', feb23: '23.02' };
function posterFigure(t, data) {
  if (data.openMoment && data.openDate) {
    const [, m, d] = data.openDate.split('-');
    if (m && d) return `${d}.${m}`;
  }
  return POSTER_DATES[t.occ] || String(new Date().getFullYear());
}

/* ——— Скин Y2K «Плеер» ——— */

/* Собственный SVG-набор транспорта: одна сетка 12×12, заливка currentColor */
const Y2K_GLYPHS = {
  play:  '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" fill="currentColor"/></svg>',
  stop:  '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" fill="currentColor"/></svg>',
  sound: '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 4.5 H4 L7 2 V10 L4 7.5 H1.5 Z" fill="currentColor"/><path d="M8.5 4 A2.6 2.6 0 0 1 8.5 8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  mute:  '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 4.5 H4 L7 2 V10 L4 7.5 H1.5 Z" fill="currentColor"/><path d="M8.5 4.5 L11 7.5 M11 4.5 L8.5 7.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
};

/* Статичный спектр: детерминированный паттерн, тот же в мини и в фолбэке.
   --lv — уровень покоя, --hi — верх CSS-фолбэка, --i — фаза его задержки */
function y2kBars(n = 27) {
  let bars = '';
  for (let i = 0; i < n; i++) {
    const lv = (0.12 + 0.72 * Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.35) * 0.4)).toFixed(2);
    const hi = Math.min(0.95, Number(lv) + 0.4).toFixed(2);
    bars += `<i style="--lv:${lv};--hi:${hi};--i:${i}"></i>`;
  }
  return `<span class="y2k__bars" aria-hidden="true">${bars}</span>`;
}

/* Окно плеера. Управление — span[role=button]: разметка живёт и внутри
   <button> каталога; на странице получателя y2k.js делает их фокусируемыми */
function renderY2k(t, data) {
  const name = escCard(data.recipientName || 'тебя');
  const mq = escCard([
    data.cardTitle || 'С днём рождения!',
    data.cardText,
    data.cardSignature ? '— ' + data.cardSignature : ''
  ].filter(Boolean).join(' · '));
  const mqDur = Math.max(10, Math.round(mq.length * 0.42));
  const photo = data.photoUrl
    ? `<img class="y2k__photo" src="${data.photoUrl}" alt="Фото в открытке">`
    : `<span class="y2k__photo y2k__photo--empty">${motif(OCCASIONS[t.occ].motif)}</span>`;

  return `<div class="${tplClasses(t)}">
    <span class="y2k__titlebar">
      <span class="y2k__tl-name">${name}</span>
      <span class="y2k__tl-tag">· bday.mix</span>
      <span class="y2k__key y2k__key--sound" data-y2k="mute" role="button" aria-pressed="false" aria-label="Выключить звук">${Y2K_GLYPHS.sound}</span>
    </span>
    <span class="y2k__display">
      ${y2kBars()}
      <span class="y2k__stage" data-y2k="stage">${photo}</span>
      <span class="y2k__lcd" data-y2k="time">00:00</span>
      <span class="y2k__lcd y2k__lcd--trk">trk 01</span>
    </span>
    <span class="y2k__marquee" aria-hidden="true" style="--mq-dur:${mqDur}s">
      <span class="y2k__reel"><span>${mq}</span><span>${mq}</span></span>
    </span>
    <span class="visually-hidden">${mq}</span>
    <span class="y2k__transport">
      <span class="y2k__key y2k__key--play" data-y2k="play" role="button" aria-pressed="false" aria-label="Играть">${Y2K_GLYPHS.play}</span>
      <span class="y2k__key" data-y2k="stop" role="button" aria-label="Стоп">${Y2K_GLYPHS.stop}</span>
      <span class="y2k__transport-label">hbd·player v1.0</span>
    </span>
  </div>`;
}

/* ——— Скин «Футляр» (валентинка) ———
   Паспарту с небольшим фото и подписью мелким кеглем; поверх — створки
   футляра и латунная лента (SVG). Без valentine.js (каталог, редактор)
   показывается раскрытое состояние; на странице получателя VAL.init
   запечатывает футляр и ведёт жест открытия. */

function renderValentine(t, data) {
  const name = escCard(data.recipientName || 'тебя');
  const title = escCard(data.cardTitle || 'Ты — моё всё');
  const text = data.cardText ? `<span class="val__text">${escCard(data.cardText)}</span>` : '';
  const signature = data.cardSignature ? `<span class="val__signature">${escCard(data.cardSignature)}</span>` : '';
  const photo = data.photoUrl
    ? `<img class="val__photo" src="${data.photoUrl}" alt="Фото в открытке">`
    : `<span class="val__photo val__photo--empty">${motif('heart')}</span>`;

  return `<div class="${tplClasses(t)}">
    <span class="val__mat">
      <span class="val__frame">${photo}<span class="val__vignette" aria-hidden="true"></span></span>
      <span class="val__caption">Для: ${name}</span>
      <span class="val__rule" aria-hidden="true"></span>
      <span class="val__message">
        <span class="val__title">${title}</span>
        ${text}${signature}
      </span>
      <span class="val__sound" data-val="sound" role="button" aria-pressed="false" aria-label="Включить музыку">${Y2K_GLYPHS.sound}</span>
    </span>
    <span class="val__leaf val__leaf--l" aria-hidden="true"></span>
    <span class="val__leaf val__leaf--r" aria-hidden="true"></span>
    <svg class="val__ribbon" data-val="ribbon" viewBox="0 0 75 100" role="button" aria-label="Развязать ленту и открыть открытку">
      <rect class="val__band val__band--top" x="35.6" y="-1" width="3.8" height="46.5" fill="currentColor"/>
      <rect class="val__band val__band--btm" x="35.6" y="54.5" width="3.8" height="46.5" fill="currentColor"/>
      <path class="val__knot" pathLength="1" fill="none" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
        d="M37.5 50 C29.5 43.5 22.5 50 27 55.5 C30 59 36 56.5 37.5 50 C39 56.5 45 59 48 55.5 C52.5 50 45.5 43.5 37.5 50 M35.8 52.5 L31.5 61 M39.2 52.5 L43.5 61"/>
    </svg>
    <span class="val__seal-name">${name}</span>
    <span class="val__hint">Потяните ленту</span>
  </div>`;
}

/* ——— Скин «Полночь» (Новый год) ———
   Момент перехода: до полуночи открытка холодная и размытая, идёт
   отсчёт; в ноль из центра расцветает тёплый свет, фото проясняется,
   появляется текст. Без midnight.js (каталог, редактор) показывается
   тёплое финальное состояние; на странице получателя MN.init включает
   холодную фазу и ведёт переход. */

/* Без фото — циферблат без стрелок: кольцо и 12 делений, деление
   полуночи длиннее. Абстракция момента, не атрибутика праздника */
function mnDial() {
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    const r1 = i === 0 ? 31 : 36;
    ticks += `<line x1="${(50 + r1 * Math.sin(a)).toFixed(2)}" y1="${(50 - r1 * Math.cos(a)).toFixed(2)}"
      x2="${(50 + 40 * Math.sin(a)).toFixed(2)}" y2="${(50 - 40 * Math.cos(a)).toFixed(2)}"/>`;
  }
  return `<svg class="mn__dial" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/>${ticks}</svg>`;
}

function renderMidnight(t, data) {
  const name = escCard(data.recipientName || 'тебя');
  const title = escCard(data.cardTitle || 'С Новым годом!');
  const text = data.cardText ? `<span class="mn__text">${escCard(data.cardText)}</span>` : '';
  const signature = data.cardSignature ? `<span class="mn__signature">— ${escCard(data.cardSignature)}</span>` : '';
  /* фото в два слоя: тёплое чёткое внизу, холодное размытое сверху —
     переход анимирует только opacity, blur посчитан один раз */
  const warm = data.photoUrl
    ? `<img class="mn__photo" src="${data.photoUrl}" alt="Фото в открытке">`
    : mnDial();
  const cold = data.photoUrl
    ? `<img class="mn__photo mn__photo--frozen" src="${data.photoUrl}" alt="">`
    : '';

  return `<div class="${tplClasses(t)}">
    <span class="mn__stage" aria-hidden="true">
      <span class="mn__layer mn__layer--warm">${warm}</span>
      <span class="mn__scrim"></span>
      <span class="mn__layer mn__layer--cold">${cold}<span class="mn__frost"></span></span>
      <span class="mn__glow"></span>
    </span>
    <span class="mn__for">Для: ${name}</span>
    <span class="mn__countdown" aria-hidden="true">
      <span class="mn__clock" data-mn="clock">00:00:00</span>
      <span class="mn__until" data-mn="until">до полуночи</span>
    </span>
    <span class="mn__hint" data-mn="hint">Нажмите — и наступит полночь</span>
    <span class="mn__message">
      <span class="mn__rule" aria-hidden="true"></span>
      <span class="mn__title">${title}</span>
      ${text}${signature}
    </span>
    <span class="mn__sound" data-mn="sound" role="button" aria-pressed="false" aria-label="Включить музыку">${Y2K_GLYPHS.sound}</span>
  </div>`;
}

/*
 * t — шаблон, data — {recipientName, cardTitle, cardText, cardSignature, photoUrl, openMoment, openDate}
 * Возвращает разметку .pcard; снаружи нужен контейнер .pcard-box.
 */
function renderCard(t, data) {
  const m = OCCASIONS[t.occ].motif;
  const recipient = data.recipientName ? `<span class="pcard__recipient">Для: ${escCard(data.recipientName)}</span>` : '';
  const title = `<span class="pcard__title">${escCard(data.cardTitle || 'Заголовок открытки')}</span>`;
  const text = data.cardText ? `<span class="pcard__text">${escCard(data.cardText)}</span>` : '';
  const signature = data.cardSignature ? `<span class="pcard__signature">— ${escCard(data.cardSignature)}</span>` : '';
  const stampCorner = `<span class="pcard__stamp">${motif(m)}</span>`;
  const photo = data.photoUrl ? `<img class="pcard__photo" src="${data.photoUrl}" alt="Фото в открытке">` : '';

  switch (t.arch) {
    case 'y2k':
      return renderY2k(t, data);

    case 'valentine':
      return renderValentine(t, data);

    case 'midnight':
      return renderMidnight(t, data);

    case 'poster':
      return `<div class="${tplClasses(t)}">
        ${stampCorner}${recipient}
        <span class="pcard__figure">${posterFigure(t, data)}</span>
        ${title}${text}${signature}
      </div>`;

    case 'photo':
      return `<div class="${tplClasses(t)}">
        ${photo || `<span class="pcard__photo-fallback">${motif(m)}</span>`}
        <span class="pcard__scrim"></span>
        <div class="pcard__body">${recipient}${title}${text}${signature}</div>
      </div>`;

    case 'note':
      return `<div class="${tplClasses(t)}">
        ${stampCorner}${recipient}${title}${text}${photo}${signature}
      </div>`;

    case 'motif':
      return `<div class="${tplClasses(t)}">
        ${recipient}
        ${motif(m, 'motif pcard__motif')}
        ${title}${text}${photo}${signature}
      </div>`;

    case 'editorial':
    default:
      return `<div class="${tplClasses(t)}">
        ${stampCorner}${recipient}${title}
        <div class="pcard__body">${text}${signature}</div>
        ${photo}
      </div>`;
  }
}

/* Демо-наполнение миниатюр каталога */
const MINI_DEMO = {
  newyear:    { cardTitle: 'С Новым годом!',       cardText: 'Пусть сбудется то, о чём молчали.', cardSignature: 'Маша' },
  birthday:   { cardTitle: 'С днём рождения!',     cardText: 'Лучшему человеку — лучший день.',   cardSignature: 'твои' },
  valentine:  { cardTitle: 'Ты — моё всё',         cardText: 'И это только начало.',              cardSignature: 'Д.' },
  mar8:       { cardTitle: 'С 8 Марта!',           cardText: 'Пусть весна начнётся сегодня.',     cardSignature: 'мы' },
  feb23:      { cardTitle: 'С 23 Февраля!',        cardText: 'За тех, на кого можно положиться.', cardSignature: 'семья' },
  wedding:    { cardTitle: 'Совет да любовь',      cardText: 'Пусть история будет длинной.',      cardSignature: 'гости' },
  graduation: { cardTitle: 'Выпуск!',              cardText: 'Мы правда это сделали.',            cardSignature: 'группа' },
  other:      { cardTitle: 'Просто вспомнил тебя', cardText: 'Без повода. Хорошего дня.',         cardSignature: 'я' }
};

/* Миниатюра шаблона: реальное превью архетипа, не заглушка */
function renderMini(t) {
  return `<div class="pcard-box">${renderCard(t, { recipientName: 'Саша', ...MINI_DEMO[t.occ] })}</div>`;
}
