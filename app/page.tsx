import { Benefits } from "@/components/site/Benefits";
import { Catalog } from "@/components/site/Catalog";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Inside } from "@/components/site/Inside";
import { Steps } from "@/components/site/Steps";

// Порядок секций — из эталонов design/mobile.html и design/desktop.html.
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Steps />
        <Faq />
        <Inside />
        <Catalog />
        <Benefits />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
