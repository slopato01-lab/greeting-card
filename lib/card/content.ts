import type { TrackId } from "@/lib/card/music";
import type { GameKey } from "@/lib/catalog/templates";
import type { TextKey } from "@/lib/i18n";

/**
 * Содержимое открытки: то, что автор собрал в конструкторе и что
 * увидит получатель.
 *
 * Конструктор /create удалён 08.10.2026, новая страница создания
 * будет собирать то же содержимое. components/card/CardView.tsx его
 * показывает. Экран получателя не должен знать, откуда приехала открытка,
 * — позже в этот же тип придут данные с сервера.
 *
 * Строк для пользователя здесь нет: `greeting`, `sign` и `surpriseValue`
 * пишет сам автор, вид сюрприза приходит ключом словаря.
 */

export const SURPRISE_KINDS = [
  { id: "text", label: "create.surprise.text" },
  { id: "link", label: "create.surprise.link" },
  { id: "code", label: "create.surprise.code" },
] as const satisfies ReadonlyArray<{ id: string; label: TextKey }>;

export type SurpriseKind = (typeof SURPRISE_KINDS)[number]["id"];

/**
 * Фотография открытки. Пока это ссылка от `URL.createObjectURL`,
 * выданная во вкладке автора: сервера нет, и дальше вкладки эти
 * снимки не уезжают.
 *
 * `name` — имя исходного файла. Оно нужно, чтобы отличать выбранные
 * файлы между собой, и на экран не попадает никогда: по docs/SECURITY.md
 * имя не сохраняется и не используется в путях.
 */
export type CardPhoto = {
  id: number;
  name: string;
  url: string;
};

/**
 * Оформление открытки. `null` — обычная открытка в стиле сайта.
 * `birthday` — шаблон «С днём рождения!»: фото праздника на обложке
 * и в покрытии скретч-карты, золото, музыка.
 */
export const CARD_THEMES = ["birthday"] as const;

export type CardTheme = (typeof CARD_THEMES)[number];

export type CardContent = {
  theme: CardTheme | null;
  /**
   * Зерно для всего, что в открытке раскладывается «случайно»: узор
   * на покрытии скретч-карты и прочее. Открытка обязана выглядеть
   * одинаково при каждом открытии, поэтому Math.random нельзя.
   * У настоящей открытки это её slug, в превью — slug шаблона.
   */
  seed: string;
  track: TrackId | null;
  game: GameKey | null;
  greeting: string;
  sign: string;
  surpriseKind: SurpriseKind;
  surpriseValue: string;
  photos: ReadonlyArray<CardPhoto>;
};
