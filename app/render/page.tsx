import type { Metadata } from "next";

import { TemplateRenderer } from "@/components/editor/TemplateRenderer";

/**
 * Служебная страница: рендер кадров шаблонов для видео в каталоге.
 * Её открывает только scripts/render-templates.mjs. Шапки, подвала
 * и текста нет — пользователю здесь смотреть не на что.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RenderPage() {
  return <TemplateRenderer />;
}
