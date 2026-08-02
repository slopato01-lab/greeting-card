import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Статический экспорт в out/ и выкладка на Cloudflare Pages.
  // Серверных роутов пока нет; когда дойдём до вебхука оплаты,
  // решение придётся пересматривать — статика вебхук не примет.
  output: "export",

  // Оптимизатор картинок Next требует сервер, в экспорте он недоступен
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
