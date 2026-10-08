"""
Рисует стикеры редактора в public/assets/stickers — коллаж в духе
design/пример анимации и дизайна.MP4: горошек, полоски, клейкая лента.

Запускается руками: python3 -I scripts/draw-stickers.py
Результат лежит в репозитории, сборка его не перерисовывает.

Горошек и конфетти расставляет генератор с фиксированным зерном:
картинки одинаковые при каждом запуске.
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "assets" / "stickers"
OUT.mkdir(parents=True, exist_ok=True)
rng = random.Random(20261008)


def svg(name, w, h, body, defs=""):
    text = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
        f"<defs>{defs}</defs>{body}</svg>\n"
    )
    (OUT / f"{name}.svg").write_text(text)


def dots(x0, y0, x1, y1, step, r, color, jitter=0.25):
    out = []
    row = 0
    y = y0
    while y < y1:
        x = x0 + (step / 2 if row % 2 else 0)
        while x < x1:
            jx = (rng.random() - 0.5) * step * jitter
            jy = (rng.random() - 0.5) * step * jitter
            out.append(f'<circle cx="{x + jx:.1f}" cy="{y + jy:.1f}" r="{r}" fill="{color}"/>')
            x += step
        y += step * 0.86
        row += 1
    return "".join(out)


# ── Колпак в горошек ─────────────────────────────────────────
svg(
    "party-hat",
    400,
    480,
    '<g clip-path="url(#cone)"><rect width="400" height="480" fill="url(#hatG)"/>'
    + dots(40, 60, 380, 470, 46, 9, "#fff")
    + '<rect width="400" height="480" fill="url(#hatShade)"/></g>'
    '<path d="M64 430 Q200 478 336 430" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".9"/>'
    '<circle cx="200" cy="44" r="30" fill="#fff"/><circle cx="192" cy="36" r="10" fill="#fde4ee"/>',
    '<linearGradient id="hatG" x1="0" x2="1"><stop offset="0" stop-color="#f6b3c9"/><stop offset="1" stop-color="#e9779d"/></linearGradient>'
    '<linearGradient id="hatShade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#8a1f45" stop-opacity=".18"/></linearGradient>'
    '<clipPath id="cone"><path d="M200 50 L340 430 Q200 478 60 430 Z"/></clipPath>',
)

# ── Полосатая свеча без огня (огонёк — отдельный стикер) ─────
stripes = "".join(
    f'<path d="M0 {y} L120 {y - 70} L120 {y - 34} L0 {y + 36} Z" fill="#e8467c"/>'
    for y in range(40, 620, 72)
)
svg(
    "candle",
    120,
    520,
    '<line x1="60" y1="44" x2="60" y2="8" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>'
    '<g clip-path="url(#body)"><rect width="120" height="520" fill="#fff4f7"/>'
    + stripes
    + '<rect width="120" height="520" fill="url(#candleShade)"/></g>'
    '<ellipse cx="60" cy="46" rx="40" ry="9" fill="#ffd3e1"/>',
    '<clipPath id="body"><rect x="20" y="44" width="80" height="470" rx="10"/></clipPath>'
    '<linearGradient id="candleShade" x1="0" x2="1"><stop offset="0" stop-color="#7a1033" stop-opacity=".22"/><stop offset=".35" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#7a1033" stop-opacity=".3"/></linearGradient>',
)

# ── Огонёк со свечением ──────────────────────────────────────
svg(
    "flame",
    120,
    200,
    '<circle cx="60" cy="118" r="58" fill="url(#glow)"/>'
    '<path d="M60 26 C82 68 94 98 94 126 A34 34 0 0 1 26 126 C26 98 40 68 60 26 Z" fill="url(#fl)"/>'
    '<path d="M60 84 C70 104 76 116 76 130 A16 16 0 0 1 44 130 C44 116 50 104 60 84 Z" fill="#fffbe6"/>',
    '<radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'
    '<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a2a"/><stop offset=".55" stop-color="#ffc24a"/><stop offset="1" stop-color="#fff1b0"/></linearGradient>',
)

# ── Спичка ───────────────────────────────────────────────────
svg(
    "match",
    60,
    420,
    '<rect x="22" y="60" width="16" height="352" rx="4" fill="#ecc98f"/>'
    '<rect x="22" y="60" width="6" height="352" rx="3" fill="#f7deb0"/>'
    '<ellipse cx="30" cy="52" rx="20" ry="32" fill="#e8507a"/>'
    '<ellipse cx="24" cy="42" rx="6" ry="10" fill="#ff9ab8"/>',
)


# ── Клейкая лента в горошек ──────────────────────────────────
def tape(name, color, dot):
    teeth_r = "".join(f"L{506 if i % 2 == 0 else 496} {14 + i * 12}" for i in range(9))
    teeth_l = "".join(f"L{14 if i % 2 == 0 else 24} {110 - i * 12}" for i in range(9))
    svg(
        name,
        520,
        124,
        f'<g clip-path="url(#tp)"><rect width="520" height="124" fill="{color}"/>'
        + dots(20, 22, 510, 118, 34, 7, dot, 0.2)
        + '<rect width="520" height="124" fill="url(#tpS)"/></g>',
        f'<clipPath id="tp"><path d="M18 10 L500 6 {teeth_r} L22 116 {teeth_l} Z"/></clipPath>'
        '<linearGradient id="tpS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>',
    )


tape("tape-pink", "#f28aae", "#fff")
tape("tape-mint", "#8fd6c3", "#fff")
tape("tape-gold", "#e9c46a", "#fff7dc")
tape("tape-red", "#e5484d", "#ffd6d8")

# ── Сердечки ─────────────────────────────────────────────────
HEART = "M80 136 C30 102 8 72 20 42 C32 14 68 14 80 46 C92 14 128 10 140 40 C152 72 128 104 80 136 Z"


def heart_doodle(name, color):
    svg(
        name,
        160,
        150,
        f'<path d="{HEART}" fill="none" stroke="{color}" stroke-width="7" stroke-linejoin="round"/>'
        f'<path d="M78 128 C34 98 14 70 24 46 C34 22 64 22 76 48" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round" opacity=".55"/>',
    )


heart_doodle("heart-doodle-pink", "#e8508a")
heart_doodle("heart-doodle-red", "#d7263d")
svg(
    "heart-red",
    160,
    150,
    f'<path d="{HEART}" fill="url(#hr)"/>'
    '<ellipse cx="44" cy="44" rx="14" ry="9" transform="rotate(-35 44 44)" fill="#fff" opacity=".45"/>',
    '<linearGradient id="hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6b7d"/><stop offset="1" stop-color="#c81d3a"/></linearGradient>',
)

# ── Искры ────────────────────────────────────────────────────
STAR4 = "M80 0 C86 50 110 74 160 80 C110 86 86 110 80 160 C74 110 50 86 0 80 C50 74 74 50 80 0 Z"
svg(
    "sparkle-gold",
    160,
    160,
    f'<path d="{STAR4}" fill="url(#sg)"/>',
    '<linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e2a92c"/></linearGradient>',
)
svg(
    "sparkle-pink",
    160,
    160,
    f'<path d="{STAR4}" fill="url(#sp)"/>',
    '<linearGradient id="sp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd1e1"/><stop offset="1" stop-color="#e8508a"/></linearGradient>',
)

# ── Конфетти ─────────────────────────────────────────────────
colors = ["#e8508a", "#fdd835", "#43a047", "#1e88e5", "#fb8c00", "#8e24aa", "#00897b"]
bits = []
for _ in range(46):
    x, y = rng.uniform(10, 390), rng.uniform(10, 290)
    c = rng.choice(colors)
    a = rng.uniform(0, 180)
    if rng.random() < 0.6:
        bits.append(
            f'<rect x="{x:.0f}" y="{y:.0f}" width="16" height="7" rx="2" fill="{c}" transform="rotate({a:.0f} {x + 8:.0f} {y + 3:.0f})"/>'
        )
    else:
        bits.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rng.uniform(4, 7):.1f}" fill="{c}"/>')
svg("confetti", 400, 300, "".join(bits))


# ── Ёлочные шары ─────────────────────────────────────────────
def ornament(name, light, mid, dark):
    svg(
        name,
        240,
        330,
        '<path d="M120 46 C100 6 140 6 120 46" fill="none" stroke="#9c7b34" stroke-width="5"/>'
        '<rect x="96" y="42" width="48" height="32" rx="5" fill="url(#cap)"/>'
        '<path d="M100 50 H140 M100 58 H140 M100 66 H140" stroke="#9c7b34" stroke-width="2" opacity=".6"/>'
        '<circle cx="120" cy="200" r="112" fill="url(#ball)"/>'
        '<path d="M14 196 Q66 170 120 196 T226 196" fill="none" stroke="#fff" stroke-width="6" opacity=".55"/>'
        '<path d="M22 232 Q70 210 120 232 T220 232" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>'
        '<ellipse cx="78" cy="148" rx="30" ry="18" transform="rotate(-35 78 148)" fill="#fff" opacity=".55"/>',
        '<linearGradient id="cap" x1="0" x2="1"><stop offset="0" stop-color="#b8923e"/><stop offset=".5" stop-color="#f3d98b"/><stop offset="1" stop-color="#a47d2c"/></linearGradient>'
        f'<radialGradient id="ball" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="{light}"/><stop offset=".55" stop-color="{mid}"/><stop offset="1" stop-color="{dark}"/></radialGradient>',
    )


ornament("ornament-red", "#ff8a8a", "#d32f2f", "#7f1010")
ornament("ornament-gold", "#fff0b8", "#e0aa34", "#94650f")

# ── Снежинка ─────────────────────────────────────────────────
arm = (
    '<line x1="120" y1="120" x2="120" y2="14"/>'
    '<line x1="120" y1="52" x2="96" y2="30"/><line x1="120" y1="52" x2="144" y2="30"/>'
    '<line x1="120" y1="84" x2="102" y2="68"/><line x1="120" y1="84" x2="138" y2="68"/>'
)
svg(
    "snowflake",
    240,
    240,
    '<g stroke="#7fb8e0" stroke-width="9" stroke-linecap="round" fill="none">'
    + "".join(f'<g transform="rotate({a} 120 120)">{arm}</g>' for a in range(0, 360, 60))
    + '</g><circle cx="120" cy="120" r="12" fill="#7fb8e0"/>',
)

# ── Заглушка фото: чёрно-белый силуэт с белой каймой, как вырезка ─
svg(
    "photo-placeholder",
    400,
    500,
    '<g stroke="#fff" stroke-width="14" stroke-linejoin="round">'
    '<path d="M36 500 C44 384 118 336 200 336 C282 336 356 384 364 500 Z" fill="url(#body)"/>'
    '<ellipse cx="200" cy="196" rx="94" ry="112" fill="url(#head)"/></g>'
    '<path d="M110 168 C112 92 170 70 214 78 C268 86 296 128 290 176 C268 140 230 128 196 132 C160 136 128 150 110 168 Z" fill="#3b3b3b"/>'
    '<path d="M150 210 Q160 204 170 210 M230 210 Q240 204 250 210" stroke="#555" stroke-width="5" fill="none" stroke-linecap="round"/>'
    '<path d="M176 262 Q200 278 224 262" stroke="#555" stroke-width="5" fill="none" stroke-linecap="round"/>',
    '<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c9c9"/><stop offset="1" stop-color="#8f8f8f"/></linearGradient>'
    '<radialGradient id="head" cx=".45" cy=".4"><stop offset="0" stop-color="#e2e2e2"/><stop offset="1" stop-color="#a9a9a9"/></radialGradient>',
)

# ── Афиша-приглашение (снимок экрана от 08.10.2026) ──────────
# Бумажная бирка: белый лист в чёрной рамке, на нём дата и время.
svg(
    "paper-label",
    300,
    104,
    '<rect x="4" y="4" width="292" height="96" fill="#fff" stroke="#111" stroke-width="4"/>',
)
# Розовое сердечко, залитое, как на афише.
svg(
    "heart-pink",
    160,
    150,
    f'<path d="{HEART}" fill="#ff8fcf"/>',
)
# Стрелка-завиток от руки: петля и наконечник.
svg(
    "arrow-doodle",
    220,
    160,
    '<g fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M14 40 C40 10 92 8 110 40 C126 70 96 96 76 74 C58 54 92 22 128 34 C168 48 186 92 190 138"/>'
    '<path d="M168 116 L190 140 L204 112"/></g>',
)

print("Готово:", len(list(OUT.glob("*.svg"))), "стикеров")
