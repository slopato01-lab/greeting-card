import next from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      // Эталоны из Figma — статические копии макета, не продакшн-код
      "design/**",
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
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='Math'][property.name='random']",
          message:
            "Math.random() запрещён: раскладка игры обязана совпадать при каждом открытии. Используйте seeded-генератор от slug открытки (CLAUDE.md).",
        },
      ],
    },
  },
];

export default config;
