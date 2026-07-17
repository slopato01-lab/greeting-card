/* ============================================================
   ICONS — собственный SVG-набор.
   Сетка 24×24, штрих 1.75, скруглённые окончания. Без эмодзи.
   Спрайт вставляется в DOM, иконки берутся через icon('name').
   ============================================================ */
'use strict';

(function () {
  const PATHS = {
    /* Праздники */
    snowflake: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.6 5.4 12 7.8l2.4-2.4M9.6 18.6 12 16.2l2.4 2.4"/>',
    cake: '<path d="M4 20.5h16M5.5 20.5v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6"/><path d="M8.5 12.5V10M12 12.5V9.5M15.5 12.5V10"/><path d="M8.5 7.5c.9-.9.9-1.8 0-2.7M12 7c.9-.9.9-1.8 0-2.7M15.5 7.5c.9-.9.9-1.8 0-2.7"/>',
    heart: '<path d="M12 20.3C7.4 16.7 3.9 13.4 3.9 9.9 3.9 7.4 5.8 5.5 8.2 5.5c1.6 0 3 .8 3.8 2.1.8-1.3 2.2-2.1 3.8-2.1 2.4 0 4.3 1.9 4.3 4.4 0 3.5-3.5 6.8-8.1 10.4z"/>',
    tulip: '<path d="M12 13.5c3.1 0 5-2.2 5-5.3V5.6l-2.5 1.7L12 4.8 9.5 7.3 7 5.6v2.6c0 3.1 1.9 5.3 5 5.3zM12 13.5v7"/><path d="M12 18.5c-2.9 0-4.9-1.4-5.4-3.8M12 18.5c2.9 0 4.9-1.4 5.4-3.8"/>',
    star: '<path d="m12 3.6 2.6 5.2 5.8.9-4.2 4.1 1 5.7L12 16.8l-5.2 2.7 1-5.7-4.2-4.1 5.8-.9z"/>',
    rings: '<circle cx="9" cy="14" r="5.4"/><circle cx="15" cy="10" r="5.4"/>',
    gradcap: '<path d="m3 9.8 9-4.3 9 4.3-9 4.3z"/><path d="M7 11.7v4.1c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-4.1M21 9.8v5.4"/>',
    spark: '<path d="M12 3c.6 4.8 2.4 6.9 9 9-6.6 2.1-8.4 4.2-9 9-.6-4.8-2.4-6.9-9-9 6.6-2.1 8.4-4.2 9-9z"/>',
    balloon: '<path d="M12 3.5c3 0 5.4 2.5 5.4 5.9 0 3.3-2.4 6.1-5.4 6.1s-5.4-2.8-5.4-6.1c0-3.4 2.4-5.9 5.4-5.9z"/><path d="m11 15.4.5 1.8h1l.5-1.8M12 17.2c0 1.6-1.6 1.8-1.6 3.3"/>',
    coin: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v8.8M8.8 10.2h6.4M8.8 13.8h6.4"/>',

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
    edit: '<path d="M14.5 5.5 18.5 9.5 8.5 19.5H4.5v-4z"/><path d="m12.5 7.5 4 4"/>'
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
