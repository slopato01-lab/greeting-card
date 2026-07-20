/* ============================================================
   ICONS — собственный SVG-набор.
   Служебные иконки: сетка 24×24, штрих 1.5. Без эмодзи.
   Мотивы поводов: сетка 48×48, оттиск одной краской --stamp,
   линия 1.5px (non-scaling), без заливок. motif('name', size).
   ============================================================ */
'use strict';

(function () {
  /* Мотивы поводов — по одному на повод, стиль почтового оттиска */
  const MOTIFS = {
    snowflake: '<path d="M24 6v36M8.4 15l31.2 18M39.6 15 8.4 33"/><path d="m19.5 8.5 4.5 4 4.5-4M19.5 39.5l4.5-4 4.5 4M7.5 21.5l5.5-1.7 1.4-5.6M7.5 26.5l5.5 1.7 1.4 5.6M40.5 21.5l-5.5-1.7-1.4-5.6M40.5 26.5l-5.5 1.7-1.4 5.6"/>',
    candle: '<path d="M18.5 21.5h11V40h-11z"/><path d="M24 21.5V16"/><path d="M24 5.5c2.6 3 2.6 5.6 0 7.8-2.6-2.2-2.6-4.8 0-7.8z"/><path d="M14 40h20"/><path d="M18.5 27.5c1.8 1.4 3.4-1.2 5.5 0s3.7-1.2 5.5 0"/>',
    heart: '<path d="M24 40.5C15 33.5 8 27.4 8 19.9 8 14.7 12 10.8 16.8 10.8c3.1 0 5.9 1.6 7.2 4.2 1.3-2.6 4.1-4.2 7.2-4.2C36 10.8 40 14.7 40 19.9c0 7.5-7 13.6-16 20.6z"/>',
    mimosa: '<path d="M23 42c-1-12 2-23 10-33"/><path d="M22 31c-4-.6-7-2.6-9-6.4M21.2 36c-4.4 0-8-1.4-11-4.6"/><circle cx="34" cy="7.5" r="2.6"/><circle cx="38.5" cy="12" r="2.6"/><circle cx="29.5" cy="12.5" r="2.6"/><circle cx="34" cy="17" r="2.6"/><circle cx="40" cy="18.5" r="2.6"/><circle cx="28" cy="19.5" r="2.6"/><circle cx="34.5" cy="23.5" r="2.6"/>',
    star: '<path d="m24 6.5 5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 33.6l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z"/>',
    rings: '<circle cx="18.5" cy="28" r="11"/><circle cx="29.5" cy="20" r="11"/>',
    laurel: '<path d="M24 41c-8.5-2.2-14-9.5-14-19M24 41c8.5-2.2 14-9.5 14-19"/><path d="M10.5 15.5c2.8.4 5 1.8 6.4 4.2-2.8.4-5.2-.4-6.4-4.2zM37.5 15.5c-2.8.4-5 1.8-6.4 4.2 2.8.4 5.2-.4 6.4-4.2zM10 24c2.8.6 4.9 2.2 6.1 4.7-2.9.2-5.2-.9-6.1-4.7zM38 24c-2.8.6-4.9 2.2-6.1 4.7 2.9.2 5.2-.9 6.1-4.7zM13 32c2.8.8 4.7 2.6 5.6 5.2-2.9 0-5-1.4-5.6-5.2zM35 32c-2.8.8-4.7 2.6-5.6 5.2 2.9 0 5-1.4 5.6-5.2z"/>',
    raydot: '<circle cx="24" cy="24" r="4.5"/><path d="M24 7v6.5M24 34.5V41M7 24h6.5M34.5 24H41M12 12l4.6 4.6M31.4 31.4 36 36M36 12l-4.6 4.6M16.6 31.4 12 36"/>'
  };

  const PATHS = {
    /* Служебные */
    'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
    'arrow-left': '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4V5a1 1 0 0 1 1-1h10v1"/>',
    share: '<circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="m8.4 10.8 6.8-4M8.4 13.2l6.8 4"/>',
    qr: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><path d="M13.5 13.5h3v3h-3zM20 13.5v.01M16.5 20H20v-3.5"/>',
    clock: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.5V12l3 2.5"/>',
    users: '<circle cx="9" cy="8.5" r="3.4"/><path d="M3.5 19.5c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><path d="M15.5 5.6a3.4 3.4 0 0 1 0 5.8M17.4 14.9c1.8.8 3 2.5 3.4 4.6"/>',
    music: '<path d="M9 18.5V6.2l10-2v12.1"/><circle cx="6.6" cy="18.6" r="2.4"/><circle cx="16.6" cy="16.4" r="2.4"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m3.5 16.5 4.5-4 4 3.5 3.5-3 5 4"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 8.9"/><path d="M4.5 4.5v4.4h4.4"/>',
    gamepad: '<path d="M7 8h10a4.5 4.5 0 0 1 4.5 4.7c-.1 2.4-.7 4.8-2.1 4.8-2.3 0-2.5-2.5-4.4-2.5H9c-1.9 0-2.1 2.5-4.4 2.5-1.4 0-2-2.4-2.1-4.8A4.5 4.5 0 0 1 7 8z"/><path d="M8.5 11v3M7 12.5h3M15.5 11.6v.01M17.5 13.4v.01"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 .4l2.5-2.5a4 4 0 1 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-6-.4l-2.5 2.5a4 4 0 1 0 5.7 5.7l1.2-1.2"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7.5 7.5 6 7.5-6"/>',
    lock: '<rect x="5.5" y="11" width="13" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 14.5v2"/>',
    send: '<path d="M20.5 3.5 3.5 10l6.5 2.5 2.5 6.5 8-15.5z"/><path d="m10 12.5 4.5-4.5"/>',
    peel: '<path d="M19.5 12.5v-6a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h6"/><path d="M19.5 12.5h-5a2 2 0 0 0-2 2v5c3.9-.6 6.4-3.1 7-7z"/>',
    edit: '<path d="M14.5 5.5 18.5 9.5 8.5 19.5H4.5v-4z"/><path d="m12.5 7.5 4 4"/>',

    /* Мини-игры */
    spark: '<path d="M12 4c.6 3.6 2.4 5.4 8 8-5.6 2.6-7.4 4.4-8 8-.6-3.6-2.4-5.4-8-8 5.6-2.6 7.4-4.4 8-8z"/>',
    snowflake: '<path d="M12 3.5v17M4.6 7.75l14.8 8.5M19.4 7.75l-14.8 8.5"/><path d="m9.8 5.2 2.2 2 2.2-2M14.2 18.8l-2.2-2-2.2 2"/>',
    balloon: '<ellipse cx="12" cy="9.5" rx="5.2" ry="6"/><path d="M12 15.5c-1.5 1.6 1.5 2.6 0 4.5"/>',
    heart: '<path d="M12 19.5c-4.5-3.4-8-6.4-8-10.1C4 6.8 6 4.9 8.4 4.9c1.5 0 2.9.8 3.6 2.1.7-1.3 2.1-2.1 3.6-2.1C18 4.9 20 6.8 20 9.4c0 3.7-3.5 6.7-8 10.1z"/>',
    coin: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/>',
    bouquet: '<path d="M11.5 20.5c-.4-5.5 1-10.5 4.5-15"/><path d="M11.8 14.5c-2.2-.3-3.9-1.4-5-3.4"/><circle cx="16.5" cy="4.5" r="1.4"/><circle cx="19" cy="7" r="1.4"/><circle cx="14" cy="7.5" r="1.4"/><circle cx="17" cy="10" r="1.4"/>',
    salute: '<circle cx="12" cy="12" r="1.8"/><path d="M12 3.5v3.2M12 17.3v3.2M3.5 12h3.2M17.3 12h3.2M6 6l2.3 2.3M15.7 15.7 18 18M18 6l-2.3 2.3M8.3 15.7 6 18"/>',
    rings: '<circle cx="9.3" cy="13.8" r="5.8"/><circle cx="14.7" cy="10.2" r="5.8"/>',
    cap: '<path d="m2.5 9.5 9.5-4 9.5 4-9.5 4z"/><path d="M6.5 11.2v4.5c0 1.5 2.5 2.8 5.5 2.8s5.5-1.3 5.5-2.8v-4.5"/><path d="M21.5 9.5v5"/>'
  };

  const symbols = Object.entries(PATHS)
    .map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`)
    .join('');

  function inject() {
    const holder = document.createElement('div');
    holder.setAttribute('aria-hidden', 'true');
    holder.style.display = 'none';
    holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
    document.body.prepend(holder);
    document.querySelectorAll('[data-icon]').forEach(el => {
      el.innerHTML = icon(el.dataset.icon, el.dataset.iconSize || 20);
    });
  }

  window.icon = function (name, size = 20, cls = '') {
    return `<svg class="icon ${cls}" width="${size}" height="${size}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  };

  /* Мотив инлайном: vector-effect работает только на самих путях */
  window.motif = function (name, cls = 'motif') {
    return `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true">${MOTIFS[name] || MOTIFS.raydot}</svg>`;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
