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
 * Подписки снимаются одним AbortController, как требует CLAUDE.md.
 */
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

    const sync = () => {
      if (visible && !reduce.matches) {
        // Автоигру браузер может запретить (режим экономии) — тогда
        // просто остаётся обложка.
        video.play().catch(() => {});
      } else {
        video.pause();
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
    controller.signal.addEventListener("abort", () => observer.disconnect());

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
