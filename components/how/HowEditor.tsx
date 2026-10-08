import { Button } from "@/components/Button";
import { HowNav } from "@/components/how/HowNav";
import { Photo } from "@/components/how/Photo";
import { Dots } from "@/components/site/Ornament";
import { ANIMATED_TEMPLATES } from "@/lib/catalog/templates";
import { FONT_IDS } from "@/lib/editor/document";
import { LIBRARY } from "@/lib/editor/music";
import { STICKERS } from "@/lib/editor/stickers";
import { plural, type TextKey, t } from "@/lib/i18n";

/**
 * Вторая панель — по блоку «ADAMAS — производитель…» из макета:
 * заголовок, два столбца текста и кнопка, ниже фото с разделами
 * и четыре карточки с крупными цифрами.
 *
 * Цифры не пишутся руками — считаются из данных: добавили шаблон,
 * трек, шрифт или стикер — цифра на странице выросла сама. Подпись
 * к числу склоняется (plural): «21 шаблон», «22 шаблона».
 */
type Stat = {
  value: number;
  unit: readonly [TextKey, TextKey, TextKey];
  caption: TextKey;
};

const STATS: readonly Stat[] = [
  {
    value: ANIMATED_TEMPLATES.length,
    unit: ["how.unit.template.one", "how.unit.template.few", "how.unit.template.many"],
    caption: "how.stat.templates",
  },
  {
    value: LIBRARY.length,
    unit: ["how.unit.track.one", "how.unit.track.few", "how.unit.track.many"],
    caption: "how.stat.tracks",
  },
  {
    value: FONT_IDS.length,
    unit: ["how.unit.font.one", "how.unit.font.few", "how.unit.font.many"],
    caption: "how.stat.fonts",
  },
  {
    value: STICKERS.filter((sticker) => sticker.hidden !== true).length,
    unit: ["how.unit.sticker.one", "how.unit.sticker.few", "how.unit.sticker.many"],
    caption: "how.stat.stickers",
  },
];

export function HowEditor() {
  return (
    <section
      id="editor"
      aria-labelledby="how-editor-title"
      className="flex flex-col gap-[24px] pt-[40px] xl:gap-[32px] xl:pt-[80px]"
    >
      <div className="flex flex-col gap-[16px]">
        <h2
          id="how-editor-title"
          className="font-display text-h2 xl:text-h1-d max-w-[1100px] font-medium tracking-tight"
        >
          {t("how.editor.title")} <Dots className="align-middle" />
        </h2>

        <div className="grid gap-[16px] xl:grid-cols-2 xl:gap-[60px]">
          <div className="flex flex-col items-start gap-[20px]">
            <p className="font-ui text-card xl:text-card-d text-body leading-[1.5]">
              {t("how.editor.text.1")}
            </p>
            <Button href="/editor" labelKey="cta.editor" tone="dark" className="xl:w-auto" />
          </div>
          <div className="flex flex-col gap-[12px]">
            <p className="font-ui text-card xl:text-card-d text-body leading-[1.5]">
              {t("how.editor.text.2")}
            </p>
            <p className="font-ui text-card xl:text-card-d text-body leading-[1.5]">
              {t("how.editor.text.3")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-[10px] xl:grid-cols-2 xl:gap-[16px]">
        <Photo src="/assets/benefits/gifts.webp" className="min-h-[260px] xl:min-h-[420px]">
          <HowNav current="editor" />
        </Photo>

        <ul
          role="list"
          aria-label={t("how.stats")}
          className="grid grid-cols-2 gap-[10px] xl:gap-[16px]"
        >
          {STATS.map((stat) => (
            <li
              key={stat.caption}
              className="bg-surface rounded-card xl:rounded-card-d flex flex-col justify-between gap-[16px] p-[16px] xl:p-[28px]"
            >
              <p className="flex items-baseline gap-[6px]">
                <span className="font-display text-h1 xl:text-h1-d font-medium tracking-tight">
                  {stat.value}
                </span>
                <span className="font-ui text-note xl:text-note-d text-ink">
                  {plural(stat.value, stat.unit)}
                </span>
              </p>
              <p className="font-ui text-note xl:text-note-d text-muted leading-[1.4]">
                {t(stat.caption)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
