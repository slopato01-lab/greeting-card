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
};

for (const [id, icon] of Object.entries(NOTO)) {
  const response = await fetch(`https://api.iconify.design/noto/${icon}.svg?width=512&height=512`);
  if (!response.ok) throw new Error(`noto:${icon} — ${response.status}`);
  await writeFile(resolve(DIR, `${id}.svg`), await response.text());
  console.log(`${id.padEnd(18)} ← noto:${icon}`);
}

// Чёрно-белый торт для афиши-приглашения: тот же Noto, обесцвеченный
// фильтром внутри SVG — так он в одном ключе с чёрно-белым фото.
{
  const response = await fetch(
    "https://api.iconify.design/noto/birthday-cake.svg?width=512&height=512",
  );
  if (!response.ok) throw new Error(`noto:birthday-cake — ${response.status}`);
  const svg = await response.text();
  const mono = svg
    .replace(
      /(<svg[^>]*>)/,
      '$1<defs><filter id="mono"><feColorMatrix type="saturate" values="0"/></filter></defs><g filter="url(#mono)">',
    )
    .replace(/<\/svg>\s*$/, "</g></svg>");
  await writeFile(resolve(DIR, "cake-mono.svg"), mono);
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

\`sample-party.png\` — пример фото в афише-приглашении: Unsplash,
https://images.unsplash.com/photo-1531746020798-e6953c6e8e04 (лицензия Unsplash).
Фон убран моделью MediaPipe selfie_segmenter, фото переведено в ч/б.

\`cake-photo.png\` — торт в афише-приглашении: Unsplash,
https://images.unsplash.com/photo-1562440499-64c9a111f713 (лицензия Unsplash).
Белый фон снят заливкой (ImageMagick), фото переведено в ч/б.
`,
);
console.log(`Готово: ${Object.keys(NOTO).length} стикеров Noto.`);
