import { Benefits } from "@/components/site/Benefits";
import { Catalog } from "@/components/site/Catalog";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Inside } from "@/components/site/Inside";
import { SitePage } from "@/components/site/SitePage";
import { Steps } from "@/components/site/Steps";

// Порядок и раскладка секций — из макета design/главная.jpg,
// названия и тексты наши. Разбор соответствия — docs/DESIGN.md,
// раздел «Раскладка главной».
export default function Page() {
  return (
    <SitePage headerTone="hero">
      <Hero />
      <Inside />
      <Catalog />
      <Steps />
      <Faq />
      <Benefits />
      <Cta />
    </SitePage>
  );
}
