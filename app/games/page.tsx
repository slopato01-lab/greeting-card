import type { Metadata } from "next";

import { Cta } from "@/components/site/Cta";
import { PAGE_TITLE_ID, PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { type TextKey, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.games.title")} — ${t("brand.name")}`,
};

/**
 * Три механики MVP. Описания и поводы взяты из docs/PRODUCT.md —
 * из раздела «Три игры MVP» и матрицы «повод × механика».
 *
 * Живого превью в карточках нет: игровых модулей ещё не существует.
 * Вместо превью — плейсхолдер цветом --color-photo, как в карточках
 * шаблонов. Подставлять сюда картинку-обманку нельзя.
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
type Game = {
  title: TextKey;
  body: TextKey;
  photos: TextKey;
  level: TextKey;
  suits: readonly TextKey[];
};

const GAMES = [
  {
    title: "games.card.1.title",
    body: "games.card.1.body",
    photos: "games.card.1.photos",
    level: "games.card.1.level",
    suits: [
      "games.tag.birthday",
      "games.tag.anniversary",
      "games.tag.parents",
      "games.tag.distance",
    ],
  },
  {
    title: "games.card.2.title",
    body: "games.card.2.body",
    photos: "games.card.2.photos",
    level: "games.card.2.level",
    suits: [
      "games.tag.birthday",
      "games.tag.confession",
      "games.tag.corporate",
      "games.tag.distance",
    ],
  },
  {
    title: "games.card.3.title",
    body: "games.card.3.body",
    photos: "games.card.3.photos",
    level: "games.card.3.level",
    suits: ["games.tag.invite", "games.tag.news", "games.tag.sorry", "games.tag.thanks"],
  },
] as const satisfies ReadonlyArray<Game>;

function Fact({ label, value }: { label: TextKey; value: TextKey }) {
  return (
    <div>
      <dt className="font-ui text-note-d text-muted">{t(label)}</dt>
      <dd className="font-ui text-card xl:text-card-d mt-[2px] font-medium">{t(value)}</dd>
    </div>
  );
}

export default function GamesPage() {
  return (
    <SitePage>
      <PageHead title="page.games.title" lead="page.games.lead" />

      <section className="page-shell pt-[30px] pb-[60px] xl:pt-[50px] xl:pb-[100px]">
        <ul
          role="list"
          aria-labelledby={PAGE_TITLE_ID}
          className="grid gap-[30px] xl:grid-cols-3 xl:gap-5"
        >
          {GAMES.map((game) => (
            <li
              key={game.title}
              className="rounded-card xl:rounded-card-d bg-surface flex flex-col overflow-hidden"
            >
              {/* Живого превью нет: игровых модулей ещё не существует.
                  Плейсхолдер тот же, что в карточках шаблонов. */}
              <div aria-hidden="true" className="bg-photo min-h-[200px] xl:min-h-[240px]" />

              <div className="flex flex-1 flex-col px-[24px] pt-[24px] pb-[28px] xl:px-[30px] xl:pt-[30px] xl:pb-[34px]">
                <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
                  {t(game.title)}
                </h2>

                <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.4]">
                  {t(game.body)}
                </p>

                <dl className="mt-[24px] flex flex-col gap-[14px]">
                  <Fact label="games.photos.label" value={game.photos} />
                  <Fact label="games.level.label" value={game.level} />
                </dl>

                {/* Поводы — подписи, а не фильтры: нажимать здесь
                    не на что, каталог отбирает по своим пилюлям. */}
                <p className="font-ui text-note-d text-muted mt-[24px]">{t("games.suits.label")}</p>
                <ul role="list" className="mt-[10px] flex flex-wrap gap-[8px]">
                  {game.suits.map((tag) => (
                    <li
                      key={tag}
                      className="bg-raised font-ui text-note text-body flex h-[33px] items-center rounded-full px-[16px]"
                    >
                      {t(tag)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>

        {/* Почему механики разные — это решение продукта, а не
            украшение страницы: см. docs/PRODUCT.md. */}
        <div className="rounded-panel xl:rounded-panel-d bg-surface mt-[40px] px-[24px] py-[28px] xl:mt-[60px] xl:px-[54px] xl:py-[40px]">
          <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
            {t("games.note.title")}
          </h2>
          <p className="font-ui text-card xl:text-card-d text-body mt-[10px] leading-[1.4] xl:max-w-[1100px]">
            {t("games.note.body")}
          </p>
        </div>
      </section>

      <Cta />
    </SitePage>
  );
}
