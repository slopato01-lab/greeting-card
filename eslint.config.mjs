import next from "eslint-config-next/core-web-vitals";

/** Раскладка игры обязана совпадать при каждом открытии — CLAUDE.md. */
const noMathRandom = {
  selector: "MemberExpression[object.name='Math'][property.name='random']",
  message:
    "Math.random() запрещён: раскладка игры обязана совпадать при каждом открытии. Используйте seeded-генератор от slug открытки (CLAUDE.md).",
};

/** Ни одной строки, видимой пользователю, в коде — только ключи словаря. */
const CYRILLIC = "[А-Яа-яЁё]";
const dictionaryOnly = [
  {
    selector: `JSXText[value=/${CYRILLIC}/]`,
    message:
      "Русский текст прямо в разметке. Строка должна лежать в docs/PRODUCT.md и приходить через t() из @/lib/i18n (CLAUDE.md).",
  },
  {
    selector: `JSXAttribute Literal[value=/${CYRILLIC}/]`,
    message:
      "Русский текст в атрибуте. Подписи для скринридера тоже видны пользователю: ключ в docs/PRODUCT.md, значение через t() (CLAUDE.md).",
  },
  {
    selector: `JSXExpressionContainer > Literal[value=/${CYRILLIC}/]`,
    message:
      "Русский текст в выражении внутри разметки. Строка должна приходить через t() из @/lib/i18n (CLAUDE.md).",
  },
];

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      // Остаётся у тех, кто собирал воркер до возврата на Pages
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      // Эталоны из Figma — статические копии макета, не продакшн-код
      "design/**",
      // WASM-среда MediaPipe — копия из node_modules (scripts/copy-mediapipe.mjs)
      "public/mediapipe/**",
    ],
  },

  ...next,

  {
    // Правила из CLAUDE.md про типы. Отдельным объектом с files:
    // плагин @typescript-eslint подключён конфигом next только
    // для .ts и .tsx, а не для .mjs
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },

  {
    // Сюда попадает и конфигурация, и будущий код игр
    rules: {
      "no-restricted-syntax": ["error", noMathRandom],
    },
  },

  {
    // Разметка приложения: плюсом к общему запрету — тексты только
    // из словаря. Списки правил не складываются, поэтому noMathRandom
    // приходится повторить.
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    ignores: [
      // Служебные страницы: показывают сам словарь и названия токенов,
      // пользователь их не видит и из навигации они не линкуются
      "app/styleguide/**",
      "app/texts/**",
    ],
    rules: {
      "no-restricted-syntax": ["error", noMathRandom, ...dictionaryOnly],
    },
  },
];

export default config;
