import type { CardMusic } from "@/lib/editor/document";
import type { TextKey } from "@/lib/i18n";

/**
 * Музыка для открытки (08.10.2026).
 *
 * Два источника, оба законные:
 *
 * 1. **Библиотека** — 15-секундные отрывки свободной музыки, нарезанные
 *    по самому яркому месту трека. Лежат у нас, поэтому играют
 *    в открытке и попадают в видео. Лицензии и источники —
 *    public/assets/music/CREDITS.md. Хиты из чартов и TikTok сюда
 *    не попадут: это чужие записи под авторским правом.
 * 2. **Яндекс Музыка** — человек вставляет ссылку на трек, играет
 *    официальный плеер Яндекса во фрейме. Звук мы не храним и не
 *    раздаём, поэтому в GIF и видео он не попадает и до припева не
 *    обрезается.
 *
 * Название и автор трека — данные, а не текст интерфейса, поэтому
 * не в словаре. Настроения — ключи словаря.
 */

export const MOODS = ["party", "pop", "romance", "calm", "fun", "festive"] as const;
export type Mood = (typeof MOODS)[number];

export const MOOD_LABEL: Record<Mood, TextKey> = {
  party: "editor.music.mood.party",
  pop: "editor.music.mood.pop",
  romance: "editor.music.mood.romance",
  calm: "editor.music.mood.calm",
  fun: "editor.music.mood.fun",
  festive: "editor.music.mood.festive",
};

export type LibraryTrack = {
  id: string;
  title: string;
  artist: string;
  mood: Mood;
  /** Нужно ли подписать автора рядом с плеером (CC BY). */
  credit: boolean;
  license: string;
};

export const LIBRARY: readonly LibraryTrack[] = [
  {
    id: "roller-fever",
    title: "Roller Fever",
    artist: "Loyalty Freak Music",
    mood: "party",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "cant-stop",
    title: "Can't Stop My Feet!",
    artist: "Loyalty Freak Music",
    mood: "party",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "sweat-time",
    title: "Sweat Time!",
    artist: "Loyalty Freak Music",
    mood: "party",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "funky-pop",
    title: "Funky Pop",
    artist: "HoliznaCC0",
    mood: "pop",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "day-dreams",
    title: "Day Dreams",
    artist: "HoliznaCC0",
    mood: "pop",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "sweet-sun",
    title: "Sweet Sun",
    artist: "Loyalty Freak Music",
    mood: "pop",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "love-love",
    title: "Love Love Love",
    artist: "HoliznaCC0",
    mood: "romance",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "puppy-love",
    title: "Puppy Love",
    artist: "HoliznaCC0",
    mood: "romance",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "street-of-love",
    title: "Street of Love",
    artist: "Loyalty Freak Music",
    mood: "romance",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "morning-coffee",
    title: "Morning Coffee",
    artist: "HoliznaCC0",
    mood: "calm",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "blue-skies",
    title: "Blue Skies",
    artist: "HoliznaCC0",
    mood: "calm",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "windows-down",
    title: "Windows Down",
    artist: "HoliznaCC0",
    mood: "calm",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "fluffing-duck",
    title: "Fluffing a Duck",
    artist: "Kevin MacLeod",
    mood: "fun",
    credit: true,
    license: "CC BY 4.0",
  },
  {
    id: "picnic",
    title: "Go to the Picnic",
    artist: "Loyalty Freak Music",
    mood: "fun",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "yippee",
    title: "Yippee!",
    artist: "Loyalty Freak Music",
    mood: "fun",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "jingle-bells",
    title: "Jingle Bells",
    artist: "Kevin MacLeod",
    mood: "festive",
    credit: true,
    license: "CC BY 4.0",
  },
  {
    id: "joy-synthwave",
    title: "Joy To The World (Synth Wave)",
    artist: "HoliznaCC0",
    mood: "festive",
    credit: false,
    license: "CC0 1.0",
  },
  {
    id: "celebration",
    title: "Beachfront Celebration",
    artist: "Kevin MacLeod",
    mood: "festive",
    credit: true,
    license: "CC BY 4.0",
  },
  {
    id: "christmas-market",
    title: "Christmas Market",
    artist: "Lobo Loco",
    mood: "festive",
    credit: true,
    license: "CC BY 4.0",
  },
];

/** Длина отрывка, секунды. */
export const CLIP_SECONDS = 15;

export function libraryTrack(id: string): LibraryTrack | undefined {
  return LIBRARY.find((track) => track.id === id);
}

export function clipUrl(id: string): string {
  return `/assets/music/${id}.mp3`;
}

/**
 * Подпись трека под CC BY: автор, название, лицензия. Нужна везде,
 * где трек звучит, — в редакторе, в открытке и в сохранённом видео.
 * У CC0 подпись не обязательна — null.
 */
export function musicCredit(music: CardMusic | null): string | null {
  if (music?.kind !== "library") return null;
  const track = libraryTrack(music.id);
  if (track === undefined || !track.credit) return null;
  return `${track.artist} — ${track.title} · ${track.license}`;
}

/** Адрес звука для записи видео: только у трека из библиотеки. */
export function musicAudioSrc(music: CardMusic | null): string | null {
  if (music?.kind !== "library" || libraryTrack(music.id) === undefined) return null;
  return clipUrl(music.id);
}

const YANDEX_HOSTS = /^(?:www\.)?music\.yandex\.(?:ru|by|kz|uz|com)$/;

/**
 * Ссылка на трек Яндекс Музыки → id альбома и трека.
 *
 * Понимает адрес из «Поделиться» (`/album/123/track/456`) и код для
 * вставки (`/iframe/album/123/track/456` или старый `#track/456/123`).
 * Домены — только Яндекс Музыки: в фрейм не уйдёт чужой адрес.
 */
export function parseYandexLink(input: string): CardMusic | null {
  const text = input.trim();
  const src = /src=["']([^"']+)["']/.exec(text)?.[1] ?? text;
  let url: URL;
  try {
    url = new URL(src.startsWith("http") ? src : `https://${src}`);
  } catch {
    return null;
  }
  if (!YANDEX_HOSTS.test(url.hostname)) return null;
  const path = /\/album\/(\d{1,12})\/track\/(\d{1,12})/.exec(url.pathname);
  if (path?.[1] !== undefined && path[2] !== undefined) {
    return { kind: "yandex", album: path[1], track: path[2] };
  }
  const hash = /#track\/(\d{1,12})\/(\d{1,12})/.exec(url.hash);
  if (hash?.[1] !== undefined && hash[2] !== undefined) {
    return { kind: "yandex", album: hash[2], track: hash[1] };
  }
  return null;
}

export function yandexEmbedUrl(music: { album: string; track: string }): string {
  return `https://music.yandex.ru/iframe/album/${music.album}/track/${music.track}`;
}
