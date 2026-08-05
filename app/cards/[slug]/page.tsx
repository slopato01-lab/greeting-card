import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { Cta } from "@/components/site/Cta";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { TemplateCard } from "@/components/site/TemplateCard";
import { relatedTemplates, TEMPLATES, templateBySlug } from "@/lib/catalog/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Страница шаблона. Восемь штук, по одной на карточку каталога:
 * название, повод, игра внутри, вводка, три пункта «что внутри»
 * и переход в конструктор с уже выбранным поводом и игрой.
 *
 * Восемь адресов известны на сборке и других не будет: dynamicParams
 * выключен, чужой slug отдаёт 404, а не пустую страницу с плейсхолдерами.
 *
 * Живого превью шаблона нет — картинок ещё не нарисовали. На их месте
 * тот же плейсхолдер --color-photo, что в каталоге и на /games.
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ slug: string }> {
  return TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = templateBySlug(slug);

  if (template === undefined) return { title: `${t("error.pageNotFound")} — ${t("brand.name")}` };

  return { title: `${t(template.nameKey)} — ${t("brand.name")}` };
}

function Fact({ label, value }: { label: TextKey; value: TextKey }) {
  return (
    <div>
      <dt className="font-ui text-note-d text-caption">{t(label)}</dt>
      <dd className="font-display text-card xl:text-card-d mt-[2px] font-medium">{t(value)}</dd>
    </div>
  );
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = templateBySlug(slug);

  // До сюда не дойти: адреса перечислены в generateStaticParams,
  // а dynamicParams выключен. Проверка нужна типу — и останется
  // страховкой, когда каталог станет динамическим.
  if (template === undefined) notFound();

  const related = relatedTemplates(template);

  return (
    <SitePage>
      {/* Выход обратно в каталог стоит над заголовком: со страницы
          шаблона чаще возвращаются к выбору, чем идут дальше. */}
      <div className="page-shell pt-[24px] xl:pt-[40px]">
        <Link
          href="/cards"
          className="font-ui text-note-d text-caption min-h-tap inline-flex items-center gap-[8px] transition-opacity hover:opacity-70"
        >
          <span aria-hidden="true">←</span>
          {t("tpl.back")}
        </Link>
      </div>

      <PageHead title={template.nameKey} lead={template.lead} />

      <section className="page-shell pt-[30px] pb-[60px] xl:pt-[50px] xl:pb-[100px]">
        <div className="grid gap-[30px] xl:grid-cols-2 xl:items-start xl:gap-5">
          {/* Превью шаблона. Пропорции те же, что у карточки каталога. */}
          <div
            aria-hidden="true"
            className="rounded-card xl:rounded-card-d border-ink bg-photo min-h-[317px] border-2 xl:min-h-[520px]"
          />

          <div className="border-ink rounded-card xl:rounded-card-d flex flex-col border-2 bg-white px-[24px] pt-[24px] pb-[28px] xl:px-[40px] xl:pt-[40px] xl:pb-[44px]">
            <dl className="flex flex-col gap-[14px]">
              <Fact label="tpl.occasion" value={template.filter} />
              <Fact label="tpl.game" value={template.game} />
            </dl>

            <h2 className="font-display text-h3 xl:text-h3-d mt-[28px] font-medium">
              {t("tpl.inside")}
            </h2>

            <ul role="list" className="mt-[14px] flex flex-col gap-[12px]">
              {template.items.map((item) => (
                <li
                  key={item}
                  className="font-display text-card xl:text-card-d text-body flex gap-[10px] leading-[1.15]"
                >
                  {/* Маркер декоративный: списку он смысла не добавляет,
                      его роль уже несёт сам список. */}
                  <span aria-hidden="true" className="text-pink">
                    —
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>

            {/* Повод и игра уезжают в конструктор параметром: человек
                уже выбрал их здесь, спрашивать второй раз незачем. */}
            <Button
              href={`/create?t=${template.slug}`}
              labelKey="cta.create"
              className="mt-[30px] xl:mt-[40px] xl:w-full"
            />
          </div>
        </div>
      </section>

      <section className="page-shell pb-[70px] xl:pb-[120px]">
        <h2 id="more-templates" className="font-display text-h3 xl:text-h2-d font-medium">
          {t("tpl.more")}
        </h2>

        {/* На мобильном ряд шире экрана и прокручивается пальцем,
            как остальные ряды карточек: сеткой он ужал бы карточки
            до нечитаемых. */}
        <ul
          role="list"
          aria-labelledby="more-templates"
          className="carousel mt-[30px] items-stretch gap-[20px] xl:mt-[50px] xl:grid xl:grid-cols-3 xl:gap-5 xl:overflow-visible"
        >
          {related.map((item) => (
            <TemplateCard key={item.slug} template={item} className="w-[300px] xl:w-auto" />
          ))}
        </ul>
      </section>

      <Cta />
    </SitePage>
  );
}
