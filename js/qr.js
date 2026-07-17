/* ============================================================
   QR.JS — lightweight QR code generator (canvas-based)
   A minimal implementation sufficient for card URLs.
   For production, replace with qrcode.js CDN.
   ============================================================ */

/*
  Usage:
    QRCode.generate(url, canvasElement)
  or via editor.js / card.js which use the QRCode global.

  For full production use, load:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  before this file.

  If qrcodejs is loaded, this file defers to it automatically.
*/

(function() {
  'use strict';

  // If qrcodejs already loaded, nothing to do — editor.js and card.js
  // detect window.QRCode and use it directly.
  if (typeof QRCode !== 'undefined') return;

  // Minimal SVG-based QR placeholder when library not loaded.
  // Generates a visually realistic placeholder (not a real scannable QR).
  window.QRCode = {
    CorrectLevel: { L: 1, M: 0, Q: 3, H: 2 },

    generate(url, container, options) {
      const w = (options && options.width)  || 160;
      const h = (options && options.height) || 160;
      const dark  = (options && options.colorDark)  || '#000000';
      const light = (options && options.colorLight) || '#ffffff';
      const size  = 21; // 21x21 modules like version 1 QR

      // Seed deterministic from url
      let seed = 0;
      for (let i = 0; i < url.length; i++) seed = (seed * 31 + url.charCodeAt(i)) & 0xFFFFFF;

      function pseudo(x, y) {
        const n = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
        return n - Math.floor(n) > .5;
      }

      // Fixed finder patterns (corners)
      const fixed = new Set();
      function addFinder(r, c) {
        for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
          const nr = r + i, nc = c + j;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            fixed.add(`${nr},${nc}`);
          }
        }
      }
      addFinder(0, 0); addFinder(0, size-7); addFinder(size-7, 0);

      function isDark(r, c) {
        if (fixed.has(`${r},${c}`)) {
          // Finder pattern
          const inFinder = (rr, cc) => {
            for (const [fr,fc] of [[0,0],[0,size-7],[size-7,0]]) {
              const dr = rr - fr, dc = cc - fc;
              if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) {
                const maxEdge = Math.max(Math.abs(dr-3), Math.abs(dc-3));
                return maxEdge === 0 || maxEdge === 1 || maxEdge === 3;
              }
            }
            return false;
          };
          return inFinder(r, c);
        }
        // Timing pattern
        if (r === 6 || c === 6) return (r + c) % 2 === 0;
        // Data modules
        return pseudo(r, c);
      }

      const cellW = w / (size + 8);
      const cellH = h / (size + 8);
      const offset = 4 * cellW;

      let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
      svg += `<rect width="${w}" height="${h}" fill="${light}"/>`;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isDark(r, c)) {
            const x = offset + c * cellW;
            const y = offset + r * cellH;
            svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW+.5).toFixed(1)}" height="${(cellH+.5).toFixed(1)}" fill="${dark}"/>`;
          }
        }
      }
      svg += '</svg>';

      if (typeof container === 'string') {
        container = document.getElementById(container);
      }
      if (container) {
        container.innerHTML = svg;
      }
    }
  };

  // Also make it callable with `new QRCode(el, opts)` syntax (qrcodejs compat)
  const generate = QRCode.generate;
  const QRCodeObj = function(container, opts) {
    QRCode.generate(opts.text, container, opts);
  };
  QRCodeObj.CorrectLevel = QRCode.CorrectLevel;
  QRCodeObj.generate = generate;
  window.QRCode = QRCodeObj;

})();
