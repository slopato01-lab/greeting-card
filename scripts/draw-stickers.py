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

# ── Ёлка из полароидов (запись экрана от 08.10.2026) ─────────
# Рамка полароида: белая карточка с тенью, окно под фото сверху,
# широкое поле снизу. Окно 260 × 260, его центр на 25 выше центра рамки —
# это знает шаблон (lib/editor/templates.ts, polaroid()).
svg(
    "polaroid",
    320,
    370,
    '<rect x="10" y="8" width="300" height="350" rx="4" fill="#fdfdfb" filter="url(#shadow)"/>'
    '<rect x="30" y="28" width="260" height="260" fill="#d9d9d9"/>',
    '<filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">'
    '<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".35"/></filter>',
)

# Золотая звезда на верхушку ёлки.
star = []
for k in range(10):
    r = 96 if k % 2 == 0 else 42
    a = math.pi / 2 + k * math.pi / 5
    star.append(f"{100 + r * math.cos(a):.1f},{104 - r * math.sin(a):.1f}")
svg(
    "star-gold",
    200,
    200,
    f'<polygon points="{" ".join(star)}" fill="url(#sg)" stroke="#b8862a" stroke-width="3" stroke-linejoin="round"/>',
    '<linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".55" stop-color="#e8b84a"/><stop offset="1" stop-color="#c9922c"/></linearGradient>',
)

# Рваная бумага: белая полоса с неровными краями сверху и снизу.
def torn(y0, amp, step, w):
    pts = []
    x = 0
    while x <= w:
        pts.append((x, y0 + rng.uniform(-amp, amp)))
        x += step * rng.uniform(0.6, 1.4)
    pts.append((w, y0))
    return pts

W = 640
top = torn(30, 12, 10, W)
bottom = torn(270, 9, 12, W)[::-1]
path = "M" + " L".join(f"{x:.0f} {y:.0f}" for x, y in top + bottom) + " Z"
svg(
    "torn-paper",
    W,
    300,
    f'<path d="{path}" fill="#fbfbf8" filter="url(#ts)"/>',
    '<filter id="ts" x="-5%" y="-20%" width="110%" height="140%">'
    '<feDropShadow dx="0" dy="-2" stdDeviation="3" flood-color="#000" flood-opacity=".25"/></filter>',
)

# Снежинка-контур для фона: белая, бледность задаёт прозрачность слоя.
svg(
    "snowflake-line",
    240,
    240,
    '<g stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none">'
    + "".join(f'<g transform="rotate({a} 120 120)">{arm}</g>' for a in range(0, 360, 60))
    + "</g>",
)


# ── Серия по design/открытки/ (08.10.2026) ───────────────────
# Геометрия окон плёнки и диска известна шаблонам
# (lib/editor/templates/series.ts) — меняется здесь, меняется и там.

# Лист в клетку под фото валентинки.
cells = "".join(
    f'<line x1="{x}" y1="6" x2="{x}" y2="254" stroke="#9fb1c4" stroke-width="1"/>'
    for x in range(18, 300, 16)
) + "".join(
    f'<line x1="6" y1="{y}" x2="294" y2="{y}" stroke="#9fb1c4" stroke-width="1"/>'
    for y in range(14, 260, 16)
)
svg(
    "grid-paper",
    300,
    260,
    '<rect x="6" y="6" width="288" height="248" fill="#fbfbf9" filter="url(#gp)"/>' + cells,
    '<filter id="gp" x="-5%" y="-5%" width="110%" height="115%">'
    '<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".2"/></filter>',
)

# Скрепка.
svg(
    "paperclip",
    80,
    220,
    '<path d="M28 150 L28 40 Q28 14 46 14 Q64 14 64 40 L64 176 Q64 206 40 206 Q16 206 16 176 L16 60" '
    'fill="none" stroke="#8d9299" stroke-width="7" stroke-linecap="round"/>'
    '<path d="M28 150 L28 40 Q28 14 46 14 Q64 14 64 40 L64 176 Q64 206 40 206 Q16 206 16 176 L16 60" '
    'fill="none" stroke="#e6e9ed" stroke-width="2.5" stroke-linecap="round" transform="translate(-1.5 -1.5)"/>',
)

# Фотоплёнка: 220 × 600, четыре окна 144 × 108 (4:3), центры окон
# по высоте 78 + 148·i, по ширине — середина. Окна серые: фото
# кладутся поверх, слоем выше.
holes = "".join(
    f'<rect x="{x}" y="{y}" width="16" height="11" rx="2.5" fill="#f4f4f4"/>'
    for y in range(10, 596, 22)
    for x in (9, 195)
)
frames = "".join(
    f'<rect x="38" y="{24 + i * 148}" width="144" height="108" fill="#3a3a3a"/>' for i in range(4)
)
marks = "".join(
    f'<text x="{24 if i % 2 else 186}" y="{150 + i * 148}" font-family="monospace" font-size="9" '
    f'fill="#f4f4f4" opacity=".7" transform="rotate(-90 {24 if i % 2 else 186} {150 + i * 148})">{9 - i}A</text>'
    for i in range(4)
)
svg("film-strip", 220, 600, '<rect width="220" height="600" fill="#0d0d0d"/>' + holes + frames + marks)

# Бокалы с бантиком — линейный рисунок, как на «save the date».
svg(
    "glasses-doodle",
    220,
    200,
    '<g fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M30 60 Q60 52 92 60 Q88 96 61 102 Q34 96 30 60 Z"/>'
    '<path d="M61 102 L64 160 M44 164 Q64 156 84 164"/>'
    '<path d="M108 52 Q140 40 170 50 Q170 88 142 98 Q114 92 108 52 Z" transform="rotate(14 140 75)"/>'
    '<path d="M136 100 L128 158 M108 160 Q128 152 148 162"/>'
    '<path d="M150 36 Q170 14 182 30 Q172 44 150 36 Q160 52 176 62 M150 36 Q132 22 124 36 Q136 46 150 36 Q144 56 132 70"/>'
    '<path d="M86 40 L94 28 M98 44 L110 34 M78 34 L80 20"/>'
    "</g>",
)

# Сердце-отпечаток: вложенные контуры сердца с разрывами, как папиллярные линии.
def heart_path(cx, cy, k):
    return (
        f"M{cx} {cy + 70 * k} "
        f"C{cx - 40 * k} {cy + 40 * k} {cx - 100 * k} {cy + 5 * k} {cx - 100 * k} {cy - 40 * k} "
        f"C{cx - 100 * k} {cy - 85 * k} {cx - 45 * k} {cy - 100 * k} {cx} {cy - 55 * k} "
        f"C{cx + 45 * k} {cy - 100 * k} {cx + 100 * k} {cy - 85 * k} {cx + 100 * k} {cy - 40 * k} "
        f"C{cx + 100 * k} {cy + 5 * k} {cx + 40 * k} {cy + 40 * k} {cx} {cy + 70 * k} Z"
    )

ridges = "".join(
    f'<path d="{heart_path(150, 150, 1.36 - i * 0.085)}" fill="none" stroke="#c4161c" '
    f'stroke-width="{rng.uniform(3.5, 5.5):.1f}" stroke-dasharray="{rng.randint(40, 120)} {rng.randint(4, 10)}" '
    f'stroke-dashoffset="{rng.randint(0, 80)}" opacity="{rng.uniform(.7, .95):.2f}"/>'
    for i in range(15)
)
svg("heart-print", 300, 270, f'<g transform="translate(0 -6)">{ridges}</g>')

# Звёзды: красная с блёстками и рисованная контурная (тёмная и белая).
def star_points(cx, cy, r1, r2, n=5):
    pts = []
    for k in range(n * 2):
        r = r1 if k % 2 == 0 else r2
        a = math.pi / 2 + k * math.pi / n
        pts.append(f"{cx + r * math.cos(a):.1f},{cy - r * math.sin(a):.1f}")
    return " ".join(pts)

glints = "".join(
    f'<circle cx="{rng.uniform(30, 170):.0f}" cy="{rng.uniform(30, 170):.0f}" r="{rng.uniform(1.5, 4):.1f}" fill="#ff8a8a" opacity=".7"/>'
    for _ in range(60)
)
svg(
    "star-red",
    200,
    200,
    f'<g clip-path="url(#sr)"><polygon points="{star_points(100, 106, 96, 40)}" fill="#a3121f"/>{glints}</g>',
    f'<clipPath id="sr"><polygon points="{star_points(100, 106, 96, 40)}"/></clipPath>',
)
for name, color in (("star-doodle", "#222222"), ("star-doodle-white", "#ffffff")):
    svg(
        name,
        120,
        120,
        f'<path d="M60 8 Q66 52 112 60 Q66 68 60 112 Q54 68 8 60 Q54 52 60 8 Z" fill="none" '
        f'stroke="{color}" stroke-width="5" stroke-linejoin="round"/>',
    )

# Пластинка.
grooves = "".join(
    f'<circle cx="150" cy="150" r="{r}" fill="none" stroke="#2c2c2c" stroke-width="1.2"/>'
    for r in range(56, 146, 6)
)
svg(
    "vinyl",
    300,
    300,
    '<circle cx="150" cy="150" r="146" fill="#111"/>' + grooves +
    '<circle cx="150" cy="150" r="50" fill="#b3172b"/><circle cx="150" cy="150" r="6" fill="#111"/>'
    '<path d="M60 70 A120 120 0 0 1 120 34" stroke="#fff" stroke-opacity=".18" stroke-width="10" fill="none" stroke-linecap="round"/>',
)

# Зал кинотеатра: ряды красных кресел в перспективе, 600 × 800 — фон
# всей открытки.
rows = []
for k, (y, w, h) in enumerate(
    [(40, 58, 70), (120, 66, 80), (210, 76, 92), (315, 88, 106), (435, 102, 124), (575, 120, 146), (735, 140, 170)]
):
    off = (k % 2) * w / 2
    x = -w + off
    while x < 600 + w:
        rows.append(
            f'<rect x="{x + 4:.0f}" y="{y}" width="{w - 8}" height="{h}" rx="{w * 0.22:.0f}" fill="url(#seat)"/>'
            f'<rect x="{x + 10:.0f}" y="{y + 6}" width="{w - 20}" height="{h * 0.3:.0f}" rx="{w * 0.18:.0f}" fill="#d0313f" opacity=".45"/>'
        )
        x += w
svg(
    "cinema-seats",
    600,
    800,
    '<rect width="600" height="800" fill="#1a0b0c"/>' + "".join(rows) +
    '<rect width="600" height="800" fill="url(#dim)"/>',
    '<linearGradient id="seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a51d2a"/><stop offset=".7" stop-color="#6e0f19"/><stop offset="1" stop-color="#3a070c"/></linearGradient>'
    '<radialGradient id="dim" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>',
)

# Розовый листок-записка с лентой.
svg(
    "sticky-note",
    200,
    240,
    '<rect x="14" y="26" width="172" height="206" rx="3" fill="#f6c9d4" filter="url(#sn)"/>'
    '<rect x="64" y="12" width="72" height="28" fill="#fbe9c9" opacity=".85" transform="rotate(-4 100 26)"/>',
    '<filter id="sn" x="-10%" y="-10%" width="120%" height="125%">'
    '<feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".2"/></filter>',
)

# Диск с кадрами, как у стереоскопа: 640 × 640, центр (320, 320),
# двенадцать окон 92 × 92 на радиусе 228, первое — сверху, дальше
# по часовой через 30°.
slots = []
for i in range(12):
    a = -90 + i * 30
    slots.append(
        f'<rect x="274" y="46" width="92" height="92" rx="18" fill="#b9b1a3" transform="rotate({a + 90} 320 320)"/>'
    )
    na = math.radians(a + 15)
    slots.append(
        f'<text x="{320 + 160 * math.cos(na):.0f}" y="{326 + 160 * math.sin(na):.0f}" font-family="sans-serif" '
        f'font-size="15" fill="#6b645a" text-anchor="middle">{i % 7 + 1}</text>'
    )
tabs = "".join(
    f'<rect x="312" y="4" width="16" height="20" rx="3" fill="#c9c1b2" transform="rotate({a} 320 320)"/>'
    for a in range(15, 360, 60)
)
svg(
    "reel",
    640,
    640,
    '<circle cx="320" cy="320" r="312" fill="#ebe6dc" filter="url(#rs)"/>' + tabs +
    '<circle cx="320" cy="320" r="300" fill="none" stroke="#d8d1c4" stroke-width="2"/>' + "".join(slots) +
    '<circle cx="320" cy="320" r="24" fill="#d8d1c4"/><circle cx="320" cy="320" r="13" fill="#8a8275"/>',
    '<filter id="rs" x="-5%" y="-5%" width="110%" height="110%">'
    '<feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity=".3"/></filter>',
)

# Звезда-клякса (вырубка) — тёмно-красная, под «DUMP».
svg("burst", 240, 240, f'<polygon points="{star_points(120, 120, 118, 92, 16)}" fill="#9b1d1d"/>')

# Золотая лента-росчерк и золотые блёстки для рождественской открытки.
svg(
    "gold-swirl",
    600,
    520,
    '<g fill="none" stroke="url(#gs)" stroke-linecap="round">'
    '<path d="M-20 300 C120 120 300 40 420 110 C520 170 430 260 340 220 C240 170 330 40 470 30 C560 24 620 80 640 120" stroke-width="9"/>'
    '<path d="M-10 340 C160 200 260 160 360 180" stroke-width="4" opacity=".7"/>'
    "</g>",
    '<linearGradient id="gs" x1="0" x2="1"><stop offset="0" stop-color="#e9cf8e"/><stop offset=".5" stop-color="#c79a3d"/><stop offset="1" stop-color="#f1dca3"/></linearGradient>',
)
dust = []
for _ in range(420):
    r = abs(rng.gauss(0, 1)) * 120
    a = rng.uniform(0, 2 * math.pi)
    x = 200 + r * math.cos(a) * 1.4
    y = 200 + r * math.sin(a)
    if 0 < x < 400 and 0 < y < 400:
        dust.append(
            f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rng.uniform(0.8, 3.2):.1f}" fill="{rng.choice(["#d4a94a", "#e8c66d", "#b98a2e"])}" opacity="{rng.uniform(.5, 1):.2f}"/>'
        )
svg("glitter-gold", 400, 400, "".join(dust))

# Рисованная двойная рамка свадебного приглашения: 600 × 800.
def wobbly_rect(x0, y0, x1, y1, amp):
    pts = []
    for (ax, ay), (bx, by) in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        for t in range(0, 10):
            u = t / 10
            pts.append((ax + (bx - ax) * u + rng.uniform(-amp, amp), ay + (by - ay) * u + rng.uniform(-amp, amp)))
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

svg(
    "frame-sketch",
    600,
    800,
    f'<g fill="none" stroke="#b5432a" stroke-linejoin="round">'
    f'<path d="{wobbly_rect(14, 14, 586, 786, 2.2)}" stroke-width="4"/>'
    f'<path d="{wobbly_rect(30, 30, 570, 770, 2.2)}" stroke-width="3"/>'
    "</g>",
)


# ── Вторая серия по design/открытки/ (09.10.2026) ────────────
# Свой генератор: первые рисунки выше остаются байт в байт прежними.
# Геометрия окон плёнок и арки известна шаблонам (lib/editor/series-2.ts).
rng2 = random.Random(20261009)


def speckle(x0, y0, x1, y1, n, colors, rmin, rmax):
    return "".join(
        f'<circle cx="{rng2.uniform(x0, x1):.1f}" cy="{rng2.uniform(y0, y1):.1f}" r="{rng2.uniform(rmin, rmax):.1f}" '
        f'fill="{rng2.choice(colors)}" opacity="{rng2.uniform(.35, .8):.2f}"/>'
        for _ in range(n)
    )


# Имбирный пряник с глазурью.
icing = '#ffffff'
svg(
    "gingerbread",
    300,
    320,
    '<g filter="url(#gbShadow)">'
    '<path d="M150 18 C112 18 92 46 96 78 C98 94 104 104 112 110 L64 112 C34 112 20 132 24 152 C28 172 48 180 70 172 L102 160 '
    'L96 210 L58 262 C44 282 54 304 76 306 C92 308 104 298 112 284 L150 236 L188 284 C196 298 208 308 224 306 C246 304 256 282 242 262 '
    'L204 210 L198 160 L230 172 C252 180 272 172 276 152 C280 132 266 112 236 112 L188 110 C196 104 202 94 204 78 C208 46 188 18 150 18 Z" '
    'fill="url(#gb)"/></g>'
    + speckle(70, 40, 230, 290, 90, ["#8a4a1c", "#b8743a"], 0.8, 1.8)
    + f'<g fill="none" stroke="{icing}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M40 128 q6 8 0 16 q-6 8 0 16"/><path d="M260 128 q-6 8 0 16 q6 8 0 16"/>'
    '<path d="M64 268 q10 -4 14 6 q4 10 14 6"/><path d="M236 268 q-10 -4 -14 6 q-4 10 -14 6"/>'
    '<path d="M126 92 Q150 108 174 92"/></g>'
    f'<circle cx="132" cy="64" r="7" fill="{icing}"/><circle cx="168" cy="64" r="7" fill="{icing}"/>'
    '<path d="M126 92 Q150 108 174 92" fill="none" stroke="#d6222e" stroke-width="5" stroke-linecap="round"/>'
    '<path d="M132 128 L150 138 L168 128 L168 148 L150 138 L132 148 Z" fill="#2f9e44"/>'
    '<circle cx="150" cy="166" r="7" fill="#d6222e"/><circle cx="150" cy="190" r="7" fill="#d6222e"/><circle cx="150" cy="214" r="7" fill="#d6222e"/>'
    '<circle cx="150" cy="166" r="9" fill="none" stroke="#fff" stroke-width="2"/><circle cx="150" cy="190" r="9" fill="none" stroke="#fff" stroke-width="2"/>'
    '<circle cx="150" cy="214" r="9" fill="none" stroke="#fff" stroke-width="2"/>',
    '<radialGradient id="gb" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#d48a4a"/><stop offset=".7" stop-color="#b56a2c"/><stop offset="1" stop-color="#8f4d1d"/></radialGradient>'
    '<filter id="gbShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#3b0a0a" flood-opacity=".45"/></filter>',
)

# Красный атласный бант с длинными хвостами.
svg(
    "bow-red",
    340,
    300,
    '<g filter="url(#bowShadow)">'
    '<path d="M168 92 C150 120 120 170 96 214 C84 236 92 262 70 286" fill="none" stroke="url(#satin)" stroke-width="18" stroke-linecap="round"/>'
    '<path d="M176 92 C204 132 246 150 270 196 C288 230 262 260 292 290" fill="none" stroke="url(#satin)" stroke-width="18" stroke-linecap="round"/>'
    '<path d="M170 86 C130 40 70 20 50 46 C30 74 70 112 170 96 Z" fill="url(#satin)"/>'
    '<path d="M174 86 C214 40 274 20 294 46 C314 74 274 112 174 96 Z" fill="url(#satin)"/>'
    '<path d="M160 70 C150 54 102 44 76 56" fill="none" stroke="#ff8a8a" stroke-width="4" opacity=".6"/>'
    '<path d="M184 70 C194 54 242 44 268 56" fill="none" stroke="#ff8a8a" stroke-width="4" opacity=".6"/>'
    '<ellipse cx="172" cy="92" rx="20" ry="16" fill="#b80f18"/>'
    '<ellipse cx="168" cy="88" rx="8" ry="5" fill="#ff7070" opacity=".6"/></g>',
    '<linearGradient id="satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3b3b"/><stop offset=".45" stop-color="#d8121c"/><stop offset="1" stop-color="#8e0710"/></linearGradient>'
    '<filter id="bowShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#3b0a0a" flood-opacity=".4"/></filter>',
)

# Белая кассета с красной надписью.
svg(
    "cassette",
    380,
    250,
    '<g filter="url(#casShadow)"><rect x="6" y="6" width="368" height="238" rx="14" fill="#f4f2ee"/>'
    '<path d="M60 244 L84 192 L296 192 L320 244 Z" fill="#e6e3dd"/></g>'
    '<rect x="26" y="22" width="328" height="150" rx="8" fill="#fbfaf7" stroke="#d8d4cc" stroke-width="2"/>'
    '<text x="190" y="58" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" fill="#d81e2a">CULT CHRISTMAS CLASSICS</text>'
    '<text x="190" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="#d81e2a" letter-spacing="1">CONJURE, CONVERT &amp; CELEBRATE</text>'
    '<rect x="100" y="98" width="180" height="52" rx="26" fill="#ece9e3" stroke="#cfcac0" stroke-width="2"/>'
    '<circle cx="128" cy="124" r="18" fill="#fff" stroke="#bdb7ac" stroke-width="3"/><circle cx="252" cy="124" r="18" fill="#fff" stroke="#bdb7ac" stroke-width="3"/>'
    '<rect x="160" y="112" width="60" height="24" fill="#1d1d1d"/>'
    + "".join(f'<rect x="{124 + i * 8}" y="117" width="3" height="14" fill="#9a958b" transform="rotate({i * 30} 128 124)"/>' for i in range(1))
    + '<g fill="#d81e2a"><rect x="40" y="96" width="36" height="16"/><rect x="304" y="100" width="30" height="40" opacity=".8"/></g>'
    '<g fill="#c9c4ba"><circle cx="120" cy="222" r="6"/><circle cx="160" cy="222" r="6"/><circle cx="220" cy="222" r="6"/><circle cx="260" cy="222" r="6"/></g>',
    '<filter id="casShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#3b0a0a" flood-opacity=".45"/></filter>',
)

# Остролист: три листа и ягоды.
def holly_leaf(angle, length, color, vein):
    k = length / 200
    path = (
        f"M0 0 C{20*k} {-20*k} {30*k} {-40*k} {50*k} {-34*k} C{56*k} {-52*k} {74*k} {-58*k} {92*k} {-50*k} "
        f"C{100*k} {-66*k} {120*k} {-72*k} {138*k} {-62*k} C{146*k} {-78*k} {168*k} {-82*k} {200*k} {-66*k} "
        f"C{184*k} {-40*k} {176*k} {-30*k} {182*k} {-14*k} C{164*k} {-10*k} {150*k} {2*k} {148*k} {16*k} "
        f"C{130*k} {8*k} {112*k} {14*k} {104*k} {28*k} C{88*k} {18*k} {70*k} {20*k} {60*k} {32*k} C{40*k} {20*k} {20*k} {14*k} 0 0 Z"
    )
    return (
        f'<g transform="rotate({angle})"><path d="{path}" fill="{color}" stroke="#123d1d" stroke-width="3" stroke-linejoin="round"/>'
        f'<path d="M6 0 Q{100*k} {-16*k} {192*k} {-60*k}" fill="none" stroke="{vein}" stroke-width="3" stroke-linecap="round"/></g>'
    )

svg(
    "holly",
    300,
    260,
    '<g filter="url(#hollyShadow)"><g transform="translate(150 150)">'
    + holly_leaf(-165, 135, "#1f6b30", "#4f9a5a")
    + holly_leaf(-70, 120, "#247a37", "#5aa765")
    + holly_leaf(15, 135, "#1c6230", "#4f9a5a")
    + '<circle cx="-14" cy="-6" r="20" fill="url(#berry)"/><circle cx="14" cy="4" r="20" fill="url(#berry)"/><circle cx="-4" cy="22" r="20" fill="url(#berry)"/>'
    + '<circle cx="-20" cy="-12" r="5" fill="#fff" opacity=".7"/><circle cx="8" cy="-2" r="5" fill="#fff" opacity=".7"/><circle cx="-10" cy="16" r="5" fill="#fff" opacity=".7"/>'
    + "</g></g>",
    '<radialGradient id="berry" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ff5a5a"/><stop offset=".6" stop-color="#d0101c"/><stop offset="1" stop-color="#7d0610"/></radialGradient>'
    '<filter id="hollyShadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#2b1a0a" flood-opacity=".35"/></filter>',
)

# Ржаво-красная снежинка — та же, что snowflake-line, другим цветом и толще.
svg(
    "snowflake-rust",
    240,
    240,
    '<g stroke="#b5401f" stroke-width="9" stroke-linecap="round" fill="none">'
    + "".join(f'<g transform="rotate({a} 120 120)">{arm}</g>' for a in range(0, 360, 60))
    + "</g>",
)

# Восьмилучевая звёздочка для красных полос сверху и снизу.
svg(
    "asterisk-cream",
    100,
    100,
    '<g stroke="#f6ead2" stroke-linecap="round">'
    '<path d="M50 6 L50 94 M6 50 L94 50" stroke-width="5"/>'
    '<path d="M24 24 L76 76 M76 24 L24 76" stroke-width="3"/></g>',
)

# Ржавая фотоплёнка на три кадра: 300 × 580, окна 210 × 158,
# центры окон по высоте 103, 285, 467.
rust_holes = "".join(
    f'<rect x="{x}" y="{y}" width="16" height="20" rx="4" fill="#f3ecdf"/>' for y in range(14, 570, 40) for x in (12, 272)
)
rust_windows = "".join(
    f'<rect x="45" y="{cy - 79}" width="210" height="158" fill="#e9dfcf"/>' for cy in (103, 285, 467)
)
svg(
    "film-strip-red",
    300,
    580,
    '<rect width="300" height="580" fill="#b23a1c"/>'
    + speckle(0, 0, 300, 580, 700, ["#7f220c", "#d2643a", "#8e2c12"], 0.8, 2.6)
    + rust_holes
    + rust_windows
    + '<g fill="#f3ecdf" font-family="Arial, sans-serif" font-size="16" font-weight="700">'
    '<text x="280" y="200" transform="rotate(-90 280 200)">6A</text><text x="282" y="400" transform="rotate(-90 282 400)">5A</text></g>',
)

# Гирлянда: еловая лапа по дуге и тёплые лампочки. 600 × 220.
needles = []
for i in range(1400):
    t = rng2.uniform(0, 1)
    x = t * 600
    y = 60 + 70 * math.sin(t * math.pi) + rng2.uniform(-40, 40)
    a = rng2.uniform(0, 2 * math.pi)
    ln = rng2.uniform(18, 40)
    c = rng2.choice(["#1d4d2b", "#2b6a3a", "#173f23", "#3a7d48"])
    needles.append(
        f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x + ln * math.cos(a):.1f}" y2="{y + ln * math.sin(a):.1f}" stroke="{c}" stroke-width="{rng2.uniform(2, 3.6):.1f}" stroke-linecap="round"/>'
    )
wire = "M0 70 " + " ".join(f"L{x} {70 + 64 * math.sin(x / 600 * math.pi) + 10 * math.sin(x / 40):.1f}" for x in range(0, 601, 10))
bulbs = "".join(
    f'<circle cx="{x}" cy="{70 + 64 * math.sin(x / 600 * math.pi) + 10 * math.sin(x / 40) + 6:.1f}" r="22" fill="url(#bulbGlow)"/>'
    f'<ellipse cx="{x}" cy="{70 + 64 * math.sin(x / 600 * math.pi) + 10 * math.sin(x / 40) + 8:.1f}" rx="5" ry="8" fill="#fff6c8"/>'
    for x in range(30, 600, 62)
)
svg(
    "garland",
    600,
    220,
    "".join(needles) + f'<path d="{wire}" fill="none" stroke="#2c3b2a" stroke-width="2"/>' + bulbs,
    '<radialGradient id="bulbGlow"><stop offset="0" stop-color="#fff2b0" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd36b" stop-opacity=".6"/><stop offset="1" stop-color="#ffb43b" stop-opacity="0"/></radialGradient>',
)

# Карамельная трость. 90 × 300.
cane = "M45 290 L45 80 C45 30 80 14 64 14 C40 14 18 30 18 60"
svg(
    "candy-cane",
    90,
    300,
    '<path d="M45 290 L45 70 C45 30 72 22 72 50" fill="none" stroke="#fbf7f2" stroke-width="22" stroke-linecap="round"/>'
    '<path d="M45 290 L45 70 C45 30 72 22 72 50" fill="none" stroke="#d61f2c" stroke-width="22" stroke-linecap="butt" stroke-dasharray="14 12"/>'
    '<path d="M38 286 L38 72" stroke="#fff" stroke-width="3" opacity=".5"/>',
)

# Шотландская клетка во весь лист 600 × 800.
tartan = ['<rect width="600" height="800" fill="#b0141c"/>']
for off in range(0, 800, 120):
    tartan.append(f'<rect x="0" y="{off + 20}" width="600" height="34" fill="#1d2a52" opacity=".55"/>')
    tartan.append(f'<rect x="0" y="{off + 66}" width="600" height="10" fill="#1e5a2e" opacity=".7"/>')
    tartan.append(f'<rect x="0" y="{off + 92}" width="600" height="3" fill="#f4e7b5" opacity=".7"/>')
    tartan.append(f'<rect x="0" y="{off + 2}" width="600" height="4" fill="#111" opacity=".35"/>')
for off in range(0, 600, 120):
    tartan.append(f'<rect x="{off + 20}" y="0" width="34" height="800" fill="#1d2a52" opacity=".45"/>')
    tartan.append(f'<rect x="{off + 66}" y="0" width="10" height="800" fill="#1e5a2e" opacity=".6"/>')
    tartan.append(f'<rect x="{off + 92}" y="0" width="3" height="800" fill="#f4e7b5" opacity=".6"/>')
    tartan.append(f'<rect x="{off + 2}" y="0" width="4" height="800" fill="#111" opacity=".3"/>')
tartan.append('<rect width="600" height="800" fill="url(#twill)" opacity=".18"/>')
svg(
    "tartan",
    600,
    800,
    "".join(tartan),
    '<pattern id="twill" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="#000" stroke-width="1.5"/></pattern>',
)

# Камера моментальной печати без марки. 420 × 330.
svg(
    "instant-camera",
    420,
    330,
    '<g filter="url(#camShadow)">'
    '<rect x="10" y="10" width="400" height="230" rx="34" fill="url(#camBody)"/>'
    '<rect x="10" y="200" width="400" height="120" rx="20" fill="#232323"/>'
    '<rect x="10" y="200" width="400" height="40" fill="#2e2e2e"/></g>'
    '<rect x="40" y="36" width="90" height="120" rx="12" fill="#cfd3d6" stroke="#9aa0a5" stroke-width="3"/>'
    + "".join(f'<line x1="48" y1="{50 + i * 10}" x2="122" y2="{50 + i * 10}" stroke="#eef1f3" stroke-width="3"/>' for i in range(10))
    + '<circle cx="232" cy="128" r="88" fill="#1b1b1b"/><circle cx="232" cy="128" r="70" fill="#2b2b2b" stroke="#444" stroke-width="4"/>'
    '<circle cx="232" cy="128" r="46" fill="url(#lens)"/><circle cx="214" cy="110" r="12" fill="#fff" opacity=".35"/>'
    '<rect x="340" y="34" width="54" height="54" rx="10" fill="#1d1d1d"/><rect x="350" y="44" width="34" height="34" rx="6" fill="#4a5560"/>'
    '<circle cx="78" cy="196" r="22" fill="#e2412b"/><circle cx="72" cy="190" r="7" fill="#ff8a70" opacity=".6"/>'
    '<circle cx="340" cy="200" r="10" fill="#1d1d1d"/>'
    '<rect x="70" y="262" width="280" height="10" rx="5" fill="#0c0c0c"/>'
    '<rect x="150" y="214" width="120" height="16" rx="8" fill="#3a3a3a"/>',
    '<linearGradient id="camBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e3e3"/></linearGradient>'
    '<radialGradient id="lens" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#3f8f5f"/><stop offset=".5" stop-color="#16362a"/><stop offset="1" stop-color="#050505"/></radialGradient>'
    '<filter id="camShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".4"/></filter>',
)

# Чёрная плёнка на четыре кадра: 300 × 670, окна 196 × 140,
# центры окон по высоте 92, 254, 416, 578.
black_holes = "".join(
    f'<rect x="{x}" y="{y}" width="18" height="22" rx="4" fill="#ffffff"/>' for y in range(12, 660, 40) for x in (12, 270)
)
black_windows = "".join(
    f'<rect x="52" y="{cy - 70}" width="196" height="140" fill="#ffffff" stroke="#cfcfcf" stroke-width="2"/>' for cy in (92, 254, 416, 578)
)
svg(
    "film-strip-black",
    300,
    670,
    '<rect width="300" height="670" fill="#0e0e0e"/>' + black_holes + black_windows
    + '<g fill="#e9b949" font-family="Arial, sans-serif" font-size="16" font-weight="700">'
    '<text x="40" y="180" transform="rotate(-90 40 180)">4</text><text x="262" y="180" transform="rotate(-90 262 180)">4</text>'
    '<text x="40" y="500" transform="rotate(-90 40 500)">3</text><text x="262" y="500" transform="rotate(-90 262 500)">3A</text></g>',
)

# Хлопушка-нумератор. 220 × 180.
stripes_top = "".join(
    f'<path d="M{20 + i * 40} 30 L{44 + i * 40} 30 L{36 + i * 40} 62 L{12 + i * 40} 62 Z" fill="#f2f2f2"/>' for i in range(5)
)
svg(
    "clapperboard",
    220,
    180,
    '<g transform="rotate(-8 110 50)"><rect x="10" y="30" width="200" height="32" fill="#151515"/>' + stripes_top + "</g>"
    '<rect x="10" y="66" width="200" height="104" fill="#1b1b1b"/>'
    '<g stroke="#e8e8e8" stroke-width="2"><line x1="10" y1="100" x2="210" y2="100"/><line x1="10" y1="134" x2="210" y2="134"/><line x1="110" y1="100" x2="110" y2="170"/></g>'
    '<g fill="#151515"><rect x="10" y="66" width="200" height="0"/></g>',
)

# Угол арочной рамки «Save the date»: снаружи — фон открытки, по краю — линия.
# Рамка 420 × 500; уголок 120 × 100 закрывает фото снаружи рамки.
ARCH_BG = "#e5dfcb"
ARCH_LINE = "#4a4f2a"
inside = "M0 100 L0 86 A36 36 0 0 1 36 50 L50 50 A30 30 0 0 0 80 20 A20 20 0 0 1 100 0 L120 0"
outside = "M0 0 L100 0 A20 20 0 0 0 80 20 A30 30 0 0 1 50 50 L36 50 A36 36 0 0 0 0 86 Z"
corner = f'<path d="{outside}" fill="{ARCH_BG}"/><path d="{inside}" fill="none" stroke="{ARCH_LINE}" stroke-width="3"/>'
svg("arch-corner-l", 120, 100, corner)
svg("arch-corner-r", 120, 100, f'<g transform="translate(120 0) scale(-1 1)">{corner}</g>')

# Эмблема: велосипед-пенни-фартинг линией. 220 × 150.
spokes_big = "".join(
    f'<line x1="80" y1="86" x2="{80 + 56 * math.cos(a):.1f}" y2="{86 + 56 * math.sin(a):.1f}"/>' for a in [i * math.pi / 8 for i in range(16)]
)
spokes_small = "".join(
    f'<line x1="176" y1="122" x2="{176 + 20 * math.cos(a):.1f}" y2="{122 + 20 * math.sin(a):.1f}"/>' for a in [i * math.pi / 4 for i in range(8)]
)
svg(
    "bicycle",
    220,
    150,
    f'<g fill="none" stroke="{ARCH_LINE}" stroke-linecap="round" stroke-linejoin="round">'
    '<circle cx="80" cy="86" r="58" stroke-width="3"/><circle cx="80" cy="86" r="52" stroke-width="1.5"/>'
    '<circle cx="176" cy="122" r="22" stroke-width="3"/>'
    f'<g stroke-width="1">{spokes_big}{spokes_small}</g>'
    '<path d="M80 86 L96 22 Q140 30 176 122" stroke-width="3"/>'
    '<path d="M86 20 L110 20 M96 22 L92 10 L72 12" stroke-width="3"/>'
    '<circle cx="80" cy="86" r="4" fill="#4a4f2a"/></g>',
)

# Сердце одной красной линией, чуть кривое, как от руки. 520 × 460.
svg(
    "heart-line-red",
    520,
    460,
    '<path d="M250 430 C190 380 40 300 30 170 C22 70 110 20 180 34 C230 44 252 90 258 128 '
    'C270 80 320 30 390 40 C470 52 500 130 486 196 C468 290 340 360 250 430" '
    'fill="none" stroke="#d24a4a" stroke-width="4" stroke-linecap="round"/>',
)

# Глянец красной плёнки: размытые светлые полосы. 600 × 800.
svg(
    "gloss-sheen",
    600,
    800,
    '<g filter="url(#sheenBlur)" fill="none" stroke="#fff" stroke-linecap="round">'
    '<path d="M-20 120 C140 60 220 260 420 140 S640 80 640 40" stroke-width="18" opacity=".25"/>'
    '<path d="M60 820 C120 600 40 420 160 260" stroke-width="10" opacity=".2"/>'
    '<path d="M520 820 C460 640 600 520 560 300" stroke-width="14" opacity=".18"/>'
    '<path d="M-20 520 C120 470 200 560 330 500" stroke-width="8" opacity=".15"/></g>',
    '<filter id="sheenBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>',
)


# ── Третья серия по design/открытки/ (09.10.2026), lib/editor/series-3.ts ──
# Свой генератор: старые файлы остаются байт в байт.
rng3 = random.Random(20261010)


def wobble(points, amp):
    """Ломаная с дрожью — край рваной бумаги."""
    return " L".join(f"{x + rng3.uniform(-amp, amp):.1f} {y + rng3.uniform(-amp, amp):.1f}" for x, y in points)


def edge(x0, y0, x1, y1, step):
    n = max(2, int(math.hypot(x1 - x0, y1 - y0) / step))
    return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n)]


def torn_rect(x0, y0, x1, y1, step, amp):
    pts = edge(x0, y0, x1, y0, step) + edge(x1, y0, x1, y1, step) + edge(x1, y1, x0, y1, step) + edge(x0, y1, x0, y0, step)
    return "M" + wobble(pts, amp) + " Z"


SOFT = '<filter id="soft" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".28"/></filter>'

# Мятая бумага на всю открытку: светло-серая, складки — шум со светом. 600 × 800.
svg(
    "paper-crumpled",
    600,
    800,
    '<rect width="600" height="800" fill="#e7e7e5"/>'
    '<rect width="600" height="800" filter="url(#crumple)" opacity=".55"/>',
    '<filter id="crumple" x="0" y="0" width="100%" height="100%">'
    '<feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="4" seed="7"/>'
    '<feDiffuseLighting lighting-color="#ffffff" surfaceScale="6"><feDistantLight azimuth="235" elevation="48"/></feDiffuseLighting>'
    '<feComponentTransfer><feFuncA type="linear" slope="1"/></feComponentTransfer></filter>',
)

# Красная нить через всю открытку. 600 × 800.
svg(
    "red-thread",
    600,
    800,
    '<path d="M330 4 C440 -6 600 20 560 120 C520 230 640 330 560 430 C500 510 420 470 300 600 '
    'C230 670 120 540 40 520 C-20 506 -10 640 120 700 C230 750 360 640 400 800" '
    'fill="none" stroke="#b5343a" stroke-width="5" stroke-linecap="round"/>',
)

# Красная канцелярская кнопка, вид сбоку. 140 × 150.
svg(
    "push-pin",
    140,
    150,
    '<path d="M52 92 L22 140" stroke="#9a9a9a" stroke-width="5" stroke-linecap="round"/>'
    '<g filter="url(#soft)"><path d="M40 70 C30 50 46 30 66 34 L96 12 C110 4 128 18 120 34 L102 62 C108 82 88 100 70 92 Z" fill="url(#pinG)"/>'
    '<ellipse cx="96" cy="26" rx="18" ry="12" transform="rotate(-35 96 26)" fill="#e2353c"/>'
    '<ellipse cx="90" cy="22" rx="6" ry="4" transform="rotate(-35 90 22)" fill="#fff" opacity=".6"/></g>',
    SOFT + '<linearGradient id="pinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a5f"/><stop offset=".6" stop-color="#c01d24"/><stop offset="1" stop-color="#7a0d12"/></linearGradient>',
)

# Белая рваная подложка под фото. 520 × 500.
svg(
    "torn-frame",
    520,
    500,
    f'<path d="{torn_rect(14, 14, 506, 486, 9, 4)}" fill="#f7f7f5" filter="url(#soft)"/>',
    SOFT,
)

# Бежевая записка-облако для «Soulmate». 300 × 150.
cloud = "M20 40 C10 10 60 4 90 16 C120 0 170 6 190 18 C220 4 280 8 284 40 C300 70 290 110 270 126 C240 150 180 140 150 146 C110 150 60 150 34 132 C6 114 0 70 20 40 Z"
svg("paper-cloud", 300, 150, f'<path d="{cloud}" fill="#e3ddd2" filter="url(#soft)"/>', SOFT)

# Обрывок письма от руки: кремовый лист с рукописными строками. 300 × 460.
def scribble(y, x0, x1):
    pts = []
    x = x0
    while x < x1:
        pts.append(f"Q{x + 4:.0f} {y - rng3.uniform(4, 9):.1f} {x + 8:.0f} {y:.1f}")
        pts.append(f"Q{x + 11:.0f} {y + rng3.uniform(1, 4):.1f} {x + 14:.0f} {y:.1f}")
        x += 14 + rng3.uniform(0, 10) if rng3.random() < 0.2 else 14
    return f'<path d="M{x0} {y} {" ".join(pts)}" fill="none" stroke="#3b3128" stroke-width="1.6" stroke-linecap="round"/>'


letter_edge = "M0 0 L300 0 L300 30 " + wobble([(270, 60), (240, 90), (250, 130), (220, 170), (236, 210), (200, 250), (180, 300), (150, 330), (170, 380), (130, 420), (100, 460)], 6) + " L0 460 Z"
svg(
    "letter-scrap",
    300,
    460,
    f'<clipPath id="lc"><path d="{letter_edge}"/></clipPath>'
    '<g clip-path="url(#lc)"><rect width="300" height="460" fill="#efe6d2"/>'
    + "".join(scribble(28 + i * 30, 12, 290) for i in range(15))
    + "</g>",
)

# Чугунный фонарь с тёплым стеклом. 60 × 420.
svg(
    "street-lamp",
    60,
    420,
    '<rect x="26" y="70" width="8" height="330" fill="url(#lampG)"/>'
    '<rect x="16" y="396" width="28" height="18" rx="4" fill="#8a8f93"/>'
    '<rect x="20" y="160" width="20" height="10" rx="3" fill="#9aa0a4"/><rect x="20" y="300" width="20" height="10" rx="3" fill="#9aa0a4"/>'
    '<path d="M14 26 L46 26 L42 66 L18 66 Z" fill="#f2b8a0" stroke="#5c6266" stroke-width="3"/>'
    '<path d="M10 26 L50 26 L30 8 Z" fill="#5c6266"/><circle cx="30" cy="6" r="4" fill="#5c6266"/>'
    '<rect x="16" y="64" width="28" height="8" fill="#5c6266"/>',
    '<linearGradient id="lampG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f7579"/><stop offset=".5" stop-color="#d6dadc"/><stop offset="1" stop-color="#6f7579"/></linearGradient>',
)

# Сухой цветок на веточке, бежевый. 200 × 260.
petals = "".join(
    f'<ellipse cx="{cx + 14 * math.cos(a):.1f}" cy="{cy + 14 * math.sin(a):.1f}" rx="13" ry="7" transform="rotate({math.degrees(a):.0f} {cx + 14 * math.cos(a):.1f} {cy + 14 * math.sin(a):.1f})" fill="#e9d6c4" stroke="#c9ab92" stroke-width="1"/>'
    for cx, cy in ((120, 60), (150, 110), (96, 120)) for a in [i * math.pi / 3 + 0.3 for i in range(6)]
)
svg(
    "dried-flower",
    200,
    260,
    '<path d="M20 250 C60 200 90 160 120 60 M80 170 C110 150 130 130 150 110 M70 190 C80 160 90 140 96 120" fill="none" stroke="#9c8a6c" stroke-width="3" stroke-linecap="round"/>'
    + petals
    + '<circle cx="120" cy="60" r="6" fill="#c7a46d"/><circle cx="150" cy="110" r="6" fill="#c7a46d"/><circle cx="96" cy="120" r="6" fill="#c7a46d"/>',
)

# Красная сургучная печать. 120 × 120.
wax = " L".join(
    f"{60 + (52 + rng3.uniform(-5, 4)) * math.cos(i * math.pi / 14):.1f} {60 + (52 + rng3.uniform(-5, 4)) * math.sin(i * math.pi / 14):.1f}"
    for i in range(28)
)
svg(
    "wax-seal",
    120,
    120,
    f'<path d="M{wax} Z" fill="url(#waxG)" filter="url(#soft)"/>'
    '<circle cx="60" cy="60" r="34" fill="none" stroke="#5e0f12" stroke-width="3" opacity=".7"/>'
    '<path d="M60 76 C40 62 38 48 48 42 C54 38 60 44 60 50 C60 44 66 38 72 42 C82 48 80 62 60 76 Z" fill="#5e0f12" opacity=".75"/>',
    SOFT + '<radialGradient id="waxG" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#b8343a"/><stop offset=".7" stop-color="#7d1418"/><stop offset="1" stop-color="#5a0c10"/></radialGradient>',
)

# Однотонная клейкая лента: бежевая полупрозрачная и тёмно-красная. 260 × 70.
def plain_tape(name, color, opacity):
    teeth_r = "".join(f"L{254 if i % 2 == 0 else 246} {6 + i * 7}" for i in range(9))
    teeth_l = "".join(f"L{6 if i % 2 == 0 else 14} {62 - i * 7}" for i in range(9))
    svg(
        name,
        260,
        70,
        f'<path d="M8 4 L250 2 {teeth_r} L10 66 {teeth_l} Z" fill="{color}" opacity="{opacity}"/>',
    )


plain_tape("tape-beige", "#d9cbb2", ".88")
plain_tape("tape-maroon", "#8e2a24", ".95")

# Серебряная надутая звезда. 160 × 160.
silver_star = star_points(80, 84, 74, 34)
svg(
    "star-silver",
    160,
    160,
    f'<polygon points="{silver_star}" fill="url(#ssG)" stroke="#8d949b" stroke-width="2" stroke-linejoin="round" filter="url(#soft)"/>'
    '<ellipse cx="62" cy="62" rx="16" ry="8" transform="rotate(-30 62 62)" fill="#fff" opacity=".75"/>',
    SOFT + '<linearGradient id="ssG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#bfc5ca"/><stop offset=".7" stop-color="#7f878e"/><stop offset="1" stop-color="#d9dde0"/></linearGradient>',
)

# Компактная серебряная «мыльница» сзади, без марки. 360 × 520.
# Окно экрана: x 40–232, y 40–300 (192 × 260) — фото кладётся поверх.
svg(
    "camera-silver",
    360,
    520,
    '<g filter="url(#soft)"><rect x="4" y="4" width="330" height="512" rx="22" fill="url(#bodyG)"/>'
    '<rect x="330" y="300" width="26" height="110" rx="10" fill="#9da3a8"/></g>'
    '<rect x="30" y="30" width="212" height="280" rx="6" fill="#2a2d30"/>'
    '<rect x="40" y="40" width="192" height="260" fill="#ffffff"/>'
    '<rect x="264" y="40" width="44" height="12" rx="4" fill="#7b8186"/>'
    '<circle cx="286" cy="196" r="26" fill="#1d1f21" stroke="#8d9398" stroke-width="5"/><circle cx="286" cy="196" r="10" fill="#3a3e42"/>'
    '<circle cx="268" cy="258" r="7" fill="#33373a"/><circle cx="296" cy="258" r="7" fill="#33373a"/>'
    '<circle cx="168" cy="420" r="78" fill="url(#dialG)" stroke="#7c8287" stroke-width="3"/>'
    '<circle cx="168" cy="420" r="30" fill="#c9ced2" stroke="#7c8287" stroke-width="3"/>'
    '<circle cx="54" cy="360" r="20" fill="#d4d8db" stroke="#7c8287" stroke-width="3"/>'
    '<circle cx="282" cy="360" r="20" fill="#d4d8db" stroke="#7c8287" stroke-width="3"/>'
    '<circle cx="54" cy="450" r="16" fill="#d4d8db" stroke="#7c8287" stroke-width="3"/>'
    '<g fill="#3a3e42">' + "".join(f'<circle cx="{282 + dx}" cy="{444 + dy}" r="2.6"/>' for dx in (-10, 0, 10) for dy in (-10, 0, 10)) + '</g>'
    '<rect x="270" y="320" width="40" height="8" rx="3" fill="#7b8186" opacity=".6"/>',
    SOFT
    + '<linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ecee"/><stop offset=".4" stop-color="#b9bfc4"/><stop offset=".75" stop-color="#d7dbde"/><stop offset="1" stop-color="#9aa1a7"/></linearGradient>'
    '<radialGradient id="dialG" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#f4f6f7"/><stop offset=".6" stop-color="#b3b9be"/><stop offset="1" stop-color="#8b9297"/></radialGradient>',
)

# Два котика дай-пять, рисунок линией. 200 × 150.
svg(
    "cats-doodle",
    200,
    150,
    '<g fill="none" stroke="#2b2b2b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M24 140 L26 70 C26 52 36 44 52 44 C70 44 80 52 80 70 L82 140"/><path d="M30 50 L28 28 L44 42 M66 42 L80 28 L78 50"/>'
    '<path d="M80 74 L96 36"/><circle cx="44" cy="64" r="2"/><circle cx="62" cy="64" r="2"/><path d="M50 74 Q53 78 56 74"/>'
    '<path d="M118 140 L120 70 C120 52 130 44 146 44 C164 44 174 52 174 70 L176 140"/><path d="M124 50 L122 28 L138 42 M160 42 L174 28 L172 50"/>'
    '<path d="M120 74 L104 36"/><circle cx="138" cy="64" r="2"/><circle cx="156" cy="64" r="2"/><path d="M144 74 Q147 78 150 74"/>'
    '<path d="M86 22 C80 10 92 4 98 14 C104 4 116 10 110 22 L98 34 Z"/><path d="M78 16 L72 10 M118 16 L124 10 M98 4 L98 0"/></g>'
    '<path d="M26 110 L82 110 L82 140 L24 140 Z" fill="#2b2b2b"/><circle cx="150" cy="58" r="10" fill="#2b2b2b"/>',
)

# Белый рваный обрывок под «ЛЮБОВЬ». 220 × 400.
svg(
    "paper-scrap",
    220,
    400,
    f'<path d="{torn_rect(10, 12, 210, 388, 10, 6)}" fill="#fafafa" filter="url(#soft)"/>',
    SOFT,
)

# Тетрадный лист с рваным краем слева. 480 × 360.
holes = "".join(f'<rect x="20" y="{30 + i * 28}" width="16" height="12" rx="2" fill="#2a2a2a"/>' for i in range(11))
rules = "".join(f'<line x1="44" y1="{56 + i * 26}" x2="470" y2="{56 + i * 26}" stroke="#c9c2b4" stroke-width="1"/>' for i in range(12))
svg(
    "notebook-sheet",
    480,
    360,
    f'<path d="M8 4 L476 4 L476 356 L8 356 {wobble([(4, 320), (14, 280), (2, 240), (16, 200), (4, 160), (14, 120), (2, 80), (14, 40)], 4)} Z" fill="#f1ece2" filter="url(#soft)"/>'
    + rules + holes,
    SOFT,
)

# Обведённое от руки кольцо — вокруг надписи-кнопки. 200 × 90.
svg(
    "circle-doodle",
    200,
    90,
    '<path d="M150 10 C190 14 198 50 170 70 C130 92 40 90 14 64 C-6 42 30 10 100 8 C130 7 160 12 176 24" fill="none" stroke="#1d1d1d" stroke-width="2.4" stroke-linecap="round"/>',
)

print("Готово:", len(list(OUT.glob("*.svg"))), "стикеров")
