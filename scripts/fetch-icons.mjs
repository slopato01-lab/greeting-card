/**
 * Скачивает иконки из Iconify в public/assets/icons и собирает из них
 * модуль lib/icons/generated.ts для вставки прямо в разметку.
 *
 * Запускается руками: pnpm icons:fetch. В сборке не участвует —
 * иконки лежат в репозитории, прод не зависит от чужого API.
 *
 * Список — из docs/FIGMA.md. Менять список здесь и там одновременно.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_DIR = resolve(ROOT, "public/assets/icons");
const MODULE_PATH = resolve(ROOT, "lib/icons/generated.ts");
const CREDITS_PATH = resolve(SVG_DIR, "CREDITS.md");

/**
 * mono — иконка красится currentColor, цветные иллюстрации нет.
 * deanimate — вырезать SMIL-анимацию: в подвале она не нужна,
 * а prefers-reduced-motion её не выключает.
 */
const ICONS = [
  { name: "certificate", source: "fluent-color:gift-card-16", where: "карточка «Сертификат»" },
  { name: "confession", source: "fluent-emoji-flat:e-mail", where: "карточка «Признание»" },
  { name: "transfer", source: "noto:money-bag", where: "карточка «Перевод»" },
  { name: "ticket", source: "noto-v1:ticket", where: "карточка «Билет»" },
  {
    name: "tick",
    source: "hugeicons:tick-04",
    mono: true,
    where: "галочки в карточках преимуществ",
  },
  { name: "instagram", source: "line-md:instagram", mono: true, deanimate: true, where: "подвал" },
  { name: "twitter", source: "line-md:twitter", mono: true, deanimate: true, where: "подвал" },
  {
    name: "facebook",
    source: "ri:facebook-fill",
    mono: true,
    where: "подвал, внутри розового круга",
  },
  // Три иконки ниже заменены на аналоги под MIT: в макете стояли наборы
  // Solar, Game Icons и Pepicons Print под CC BY, а она требует
  // указания авторства там, где это видит пользователь.
  { name: "burger", source: "tabler:menu-2", mono: true, where: "бургер-меню, мобильный" },
  { name: "path", source: "tabler:route", mono: true, where: "декор в карточке FAQ" },
  { name: "planet", source: "tabler:planet", mono: true, where: "декор в герое, десктоп" },
];

/** Убирает анимацию и приводит иконку к её конечному, видимому состоянию. */
function deanimate(svg) {
  return (
    svg
      // сами анимации
      .replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*\/>/g, "")
      .replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*>[\s\S]*?<\/\1>/g, "")
      // без анимации штрих остался бы недорисованным или невидимым
      .replace(/\s(stroke-dasharray|stroke-dashoffset)="[^"]*"/g, "")
      // элементы, которые проявлялись анимацией, иначе останутся прозрачными
      .replace(/\sopacity="0"/g, "")
  );
}

/**
 * Префиксует id внутри иконки её именем.
 *
 * Цветные иконки Iconify содержат градиенты со случайными id. Две разные
 * иконки на одной странице могут получить одинаковый — тогда одна
 * подтянет чужой градиент. Префикс это исключает.
 */
function namespaceIds(body, name) {
  const ids = [...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  let result = body;
  for (const id of ids) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result
      .replace(new RegExp(`id="${escaped}"`, "g"), `id="${name}-${id}"`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, "g"), `url(#${name}-${id})`)
      .replace(new RegExp(`href="#${escaped}"`, "g"), `href="#${name}-${id}"`);
  }
  return result;
}

function parseSvg(svg) {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  const body = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)?.[1];
  if (!viewBox || body === undefined) {
    throw new Error("не разобрал SVG: нет viewBox или содержимого");
  }
  return { viewBox, body: body.trim() };
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} → HTTP ${response.status}`);
  }
  return response.text();
}

async function fetchCollection(prefix) {
  const data = JSON.parse(
    await fetchText(`https://api.iconify.design/collections?prefix=${prefix}`),
  );
  const info = data[prefix];
  if (!info) throw new Error(`нет данных о наборе ${prefix}`);
  return {
    title: info.name ?? prefix,
    author: info.author?.name ?? "—",
    authorUrl: info.author?.url ?? "",
    license: info.license?.title ?? "—",
    licenseUrl: info.license?.url ?? "",
  };
}

async function main() {
  await mkdir(SVG_DIR, { recursive: true });
  await mkdir(dirname(MODULE_PATH), { recursive: true });

  const collections = new Map();
  const entries = [];

  for (const icon of ICONS) {
    const [prefix, iconName] = icon.source.split(":");
    if (!prefix || !iconName) throw new Error(`кривой источник: ${icon.source}`);

    if (!collections.has(prefix)) {
      collections.set(prefix, await fetchCollection(prefix));
    }

    const raw = await fetchText(`https://api.iconify.design/${prefix}/${iconName}.svg`);
    const svg = icon.deanimate ? deanimate(raw) : raw;
    const parsed = parseSvg(svg);
    const body = namespaceIds(parsed.body, icon.name);

    await writeFile(resolve(SVG_DIR, `${icon.name}.svg`), `${svg.trim()}\n`, "utf8");
    entries.push({ ...icon, prefix, viewBox: parsed.viewBox, body });

    const flags = [icon.mono ? "mono" : "цветная", icon.deanimate ? "без анимации" : null]
      .filter(Boolean)
      .join(", ");
    console.log(`${icon.name.padEnd(12)} ← ${icon.source.padEnd(34)} ${flags}`);
  }

  const moduleSource = `// Сгенерировано scripts/fetch-icons.mjs. Руками не править.
// Источник — файлы в public/assets/icons, список — в docs/FIGMA.md.

export type IconData = {
  /** Система координат иконки, у разных наборов она разная. */
  readonly viewBox: string;
  /** Содержимое <svg> как есть. */
  readonly body: string;
  /** Красится currentColor. Цветные иллюстрации — нет. */
  readonly mono: boolean;
  /** Имя в Iconify, откуда иконка приехала. */
  readonly source: string;
  /** Где используется по макету. */
  readonly where: string;
};

export const icons = {
${entries
  .map(
    (e) =>
      `  ${e.name}: {\n    viewBox: ${JSON.stringify(e.viewBox)},\n    body: ${JSON.stringify(e.body)},\n    mono: ${Boolean(e.mono)},\n    source: ${JSON.stringify(e.source)},\n    where: ${JSON.stringify(e.where)},\n  },`,
  )
  .join("\n")}
} as const satisfies Record<string, IconData>;

export type IconName = keyof typeof icons;
`;

  await writeFile(MODULE_PATH, moduleSource, "utf8");

  const used = [...collections.entries()];
  const credits = `# Иконки: наборы, авторы, лицензии

Сгенерировано \`scripts/fetch-icons.mjs\`. Руками не править.

Наборы под CC BY здесь намеренно отсутствуют: они требуют указания
авторства там, где это видит пользователь. Бургер-меню, декор в карточке
FAQ и планета в герое заменены на аналоги из Tabler Icons под MIT.

## Наборы

| Набор | Автор | Лицензия |
|---|---|---|
${used
  .map(
    ([prefix, c]) =>
      `| ${c.title} (\`${prefix}\`) | ${c.authorUrl ? `[${c.author}](${c.authorUrl})` : c.author} | ${c.licenseUrl ? `[${c.license}](${c.licenseUrl})` : c.license} |`,
  )
  .join("\n")}

## Иконки

| Файл | Источник | Где используется |
|---|---|---|
${entries.map((e) => `| \`${e.name}.svg\` | \`${e.source}\` | ${e.where} |`).join("\n")}
`;

  await writeFile(CREDITS_PATH, credits, "utf8");
  console.log(`\nГотово: ${entries.length} иконок, ${used.length} наборов.`);
}

await main();
