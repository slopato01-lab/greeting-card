import assert from "node:assert/strict";
import { test } from "node:test";

import { applyFrame, frameAt, IDENTITY, revealText } from "./animation.ts";
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
    const frame = frameAt(text({ loop: type, in: "fade", inDuration: 1 }), 1, 6);
    assert.ok(near(frame.dx, 0) && near(frame.dy, 0) && near(frame.angle, 0), type);
    assert.ok(near(frame.scale, 1) && near(frame.opacity, 1), type);
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
  const out = applyFrame(layer, { dx: 10, dy: -5, scale: 0.5, angle: 30, opacity: 0.5, reveal: 1 });
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
