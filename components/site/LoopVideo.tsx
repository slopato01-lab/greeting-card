"use client";

import { useEffect, useRef } from "react";

/**
 * Зацикленное беззвучное видео для карточки каталога.
 *
 * Играет только пока видно на экране: в ленте на главной карточек
 * много, и крутить их все за краем — зря тратить батарею. При
 * prefers-reduced-motion не играет вовсе: остаётся обложка (poster) —
 * полный кадр открытки. preload="none": видео начинает грузиться,
 * только когда карточка доехала до экрана.
 *
 * С 08.10.2026 на узких экранах одновременно играет ограниченное число
 * видео (PLAY_LIMITS): на телефоне дуга и бегущие ряды держали
 * по десятку декодеров сразу, и главная проседала. Остальные видимые
 * ждут в очереди с обложкой и запускаются, как только освободится место.
 * Запуск — через PLAY_DELAY после появления: карточка, мелькнувшая
 * на краю бегущего ряда, видео не трогает.
 *
 * Подписки снимаются одним AbortController, как требует CLAUDE.md.
 */

/** Сколько видео играет одновременно: до 768, до 1280, шире. */
const PLAY_LIMITS = [
  { query: "(max-width: 767px)", limit: 4 },
  { query: "(max-width: 1279px)", limit: 8 },
] as const;
/** Через сколько мс после появления на экране видео запускается. */
const PLAY_DELAY = 300;

// Общая очередь для всех видео страницы. Порядок вставки в Set —
// порядок появления на экране: первыми запускаются те, кто ждёт дольше.
const playing = new Set<HTMLVideoElement>();
const waiting = new Set<HTMLVideoElement>();

function limit(): number {
  for (const item of PLAY_LIMITS) {
    if (window.matchMedia(item.query).matches) return item.limit;
  }
  return Number.POSITIVE_INFINITY;
}

function start(video: HTMLVideoElement) {
  playing.add(video);
  // Автоигру браузер может запретить (режим экономии) — тогда
  // просто остаётся обложка.
  video.play().catch(() => {});
}

function promote() {
  for (const video of waiting) {
    if (playing.size >= limit()) return;
    waiting.delete(video);
    start(video);
  }
}

function enqueue(video: HTMLVideoElement) {
  if (playing.has(video) || waiting.has(video)) return;
  if (playing.size < limit()) start(video);
  else waiting.add(video);
}

function release(video: HTMLVideoElement) {
  waiting.delete(video);
  if (playing.delete(video)) video.pause();
  promote();
}

export function LoopVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (video === null) return;
    const controller = new AbortController();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer = 0;

    const sync = () => {
      window.clearTimeout(timer);
      if (visible && !reduce.matches) {
        timer = window.setTimeout(() => enqueue(video), PLAY_DELAY);
      } else {
        release(video);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduce.addEventListener("change", sync, { signal: controller.signal });
    controller.signal.addEventListener("abort", () => {
      observer.disconnect();
      window.clearTimeout(timer);
      release(video);
    });

    return () => controller.abort();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={className}
    />
  );
}
