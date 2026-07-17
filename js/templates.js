/* ============================================================
   TEMPLATES — общие данные шаблонов и поводов.
   Один фундамент: нейтрали + типографика из токенов,
   у каждого повода один акцент и одна иконка из своего набора.
   Подключается на всех страницах до editor.js / card.js.
   ============================================================ */
'use strict';

const OCCASIONS = {
  newyear:    { label: 'Новый год',      icon: 'snowflake', game: 'snowflakes' },
  birthday:   { label: 'День рождения',  icon: 'cake',      game: 'balloons' },
  valentine:  { label: '14 февраля',     icon: 'heart',     game: 'hearts' },
  mar8:       { label: '8 Марта',        icon: 'tulip',     game: 'hearts' },
  feb23:      { label: '23 Февраля',     icon: 'star',      game: 'coins' },
  wedding:    { label: 'Свадьба',        icon: 'rings',     game: 'coins' },
  graduation: { label: 'Выпускной',      icon: 'gradcap',   game: 'balloons' },
  other:      { label: 'Просто так',     icon: 'spark',     game: 'balloons' }
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

/* surface: light | dark | accent; pattern: none | dots | grid | stripes | rays */
const TEMPLATES = [
  { id: 'ny_scandinavian', name: 'Скандинавский', occ: 'newyear',    cat: 'newyear',    surface: 'light',  pattern: 'dots' },
  { id: 'ny_soviet',       name: 'Ретро',         occ: 'newyear',    cat: 'newyear',    surface: 'dark',   pattern: 'stripes' },
  { id: 'ny_cyberpunk',    name: 'Полночь',       occ: 'newyear',    cat: 'newyear',    surface: 'dark',   pattern: 'grid' },
  { id: 'ny_cozy',         name: 'Уютный',        occ: 'newyear',    cat: 'newyear',    surface: 'light',  pattern: 'none' },
  { id: 'ny_meme',         name: 'Дерзкий',       occ: 'newyear',    cat: 'newyear',    surface: 'accent', pattern: 'rays' },

  { id: 'bday_elegant',    name: 'Монохром',      occ: 'birthday',   cat: 'birthday',   surface: 'dark',   pattern: 'none' },
  { id: 'bday_meme',       name: 'Мемный',        occ: 'birthday',   cat: 'birthday',   surface: 'accent', pattern: 'rays' },
  { id: 'bday_kids',       name: 'Детский',       occ: 'birthday',   cat: 'birthday',   surface: 'light',  pattern: 'dots' },
  { id: 'bday_party',      name: 'Вечеринка',     occ: 'birthday',   cat: 'birthday',   surface: 'dark',   pattern: 'stripes' },

  { id: 'val_watercolor',  name: 'Нежный',        occ: 'valentine',  cat: 'valentine',  surface: 'light',  pattern: 'dots' },
  { id: 'val_minimal',     name: 'Минимализм',    occ: 'valentine',  cat: 'valentine',  surface: 'light',  pattern: 'none' },
  { id: 'val_vintage',     name: 'Винтаж',        occ: 'valentine',  cat: 'valentine',  surface: 'dark',   pattern: 'stripes' },
  { id: 'val_romantic',    name: 'Страсть',       occ: 'valentine',  cat: 'valentine',  surface: 'accent', pattern: 'none' },

  { id: 'mar8_corporate',  name: 'Строгий',       occ: 'mar8',       cat: 'holidays',   surface: 'light',  pattern: 'none' },
  { id: 'mar8_floral',     name: 'Цветочный',     occ: 'mar8',       cat: 'holidays',   surface: 'light',  pattern: 'dots' },
  { id: 'mar8_pink',       name: 'Яркий',         occ: 'mar8',       cat: 'holidays',   surface: 'accent', pattern: 'rays' },
  { id: 'feb23_blue',      name: 'Стальной',      occ: 'feb23',      cat: 'holidays',   surface: 'dark',   pattern: 'grid' },

  { id: 'wed_classic',     name: 'Классика',      occ: 'wedding',    cat: 'wedding',    surface: 'light',  pattern: 'none' },
  { id: 'wed_boho',        name: 'Бохо',          occ: 'wedding',    cat: 'wedding',    surface: 'light',  pattern: 'dots' },
  { id: 'wed_modern',      name: 'Модерн',        occ: 'wedding',    cat: 'wedding',    surface: 'dark',   pattern: 'none' },

  { id: 'grad_gradient',   name: 'Громкий',       occ: 'graduation', cat: 'graduation', surface: 'accent', pattern: 'rays' },
  { id: 'grad_academic',   name: 'Академия',      occ: 'graduation', cat: 'graduation', surface: 'light',  pattern: 'grid' },

  { id: 'just_warm',       name: 'Тёплый',        occ: 'other',      cat: 'other',      surface: 'light',  pattern: 'dots' },
  { id: 'just_abstract',   name: 'Абстракция',    occ: 'other',      cat: 'other',      surface: 'dark',   pattern: 'grid' },
  { id: 'just_retro90',    name: 'Ретро-90е',     occ: 'other',      cat: 'other',      surface: 'accent', pattern: 'stripes' }
];

const GAMES = {
  auto:       { label: 'По теме открытки' },
  snowflakes: { label: 'Поймай снежинки', icon: 'snowflake' },
  balloons:   { label: 'Лопни шарики',    icon: 'balloon' },
  hearts:     { label: 'Найди сердечки',  icon: 'heart' },
  coins:      { label: 'Лови монеты',     icon: 'coin' },
  none:       { label: 'Без игры' }
};

function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

/* Классы поверхности шаблона для .tpl-элемента */
function tplClasses(t) {
  return `tpl tpl--occ-${t.occ} tpl--${t.surface} tpl--pat-${t.pattern}`;
}

/* Игра шаблона с учётом выбора отправителя */
function resolveGame(cardGame, t) {
  return (cardGame === 'auto' || !cardGame) ? OCCASIONS[t.occ].game : cardGame;
}
