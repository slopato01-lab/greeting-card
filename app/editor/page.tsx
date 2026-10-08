import type { Metadata } from "next";

import { Editor } from "@/components/editor/Editor";
import { PageHead } from "@/components/site/PageHead";
import { SitePage } from "@/components/site/SitePage";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("editor.title")} — ${t("brand.name")}`,
};

/**
 * Свободный редактор открытки. Отдельная страница, а не шаг
 * конструктора: шесть шагов собирают открытку-игру, а здесь —
 * холст, на котором раскладывают текст и фигуры.
 *
 * Подвала нет по той же причине, что в конструкторе: здесь работают.
 * С 08.10.2026 сюда ведут все кнопки «Создать открытку» на сайте.
 */
export default function EditorPage() {
  return (
    <SitePage withFooter={false}>
      {/* Заголовок — для скринридера и вкладки браузера. На десктопе
          видимым он съел бы высоту: редактор занимает ровно окно. */}
      <div className="xl:sr-only">
        <PageHead title="editor.title" />
      </div>
      <Editor />
    </SitePage>
  );
}
