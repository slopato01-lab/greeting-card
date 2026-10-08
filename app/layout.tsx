import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Montserrat_Alternates } from "next/font/google";

import "./globals.css";

// Оба шрифта с полной кириллицей и свободной лицензией — docs/DESIGN.md.
// next/font скачивает их на сборке и раздаёт со своего домена:
// в рантайме запросов на сторонние хосты нет.
const montserratAlternates = Montserrat_Alternates({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ma",
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
    <html lang="ru" className={`${montserratAlternates.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
