import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Steps } from "@/components/site/Steps";

// Главная страница собирается секция за секцией снизу списка
// в docs/FIGMA.md. Сейчас на ней шапка, герой и три этапа.
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Steps />
      </main>
    </>
  );
}
