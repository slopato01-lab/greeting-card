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
