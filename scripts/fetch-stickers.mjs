/**
 * Скачивает стикеры-картинки Noto Emoji (Apache 2.0) из Iconify
 * в public/assets/stickers. Рисованные стикеры делает
 * scripts/draw-stickers.py, здесь — только сложные предметы, которые
 * руками не нарисовать прилично: ёлка, цветы, бокалы.
 *
 * Запускается руками: pnpm stickers:fetch. В сборке не участвует —
 * файлы лежат в репозитории, прод не зависит от чужого API.
 *
 * Размер 512 × 512 задаётся атрибутами: холст рисует SVG через <img>,
 * и без собственного размера Firefox его не нарисует, а остальные
 * растеризуют в 128 и мылят при увеличении.
 */
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = resolve(ROOT, "public/assets/stickers");

/** id стикера → иконка Noto. Список id — STICKER_IDS в lib/editor/document.ts. */
const NOTO = {
  gift: "wrapped-gift",
  balloon: "balloon",
  "party-popper": "party-popper",
  "christmas-tree": "christmas-tree",
  snowman: "snowman-without-snow",
  "glowing-star": "glowing-star",
  tulip: "tulip",
  bouquet: "bouquet",
  blossom: "blossom",
  rose: "rose",
  "love-letter": "love-letter",
  "kiss-mark": "kiss-mark",
  ribbon: "ribbon",
  "clinking-glasses": "clinking-glasses",
  // Серия по design/открытки/ (08.10.2026): диско, кино, котята, вишни.
  "mirror-ball": "mirror-ball",
  cocktail: "cocktail-glass",
  popcorn: "popcorn",
  cat: "cat",
  "black-cat": "black-cat",
  "cat-face": "cat-face",
  cupcake: "cupcake",
  "birthday-cake": "birthday-cake",
  sunflower: "sunflower",
  strawberry: "strawberry",
  cherries: "cherries",
};

/** Обесцвеченные: диско-шар на макете серебряный, у Noto он сине-фиолетовый. */
const MONO = new Set(["mirror-ball"]);

/** Тот же SVG, обёрнутый в фильтр без насыщенности. */
function desaturate(svg) {
  return svg
    .replace(
      /(<svg[^>]*>)/,
      '$1<defs><filter id="mono"><feColorMatrix type="saturate" values="0"/></filter></defs><g filter="url(#mono)">',
    )
    .replace(/<\/svg>\s*$/, "</g></svg>");
}

for (const [id, icon] of Object.entries(NOTO)) {
  const response = await fetch(`https://api.iconify.design/noto/${icon}.svg?width=512&height=512`);
  if (!response.ok) throw new Error(`noto:${icon} — ${response.status}`);
  const svg = await response.text();
  await writeFile(resolve(DIR, `${id}.svg`), MONO.has(id) ? desaturate(svg) : svg);
  console.log(`${id.padEnd(18)} ← noto:${icon}`);
}

// Чёрно-белый торт для афиши-приглашения: тот же Noto, обесцвеченный
// фильтром внутри SVG — так он в одном ключе с чёрно-белым фото.
{
  const response = await fetch(
    "https://api.iconify.design/noto/birthday-cake.svg?width=512&height=512",
  );
  if (!response.ok) throw new Error(`noto:birthday-cake — ${response.status}`);
  await writeFile(resolve(DIR, "cake-mono.svg"), desaturate(await response.text()));
  console.log(`${"cake-mono".padEnd(18)} ← noto:birthday-cake, ч/б`);
}

await writeFile(
  resolve(DIR, "CREDITS.md"),
  `# Стикеры

Рисованные (колпак, свеча, огонёк, спичка, ленты, сердечки, искры,
конфетти, ёлочные шары, снежинка, заглушка фото) — свои,
scripts/draw-stickers.py.

\`sample-birthday.png\` — пример фото в шаблоне «День рождения»: Unsplash,
https://images.unsplash.com/photo-1471286174890-9c112ffca5b4 (лицензия Unsplash).
Фон убран моделью MediaPipe selfie_segmenter, фото переведено в ч/б.

Остальные — Noto Emoji, © Google, лицензия Apache 2.0,
https://github.com/googlefonts/noto-emoji:

${Object.entries(NOTO)
  .map(([id, icon]) => `- \`${id}.svg\` — noto:${icon}`)
  .join("\n")}
- \`cake-mono.svg\` — noto:birthday-cake, обесцвечен фильтром
- \`mirror-ball.svg\` обесцвечен тем же фильтром

\`sample-party.png\` — пример фото в афише-приглашении: Unsplash,
https://images.unsplash.com/photo-1531746020798-e6953c6e8e04 (лицензия Unsplash).
Фон убран моделью MediaPipe selfie_segmenter, фото переведено в ч/б.

\`cake-photo.png\` — торт в афише-приглашении: Unsplash,
https://images.unsplash.com/photo-1562440499-64c9a111f713 (лицензия Unsplash).
Белый фон снят заливкой (ImageMagick), фото переведено в ч/б.

\`sample-sq-*\`, \`sample-wide-*\`, \`sample-bw-*\` — примеры фото в шаблонах
серии по design/открытки/: Unsplash (лицензия Unsplash), скачаны через
picsum.photos по номеру, обрезаны по центру, \`bw\` — в ч/б:

- \`sample-sq-1\` — Morgan Sessions, https://unsplash.com/photos/TS2UKluECVE
- \`sample-sq-2\` — Jessica Polar, https://unsplash.com/photos/l5d9Zp7HO6o
- \`sample-sq-3\` — Julia Caesar, https://unsplash.com/photos/DpoMKEARZe4
- \`sample-sq-4\` — Julia Caesar, https://unsplash.com/photos/3-3k_sYEJ1s
- \`sample-sq-5\` — Morgan Sessions, https://unsplash.com/photos/YIN4xUBaqnk
- \`sample-sq-6\` — Nicholas Swanson, https://unsplash.com/photos/agnhLQWqr1Q
- \`sample-sq-7\` — London Scout, https://unsplash.com/photos/4-gFGb12hFA
- \`sample-sq-8\` — Matthew Skinner, https://unsplash.com/photos/t05kfHeygbE
- \`sample-sq-9\` — Desi Mendoza, https://unsplash.com/photos/CuSHBGBdXc0
- \`sample-sq-10\` — Brooklyn Morgan, https://unsplash.com/photos/vlSyS1VLCoQ
- \`sample-sq-11\` — Benjamin Combs, https://unsplash.com/photos/hiAdjnXZxl8
- \`sample-sq-12\` — Léa Dubedout, https://unsplash.com/photos/N6STB5KbRUU
- \`sample-wide-1\`, \`sample-bw-1\` — Charlie Foster, https://unsplash.com/photos/A88emaZe7d8
- \`sample-wide-2\`, \`sample-bw-sq\` — Mayur Gala, https://unsplash.com/photos/2PODhmrvLik
- \`sample-wide-3\`, \`sample-bw-2\` — London Scout, https://unsplash.com/photos/mE9DC6I1_8I
- \`sample-wide-4\` — Lechon Kirb, https://unsplash.com/photos/yvx7LSZSzeo
- \`sample-wide-5\` — Sunset Girl, https://unsplash.com/photos/FjAD28N8-IQ
- \`sample-wide-6\` — veeterzy, https://unsplash.com/photos/OJJIaFZOeX4
- \`sample-bw-3\` — Jessica Polar, https://unsplash.com/photos/l5d9Zp7HO6o
- \`sample-bw-4\` — Julia Caesar, https://unsplash.com/photos/DpoMKEARZe4
- \`sample-bw-5\` — Brooklyn Morgan, https://unsplash.com/photos/vlSyS1VLCoQ

Вырезанные примеры людей (08.10.2026) — StockSnap, CC0. Фон убран
моделью MediaPipe selfie_segmenter, дыры в силуэте залиты, у невесты
контуром срезана мама за спиной; \`sample-disco\` — в ч/б:

- \`sample-groom.png\` — Direct Media, https://stocksnap.io/photo/child-toddler-D5VVUIQNDL
- \`sample-bride.png\` — Direct Media, https://stocksnap.io/photo/baby-girl-TOPVUEPEKK
- \`sample-cinema.png\` — Kristin Hardwick, https://stocksnap.io/photo/woman-business-B9BEJYBUZ5
- \`sample-disco.png\` — Kristin Hardwick, https://stocksnap.io/photo/young-man-SEZ0BOQJBD
`,
);
console.log(`Готово: ${Object.keys(NOTO).length} стикеров Noto.`);
