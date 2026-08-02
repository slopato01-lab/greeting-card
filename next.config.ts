import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

// Даёт `next dev` доступ к привязкам Cloudflare через getCloudflareContext().
// Без этой строки локальная разработка не видит R2, D1 и переменные воркера.
void initOpenNextCloudflareForDev();
