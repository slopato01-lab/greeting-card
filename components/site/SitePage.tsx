import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

/**
 * Обёртка публичной страницы: шапка, содержимое, подвал.
 *
 * Отдельным компонентом, а не в app/layout.tsx, потому что служебные
 * страницы /styleguide и /texts шапку и подвал не показывают — они
 * не часть сайта, а инструмент для вычитки.
 *
 * Подвал можно снять: в конструкторе он мешает. Шапка есть везде —
 * без неё со страницы нет выхода. На главной она становится верхом
 * тёмной карточки героя: headerTone="hero".
 */
export function SitePage({
  children,
  withFooter = true,
  headerTone = "light",
}: {
  children: ReactNode;
  withFooter?: boolean;
  headerTone?: "light" | "hero";
}) {
  return (
    <>
      <Header tone={headerTone} />
      <main>{children}</main>
      {withFooter ? <Footer /> : null}
    </>
  );
}
