from PIL import Image, ImageDraw
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)
RUNE_PATH = os.path.join(OUTPUT_DIR, "blender_avada_rune.png")

def create_death_rune_texture(size=1024):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2

    # Color palette: Deep Emerald, Radiant Viridian, Mint-White Core
    c_dark_emerald = (2, 89, 61, 230)      # #02593d
    c_viridian = (4, 120, 87, 245)         # #047857
    c_bright_emerald = (16, 185, 129, 255) # #10b981
    c_mint = (236, 254, 255, 255)          # #ecfeff

    # 1. Concentric circles with varying line widths
    rings = [
        (480, 5, c_bright_emerald),
        (462, 2.5, c_viridian),
        (420, 3, c_bright_emerald),
        (375, 4, c_dark_emerald),
        (330, 2, c_viridian),
        (255, 3.5, c_bright_emerald),
        (175, 2.5, c_viridian),
        (95, 3, c_bright_emerald),
        (35, 2, c_mint),
    ]

    for radius, width, color in rings:
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.ellipse(bbox, outline=color, width=int(width))

    # 2. Outer Runic Tick Rays (36 tick marks)
    for i in range(36):
        ang = i * (math.pi * 2 / 36)
        r1 = 420
        r2 = 462 if i % 3 == 0 else 445
        w = 3 if i % 3 == 0 else 1.5
        col = c_mint if i % 3 == 0 else c_viridian
        x1 = cx + math.cos(ang) * r1
        y1 = cy + math.sin(ang) * r1
        x2 = cx + math.cos(ang) * r2
        y2 = cy + math.sin(ang) * r2
        draw.line([(x1, y1), (x2, y2)], fill=col, width=int(w))

        # Small outer runic dot at major ticks
        if i % 3 == 0:
            rx = cx + math.cos(ang) * 440
            ry = cy + math.sin(ang) * 440
            draw.ellipse([rx - 4, ry - 4, rx + 4, ry + 4], fill=c_bright_emerald)

    # 3. Interlaced Heptagram / 7-pointed Dark Arcane Star
    points_7 = []
    n_pts = 7
    for i in range(n_pts):
        ang = -math.pi / 2 + i * (math.pi * 2 / n_pts)
        px = cx + math.cos(ang) * 375
        py = cy + math.sin(ang) * 375
        points_7.append((px, py))

    # Connect with step = 2 (7/2 heptagram)
    for i in range(n_pts):
        p1 = points_7[i]
        p2 = points_7[(i + 2) % n_pts]
        draw.line([p1, p2], fill=c_bright_emerald, width=3)

    # Connect with step = 3 (7/3 heptagram)
    for i in range(n_pts):
        p1 = points_7[i]
        p2 = points_7[(i + 3) % n_pts]
        draw.line([p1, p2], fill=c_viridian, width=2)

    # 4. Elder Futhark Death Runes in Ring Band (between r=255 and r=330)
    # Simple geometric stroke glyphs for 16 runes
    futhark_count = 16
    for i in range(futhark_count):
        ang = i * (math.pi * 2 / futhark_count)
        rc = 292
        gx = cx + math.cos(ang) * rc
        gy = cy + math.sin(ang) * rc
        # Local coordinate frame aligned with radial direction
        cos_a = math.cos(ang)
        sin_a = math.sin(ang)
        
        # Draw stylized algorithmic rune glyph
        size_g = 18
        # Radial stem
        sx1 = gx - sin_a * (-size_g)
        sy1 = gy + cos_a * (-size_g)
        sx2 = gx - sin_a * size_g
        sy2 = gy + cos_a * size_g
        draw.line([(sx1, sy1), (sx2, sy2)], fill=c_bright_emerald, width=2)

        # Cross branches
        bx1 = gx - sin_a * 0
        by1 = gy + cos_a * 0
        bx2 = gx - sin_a * (size_g * 0.7) + cos_a * (size_g * 0.6)
        by2 = gy + cos_a * (size_g * 0.7) + sin_a * (size_g * 0.6)
        draw.line([(bx1, by1), (bx2, by2)], fill=c_mint, width=2)

    # 5. Inner Inscribed Hexagram (between r=95 and r=175)
    points_6 = []
    for i in range(6):
        ang = i * (math.pi * 2 / 6)
        px = cx + math.cos(ang) * 175
        py = cy + math.sin(ang) * 175
        points_6.append((px, py))

    # Triangle 1
    draw.polygon([points_6[0], points_6[2], points_6[4]], outline=c_mint, width=2)
    # Triangle 2
    draw.polygon([points_6[1], points_6[3], points_6[5]], outline=c_bright_emerald, width=2)

    # 6. Central Eye / Skull Sigil (Center circle at r=35)
    draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], fill=c_bright_emerald)
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=c_mint)

    # 7. Crackling dark lightning fissures shooting outward
    fissures = [
        [(0.0, 35), (0.1, 120), (-0.08, 220), (0.15, 340), (-0.05, 470)],
        [(1.5, 35), (1.42, 110), (1.58, 240), (1.45, 360), (1.60, 480)],
        [(3.14, 35), (3.05, 130), (3.22, 230), (3.10, 350), (3.18, 475)],
        [(4.6, 35), (4.72, 115), (4.55, 235), (4.68, 355), (4.58, 485)],
    ]
    for fiss in fissures:
        pts = []
        for ang_offset, rad in fiss:
            fx = cx + math.cos(ang_offset) * rad
            fy = cy + math.sin(ang_offset) * rad
            pts.append((fx, fy))
        for j in range(len(pts) - 1):
            draw.line([pts[j], pts[j + 1]], fill=c_mint, width=2)

    img.save(RUNE_PATH, "PNG")
    print(f"✨ [Death Rune Generation] Saved high-detail death rune circle: {RUNE_PATH} ({os.path.getsize(RUNE_PATH)} bytes)")

if __name__ == '__main__':
    create_death_rune_texture(1024)
