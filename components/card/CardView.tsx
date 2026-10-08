"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { BirthdayCover } from "@/components/card/BirthdayCover";
import { Button } from "@/components/Button";
import { ScratchCard } from "@/components/games/ScratchCard";
import { GhostButton } from "@/components/GhostButton";
import { Icon } from "@/components/Icon";
import type { CardContent, CardTheme } from "@/lib/card/content";
import { trackById } from "@/lib/card/music";
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
 * **Игры.** Скретч-карта уже настоящая — первая игра по контракту
 * из lib/games/contract.ts, под покрытием лежит сюрприз автора.
 * Пазла и мемори пока нет: на их месте глухой плейсхолдер цветом
 * --photo, как в карточках на /games. «Дальше» после скретч-карты
 * появляется только когда она пройдена.
 *
 * **Оформление.** У темы `birthday` обложка — слоёная композиция
 * (BirthdayCover): фото автора в рамках, заголовок, наклейки. Подарки
 * в покрытии скретч-карты, конфетти над финалом. Текст на фото не
 * лежит нигде.
 *
 * **Анимация сборки** — как у SUPA: каждая стадия собирается из слоёв,
 * которые влетают по очереди (.assemble-layer в globals.css). Стадия
 * монтируется заново — анимация проигрывается заново.
 *
 * **Музыка** включается только нажатием «Начать» — звук до первого
 * касания запрещён (docs/TESTING.md) — и играет по кругу. Кнопка
 * в углу её выключает. Автор и лицензия песни подписаны рядом:
 * этого требует CC BY.
 *
 * Чего здесь нет намеренно: счётчиков хода и времени (`game.moves`,
 * `game.time`) — у скретч-карты считать нечего; кнопки жалобы, которую
 * требует docs/SECURITY.md, — жаловаться некому, пока нет сервера.
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

/** Номер слоя в очереди сборки, см. .assemble-layer в globals.css. */
function layer(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

/** Игра, которая уже существует в коде. Остальные — плейсхолдер. */
const SCRATCH = "games.card.3.title" satisfies GameKey;

/** Фото оформления. Скачаны с Unsplash, источники — CREDITS.md рядом. */
const THEME_ART = {
  birthday: {
    cover: "/assets/templates/birthday/cake.jpg",
    coating: "/assets/templates/birthday/gifts.jpg",
    finale: "/assets/templates/birthday/confetti.jpg",
  },
} as const satisfies Record<CardTheme, { cover: string; coating: string; finale: string }>;

/** Текст автора: переносы строк он ставил руками, и они значимые. */
const AUTHOR_TEXT =
  "font-ui text-card xl:text-card-d whitespace-pre-line break-words leading-[1.4]";

export function CardView({ card, onExit }: { card: CardContent; onExit: () => void }) {
  const [stage, setStage] = useState<Stage>("cover");
  const [gameDone, setGameDone] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Фокус переезжает на новую стадию: кнопка, которую только что нажали,
  // уехала вместе с прошлой стадией, и с клавиатуры фокус остался бы
  // в пустоте. Первый показ тоже считается: экран появляется в ответ
  // на нажатие «Посмотреть целиком», а не сам по себе.
  useEffect(() => {
    stageRef.current?.focus();
  }, [stage]);

  // Ушли с экрана — музыка замолкает и отпускает файл.
  useEffect(
    () => () => {
      const audio = audioRef.current;
      if (audio === null) return;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    },
    [],
  );

  const greeting = card.greeting.trim();
  const sign = card.sign.trim();
  const surprise = card.surpriseValue.trim();
  const art = card.theme === null ? null : THEME_ART[card.theme];
  const cover = card.photos[0]?.url ?? art?.cover ?? null;
  const hint = card.game === null ? null : GAME_HINTS[card.game];
  const link = card.surpriseKind === "link" ? safeUrl(surprise) : null;
  const code = card.surpriseKind === "code" && surprise !== "" ? surprise : null;
  const track = trackById(card.track);

  // Звук только в ответ на нажатие: этот обработчик и есть первое касание.
  const start = () => {
    if (track !== undefined && audioRef.current === null) {
      const audio = new Audio(track.src);
      audio.loop = true;
      audioRef.current = audio;
      // Кнопка показывает «играет» сразу: на медленной сети файл
      // грузится секунды, и нажатие в это время должно выключать,
      // а не запускать второй раз. Отказ браузера откатывает её.
      setMusicOn(true);
      audio.play().catch(() => setMusicOn(false));
    }
    setStage("game");
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (audio === null) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      setMusicOn(true);
      audio.play().catch(() => setMusicOn(false));
    }
  };

  const copyCode = () => {
    if (code === null) return;
    navigator.clipboard
      .writeText(code)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  /** Сюрприз под покрытием скретч-карты. */
  const reward =
    code !== null ? (
      <p className="font-display text-h2 xl:text-h2-d text-gold-deep font-medium tracking-tight break-all">
        {code}
      </p>
    ) : surprise !== "" && link === null ? (
      <p className={AUTHOR_TEXT}>{surprise}</p>
    ) : cover !== null ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
    ) : null;

  return (
    <div className="mx-auto xl:max-w-[900px]">
      {/* Музыка: кнопка и подпись с автором — CC BY требует указать его
          там, где песня звучит. Появляются вместе со звуком. */}
      {track !== undefined && stage !== "cover" ? (
        <div className="mb-[20px] flex items-center gap-[12px] xl:mb-[30px]">
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={t(musicOn ? "card.music.off" : "card.music.on")}
            aria-pressed={musicOn}
            className={`size-tap flex shrink-0 items-center justify-center rounded-full border transition-colors ${musicOn ? "bg-gold border-gold text-ink" : "border-line text-ink hover:bg-raised"}`}
          >
            <span aria-hidden="true" className="font-ui text-card">
              ♪
            </span>
          </button>
          <p className="font-ui text-note text-muted">
            {t("create.music.label")}: {track.artist} — {track.title} ·{" "}
            <a
              href={track.license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink underline"
            >
              {track.license.name}
            </a>
          </p>
        </div>
      ) : null}

      {/* Слои на старте сборки увеличены в 1.6 раза — без обрезки
          по горизонтали страница на миг становилась бы шире экрана.
          Поле в 4px оставлено под обводку фокуса у краёв. */}
      <div ref={stageRef} tabIndex={-1} className="-mx-[4px] overflow-x-clip px-[4px] outline-none">
        {/* ── Обложка ──────────────────────────────────────── */}
        {stage === "cover" && card.theme === "birthday" ? (
          <div>
            <BirthdayCover photos={card.photos.map((photo) => photo.url)} seed={card.seed} />

            {/* Обращение автора — на плашке под холстом: его длину
                не знает никто, а холст фиксированный. Плашка влетает
                вместе с композицией, следом за заголовком. */}
            <div
              className={`assemble-layer ${CARD} mx-auto mt-[16px] max-w-[560px] px-[24px] py-[24px] xl:mt-[20px] xl:px-[32px] xl:py-[28px]`}
              style={layer(2)}
            >
              {greeting === "" ? null : (
                <p className="font-display text-h3 xl:text-h3-d font-medium tracking-tight break-words whitespace-pre-line">
                  {greeting}
                </p>
              )}
              <Button
                labelKey="cta.start"
                onClick={start}
                className={greeting === "" ? "" : "mt-[20px] xl:mt-[28px]"}
              />
            </div>
          </div>
        ) : null}

        {stage === "cover" && card.theme !== "birthday" ? (
          <div className={CARD}>
            {/* Обычный img: оптимизатор Next в статическом экспорте
                недоступен, а фото автора — это blob из его вкладки. */}
            {cover === null ? (
              <div aria-hidden="true" className="bg-photo h-[240px] w-full xl:h-[420px]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="h-[240px] w-full object-cover xl:h-[420px]" />
            )}

            {/* Текст никогда не лежит на голом фото, только на подложке
                — docs/DESIGN.md, «Работа с изображениями». Обращения
                может не быть: заглушку вместо него не подставляем,
                придумывать за автора нечего. */}
            <div className="px-[24px] py-[28px] xl:px-[54px] xl:py-[40px]">
              {greeting === "" ? null : (
                <h2 className="font-display text-h3 xl:text-h3-d font-medium tracking-tight break-words whitespace-pre-line">
                  {greeting}
                </h2>
              )}

              <Button
                labelKey="cta.start"
                onClick={start}
                className={greeting === "" ? "" : "mt-[24px] xl:mt-[34px]"}
              />
            </div>
          </div>
        ) : null}

        {/* ── Игра ─────────────────────────────────────────── */}
        {stage === "game" ? (
          <div>
            {hint === null ? null : (
              <h2
                className="assemble-layer font-display text-h3 xl:text-h3-d font-medium tracking-tight"
                style={layer(0)}
              >
                {t(hint)}
              </h2>
            )}

            <div className="assemble-layer mt-[20px] xl:mt-[30px]" style={layer(1)}>
              {card.game === SCRATCH ? (
                <ScratchCard
                  seed={card.seed}
                  reward={reward}
                  cover={art?.coating ?? null}
                  onDone={() => setGameDone(true)}
                />
              ) : (
                // Пазла и мемори ещё нет. Плейсхолдер тот же, что
                // в карточках на /games: картинку-обманку сюда нельзя.
                <div
                  aria-hidden="true"
                  className="bg-photo rounded-card xl:rounded-card-d h-[300px] w-full xl:h-[460px]"
                />
              )}
            </div>

            {card.game !== SCRATCH || gameDone ? (
              <Button
                labelKey="cta.next"
                onClick={() => setStage("final")}
                className="mt-[30px] xl:mt-[45px]"
              />
            ) : null}
          </div>
        ) : null}

        {/* ── Финал ────────────────────────────────────────── */}
        {stage === "final" ? (
          <div>
            {art === null ? null : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={art.finale}
                alt=""
                className="assemble-layer rounded-card xl:rounded-card-d mb-[16px] h-[140px] w-full object-cover xl:mb-[20px] xl:h-[220px]"
                style={layer(0)}
              />
            )}

            {/* Пустая рамка вместо сюрприза и подписи выглядела бы
                поломкой, поэтому карточка появляется только тогда,
                когда внутри действительно что-то есть. */}
            {surprise === "" && sign === "" ? null : (
              <div
                className={`assemble-layer ${CARD} px-[24px] py-[28px] xl:px-[54px] xl:py-[40px]`}
                style={layer(1)}
              >
                {code !== null ? (
                  <div>
                    <p className="font-display text-h2 xl:text-h2-d text-gold-deep font-medium tracking-tight break-all">
                      {code}
                    </p>
                    <div className="mt-[20px] flex flex-col gap-[10px] xl:flex-row xl:items-center xl:gap-[20px]">
                      <Button labelKey="cta.copyCode" tone="dark" onClick={copyCode} />
                      <p aria-live="polite" className="font-ui text-note text-muted">
                        {copied ? (
                          <>
                            <Icon name="tick" size={16} className="text-gold-deep me-[6px] inline" />
                            {t("card.copied")}
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                ) : surprise === "" ? null : link === null ? (
                  <p className={AUTHOR_TEXT}>{surprise}</p>
                ) : (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-ui text-card xl:text-card-d min-h-tap text-gold-deep inline-flex items-center break-all underline"
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
            )}
          </div>
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
