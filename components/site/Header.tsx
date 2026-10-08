"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { t, type TextKey } from "@/lib/i18n";

/**
 * Шапка сайта. Вид — из design/главная greetinh-cards.jpg: знак
 * и название слева, навигация капсом по центру (текущий раздел
 * подчёркнут), справа белая пилюля. Одна на все страницы.
 *
 * Шапка прилипает к верху экрана на всех страницах и ширинах
 * (решение 08.10.2026). Фон сплошной --canvas: контент под ней не
 * просвечивает. Линия --line снизу появляется, только когда страница
 * прокручена, — наверху страницы шапка лежит на основе, как в макете.
 * Высота — токены --spacing-header / -d, на них же отступает прокрутка
 * к фокусу (globals.css).
 *
 * На мобильном — название и бургер. Панели раскрытого меню в макете
 * нет — спроектирована от токенов, описание в docs/DESIGN.md, раздел
 * «Панель мобильного меню». Панель раскрывается в потоке и сдвигает
 * содержимое вниз: так не нужны ни оверлей, ни блокировка прокрутки,
 * ни ловушка фокуса.
 */
const NAV: ReadonlyArray<{ href: string; key: TextKey }> = [
  { href: "/cards", key: "nav.cards" },
  { href: "/games", key: "nav.games" },
  { href: "/faq", key: "nav.faq" },
  { href: "/how", key: "nav.how" },
];

const NAV_LINK =
  "font-ui caps text-body hover:text-ink active:text-ink transition-colors " +
  "aria-[current=page]:text-ink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Пока панель открыта, слушаем Esc, нажатие и фокус вне шапки.
  // Все слушатели снимаются одним AbortSignal — вместе с закрытием
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

    // Фокус ушёл из шапки (Tab за последний пункт) — панель закрывается:
    // шапка прилипает к экрану, и открытая панель накрыла бы элемент
    // в фокусе.
    document.addEventListener(
      "focusin",
      (event) => {
        const target = event.target;
        if (target instanceof Node && headerRef.current?.contains(target)) return;
        setOpen(false);
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

  // Прокручена ли страница — от этого зависит линия под шапкой.
  // Слушатель пассивный и снимается по AbortSignal.
  useEffect(() => {
    const controller = new AbortController();
    const update = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", update, { passive: true, signal: controller.signal });
    update();
    return () => controller.abort();
  }, []);

  // Фокус уходит в панель сразу после раскрытия: иначе с клавиатуры
  // следующий Tab уводит мимо только что открытого меню.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  // Текущий раздел: сам адрес или любая страница под ним.
  // Статический экспорт отдаёт адреса без хвостового слэша.
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;

  return (
    <header
      ref={headerRef}
      className={`bg-canvas sticky top-0 z-40 border-b transition-colors ${scrolled ? "border-line" : "border-transparent"}`}
    >
      <div className="page-shell min-h-header xl:min-h-header-d flex items-center">
        <Link
          href="/"
          className="font-display text-logo xl:text-logo-d min-h-tap inline-flex items-center gap-[10px] font-medium"
        >
          <Icon name="planet" size={28} className="text-gold-deep" />
          {t("brand.name")}
        </Link>

        <nav aria-label={t("nav.menu")} className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-[40px]">
            {NAV.map((item) => (
              <li key={item.href}>
                {/* Подчёркивание — нижняя граница пункта, а не text-decoration:
                    так оно ровно под всей строкой и одной толщины в любом шрифте. */}
                <Link
                  href={item.href}
                  aria-current={current(item.href)}
                  className={`${NAV_LINK} text-nav-d min-h-tap min-w-tap aria-[current=page]:border-ink inline-flex items-center justify-center border-b border-transparent`}
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
        <div className="hidden xl:block">
          <Button href="/create" variant="header" tone="dark" labelKey="cta.create" />
        </div>

        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={t("nav.menu")}
          aria-expanded={open}
          aria-controls={panelId}
          className="size-tap text-ink hover:text-gold-deep active:text-gold-deep ms-auto flex items-center justify-center transition-colors xl:hidden"
        >
          <Icon name="burger" size={32} />
        </button>
      </div>

      {open ? (
        <div id={panelId} ref={panelRef} className="page-shell pb-5 xl:hidden">
          <nav aria-label={t("nav.menu")}>
            <ul>
              {NAV.map((item) => (
                <li key={item.href} className="border-line border-t">
                  <Link
                    href={item.href}
                    aria-current={current(item.href)}
                    onClick={() => setOpen(false)}
                    className={`${NAV_LINK} text-menu min-h-tap flex items-center`}
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
    </header>
  );
}
