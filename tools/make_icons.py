"""Draws Kesho's app icon, adaptive icon and splash image (a sun rising over a hill).

Run from the repo root:  python tools/make_icons.py
Needs Pillow (pip install pillow). Writes PNG files into app/assets/.
The colors match app/src/core/theme.js.
"""
from PIL import Image, ImageDraw, ImageFilter

S = 1024          # final size
K = 2             # draw at 2x, then shrink = smooth edges
NIGHT, PLUM, AMBER = (22, 33, 63), (142, 74, 110), (242, 158, 76)
SUN, HILL = (255, 209, 102), (11, 18, 32)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def sky(size):
    """Vertical dawn gradient: night blue -> plum -> amber."""
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        c = lerp(NIGHT, PLUM, t / 0.6) if t < 0.6 else lerp(PLUM, AMBER, (t - 0.6) / 0.4)
        d.line([(0, y), (size, y)], fill=c)
    return img.convert("RGBA")


def sun_and_hill(size, scale=1.0, with_hill=True):
    """Transparent layer with a glowing sun (and the dark hill it rises from)."""
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy, r = size / 2, size * 0.60, size * 0.20 * scale
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([cx - r * 1.7, cy - r * 1.7, cx + r * 1.7, cy + r * 1.7], fill=SUN + (90,))
    layer.alpha_composite(glow.filter(ImageFilter.GaussianBlur(size * 0.05)))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SUN + (255,))
    if with_hill:
        hw, top = size * 0.95 * scale, cy + r * 0.25
        d.ellipse([cx - hw, top, cx + hw, top + hw * 1.3], fill=HILL + (255,))
    return layer


def save(img, name):
    img.resize((S, S), Image.LANCZOS).save(f"app/assets/{name}", optimize=True)
    print("wrote", name)


big = S * K
# 1. Full icon (older Android, stores): sky + sun + hill
icon = sky(big)
icon.alpha_composite(sun_and_hill(big))
save(icon.convert("RGB"), "icon.png")

# 2. Adaptive icon foreground (Android crops the outer third): smaller sun + hill, transparent
save(sun_and_hill(big, scale=0.62), "adaptive-icon.png")

# 3. Adaptive icon background: the dawn sky
save(sky(big).convert("RGB"), "adaptive-background.png")

# 4. Splash: just the sun, on the app's dark background (set in app.config.js)
save(sun_and_hill(big, scale=0.9, with_hill=False), "splash-icon.png")
