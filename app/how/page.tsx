import type { Metadata } from "next";

import { Cta } from "@/components/site/Cta";
import { Inside } from "@/components/site/Inside";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { Steps } from "@/components/site/Steps";
import { type TextKey, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("page.how.title")} — ${t("brand.name")}`,
};

/**
 * «Как это работает».
 *
 * Три этапа и «что спрятать внутри» переиспользованы с лендинга
 * без изменений: страница объясняет то же самое, только подробнее,
 * и заводить второй набор карточек про то же самое незачем.
 *
 * Своё здесь — шесть шагов конструктора и абзац про то, что видит
 * получатель. Заголовки шагов уже жили в словаре (step.N.title),
 * дописаны только тела.
 *
 * Макета у страницы нет, раскладка собрана из готовых секций.
 */
const STEPS = [
  { title: "step.1.title", body: "how.step.1.body" },
  { title: "step.2.title", body: "how.step.2.body" },
  { title: "step.3.title", body: "how.step.3.body" },
  { title: "step.4.title", body: "how.step.4.body" },
  { title: "step.5.title", body: "how.step.5.body" },
  { title: "step.6.title", body: "how.step.6.body" },
] as const satisfies ReadonlyArray<{ title: TextKey; body: TextKey }>;

export default function HowPage() {
  return (
    <SitePage>
      <PageHead title="page.how.title" lead="page.how.lead" />

      <div className="pt-[30px] xl:pt-[50px]">
        <Steps />
      </div>

      <section className="page-shell pt-[60px] pb-[60px] xl:pt-[100px] xl:pb-[100px]">
        <h2
          id="how-steps-title"
          className="font-display text-h2 xl:text-h2-d font-semibold tracking-tight"
        >
          {t("how.steps.title")}
        </h2>

        {/* Нумерованный список: порядок шагов здесь смысл, а не
            оформление. Цифра берётся из позиции в списке и скрыта
            от скринридера — он читает нумерацию сам. */}
        <ol
          role="list"
          aria-labelledby="how-steps-title"
          className="mt-[30px] grid gap-[20px] xl:mt-[50px] xl:grid-cols-2 xl:gap-x-5 xl:gap-y-[25px]"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-card xl:rounded-card-d flex gap-[18px] bg-white px-[22px] py-[24px] xl:gap-[25px] xl:px-[40px] xl:py-[34px]"
            >
              <span
                aria-hidden="true"
                className="bg-dark rounded-inner xl:rounded-inner-d font-display text-card xl:text-h3-d flex size-[40px] shrink-0 items-center justify-center font-semibold tracking-tight text-white xl:size-[56px]"
              >
                {index + 1}
              </span>

              <div>
                <h3 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
                  {t(step.title)}
                </h3>
                <p className="font-ui text-card xl:text-card-d text-body mt-[8px] leading-[1.4]">
                  {t(step.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Inside />

      <section className="page-shell pt-[60px] pb-[20px] xl:pt-[100px] xl:pb-[40px]">
        <div className="on-dark bg-dark rounded-card xl:rounded-panel-d px-[24px] py-[34px] xl:px-[100px] xl:py-[60px]">
          <h2 className="font-display text-h2 xl:text-h2-d font-semibold tracking-tight text-white">
            {t("how.player.title")}
          </h2>
          <p className="font-ui text-card xl:text-card-d mt-[16px] leading-[1.4] text-white xl:mt-[25px] xl:max-w-[1000px]">
            {t("how.player.body")}
          </p>
        </div>
      </section>

      <Cta />
    </SitePage>
  );
}
