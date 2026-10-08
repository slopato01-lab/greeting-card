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

await writeFile(
  resolve(DIR, "CREDITS.md"),
  `# Стикеры

Рисованные (колпак, свеча, огонёк, спичка, ленты, сердечки, искры,
конфетти, ёлочные шары, снежинка, заглушка фото) — свои,
scripts/draw-stickers.py.

Остальные — Noto Emoji, © Google, лицензия Apache 2.0,
https://github.com/googlefonts/noto-emoji:

${Object.entries(NOTO)
  .map(([id, icon]) => `- \`${id}.svg\` — noto:${icon}`)
  .join("\n")}
`,
);
console.log(`Готово: ${Object.keys(NOTO).length} стикеров Noto.`);
