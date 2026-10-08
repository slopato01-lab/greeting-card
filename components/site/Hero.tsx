import { Button } from "@/components/Button";
import { HeroArc } from "@/components/site/HeroArc";
import { t } from "@/lib/i18n";

/**
 * Первый экран главной — по design/главный экран.jpg (08.10.2026):
 * всё по центру на белом — золотая плашка-бейдж, огромный H1, вводный
 * абзац, под ним дуга анимированных открыток во всю ширину экрана
 * и главная кнопка в пунктирном кольце. Рядом две подписи от руки
 * со стрелками.
 *
 * Тексты наши, из словаря. Отличия от макета:
 * - «Join over 100,000 happy creators» — у нас подзаголовок героя
 *   `hero.badge`: цифр пользователей нет;
 * - фото в карточках — наши анимированные шаблоны (HeroArc);
 * - подпись «Выбери свою» видна только с 1280: на телефоне ей негде
 *   встать рядом с заголовком, не налезая на текст.
 *
 * H1 из трёх ключей — три строки и на десктопе: в макете две, но наш
 * текст длиннее, и «Маленький подарок по ссылке» не влезал в строку.
 */
export function Hero() {
  return (
    <section className="page-shell relative pt-[32px] text-center xl:pt-[56px]">
      <p className="font-ui caps text-badge xl:text-badge-d bg-gold text-ink inline-block rounded-full px-[14px] py-[6px] font-medium">
        {t("hero.badge")}
      </p>

      <div className="relative mx-auto max-w-[1100px]">
        <h1 className="font-display text-h1 xl:text-h1-d mt-[20px] font-medium tracking-tight xl:mt-[28px]">
          <span className="block">{t("hero.title.1")}</span>
          <span className="block">{t("hero.title.2")}</span>
          <span className="block">{t("hero.title.3")}</span>
        </h1>

        <p
          aria-hidden="true"
          className="font-hand text-hand-d text-ink absolute top-full right-0 hidden -translate-y-1/2 rotate-[14deg] xl:block"
        >
          {t("hero.note.pick")}
          <ArrowDown className="ms-auto mt-[4px] h-[70px] w-[90px]" />
        </p>
      </div>

      <p className="font-ui text-lead xl:text-lead-d text-body mx-auto mt-[16px] max-w-[560px] leading-[1.5] xl:mt-[24px]">
        {t("hero.lead")}
      </p>

      <div className="mt-[8px] xl:mt-[12px]">
        <HeroArc />
      </div>

      <div className="relative mx-auto flex flex-col items-center xl:w-max">
        <span className="border-ink w-full rounded-full border border-dashed p-[5px] xl:w-auto">
          <Button href="/create" labelKey="cta.create" />
        </span>

        {/* На телефоне подпись под кнопкой, стрелка вверх. С 1280 —
            слева от кнопки, стрелка вправо, как в макете. */}
        <p
          aria-hidden="true"
          className="font-hand text-hand xl:text-hand-d text-ink mt-[8px] flex -rotate-[6deg] items-center gap-[6px] xl:absolute xl:top-1/2 xl:right-full xl:me-[20px] xl:mt-0 xl:-translate-y-1/4 xl:rotate-[12deg] xl:flex-row-reverse xl:whitespace-nowrap"
        >
          <ArrowSide className="h-[36px] w-[48px] -rotate-90 xl:rotate-0" />
          {t("hero.note.free")}
        </p>
      </div>
    </section>
  );
}

/** Стрелка от руки, изгибом вниз — к ряду открыток. */
function ArrowDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 70"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block ${className ?? ""}`}
    >
      <path d="M8 6c30 2 62 10 70 30 4 10-2 20-10 26" />
      <path d="M56 56l12 7 2-14" />
    </svg>
  );
}

/** Короткая стрелка от руки, остриём вправо — к кнопке. */
function ArrowSide({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block shrink-0 ${className ?? ""}`}
    >
      <path d="M4 28c10-14 22-18 38-14" />
      <path d="M33 7l9 7-8 9" />
    </svg>
  );
}
