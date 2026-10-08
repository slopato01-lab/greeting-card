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

print("Готово:", len(list(OUT.glob("*.svg"))), "стикеров")
