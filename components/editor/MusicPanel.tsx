"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/Icon";
import { GroupLabel, Panel } from "@/components/editor/controls";
import type { CardMusic } from "@/lib/editor/document";
import {
  clipUrl,
  LIBRARY,
  type LibraryTrack,
  MOOD_LABEL,
  MOODS,
  musicCredit,
  parseYandexLink,
  yandexEmbedUrl,
} from "@/lib/editor/music";
import { t } from "@/lib/i18n";

/**
 * Вкладка «Музыка»: отрывок из библиотеки или трек Яндекс Музыки
 * по ссылке. Источники и лицензии — lib/editor/music.ts.
 *
 * Выбор — обычные радиокнопки: «Без музыки», треки библиотеки по
 * настроениям и трек Яндекса, если он добавлен. Рядом с каждым треком
 * библиотеки — кнопка «Послушать»: играет отрывок, не выбирая его.
 * Одновременно играет только один.
 */

const ROW =
  "rounded-inner flex min-h-tap items-center gap-[10px] px-[8px] py-[6px] transition-colors";

function sameMusic(a: CardMusic | null, b: CardMusic | null): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind === "library" && b.kind === "library") return a.id === b.id;
  if (a.kind === "yandex" && b.kind === "yandex") return a.album === b.album && a.track === b.track;
  return false;
}

export function MusicPanel({
  music,
  disabled,
  onMusic,
}: {
  music: CardMusic | null;
  disabled: boolean;
  onMusic: (music: CardMusic | null) => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [listening, setListening] = useState<string | null>(null);
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState(false);
  /** Трек Яндекса держится в списке, даже если выбрали другой. */
  const [yandex, setYandex] = useState<CardMusic | null>(music?.kind === "yandex" ? music : null);

  // Ушли со вкладки — отрывок замолкает.
  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  const listen = (track: LibraryTrack) => {
    audio.current?.pause();
    if (listening === track.id) {
      audio.current = null;
      setListening(null);
      return;
    }
    const player = new Audio(clipUrl(track.id));
    player.addEventListener("ended", () => setListening(null), { once: true });
    audio.current = player;
    setListening(track.id);
    player.play().catch(() => setListening(null));
  };

  const addYandex = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseYandexLink(link);
    setLinkError(parsed === null);
    if (parsed === null) return;
    setYandex(parsed);
    setLink("");
    onMusic(parsed);
  };

  const option = (value: CardMusic | null, label: string, sub?: string) => (
    <label
      className={`${ROW} min-w-0 flex-1 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-50 ${
        sameMusic(music, value) ? "bg-paper" : "hover:bg-raised"
      }`}
    >
      <input
        type="radio"
        name="editor-music"
        checked={sameMusic(music, value)}
        disabled={disabled}
        onChange={() => onMusic(value)}
        className="accent-gold-deep size-[18px] shrink-0"
      />
      <span className="flex min-w-0 flex-col">
        <span className="font-ui text-note xl:text-note-d text-ink truncate font-medium">
          {label}
        </span>
        {sub === undefined ? null : (
          <span className="font-ui text-badge text-muted truncate">{sub}</span>
        )}
      </span>
    </label>
  );

  const credit = musicCredit(music);

  return (
    <Panel labelledBy="editor-music">
      <GroupLabel id="editor-music" labelKey="editor.music" />

      <div role="radiogroup" aria-labelledby="editor-music" className="flex flex-col gap-[12px]">
        {option(null, t("editor.music.none"))}

        {yandex?.kind === "yandex" ? option(yandex, t("editor.music.yandex")) : null}

        <div className="flex flex-col gap-[6px]">
          <span className="font-ui caps text-badge text-muted">{t("editor.music.library")}</span>
          <p className="font-ui text-note text-body leading-[1.4]">
            {t("editor.music.library.hint")}
          </p>
        </div>

        {LIBRARY.length === 0 ? (
          <p className="font-ui text-note text-muted">{t("editor.music.empty")}</p>
        ) : null}

        {MOODS.map((mood) => {
          const tracks = LIBRARY.filter((track) => track.mood === mood);
          if (tracks.length === 0) return null;
          return (
            <div key={mood} className="flex flex-col gap-[4px]">
              <span className="font-ui caps text-badge text-muted">{t(MOOD_LABEL[mood])}</span>
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-[4px]">
                  <button
                    type="button"
                    aria-pressed={listening === track.id}
                    aria-label={`${t(listening === track.id ? "editor.music.pause" : "editor.music.listen")}: ${track.title}`}
                    title={t(listening === track.id ? "editor.music.pause" : "editor.music.listen")}
                    onClick={() => listen(track)}
                    className="size-tap border-line text-ink hover:bg-raised hover:border-muted active:bg-line flex shrink-0 items-center justify-center rounded-full border transition-colors"
                  >
                    <Icon name={listening === track.id ? "pause" : "play"} size={18} />
                  </button>
                  {option({ kind: "library", id: track.id }, track.title, track.artist)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* CC BY требует подписать автора рядом с плеером. */}
      {credit === null ? null : (
        <p className="font-ui text-badge text-muted leading-[1.4]">
          {t("editor.music.license")}: {credit}
        </p>
      )}

      <form onSubmit={addYandex} className="border-line flex flex-col gap-[8px] border-t pt-[16px]">
        <label htmlFor="editor-yandex" className="font-ui caps text-badge text-muted">
          {t("editor.music.yandex")}
        </label>
        <p id="editor-yandex-hint" className="font-ui text-note text-body leading-[1.4]">
          {t("editor.music.yandex.hint")}
        </p>
        <input
          id="editor-yandex"
          type="url"
          inputMode="url"
          value={link}
          disabled={disabled}
          placeholder={t("editor.music.yandex.field")}
          aria-describedby={linkError ? "editor-yandex-error" : "editor-yandex-hint"}
          aria-invalid={linkError || undefined}
          onChange={(event) => {
            setLink(event.target.value);
            setLinkError(false);
          }}
          className="font-ui text-note text-ink bg-paper border-muted rounded-inner min-h-tap w-full border px-[12px] disabled:opacity-50"
        />
        {linkError ? (
          <p id="editor-yandex-error" role="alert" className="font-ui text-note text-ink">
            {t("editor.music.yandex.error")}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={disabled || link.trim() === ""}
          className="font-ui text-note xl:text-note-d text-ink border-line min-h-tap hover:bg-raised hover:border-muted active:bg-line disabled:text-muted flex items-center justify-center gap-[10px] rounded-full border px-[16px] font-medium transition-colors disabled:cursor-not-allowed"
        >
          <Icon name="tabMusic" size={20} />
          {t("editor.music.yandex.add")}
        </button>
      </form>

      {music?.kind === "yandex" ? (
        <iframe
          title={t("editor.music.yandex.player")}
          src={yandexEmbedUrl(music)}
          loading="lazy"
          allow="clipboard-write; autoplay"
          referrerPolicy="strict-origin-when-cross-origin"
          className="rounded-inner h-[180px] w-full border-0"
        />
      ) : null}
    </Panel>
  );
}
