/**
 * Песни, которые можно поставить в открытку.
 *
 * Все три — с конкурса New Birthday Song Contest (WFMU и Free Music
 * Archive, 2012): песни писали как свободную замену «Happy Birthday».
 * Взяты с Wikimedia Commons, лицензия CC BY 3.0 — коммерческое
 * использование разрешено, нужно указать автора. Подпись с автором
 * и лицензией стоит рядом с плеером, в конструкторе и в открытке.
 *
 * Трендовые треки из TikTok здесь не появятся: это чужие записи
 * под авторским правом, раздавать их с нашего сервера нельзя.
 *
 * Название и автор — данные трека, а не текст интерфейса, поэтому
 * не в словаре. Исходники и проверка лицензии —
 * public/assets/templates/birthday/CREDITS.md.
 */

const LICENSE = {
  name: "CC BY 3.0",
  url: "https://creativecommons.org/licenses/by/3.0/",
} as const;

export const TRACKS = [
  {
    id: "monk",
    src: "/assets/templates/birthday/music/monk.mp3",
    artist: "Monk Turner + Fascinoma",
    title: "It’s Your Birthday!",
    license: LICENSE,
  },
  {
    id: "zicmuse",
    src: "/assets/templates/birthday/music/zicmuse.mp3",
    artist: "McCloud Zicmuse",
    title: "Birthday Song",
    license: LICENSE,
  },
  {
    id: "martin",
    src: "/assets/templates/birthday/music/martin.mp3",
    artist: "Kathleen Martin",
    title: "Birthday Song",
    license: LICENSE,
  },
] as const;

export type Track = (typeof TRACKS)[number];
export type TrackId = Track["id"];

export function trackById(id: string | null): Track | undefined {
  return TRACKS.find((track) => track.id === id);
}
