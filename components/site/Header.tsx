"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Шапка лендинга.
 *
 * Мобильный (макет 341:607): логотип слева, бургер справа, линия 2px
 * под шапкой. Десктоп с 1280px (макет 324:246): логотип, четыре пункта
 * навигации, розовая кнопка.
 *
 * Панели раскрытого меню в макете нет — спроектирована от токенов,
 * описание в docs/DESIGN.md, раздел «Панель мобильного меню».
 * Панель раскрывается в потоке и сдвигает содержимое вниз: так не нужны
 * ни оверлей, ни блокировка прокрутки, ни ловушка фокуса.
 *
 * Вариант `hero` — для главной (design/главная.jpg): шапка становится
 * верхней половиной тёмной карточки героя, нижнюю рисует Hero.
 * Панель меню раскрывается внутри той же карточки и сдвигает героя.
 */
const NAV: ReadonlyArray<{ href: string; key: TextKey }> = [
  { href: "/cards", key: "nav.cards" },
  { href: "/games", key: "nav.games" },
  { href: "/faq", key: "nav.faq" },
  { href: "/how", key: "nav.how" },
];

const NAV_LINK = {
  light: "font-ui tracking-base text-nav hover:text-ink active:text-ink transition-colors",
  hero: "font-ui tracking-base whitespace-nowrap text-white hover:opacity-80 active:opacity-80 transition-opacity",
} as const;

export function Header({ tone = "light" }: { tone?: "light" | "hero" }) {
  const hero = tone === "hero";
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Пока панель открыта, слушаем Esc и нажатие вне шапки.
  // Оба слушателя снимаются одним AbortSignal — вместе с закрытием
  // панели и при размонтировании.
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") return;
        setOpen(false);
        burgerRef.current?.focus();
      },
      { signal },
    );

    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target;
        if (target instanceof Node && headerRef.current?.contains(target)) return;
        setOpen(false);
      },
      { signal },
    );

    return () => controller.abort();
  }, [open]);

  // Фокус уходит в панель сразу после раскрытия: иначе с клавиатуры
  // следующий Tab уводит мимо только что открытого меню.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={
        hero
          ? "on-dark header-hero page-shell pt-[10px] max-md:px-0 max-md:pt-0 xl:pt-5"
          : "border-ink border-b-2"
      }
    >
      {/* В варианте hero поля живут на тёмной карточке, а не на полосе
          страницы: те же 20 / 40, что у нижней половины в Hero. */}
      <div
        className={hero ? "bg-dark md:rounded-t-card xl:rounded-t-card-d px-[20px] xl:px-10" : ""}
      >
        <div
          className={
            hero
              ? "flex min-h-16 items-center xl:min-h-[107px]"
              : "page-shell flex min-h-16 items-center xl:min-h-[107px]"
          }
        >
          <Link
            href="/"
            className={`font-display text-logo xl:text-logo-d min-h-tap inline-flex items-center font-medium ${hero ? "text-white" : ""}`}
          >
            {t("brand.name")}
          </Link>

          {/* Отступ от логотипа и шаг между пунктами живут в globals.css:
            на 1920 это макетные 264 и 110, ниже они текут вместе
            с боковым полем, иначе на 1280 шапка не помещается. */}
          <nav aria-label={t("nav.menu")} className="header-nav hidden xl:block">
            <ul className="flex items-center">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${NAV_LINK[tone]} text-nav-d min-h-tap inline-flex items-center`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Кнопка прячется обёрткой, а не своим классом: у самой кнопки
            в базовых классах уже есть inline-flex, и он перебивает
            hidden — порядок в строке классов на это не влияет. */}
          <div className="ms-auto hidden ps-5 xl:block">
            <Button href="/create" variant="header" labelKey="cta.create" />
          </div>

          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={t("nav.menu")}
            aria-expanded={open}
            aria-controls={panelId}
            className={`size-tap ms-auto flex items-center justify-center transition-colors xl:hidden ${
              hero ? "text-white hover:opacity-80" : "text-ink hover:text-pink active:text-pink"
            }`}
          >
            <Icon name="burger" size={40} />
          </button>
        </div>

        {open ? (
          <div
            id={panelId}
            ref={panelRef}
            className={hero ? "pb-5 xl:hidden" : "page-shell pb-5 xl:hidden"}
          >
            <nav aria-label={t("nav.menu")}>
              <ul>
                {NAV.map((item) => (
                  <li
                    key={item.href}
                    className={`border-t ${hero ? "border-white/20" : "border-muted"}`}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`${NAV_LINK[tone]} text-menu min-h-tap flex items-center`}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Button href="/create" labelKey="cta.create" className="mt-5" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
