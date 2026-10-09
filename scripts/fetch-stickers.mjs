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
  // Третья серия (09.10.2026): мишки в «Happy Birthday» с фотоаппаратом.
  "teddy-bear": "teddy-bear",
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
- \`sample-cinema.png\` — Kris Kemp, https://stocksnap.io/photo/fashion-model-ZI3P3U28P8
  (с 09.10.2026: девушка в пиджаке; фон убран selfie_segmenter)
- \`sample-disco.png\` — Kristin Hardwick, https://stocksnap.io/photo/young-man-SEZ0BOQJBD

Вторая серия по design/открытки/ (09.10.2026) — StockSnap, CC0.
Обрезаны под окно шаблона, \`sample-love-*\`, \`sample-strip-*\`,
\`sample-wed-2\`, \`sample-amor-*\` — в ч/б:

- \`sample-love-1.jpg\` — Kaci Baum, https://stocksnap.io/photo/bride-groom-HXDO55F695
- \`sample-love-2.jpg\` — Pablo Heimplatz, https://stocksnap.io/photo/people-man-TBZCYT5FNL
- \`sample-love-bg.jpg\` — Kaci Baum, https://stocksnap.io/photo/bride-groom-HXDO55F695
- \`sample-strip-1.jpg\` — Nathan Walker, https://stocksnap.io/photo/couple-kissing-JRTQVF9EQC
- \`sample-strip-2.jpg\` — Freestocks.org, https://stocksnap.io/photo/bokeh-people-TO66YCNJNJ
- \`sample-strip-3.jpg\` — Direct Media, https://stocksnap.io/photo/couple-kissing-UHDB9OMRIQ
- \`sample-strip-4.jpg\` — Direct Media, https://stocksnap.io/photo/couple-kissing-X8N6YH8IZD
- \`sample-strip-5.jpg\` — frank mckenna, https://stocksnap.io/photo/couple-man-F7HEUYRTTH
- \`sample-strip-6.jpg\` — Alejandra Quiroz, https://stocksnap.io/photo/sunset-kiss-61C38E9964
- \`sample-xmas-friends.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-couple-6VMDVAWS4C
- \`sample-xmas-1.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-tree-GRDBC0N50P
- \`sample-xmas-2.jpg\` — PS Imaging, https://stocksnap.io/photo/grandmother-child-NNKPN9QYIR
- \`sample-xmas-3.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-tree-XJWYEY8SWX
- \`sample-xmas-4.jpg\` — PS Imaging, https://stocksnap.io/photo/grandmother-child-LPKCDYIP2T
- \`sample-xmas-5.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-child-EVLWWY2UJG
- \`sample-xmas-6.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-person-Z5WZJHCE1Y
- \`sample-xmas-7.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-person-PDODQ5ZLZ2
- \`sample-xmas-8.jpg\` — William Stitt, https://stocksnap.io/photo/hat-woman-4HL8TN3VNN
- \`sample-xmas-9.jpg\` — Family Moments, https://stocksnap.io/photo/family-christmas-BWCM0CU0M8
- \`sample-xmas-10.jpg\` — PS Imaging, https://stocksnap.io/photo/christmas-child-GO3ZJSS5Z1
- \`sample-wed-1.jpg\` — Glen McCallum, https://stocksnap.io/photo/people-man-RWMC95HRC0
- \`sample-wed-2.jpg\` — Candace McDaniel, https://stocksnap.io/photo/bride-wedding-MLZEIPZX1P
- \`sample-amor-1.jpg\` — Scott Webb, https://stocksnap.io/photo/engagement-ring-4IFH7OWDL8
- \`sample-amor-2.jpg\` — Shelby Deeter, https://stocksnap.io/photo/couple-love-0X3DOGA75K
- \`sample-amor-3.jpg\` — frank mckenna, https://stocksnap.io/photo/couple-man-F7HEUYRTTH
- \`sample-sunset.jpg\` — Caleb Ekeroth, https://stocksnap.io/photo/couple-love-6QXTZFW51U
- \`xmas-tree-photo.png\` — Pawel Kadysz, https://stocksnap.io/photo/christmas-tree-ELVRAJB0NI
  (край срезан волной, 256 цветов)

Третья серия по design/открытки/ (09.10.2026) — StockSnap, CC0, превью 960 px,
обрезаны под окно шаблона:

- \`sample-cover.jpg\` — Candace McDaniel, https://stocksnap.io/photo/woman-model-CRHFNXOZMG
- \`camera-real.png\` — Thomas Backa, https://www.flickr.com/photos/76297116@N00/4116965145
  (Flickr, CC0; фон снят по контуру корпуса, повёрнут вертикально)
- \`sample-bff-1.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-fun-TK55STNQN8, тонировано в красный
- \`sample-bff-2.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-fun-NPEZGYPUYP, тонировано в красный
- \`sample-bff-3.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-together-UHTM70G1AS, тонировано в красный
- \`sample-bff-4.jpg\` — Candace McDaniel, https://stocksnap.io/photo/women-friends-9VP7PKBGGT, тонировано в красный
- \`sample-bff-5.jpg\` — Candace McDaniel, https://stocksnap.io/photo/girl-friends-3YF2EP4KOA, тонировано в красный
- \`sample-bff-6.jpg\` — Bruce Mars, https://stocksnap.io/photo/friends-dinner-RRSDBIHUMS, тонировано в красный
- \`sample-kodak-1.jpg\` — Hiking Adventures, https://stocksnap.io/photo/friends-hiking-WQE4AZ2BPU
- \`sample-kodak-2.jpg\` — Living Together, https://stocksnap.io/photo/couple-selfie-XNOUUIHJGG
- \`sample-kodak-3.jpg\` — Brodie Vissers, https://stocksnap.io/photo/people-men-XO53SBWVMF
- \`sample-kodak-4.jpg\` — Duri from Mocup, https://stocksnap.io/photo/couple-man-E9QVYLY3DI
- \`sample-kodak-5.jpg\` — Clarisse Meyer, https://stocksnap.io/photo/people-friends-EVSKT1I1QG
- \`sample-kodak-6.jpg\` — Helena Lopes, https://stocksnap.io/photo/group-friends-YBGQFVYDDC
- \`sample-kodak-big.jpg\` — Candace McDaniel, https://stocksnap.io/photo/selfie-women-TDLN8CRA4P
- \`sample-cam.jpg\` — Benjamin Combs, https://stocksnap.io/photo/girl-woman-TNK87N7464
- \`sample-pin.jpg\` — Scott Webb, https://stocksnap.io/photo/couple-love-MIMZ4PUM2F
- \`sample-tape.jpg\` — Redd Angelo, https://stocksnap.io/photo/couple-love-CTYF2POOT3
- \`sample-moon-1.jpg\` — Helena Lopes, https://stocksnap.io/photo/friends-hugging-6ZYX4YY4IR, ч/б
- \`sample-moon-2.jpg\` — Helena Lopes, https://stocksnap.io/photo/friends-family-EI9BBWFMXB, ч/б
- \`sample-moon-3.jpg\` — Helena Lopes, https://stocksnap.io/photo/male-friends-HFWBLKKCXV, ч/б
- \`sample-moon-4.jpg\` — Helena Lopes, https://stocksnap.io/photo/group-friends-M16QHPDGYJ, ч/б
- \`sample-moon-5.jpg\` — Helena Lopes, https://stocksnap.io/photo/friends-picnic-3IVBNKC2JH, ч/б
- \`sample-moon-6.jpg\` — Aidan Meyer, https://stocksnap.io/photo/people-friends-DDYC9U7O2P, ч/б
- \`sample-moon-7.jpg\` — Aidan Meyer, https://stocksnap.io/photo/group-friends-B740UADQ1E, ч/б
- \`sample-moon-8.jpg\` — Daria Shevtsova, https://stocksnap.io/photo/friends-talking-JQCWIM78PZ, ч/б
- \`sample-moon-9.jpg\` — Tirachard Kumtanom, https://stocksnap.io/photo/people-friends-5ZC9K92S09, ч/б
- \`sample-moon-10.jpg\` — Oliver Sjöström, https://stocksnap.io/photo/friends-running-KWBUZNDC9A, ч/б
- \`sample-moon-11.jpg\` — Asaf R, https://stocksnap.io/photo/friends-people-SG89Q67Y7J, ч/б
- \`sample-moon-12.jpg\` — Candace McDaniel, https://stocksnap.io/photo/girl-friends-VCOMSBEPUK, ч/б
- \`sample-moon-13.jpg\` — RachelH, https://stocksnap.io/photo/silhouette-family-Q7UIKF58IR, ч/б
- \`sample-moon-14.jpg\` — Ian Schneider, https://stocksnap.io/photo/peace-girls-G9CLJC5580, ч/б
- \`sample-moon-15.jpg\` — Living Together, https://stocksnap.io/photo/couple-selfie-IR1NI4RTUN, ч/б
- \`sample-moon-16.jpg\` — Family Moments, https://stocksnap.io/photo/father-child-MF5LAZWIOE, ч/б
- \`sample-moon-17.jpg\` — Helena Lopes, https://stocksnap.io/photo/group-friends-YBGQFVYDDC, ч/б
- \`sample-moon-18.jpg\` — Hiking Adventures, https://stocksnap.io/photo/friends-hiking-WQE4AZ2BPU, ч/б
- \`sample-moon-19.jpg\` — Bruce Mars, https://stocksnap.io/photo/friends-dinner-RRSDBIHUMS, ч/б
- \`sample-moon-20.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-fun-TK55STNQN8, ч/б
- \`sample-moon-21.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-fun-NPEZGYPUYP, ч/б
- \`sample-moon-22.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-together-UHTM70G1AS, ч/б
- \`sample-moon-23.jpg\` — Candace McDaniel, https://stocksnap.io/photo/girl-friends-3YF2EP4KOA, ч/б
- \`sample-moon-24.jpg\` — Candace McDaniel, https://stocksnap.io/photo/women-friends-9VP7PKBGGT, ч/б
- \`sample-moon-25.jpg\` — Candace McDaniel, https://stocksnap.io/photo/selfie-women-TDLN8CRA4P, ч/б
- \`sample-moon-26.jpg\` — Brodie Vissers, https://stocksnap.io/photo/people-men-XO53SBWVMF, ч/б
- \`sample-moon-27.jpg\` — Duri from Mocup, https://stocksnap.io/photo/couple-man-E9QVYLY3DI, ч/б
- \`sample-moon-28.jpg\` — Living Together, https://stocksnap.io/photo/couple-selfie-XNOUUIHJGG, ч/б
- \`sample-home-main.jpg\` — Freestocks.org, https://stocksnap.io/photo/wedding-bride-GI154PSYGF
- \`sample-home-1.jpg\` — Nathan Walker, https://stocksnap.io/photo/couple-kissing-JRTQVF9EQC
- \`sample-home-2.jpg\` — Nathan Walker, https://stocksnap.io/photo/couple-kissing-UG86T8KW5X
- \`sample-home-3.jpg\` — Vladimir Kudinov, https://stocksnap.io/photo/couple-love-FP4R72OQII
- \`sample-home-4.jpg\` — Jenelle Ball, https://stocksnap.io/photo/couple-love-J1Z9HDHZAC
- \`sample-home-5.jpg\` — Tord Sollie, https://stocksnap.io/photo/people-couple-2F6A2051DE
- \`sample-home-6.jpg\` — Daryn Bartlett, https://stocksnap.io/photo/couple-love-9UVAGMWV89
- \`sample-home-7.jpg\` — Anggoro Sakti, https://stocksnap.io/photo/couple-holding-DSGMWWUKM8
- \`sample-home-8.jpg\` — Freestocks.org, https://stocksnap.io/photo/couple-hugging-ZK4IUPNIUE
- \`sample-home-9.jpg\` — Pavel Badrtdinov, https://stocksnap.io/photo/couple-holdinghands-UIM4X385QF
- \`sample-home-10.jpg\` — Ezra Jeffrey, https://stocksnap.io/photo/holdinghands-couple-2X3JMDXU78
- \`sample-home-11.jpg\` — Burst, https://stocksnap.io/photo/couple-holding-WCZBVEEQKC
- \`sample-home-12.jpg\` — Jeremy Wong, https://stocksnap.io/photo/love-couple-KVSHDPVIXH
- \`sample-home-13.jpg\` — Direct Media, https://stocksnap.io/photo/couple-kissing-X8N6YH8IZD
- \`sample-home-14.jpg\` — Freestocks.org, https://stocksnap.io/photo/holdinghands-couple-4WIPPD231S
- \`sample-home-15.jpg\` — Burst, https://stocksnap.io/photo/couple-holding-BOKT0DPZBB
- \`sample-home-16.jpg\` — Living Together, https://stocksnap.io/photo/young-couple-OGXSXATG8X
- \`sample-home-17.jpg\` — PALOMA Aviles, https://stocksnap.io/photo/couple-love-ZFPLRQHJ8U
- \`sample-grid-1.jpg\` — Direct Media, https://stocksnap.io/photo/couple-kissing-X8N6YH8IZD, ч/б
- \`sample-grid-2.jpg\` — Living Together, https://stocksnap.io/photo/young-couple-OGXSXATG8X, ч/б
- \`sample-grid-3.jpg\` — Freestocks.org, https://stocksnap.io/photo/couple-hugging-ZK4IUPNIUE, ч/б
- \`sample-grid-4.jpg\` — Tord Sollie, https://stocksnap.io/photo/people-couple-2F6A2051DE, ч/б
- \`sample-grid-5.jpg\` — Burst, https://stocksnap.io/photo/couple-holding-WCZBVEEQKC, ч/б
- \`sample-grid-6.jpg\` — Eric Alves, https://stocksnap.io/photo/marriage-wedding-JB4CPU0LCU, ч/б
- \`sample-grid-7.jpg\` — Nathan Walker, https://stocksnap.io/photo/couple-kissing-JRTQVF9EQC, ч/б
- \`sample-grid-8.jpg\` — Jeremy Wong, https://stocksnap.io/photo/love-couple-KVSHDPVIXH, ч/б
- \`sample-grid-9.jpg\` — PALOMA Aviles, https://stocksnap.io/photo/couple-love-ZFPLRQHJ8U, ч/б
- \`sample-grid-10.jpg\` — Senior Living, https://stocksnap.io/photo/couple-park-GL9XJQTLJK, ч/б
- \`sample-dark.jpg\` — Nathan Walker, https://stocksnap.io/photo/couple-kissing-UG86T8KW5X, ч/б
- \`sample-wd-dance.jpg\` — Jason Briscoe, https://stocksnap.io/photo/wedding-party-X3UU2014U4
- \`sample-wd-hands.jpg\` — Jeremy Wong, https://stocksnap.io/photo/wedding-bride-KBSWTHYXXH, ч/б
- \`sample-moment-1.jpg\` — Candace McDaniel, https://stocksnap.io/photo/women-friends-9VP7PKBGGT
- \`sample-moment-2.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-fun-TK55STNQN8
- \`sample-moment-3.jpg\` — Candace McDaniel, https://stocksnap.io/photo/selfie-women-TDLN8CRA4P
- \`sample-moment-4.jpg\` — Bruce Mars, https://stocksnap.io/photo/friends-dinner-RRSDBIHUMS
- \`sample-moment-5.jpg\` — Matt Moloney, https://stocksnap.io/photo/friends-together-UHTM70G1AS
- \`sample-moment-6.jpg\` — Candace McDaniel, https://stocksnap.io/photo/girl-friends-3YF2EP4KOA
- \`sample-bff-cut.png\` — Candace McDaniel, https://stocksnap.io/photo/women-friends-9VP7PKBGGT
  (фон убран моделью MediaPipe selfie_segmenter, края по бокам растушёваны)

\`kevin.png\` — Кевин из фильма «Один дома» (20th Century Fox, 1990),
вырезан из макета design/открытки/новый год 6.jpg по просьбе
пользователя. Права на кадр — у правообладателя фильма, не CC.
`,
);
console.log(`Готово: ${Object.keys(NOTO).length} стикеров Noto.`);
