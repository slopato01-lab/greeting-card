import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";

// Главная страница собирается секция за секцией снизу списка
// в docs/FIGMA.md. Сейчас на ней шапка и герой.
export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
