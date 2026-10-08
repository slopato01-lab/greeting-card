import { Icon } from "@/components/Icon";
import { SOCIAL } from "@/components/site/social";
import { t } from "@/lib/i18n";

/**
 * Соцсети тёмными кружками — как в макете главной (design/главная.jpg):
 * в вырезе героя и справа в подвале.
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
            className="size-tap bg-ink hover:bg-pink active:bg-pink flex items-center justify-center rounded-full text-white transition-colors"
          >
            <Icon name={item.icon} size={20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
