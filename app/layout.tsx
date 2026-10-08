import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Unbounded } from "next/font/google";

import "./globals.css";

// Оба шрифта с полной кириллицей и свободной лицензией — docs/DESIGN.md.
// next/font скачивает их на сборке и раздаёт со своего домена:
// в рантайме запросов на сторонние хосты нет.
// Unbounded — заголовки, с 08.10.2026 вместо Montserrat Alternates:
// широкий гротеск, как в макете design/главная greetinh-cards.jpg.
const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-unb",
});

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-inter",
});

// Название продукта зафиксировано в docs/PRODUCT.md.
// Остальные метаданные появятся вместе с лендингом.
export const metadata: Metadata = {
  title: "Открыточка",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
