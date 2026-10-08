import { Icon } from "@/components/Icon";
import { SOCIAL } from "@/components/site/social";
import { t } from "@/lib/i18n";

/**
 * Соцсети кружками с тонкой обводкой — как круглые кнопки в макете
 * главной (design/главная greetinh-cards.jpg). Живут в подвале.
 *
 * Кружок 44px — это и есть зона нажатия, в макете он мельче.
 * Подпись висит на ссылке, а не на иконке внутри: называть имеет
 * смысл то, что нажимают.
 */
export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul role="list" className={`flex items-center gap-[8px] ${className}`}>
      {SOCIAL.map((item) => (
        <li key={item.icon}>
          <a
            href={item.href}
            aria-label={t(item.label)}
            className="size-tap text-ink border-line hover:bg-raised hover:border-muted active:bg-line flex items-center justify-center rounded-full border transition-colors"
          >
            <Icon name={item.icon} size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
