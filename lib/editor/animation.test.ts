import assert from "node:assert/strict";
import { test } from "node:test";

import { applyFrame, frameAt, IDENTITY, letterState, revealText } from "./animation.ts";
import { ANIM_IN, ANIM_LOOP, ANIM_OUT, defaultLayer, imageLayer, type Layer } from "./document.ts";

const text = (anim: Partial<Layer["anim"]>): Layer => {
  const layer = defaultLayer("text", "Привет");
  return { ...layer, anim: { ...layer.anim, ...anim } };
};

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("без анимации кадр всегда тождественный", () => {
  for (const t of [0, 1, 5.9, 6, 100]) assert.deepEqual(frameAt(text({}), t, 6), IDENTITY);
});

test("каждое появление заканчивается на месте слоя", () => {
  for (const type of ANIM_IN) {
    const frame = frameAt(text({ in: type, inDuration: 1, delay: 0.5 }), 1.5, 6);
    assert.ok(near(frame.dx, 0) && near(frame.dy, 0), `${type}: сдвиг`);
    assert.ok(near(frame.scale, 1) && near(frame.angle, 0), `${type}: масштаб и угол`);
    assert.ok(near(frame.opacity, 1) && near(frame.reveal, 1), `${type}: видимость`);
  }
});

test("до задержки слой с появлением спрятан", () => {
  const fade = frameAt(text({ in: "fade", delay: 2 }), 1, 6);
  assert.equal(fade.opacity, 0);
  const slide = frameAt(text({ in: "slide-left", delay: 2 }), 1, 6);
  assert.equal(slide.dx, -600);
  const type = frameAt(text({ in: "typewriter", delay: 2 }), 1, 6);
  assert.equal(type.reveal, 0);
});

test("исчезание прижато к концу открытки и уводит слой", () => {
  const layer = text({ out: "slide-right", outDuration: 1 });
  assert.deepEqual(frameAt(layer, 4.99, 6), IDENTITY);
  assert.ok(frameAt(layer, 5.5, 6).dx > 0);
  assert.equal(frameAt(layer, 6, 6).dx, 600);
  assert.ok(near(frameAt(text({ out: "fade" }), 6, 6).opacity, 0));
});

test("каждое исчезание начинается с места слоя", () => {
  for (const type of ANIM_OUT) {
    const frame = frameAt(text({ out: type, outDuration: 1 }), 5, 6);
    assert.ok(near(frame.dx, 0) && near(frame.opacity, 1) && near(frame.scale, 1), type);
  }
});

test("показ начинается без скачка", () => {
  for (const type of ANIM_LOOP) {
    // Допуск 0.001: у сердцебиения хвост удара в нуле — 0.00003.
    const close = (a: number, b: number) => Math.abs(a - b) < 1e-3;
    const frame = frameAt(text({ loop: type, in: "fade", inDuration: 1 }), 1, 6);
    assert.ok(close(frame.dx, 0) && close(frame.dy, 0) && close(frame.angle, 0), type);
    assert.ok(close(frame.scale, 1) && close(frame.opacity, 1), type);
  }
});

test("бегущая строка только у текста, медленный наезд только у фото", () => {
  const photo = imageLayer("abcdef1234", 800, 600);
  const marqueePhoto = { ...photo, anim: { ...photo.anim, loop: "marquee" as const } };
  assert.deepEqual(frameAt(marqueePhoto, 1.3, 6), IDENTITY);

  const kenText = text({ loop: "kenburns" });
  assert.deepEqual(frameAt(kenText, 3, 6), IDENTITY);

  const kenPhoto = { ...photo, anim: { ...photo.anim, loop: "kenburns" as const } };
  assert.ok(frameAt(kenPhoto, 5, 6).scale > 1);
});

test("печатная машинка у фигуры ничего не делает", () => {
  const rect = defaultLayer("rect", "");
  const layer = { ...rect, anim: { ...rect.anim, in: "typewriter" as const } };
  assert.deepEqual(frameAt(layer, 0, 6), IDENTITY);
});

test("reduced motion: вместо движения — проявление, показ стоит", () => {
  const layer = text({ in: "slide-left", loop: "marquee", out: "zoom" });
  const start = frameAt(layer, 0, 6, true);
  assert.equal(start.dx, 0);
  assert.equal(start.opacity, 0);
  assert.deepEqual(frameAt(layer, 3, 6, true), IDENTITY);
});

test("одинаковое время — одинаковый кадр", () => {
  const layer = text({ in: "pop", loop: "swing", out: "rotate" });
  for (const t of [0.13, 2.7, 5.5]) assert.deepEqual(frameAt(layer, t, 6), frameAt(layer, t, 6));
});

test("applyFrame складывает сдвиг и умножает масштаб и прозрачность", () => {
  const layer = { ...defaultLayer("rect", ""), opacity: 0.5, scaleX: 2 };
  const out = applyFrame(layer, {
    ...IDENTITY,
    dx: 10,
    dy: -5,
    scale: 0.5,
    angle: 30,
    opacity: 0.5,
  });
  assert.equal(out.x, layer.x + 10);
  assert.equal(out.scaleX, 1);
  assert.equal(out.angle, 30);
  assert.equal(out.opacity, 0.25);
});

test("revealText режет по символам, а не по половинкам эмодзи", () => {
  assert.equal(revealText("Привет", 0.5), "При");
  assert.equal(revealText("🎉🎂", 0.5), "🎉");
  assert.equal(revealText("abc", 0), "");
  assert.equal(revealText("abc", 1), "abc");
});

test("по буквам: буквы встают по очереди и все на месте к концу", () => {
  const first = letterState(0, 10, 0.2);
  const last = letterState(9, 10, 0.2);
  assert.ok(first.alpha > 0 && last.alpha === 0, "первая раньше последней");
  for (let i = 0; i < 10; i += 1) assert.deepEqual(letterState(i, 10, 1), { alpha: 1, dy: 0 });
  assert.deepEqual(letterState(0, 1, 1), { alpha: 1, dy: 0 });
  const mid = frameAt(text({ in: "letters", inDuration: 1 }), 0.5, 6);
  assert.equal(mid.letters, 0.5);
});

test("сборка из разрядки: буквы съезжаются к нулю", () => {
  const layer = text({ in: "tracking", inDuration: 1 });
  assert.ok(frameAt(layer, 0.1, 6).spacing > 500);
  assert.ok(near(frameAt(layer, 1, 6).spacing, 0));
});

test("влёт с поворотом приходит с поворотом и встаёт на место", () => {
  const rect = defaultLayer("rect", "");
  const layer = { ...rect, anim: { ...rect.anim, in: "toss-left" as const, inDuration: 1 } };
  const start = frameAt(layer, 0, 6);
  assert.ok(start.dx < 0 && start.angle < 0 && start.opacity === 0);
  const end = frameAt(layer, 1, 6);
  assert.ok(near(end.dx, 0) && near(end.angle, 0) && near(end.scale, 1));
});

test("по буквам и разрядка у фигур не работают", () => {
  const rect = defaultLayer("rect", "");
  for (const type of ["letters", "tracking"] as const) {
    const layer = { ...rect, anim: { ...rect.anim, in: type } };
    assert.deepEqual(frameAt(layer, 0.3, 6), IDENTITY, type);
  }
});

test("огонёк и сердцебиение колеблются около исходного", () => {
  for (const loop of ["flicker", "heartbeat"] as const) {
    const layer = text({ loop, loopPeriod: 1 });
    const scales = [0.05, 0.1, 0.3, 0.5, 0.8].map((t) => frameAt(layer, t, 6).scale);
    assert.ok(Math.max(...scales) > 1.01, `${loop} шевелится`);
    assert.ok(
      scales.every((v) => v > 0.9 && v < 1.2),
      `${loop} без скачков`,
    );
  }
});
