import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { t } from "@/lib/i18n";

/**
 * Герой главной страницы.
 *
 * Наклонная плашка-подзаголовок, H1 с розовой подложкой на выделенных
 * строках, вводный абзац и главная кнопка. На десктопе справа лежит
 * декоративная планета с opacity 0.02 — она уходит за правый край,
 * поэтому секция обрезает переполнение.
 *
 * Заголовок разбит на строки блоками, а не переносами внутри строки:
 * три ключа словаря дают ровно то разбиение, что в макете, а перенос
 * внутри ключа отдан браузеру — на мобильном первая и вторая строки
 * ложатся в две каждая.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-[35px] pb-[50px] xl:pt-[91px] xl:pb-[131px]">
      <div className="page-shell relative">
        <Icon
          name="planet"
          size={722}
          className="pointer-events-none absolute top-px -right-[299px] hidden opacity-[0.02] xl:block"
        />

        {/* Наклон съедает высоту: обёртка держит ту же вертикаль,
            что и прямая плашка в макете. */}
        <div className="relative flex min-h-[36px] items-center xl:min-h-[83px]">
          <p className="font-ui text-badge xl:text-badge-d rounded-badge xl:rounded-badge-d border-ink inline-flex min-h-[27px] rotate-[-2.19deg] items-center border bg-white px-[15px] xl:min-h-[61px] xl:px-[49px]">
            {t("hero.badge")}
          </p>
        </div>

        <h1 className="font-display text-h1 xl:text-h1-d relative mt-[6px] font-medium xl:mt-[15px]">
          <span className="block">{t("hero.title.1")}</span>
          <span className="block">
            <span className="h1-mark font-semibold xl:font-bold">{t("hero.title.2")}</span>
          </span>
          <span className="block">{t("hero.title.3")}</span>
        </h1>

        <p className="font-ui text-lead xl:text-lead-d text-muted relative mt-[19px] leading-[1.15] xl:mt-[32px] xl:max-w-[1031px]">
          {t("hero.lead")}
        </p>

        <Button href="/create" labelKey="cta.create" className="relative mt-[25px] xl:mt-[60px]" />
      </div>
    </section>
  );
}
