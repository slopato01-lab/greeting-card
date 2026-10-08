import type { FontId } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";

/**
 * Заготовки текста во вкладке «Текст» — как «Добавить заголовок»
 * в Canva. Начертания те же, что в шаблонах по образцу
 * design/пример анимации и дизайна.MP4: заголовок маркерным,
 * основной текст моноширинным с разрядкой.
 */
export const TEXT_PRESETS = ["title", "subtitle", "body"] as const;
export type TextPreset = (typeof TEXT_PRESETS)[number];

export type TextPresetInfo = {
  text: TextKey;
  font: FontId;
  fontSize: number;
  bold: boolean;
  spacing: number;
};

export const TEXT_PRESET_INFO: Record<TextPreset, TextPresetInfo> = {
  title: { text: "editor.text.title", font: "shantell", fontSize: 56, bold: true, spacing: 0 },
  subtitle: {
    text: "editor.text.subtitle",
    font: "shantell",
    fontSize: 32,
    bold: false,
    spacing: 0,
  },
  body: { text: "editor.text.body", font: "ptmono", fontSize: 20, bold: false, spacing: 60 },
};
