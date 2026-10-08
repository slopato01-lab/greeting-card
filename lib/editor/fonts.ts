import {
  Amatic_SC,
  Bad_Script,
  Caveat,
  Comfortaa,
  Cormorant_Garamond,
  Lobster,
  Lora,
  Manrope,
  Marck_Script,
  Montserrat,
  Nunito,
  Oswald,
  Pacifico,
  Playfair_Display,
  PT_Mono,
  PT_Serif,
  Roboto_Slab,
  Rubik,
  Russo_One,
  Shantell_Sans,
} from "next/font/google";

import type { FontId } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";

/**
 * Шрифты редактора. Все — Google Fonts под OFL, у всех есть кириллица
 * и латиница. next/font скачивает файлы на сборке и раздаёт их со своего
 * домена: внешних запросов в рантайме нет.
 *
 * `preload: false` — главное здесь. Браузер узнаёт о шрифтах, но качает
 * файл только когда его кто-то попросил: холст перед отрисовкой зовёт
 * document.fonts.load (см. loadFont). Двадцать шрифтов не утяжеляют ни
 * сайт, ни сам редактор, пока их не выбрали.
 *
 * Модуль подключается только из components/editor, поэтому
 * @font-face этих шрифтов есть только на странице /editor.
 *
 * Inter и Unbounded уже подключены сайтом в app/layout.tsx — их
 * семейства читаются из CSS-переменных, а не грузятся второй раз.
 */

// Опции у next/font обязаны быть литералами прямо в вызове: загрузчик
// читает их на сборке, общий объект через spread он не понимает.
// У всех одно и то же: латиница и кириллица, swap, без предзагрузки.
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const manrope = Manrope({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const oswald = Oswald({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const lora = Lora({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const ptSerif = PT_Serif({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
  style: ["normal", "italic"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
  style: ["normal", "italic"],
});
const robotoSlab = Roboto_Slab({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const russo = Russo_One({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});
const comfortaa = Comfortaa({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const lobster = Lobster({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});
const pacifico = Pacifico({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});
const caveat = Caveat({ subsets: ["latin", "cyrillic"], display: "swap", preload: false });
const marck = Marck_Script({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});
const badScript = Bad_Script({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});
const amatic = Amatic_SC({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
});
// Shantell Sans — маркерный рукописный, ближе всего к заголовку из
// design/пример анимации и дизайна.MP4. PT Mono — пожелание из того же видео.
const shantell = Shantell_Sans({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
});
const ptMono = PT_Mono({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
  weight: "400",
});

export const FONT_GROUPS = ["sans", "serif", "accent", "hand", "mono"] as const;
export type FontGroup = (typeof FONT_GROUPS)[number];

export type FontInfo = {
  id: FontId;
  group: FontGroup;
  label: TextKey;
  /**
   * CSS-значение font-family. Для шрифтов сайта — `null`: их семейство
   * читается из --font-ui и --font-display в момент запуска холста.
   */
  family: string | null;
};

export const FONTS: readonly FontInfo[] = [
  { id: "inter", group: "sans", label: "font.inter", family: null },
  {
    id: "montserrat",
    group: "sans",
    label: "font.montserrat",
    family: montserrat.style.fontFamily,
  },
  { id: "manrope", group: "sans", label: "font.manrope", family: manrope.style.fontFamily },
  { id: "rubik", group: "sans", label: "font.rubik", family: rubik.style.fontFamily },
  { id: "nunito", group: "sans", label: "font.nunito", family: nunito.style.fontFamily },
  { id: "oswald", group: "sans", label: "font.oswald", family: oswald.style.fontFamily },
  { id: "playfair", group: "serif", label: "font.playfair", family: playfair.style.fontFamily },
  { id: "lora", group: "serif", label: "font.lora", family: lora.style.fontFamily },
  { id: "ptserif", group: "serif", label: "font.ptserif", family: ptSerif.style.fontFamily },
  { id: "cormorant", group: "serif", label: "font.cormorant", family: cormorant.style.fontFamily },
  {
    id: "robotoslab",
    group: "serif",
    label: "font.robotoslab",
    family: robotoSlab.style.fontFamily,
  },
  { id: "unbounded", group: "accent", label: "font.unbounded", family: null },
  { id: "russo", group: "accent", label: "font.russo", family: russo.style.fontFamily },
  { id: "comfortaa", group: "accent", label: "font.comfortaa", family: comfortaa.style.fontFamily },
  { id: "lobster", group: "accent", label: "font.lobster", family: lobster.style.fontFamily },
  { id: "pacifico", group: "hand", label: "font.pacifico", family: pacifico.style.fontFamily },
  { id: "caveat", group: "hand", label: "font.caveat", family: caveat.style.fontFamily },
  { id: "marck", group: "hand", label: "font.marck", family: marck.style.fontFamily },
  { id: "badscript", group: "hand", label: "font.badscript", family: badScript.style.fontFamily },
  { id: "amatic", group: "hand", label: "font.amatic", family: amatic.style.fontFamily },
  { id: "shantell", group: "hand", label: "font.shantell", family: shantell.style.fontFamily },
  { id: "ptmono", group: "mono", label: "font.ptmono", family: ptMono.style.fontFamily },
];

/** Семейства всех шрифтов. Шрифты сайта — из его CSS-переменных. */
export function readFontFamilies(): Record<FontId, string> {
  const style = getComputedStyle(document.documentElement);
  const site: Partial<Record<FontId, string>> = {
    inter: style.getPropertyValue("--font-ui").trim(),
    unbounded: style.getPropertyValue("--font-display").trim(),
  };
  const families = {} as Record<FontId, string>;
  for (const font of FONTS) families[font.id] = font.family ?? site[font.id] ?? "sans-serif";
  return families;
}

/**
 * Образец для document.fonts.load: латиница и кириллица. Google Fonts
 * режет шрифт на файлы по алфавитам (unicode-range), и load() без
 * образца качает только латинский — проверяет он пробел. Кириллица
 * тогда докачивается позже, а холст к тому времени уже нарисовал текст
 * запасным шрифтом и сам не перерисуется. Найдено в браузере 08.10.2026.
 */
const SAMPLE = "AaZzАаЯяЁё";

/**
 * Дожидается файлов шрифта нужного начертания. Холст меряет текст
 * в момент отрисовки: без этого первый кадр нарисуется запасным
 * шрифтом, и рамка текста разъедется с буквами.
 *
 * Не бросает: недоступный шрифт — повод нарисовать запасным,
 * а не уронить редактор.
 */
export async function loadFont(family: string, bold: boolean, italic: boolean): Promise<void> {
  if (!("fonts" in document)) return;
  const spec = `${italic ? "italic " : ""}${bold ? "700" : "400"} 40px ${family}`;
  try {
    await document.fonts.load(spec, SAMPLE);
  } catch {
    // Остаётся запасной шрифт из стека font-family.
  }
}
