import { Button } from "@/components/Button";
import { Sun } from "@/components/site/Ornament";
import { TemplateMarquee } from "@/components/site/TemplateMarquee";
import { t } from "@/lib/i18n";

/**
 * Секция «Дизайн для каждого случая» на главной: огромный заголовок,
 * подводка, фильтры и лента шаблонов.
 *
 * Раскладка — блок «New Ice Jewelry / By Type» из макета
 * design/главная greetinh-cards.jpg: заголовок разведён на две строки
 * по диагонали — первая слева, последнее слово справа внизу. Между
 * ними справа золотая кнопка, слева подводка и «солнце». Ниже черта,
 * три бесконечных ряда карточек.
 *
 * Строки режутся из одного ключа словаря по последнему пробелу —
 * текст не меняется, меняется только раскладка. Для скринридера
 * заголовок целиком лежит в h2, визуальные строки скрыты: иначе
 * подводка и кнопка, стоящие между строками, разорвали бы заголовок.
 *
 * На мобильном порядок другой: обе строки заголовка подряд, под ними
 * подводка и кнопка.
 *
 * С 08.10.2026 вместо ленты с фильтрами — три ряда анимированных
 * шаблонов, сами едущие в шахматном порядке (TemplateMarquee), а карточка
 * — по третьей карточке этого блока макета (просьба пользователя).
 * Фильтры остались на /cards, туда ведёт кнопка: в бегущих рядах
 * отбор по одному поводу дал бы ряд из одной повторяющейся карточки.
 */
function splitLast(text: string): readonly [string, string] {
  const at = text.lastIndexOf(" ");
  return at === -1 ? [text, ""] : [text.slice(0, at), text.slice(at + 1)];
}

const DISPLAY = "font-display text-h1 xl:text-h1-d font-medium tracking-tight";

export function Catalog() {
  const title = t("catalog.title");
  const [first, last] = splitLast(title);

  return (
    <section className="page-shell">
      <h2 id="catalog-title" className="sr-only">
        {title}
      </h2>

      <div className="flex flex-col gap-[20px] xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-x-[40px] xl:gap-y-[10px]">
        <p aria-hidden="true" className={`${DISPLAY} xl:col-start-1 xl:row-start-1`}>
          {first}
        </p>

        {last === "" ? null : (
          <p
            aria-hidden="true"
            className={`${DISPLAY} -mt-[20px] xl:col-start-2 xl:row-start-2 xl:mt-0 xl:text-right`}
          >
            {last}
          </p>
        )}

        <div className="flex items-end gap-[24px] xl:col-start-1 xl:row-start-2">
          <p className="font-ui text-sub xl:text-sub-d text-body max-w-[520px] leading-[1.5]">
            {t("catalog.lead")}
          </p>
          <Sun className="text-gold-deep hidden h-[60px] w-[120px] shrink-0 xl:block" />
        </div>

        <div className="xl:col-start-2 xl:row-start-1 xl:self-center xl:justify-self-end">
          <Button href="/cards" labelKey="cta.templates" />
        </div>
      </div>

      <div aria-hidden="true" className="bg-line mt-[30px] h-px xl:mt-[20px]" />

      <TemplateMarquee className="mt-[24px] xl:mt-[20px]" />
    </section>
  );
}
