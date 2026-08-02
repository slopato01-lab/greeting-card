import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Кэш, очереди и тегированная ревалидация не подключены намеренно:
// они требуют KV и R2, которых пока нет. Добавляются отдельной задачей.
export default defineCloudflareConfig();
