/**
 * Декор из design/главная greetinh-cards.jpg, нарисованный кодом,
 * а не картинкой: «солнце» из лучей над чертой и ряд кружков
 * внахлёст. Оба скрыты от скринридера и красятся currentColor.
 */

/** Полусолнце: 13 лучей веером над горизонтальной чертой. */
export function Sun({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 13 }, (_, index) => {
    const angle = Math.PI - (Math.PI * index) / 12;
    return {
      x1: 60 + Math.cos(angle) * 18,
      y1: 58 - Math.sin(angle) * 18,
      x2: 60 + Math.cos(angle) * 52,
      y2: 58 - Math.sin(angle) * 52,
    };
  });

  return (
    <svg aria-hidden="true" viewBox="0 0 120 60" className={className}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {rays.map((ray, index) => (
          <line key={index} {...ray} />
        ))}
        <line x1="0" y1="59" x2="120" y2="59" />
      </g>
    </svg>
  );
}

/** Три кружка внахлёст — точки после выделенного слова в макете. */
export function Dots({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex ${className}`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="bg-gold border-canvas -ms-[0.25em] size-[0.9em] rounded-full border-2 first:ms-0"
        />
      ))}
    </span>
  );
}
