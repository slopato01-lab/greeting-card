import { Benefits } from "@/components/site/Benefits";
import { Catalog } from "@/components/site/Catalog";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Inside } from "@/components/site/Inside";
import { SitePage } from "@/components/site/SitePage";
import { Steps } from "@/components/site/Steps";

// Порядок, раскладка и стиль секций — из макета
// design/главная greetinh-cards.jpg, смысл и тексты наши. Разбор
// соответствия — docs/DESIGN.md, раздел «Раскладка главной».
export default function Page() {
  return (
    <SitePage>
      {/* Промежуток между блоками — сверх их собственных полей
          (docs/DESIGN.md, «Раскладка главной»). Нижний — до подвала. */}
      <div className="flex flex-col gap-[100px] pb-[100px] md:gap-[160px] md:pb-[160px] xl:gap-[250px] xl:pb-[250px]">
        <Hero />
        {/* «Какие поздравления…» перед каталогом — с 08.10.2026
            (просьба пользователя). */}
        <Faq />
        <Catalog />
        <Benefits />
        {/* Ряд из двух карточек: «что внутри» и золотые этапы. С 08.10.2026
          стоит перед CTA, а не сразу под героем (просьба пользователя). */}
        <div className="page-shell grid gap-[12px] xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-[20px]">
          <Inside />
          <Steps />
        </div>
        <Cta />
      </div>
    </SitePage>
  );
}
