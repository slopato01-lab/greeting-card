import type { TextKey } from "@/lib/i18n";

/**
 * Соцсети сервиса. Живут отдельно от подвала: тот же список нужен
 * странице контактов, а два списка разошлись бы на первой же смене
 * адреса.
 *
 * Адреса пока ведут на главные страницы сетей — своих аккаунтов ещё
 * нет. Это видно на странице и правится здесь одной строкой.
 */
export const SOCIAL = [
  { icon: "instagram", label: "footer.social.instagram", href: "https://instagram.com" },
  { icon: "twitter", label: "footer.social.twitter", href: "https://twitter.com" },
  { icon: "facebook", label: "footer.social.facebook", href: "https://facebook.com" },
] as const satisfies ReadonlyArray<{ icon: string; label: TextKey; href: string }>;
