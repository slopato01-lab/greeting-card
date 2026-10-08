"use client";

import { useEffect } from "react";

import { frameAt } from "@/lib/editor/animation";
import { CARD_HEIGHT, CARD_WIDTH, type Layer } from "@/lib/editor/document";
import { loadFont } from "@/lib/editor/fonts";
import { loadDocIntoCanvas, objectToLayer, readTheme, showFrame } from "@/lib/editor/fabric";
import { TEMPLATES } from "@/lib/editor/templates";

/**
 * Служебный рендер шаблонов для видео в каталоге (/render).
 *
 * Страница рисует шаблон на невидимом холсте тем же кодом, что
 * и редактор, и отдаёт наружу `window.__renderFrame(id, t)` — PNG кадра
 * в момент t. scripts/render-templates.mjs обходит кадры с шагом 1/30 с
 * и собирает из них видео ffmpeg-ом. Кадр считается по времени, а не
 * снимается с живой анимации: видео одинаковое при каждом рендере
 * и не дёргается от тормозов машины.
 *
 * Пользователь сюда не попадает: из навигации не ведёт, в поиск
 * не пускается (robots в app/render/page.tsx).
 */

declare global {
  interface Window {
    __renderReady?: boolean;
    __renderFrame?: (id: string, t: number, multiplier: number) => Promise<string>;
    __renderTemplates?: { id: string; duration: number }[];
  }
}

export function TemplateRenderer() {
  useEffect(() => {
    const controller = new AbortController();

    const start = async () => {
      const fabric = await import("fabric");
      const theme = readTheme();
      const element = document.createElement("canvas");
      const canvas = new fabric.StaticCanvas(element, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        renderOnAddRemove: false,
      });
      controller.signal.addEventListener("abort", () => void canvas.dispose());

      // Шрифты всех шаблонов заранее, иначе первые кадры — запасным.
      await Promise.all(
        TEMPLATES.flatMap((template) =>
          template
            .build()
            .layers.flatMap((layer) =>
              layer.kind === "text"
                ? [loadFont(theme.fonts[layer.font], layer.bold, layer.italic)]
                : [],
            ),
        ),
      );
      if ("fonts" in document) await document.fonts.ready;
      fabric.cache.clearFontCache();

      let loaded: {
        id: string;
        items: { object: import("fabric").FabricObject; layer: Layer }[];
        duration: number;
      } | null = null;

      window.__renderFrame = async (id, t, multiplier) => {
        if (loaded?.id !== id) {
          const template = TEMPLATES.find((item) => item.id === id);
          if (template === undefined) throw new Error(`Нет шаблона ${id}`);
          const doc = template.build();
          await loadDocIntoCanvas(fabric, canvas, doc, theme, () => null);
          const items = canvas.getObjects().flatMap((object) => {
            const layer = objectToLayer(fabric, object);
            return layer === null ? [] : [{ object, layer }];
          });
          loaded = { id, items, duration: doc.duration };
        }
        const time = Math.min(t, loaded.duration);
        for (const { object, layer } of loaded.items) {
          showFrame(fabric, object, layer, frameAt(layer, time, loaded.duration));
        }
        canvas.renderAll();
        return canvas.toDataURL({ format: "png", multiplier });
      };
      window.__renderTemplates = TEMPLATES.map((template) => ({
        id: template.id,
        duration: template.build().duration,
      }));
      window.__renderReady = true;
    };

    void start();
    return () => {
      controller.abort();
      window.__renderReady = false;
    };
  }, []);

  return null;
}
