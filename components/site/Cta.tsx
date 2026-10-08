import { Button } from "@/components/Button";
import { Sun } from "@/components/site/Ornament";
import { ANIMATED_TEMPLATES, type AnimatedTemplate } from "@/lib/catalog/templates";
import { t } from "@/lib/i18n";

/**
 * Блок призыва к действию перед подвалом.
 *
 * В макете design/главная greetinh-cards.jpg такого блока нет —
 * собран из его же элементов: скруглённая панель, широкий заголовок,
 * «солнце» над ним. С 08.10.2026 панель золотая, а по бокам веером
 * лежат обложки шаблонов в белой рамке с тенью — до этого блок был
 * серым и пустым (просьба пользователя). Кнопка на золоте тёмная.
 *
 * Обложки — декор: ссылками не являются, скринридеру не видны.
 * С 1280 — по три у левого и правого края панели, текст между ними, на мобильном — три
 * над «солнцем».
 *
 * Подпись взята из десктопного макета Figma: на мобильном там стояла
 * заглушка «так готовы или нет, отвечай?», см. PRODUCT.md.
 */

/** Какие шаблоны лежат веером: слева три, справа три. */
const LEFT = ["birthday", "val-film", "ny-xmas"];
const RIGHT = ["fr-polaroids", "wd-married", "bd-kittens"];

/** Положение обложки в левом веере, слева направо. */
const FAN = [
  "-rotate-[14deg] translate-y-[30px]",
  "-rotate-[4deg] -translate-y-[10px]",
  "rotate-[6deg] translate-y-[20px]",
] as const;

/** Правый веер — зеркало левого, тоже слева направо. */
const FAN_RIGHT = [
  "-rotate-[6deg] translate-y-[20px]",
  "rotate-[4deg] -translate-y-[10px]",
  "rotate-[14deg] translate-y-[30px]",
] as const;

function pick(ids: readonly string[]): AnimatedTemplate[] {
  return ids.flatMap((id) => ANIMATED_TEMPLATES.filter((template) => template.id === id));
}

function Cover({ template, className }: { template: AnimatedTemplate; className: string }) {
  return (
    <div
      // Фон — цвет открытки, а не оформления сайта
      // (docs/DESIGN.md, «Цвета и шрифты содержимого открытки»).
      style={{ backgroundColor: template.background }}
      className={`rounded-inner xl:rounded-inner-d border-paper shadow-card relative aspect-[3/4] shrink-0 overflow-hidden border-2 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={template.poster}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
    </div>
  );
}

export function Cta() {
  const left = pick(LEFT);
  const right = pick(RIGHT);

  return (
    <section className="page-shell pt-[40px] pb-[10px] xl:pt-[60px] xl:pb-[20px]">
      <div className="rounded-panel xl:rounded-panel-d bg-gold relative flex min-h-[320px] items-center justify-center overflow-hidden px-[20px] py-[40px] xl:min-h-[440px] xl:px-[60px] xl:py-[70px]">
        <div
          aria-hidden="true"
          className="absolute top-1/2 -left-[20px] hidden -translate-y-1/2 items-center xl:flex 2xl:left-[40px]"
        >
          {left.map((template, i) => (
            <Cover
              key={template.id}
              template={template}
              className={`-ms-[30px] w-[100px] first:ms-0 2xl:w-[150px] ${FAN[i] ?? ""}`}
            />
          ))}
        </div>

        <div className="relative flex max-w-[600px] flex-col items-center text-center 2xl:max-w-[880px]">
          {/* На мобильном веер над текстом. */}
          <div aria-hidden="true" className="mb-[28px] flex items-center xl:hidden">
            {left.map((template, i) => (
              <Cover
                key={template.id}
                template={template}
                className={`-ms-[18px] w-[84px] first:ms-0 ${FAN[i] ?? ""}`}
              />
            ))}
          </div>

          <Sun className="text-ink h-[40px] w-[80px] xl:h-[60px] xl:w-[120px]" />

          <h2 className="font-display text-h1 xl:text-h1-d text-ink mt-[24px] font-medium tracking-tight text-balance">
            {t("cta.title")}
          </h2>

          <p className="font-ui text-card xl:text-card-d text-body mt-[16px] leading-[1.5] xl:mt-[20px] xl:max-w-[640px]">
            {t("cta.lead")}
          </p>

          <Button
            href="/editor"
            labelKey="cta.create"
            tone="dark"
            className="mt-[30px] max-w-[325px] xl:mt-[40px] xl:max-w-none"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-[20px] hidden -translate-y-1/2 items-center xl:flex 2xl:right-[40px]"
        >
          {right.map((template, i) => (
            <Cover
              key={template.id}
              template={template}
              className={`-ms-[30px] w-[100px] first:ms-0 2xl:w-[150px] ${FAN_RIGHT[i] ?? ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
