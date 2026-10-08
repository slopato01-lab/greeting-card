"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { GhostButton } from "@/components/GhostButton";
import type { CardContent } from "@/lib/card/content";
import type { GameKey } from "@/lib/catalog/templates";
import { type TextKey, t } from "@/lib/i18n";

/**
 * Экран получателя: то, что видит человек, открывший ссылку.
 *
 * Три стадии по docs/PRODUCT.md — обложка с обращением, игра, финал
 * с сюрпризом. Движение только вперёд: у получателя нет «назад»,
 * он проходит открытку один раз.
 *
 * Компонент ничего не знает о том, откуда приехала открытка. Сейчас
 * его показывает конструктор из живого черновика той же вкладки,
 * позже тем же способом его откроет страница /c/<slug> с серверными
 * данными.
 *
 * **Игры внутри нет.** На её месте глухой плейсхолдер цветом --photo,
 * такой же, как в карточках на /games. Игровых модулей не существует,
 * и контракт игрового модуля здесь не проектируется: когда он появится,
 * шов согласуется отдельно. Подсказка над плейсхолдером — настоящая
 * строка механики из словаря, она честно говорит, что игра попросит
 * сделать.
 *
 * Чего здесь нет намеренно: счётчиков хода и времени (`game.moves`,
 * `game.time`) — считать нечего; состояния загрузки (`loading.game`) —
 * грузить нечего; кнопки жалобы, которую требует docs/SECURITY.md, —
 * жаловаться некому, пока нет сервера.
 *
 * Раскладки в макете нет, она собрана от токенов, см. docs/DESIGN.md,
 * раздел «Экран получателя».
 */

const STAGES = ["cover", "game", "final"] as const;

type Stage = (typeof STAGES)[number];

/**
 * Подсказка механики. Ключи разведены по названиям игр, а не по номерам
 * карточек: `games.card.1.title` — это «Фото-пазл», и связь пазла
 * с «Соберите фотографию» должна быть видна глазами, иначе при
 * перестановке карточек подсказки молча разъедутся.
 */
const GAME_HINTS = {
  "games.card.1.title": "game.puzzle.hint",
  "games.card.2.title": "game.memory.hint",
  "games.card.3.title": "game.scratch.hint",
} as const satisfies Record<GameKey, TextKey>;

/**
 * Сюрприз-ссылку пишет автор, а открывает её получатель. В `href`
 * попадают только `http` и `https`: `javascript:` в ссылке — это
 * выполнение чужого кода на странице открытки.
 *
 * Не прошло разбор — показываем текстом как есть. Ничего не теряется,
 * а кликать по неизвестно чему получатель не будет.
 */
function safeUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const CARD = "rounded-card xl:rounded-card-d overflow-hidden bg-surface";

/** Текст автора: переносы строк он ставил руками, и они значимые. */
const AUTHOR_TEXT =
  "font-ui text-card xl:text-card-d whitespace-pre-line break-words leading-[1.4]";

export function CardView({ card, onExit }: { card: CardContent; onExit: () => void }) {
  const [stage, setStage] = useState<Stage>("cover");
  const stageRef = useRef<HTMLDivElement>(null);

  // Фокус переезжает на новую стадию: кнопка, которую только что нажали,
  // уехала вместе с прошлой стадией, и с клавиатуры фокус остался бы
  // в пустоте. Первый показ тоже считается: экран появляется в ответ
  // на нажатие «Посмотреть целиком», а не сам по себе.
  useEffect(() => {
    stageRef.current?.focus();
  }, [stage]);

  const greeting = card.greeting.trim();
  const sign = card.sign.trim();
  const surprise = card.surpriseValue.trim();
  const cover = card.photos[0];
  const hint = card.game === null ? null : GAME_HINTS[card.game];
  const link = card.surpriseKind === "link" ? safeUrl(surprise) : null;

  return (
    <div className="mx-auto xl:max-w-[900px]">
      <div ref={stageRef} tabIndex={-1} className="outline-none">
        {/* ── Обложка ──────────────────────────────────────── */}
        {stage === "cover" ? (
          <div className={CARD}>
            {/* Фото автора на обложке. Обычный img: оптимизатор Next
                в статическом экспорте недоступен, да и это не файл
                сборки — это blob из вкладки автора. */}
            {cover === undefined ? (
              <div aria-hidden="true" className="bg-photo h-[240px] w-full xl:h-[420px]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt="" className="h-[240px] w-full object-cover xl:h-[420px]" />
            )}

            {/* Текст никогда не лежит на голом фото, только на подложке
                — docs/DESIGN.md, «Работа с изображениями». Обращения
                может не быть: заглушку вместо него не подставляем,
                придумывать за автора нечего. */}
            <div className="px-[24px] py-[28px] xl:px-[54px] xl:py-[40px]">
              {greeting === "" ? null : (
                <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight break-words whitespace-pre-line">
                  {greeting}
                </h2>
              )}

              <Button
                labelKey="cta.start"
                onClick={() => setStage("game")}
                className={greeting === "" ? "" : "mt-[24px] xl:mt-[34px]"}
              />
            </div>
          </div>
        ) : null}

        {/* ── Игра ─────────────────────────────────────────── */}
        {stage === "game" ? (
          <div>
            {hint === null ? null : (
              <h2 className="font-display text-h3 xl:text-h3-d font-semibold tracking-tight">
                {t(hint)}
              </h2>
            )}

            {/* Игрового модуля не существует. Плейсхолдер тот же, что
                в карточках на /games: подставлять сюда картинку-обманку
                нельзя. */}
            <div
              aria-hidden="true"
              className="bg-photo rounded-card xl:rounded-card-d mt-[20px] h-[300px] w-full xl:mt-[30px] xl:h-[460px]"
            />

            <Button
              labelKey="cta.next"
              onClick={() => setStage("final")}
              className="mt-[30px] xl:mt-[45px]"
            />
          </div>
        ) : null}

        {/* ── Финал ────────────────────────────────────────── */}
        {stage === "final" ? (
          // Пустая рамка вместо сюрприза и подписи выглядела бы поломкой,
          // поэтому карточка появляется только тогда, когда внутри
          // действительно что-то есть.
          surprise === "" && sign === "" ? null : (
            <div className={`${CARD} px-[24px] py-[28px] xl:px-[54px] xl:py-[40px]`}>
              {surprise === "" ? null : link === null ? (
                <p className={AUTHOR_TEXT}>{surprise}</p>
              ) : (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-ui text-card xl:text-card-d min-h-tap text-gold inline-flex items-center break-all underline"
                >
                  {link}
                </a>
              )}

              {sign === "" ? null : (
                <p
                  className={`${AUTHOR_TEXT} text-body ${surprise === "" ? "" : "mt-[24px] xl:mt-[34px]"}`}
                >
                  {sign}
                </p>
              )}
            </div>
          )
        ) : null}
      </div>

      {/* Возврат в конструктор. Называется «Назад», а не «Закрыть»:
          строки «Закрыть» в словаре нет, а придумывать текст нельзя. */}
      <div className="mt-[30px] xl:mt-[45px]">
        <GhostButton labelKey="cta.back" onClick={onExit} className="xl:w-[360px]" />
      </div>
    </div>
  );
}
