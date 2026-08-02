import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

// Название продукта зафиксировано в docs/PRODUCT.md.
// Остальные метаданные (описание, og-теги) появятся вместе с лендингом.
export const metadata: Metadata = {
  title: "Открыточка",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
