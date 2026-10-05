"""
HIGH-FIDELITY ASSET GENERATOR FOR HOGWARTS DUEL 3D
Generates cinematic AAA VFX textures matching Concept Sketch 4 (Avada Kedavra):
1. Ethereal Green Phantom Skull (1024x1024 RGBA Transparent)
2. Wand Starburst Needle Flash (1024x1024 RGBA Transparent)
3. Voldemort Billowing Dark Shadow Shroud (1024x1024 RGBA Transparent)
"""

import math
import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

OUT_DIR = "/Users/khang/hogwarts-duel-3d/public/assets/dueling"
os.makedirs(OUT_DIR, exist_ok=True)


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def generate_fractal_noise_2d(width, height, octaves=4, persistence=0.5, lacunarity=2.0, seed=42):
    np.random.seed(seed)
    noise = np.zeros((height, width), dtype=np.float32)
    frequency = 1.0
    amplitude = 1.0
    total_amplitude = 0.0

    for _ in range(octaves):
        # Grid size for this octave
        gw = int(max(4, width * frequency / 64))
        gh = int(max(4, height * frequency / 64))
        raw = np.random.uniform(0.0, 1.0, (gh, gw)).astype(np.float32)
        # Resize to full resolution with bicubic interpolation
        img = Image.fromarray((raw * 255).astype(np.uint8), mode='L')
        resized = img.resize((width, height), Image.Resampling.BICUBIC)
        layer = np.array(resized, dtype=np.float32) / 255.0

        noise += layer * amplitude
        total_amplitude += amplitude
        amplitude *= persistence
        frequency *= lacunarity

    return noise / total_amplitude


# =========================================================================
# 1. ETHEREAL GREEN PHANTOM SKULL (Sketch 4 - Morsmordre / Dark Mark Style)
# =========================================================================
def generate_ethereal_skull():
    print(">>> Generating Cinematic Ethereal Phantom Skull (1024x1024)...")
    size = 1024
    cx, cy = size / 2.0, size / 2.0 - 10

    y_grid, x_grid = np.meshgrid(np.arange(size), np.arange(size), indexing='ij')
    dx = ((x_grid - cx) / (size * 0.44)).astype(np.float32)
    dy = ((y_grid - cy) / (size * 0.44)).astype(np.float32)

    # Multi-frequency organic turbulence
    noise1 = generate_fractal_noise_2d(size, size, octaves=5, persistence=0.55, seed=512)
    noise2 = generate_fractal_noise_2d(size, size, octaves=4, persistence=0.50, seed=613)
    noise3 = generate_fractal_noise_2d(size, size, octaves=3, persistence=0.60, seed=714)

    # Smoke domain warping
    warp_x = dx + (noise1 - 0.5) * 0.16 + (noise3 - 0.5) * 0.08
    warp_y = dy + (noise2 - 0.5) * 0.16 + (noise3 - 0.5) * 0.08

    # --- A. Cranium (Curved Head Dome Shell) ---
    cran_dist = np.sqrt((warp_x / 0.65) ** 2 + ((warp_y + 0.16) / 0.54) ** 2)
    # Give cranium internal shading: shell density peaks near rim, soft in center
    cranium_outer = smoothstep(1.02, 0.40, cran_dist)
    cranium_rim = smoothstep(0.30, 0.75, cran_dist) * smoothstep(1.05, 0.70, cran_dist)
    cranium_shell = cranium_outer * 0.55 + cranium_rim * 0.45

    # --- B. Menacing Brow Shelf (Sloping inward) ---
    brow_dist = np.sqrt((warp_x / 0.52) ** 2 + ((warp_y + 0.04 + np.abs(warp_x) * 0.15) / 0.12) ** 2)
    brow_shelf = smoothstep(1.0, 0.15, brow_dist) * 0.95

    # --- C. Cheekbones (Zygomatic Arches) ---
    cheek_dist = np.sqrt(((np.abs(warp_x) - 0.42) / 0.22) ** 2 + ((warp_y - 0.14) / 0.16) ** 2)
    cheek_mask = smoothstep(1.0, 0.15, cheek_dist) * 0.85

    # --- D. Upper Jaw & Chin Mandible ---
    maxilla = smoothstep(1.0, 0.2, np.sqrt((warp_x / 0.36) ** 2 + ((warp_y - 0.32) / 0.15) ** 2)) * 0.85
    mandible = smoothstep(1.0, 0.2, np.sqrt((warp_x / 0.30) ** 2 + ((warp_y - 0.60) / 0.20) ** 2)) * 0.80

    skull_body = np.maximum(cranium_shell, brow_shelf)
    skull_body = np.maximum(skull_body, cheek_mask)
    skull_body = np.maximum(skull_body, maxilla)
    skull_body = np.maximum(skull_body, mandible)

    # --- E. Cavernous Deep Menacing Eye Sockets (Sketch 4 - Large Dark Voids) ---
    # Tilted inward like angry scowl (/ \)
    theta_l = math.radians(24)
    ex_l = (warp_x + 0.20) * math.cos(theta_l) - (warp_y - 0.05) * math.sin(theta_l)
    ey_l = (warp_x + 0.20) * math.sin(theta_l) + (warp_y - 0.05) * math.cos(theta_l)
    dist_l = np.sqrt((ex_l / 0.15) ** 2 + (ey_l / 0.22) ** 2)

    theta_r = math.radians(-24)
    ex_r = (warp_x - 0.20) * math.cos(theta_r) - (warp_y - 0.05) * math.sin(theta_r)
    ey_r = (warp_x - 0.20) * math.sin(theta_r) + (warp_y - 0.05) * math.cos(theta_r)
    dist_r = np.sqrt((ex_r / 0.15) ** 2 + (ey_r / 0.22) ** 2)

    eyes_dist = np.minimum(dist_l, dist_r)
    # Sharp cut at 0.85, soft transition to 1.05
    eye_cut = smoothstep(0.40, 1.05, eyes_dist)
    eye_void = 1.0 - smoothstep(0.35, 1.0, eyes_dist)

    # --- F. Inverted Heart Nasal Cavity ---
    nose_dist = np.sqrt((np.abs(warp_x) / 0.075) ** 2 + ((warp_y - 0.20 + np.abs(warp_x) * 0.3) / 0.14) ** 2)
    nose_cut = smoothstep(0.35, 1.0, nose_dist)
    nose_void = 1.0 - smoothstep(0.30, 0.95, nose_dist)

    # --- G. Gaping Open Mouth Cavity ---
    mouth_dist = np.sqrt((warp_x / 0.26) ** 2 + ((warp_y - 0.44) / 0.14) ** 2)
    mouth_cut = smoothstep(0.35, 1.0, mouth_dist)
    mouth_void = 1.0 - smoothstep(0.30, 0.95, mouth_dist)

    # Carve hollows from skull body
    skull_carved = skull_body * eye_cut * nose_cut * mouth_cut

    # --- H. Stalactite Fangs Dripping Into Mouth ---
    fangs_mask = np.zeros((size, size), dtype=np.float32)
    upper_fangs = [
        (-0.20, 0.32, 0.18, 0.030),
        (-0.12, 0.33, 0.24, 0.035),
        (-0.04, 0.34, 0.27, 0.038),
        (0.04, 0.34, 0.27, 0.038),
        (0.12, 0.33, 0.24, 0.035),
        (0.20, 0.32, 0.18, 0.030),
    ]
    for fx, fy, flen, fw in upper_fangs:
        p_dx = np.abs(dx - fx + (noise3 - 0.5) * 0.03)
        p_dy = dy - fy
        cond = (p_dy >= 0) & (p_dy <= flen) & (p_dx <= (1.0 - p_dy / flen) * fw)
        fangs_mask[cond] = np.maximum(fangs_mask[cond], 1.0 - (p_dy[cond] / flen) * 0.35)

    lower_fangs = [
        (-0.14, 0.56, 0.15, 0.030),
        (-0.05, 0.57, 0.20, 0.035),
        (0.05, 0.57, 0.20, 0.035),
        (0.14, 0.56, 0.15, 0.030),
    ]
    for fx, fy, flen, fw in lower_fangs:
        p_dx = np.abs(dx - fx + (noise3 - 0.5) * 0.03)
        p_dy = fy - dy
        cond = (p_dy >= 0) & (p_dy <= flen) & (p_dx <= (1.0 - p_dy / flen) * fw)
        fangs_mask[cond] = np.maximum(fangs_mask[cond], 1.0 - (p_dy[cond] / flen) * 0.35)

    fangs_img = Image.fromarray((fangs_mask * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(radius=1.8))
    smooth_fangs = np.array(fangs_img, dtype=np.float32) / 255.0

    skull_structure = np.maximum(skull_carved, smooth_fangs * 0.95)

    # --- I. Swirling Smoke Wisps, Horns & Vapor Trails ---
    horn_l = np.sqrt(((dx + 0.34) / 0.15) ** 2 + ((dy + 0.65) / 0.32) ** 2)
    horn_r = np.sqrt(((dx - 0.34) / 0.15) ** 2 + ((dy + 0.65) / 0.32) ** 2)
    smoke_horns = np.maximum(smoothstep(1.0, 0.1, horn_l), smoothstep(1.0, 0.1, horn_r)) * (noise1 ** 1.3) * 0.70

    ambient_r = np.sqrt((dx / 0.85) ** 2 + ((dy + 0.05) / 0.82) ** 2)
    ambient_wisp = smoothstep(1.05, 0.35, ambient_r) * (noise1 * 0.55 + noise2 * 0.45) * 0.50

    total_density = np.maximum(skull_structure * 1.1, ambient_wisp)
    total_density = np.maximum(total_density, smoke_horns)
    total_density = np.clip(total_density, 0.0, 1.0)

    # --- J. Color Grading: Saturated Toxic Emerald with Glowing Bone Contours ---
    # Sketch 4 Palette:
    # Rich glowing emerald: #00ff55, #10b981
    # Highlight crests: #86efac (lime-mint incandescence)
    # Deep hollow eyes: PITCH BLACK / DARK VOID (with thin green glowing edge)
    r_chan = np.zeros((size, size), dtype=np.float32)
    g_chan = np.zeros((size, size), dtype=np.float32)
    b_chan = np.zeros((size, size), dtype=np.float32)
    a_chan = np.zeros((size, size), dtype=np.float32)

    bone_highlights = smoothstep(0.60, 0.95, skull_structure) # Crests of brow, cheekbones, teeth
    emerald_plasma = smoothstep(0.20, 0.70, total_density)     # Main skull smoke body
    outer_mist = smoothstep(0.04, 0.30, total_density)         # Soft surrounding ectoplasm

    r_chan = outer_mist * 0.02 + emerald_plasma * 0.10 + bone_highlights * 0.55
    g_chan = outer_mist * 0.65 + emerald_plasma * 0.98 + bone_highlights * 1.00
    b_chan = outer_mist * 0.15 + emerald_plasma * 0.28 + bone_highlights * 0.60
    a_chan = np.clip(outer_mist * 0.60 + emerald_plasma * 0.92 + bone_highlights * 1.0, 0.0, 1.0)

    # Cavernous eye/mouth voids: Cut out light to make pitch dark hollows!
    all_voids = np.clip(eye_void * 1.15 + nose_void * 1.10 + mouth_void * 1.05, 0.0, 1.0)
    # Maintain thin green eye rim
    eye_rim_glow = smoothstep(0.95, 1.15, eyes_dist) * smoothstep(1.35, 1.05, eyes_dist) * 0.65

    r_chan = r_chan * (1.0 - all_voids * 0.98)
    g_chan = g_chan * (1.0 - all_voids * 0.92) + eye_rim_glow * 0.4
    b_chan = b_chan * (1.0 - all_voids * 0.96)
    # Alpha inside eye sockets drops to near 0 so dark background or dark table shows through!
    a_chan = np.clip(a_chan * (1.0 - all_voids * 0.90) + eye_rim_glow * 0.5, 0.0, 1.0)

    rgba = np.stack([
        np.clip(r_chan * 255, 0, 255).astype(np.uint8),
        np.clip(g_chan * 255, 0, 255).astype(np.uint8),
        np.clip(b_chan * 255, 0, 255).astype(np.uint8),
        np.clip(a_chan * 255, 0, 255).astype(np.uint8),
    ], axis=-1)

    skull_img = Image.fromarray(rgba, mode='RGBA')
    skull_img = skull_img.filter(ImageFilter.GaussianBlur(radius=1.6))
    out_path = os.path.join(OUT_DIR, "phantom_skull_blender.png")
    skull_img.save(out_path, format="PNG")
    print(f" Saved: {out_path}")




# =========================================================================
# 2. WAND STARBURST NEEDLE FLASH (Sketch 4 - Wand Tip Glint)
# =========================================================================
def generate_wand_starburst():
    print(">>> Generating Wand Needle Starburst Flash (1024x1024)...")
    size = 1024
    cx, cy = size / 2.0, size / 2.0

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # A. 16 Sharp Needle Rays radiating outward with varied lengths
    # Concept Sketch: razor-sharp diamond rays with electric lime & pure white core
    np.random.seed(42)
    angles = np.linspace(0, 2 * math.pi, 24, endpoint=False)
    # Add slight angular jitter
    angles += np.random.uniform(-0.06, 0.06, size=angles.shape)

    for i, ang in enumerate(angles):
        # Staggered lengths: primary 4 cardinal rays, secondary 4 ordinal rays, and 16 intermediate
        is_cardinal = (i % 6 == 0)
        is_ordinal = (i % 3 == 0)
        if is_cardinal:
            length = np.random.uniform(420, 480)
            base_width = 7.0
        elif is_ordinal:
            length = np.random.uniform(320, 390)
            base_width = 5.0
        else:
            length = np.random.uniform(180, 290)
            base_width = 3.2

        tip_x = cx + math.cos(ang) * length
        tip_y = cy + math.sin(ang) * length

        perp_ang = ang + math.pi / 2.0
        w = base_width * 0.5
        p1 = (cx + math.cos(perp_ang) * w, cy + math.sin(perp_ang) * w)
        p2 = (cx - math.cos(perp_ang) * w, cy - math.sin(perp_ang) * w)

        # Draw needle polygon (outer emerald glow)
        draw.polygon([p1, (tip_x, tip_y), p2], fill=(0, 255, 68, 160))

        # Inner white-hot needle core
        tip_core_x = cx + math.cos(ang) * (length * 0.75)
        tip_core_y = cy + math.sin(ang) * (length * 0.75)
        w_core = w * 0.4
        c1 = (cx + math.cos(perp_ang) * w_core, cy + math.sin(perp_ang) * w_core)
        c2 = (cx - math.cos(perp_ang) * w_core, cy - math.sin(perp_ang) * w_core)
        draw.polygon([c1, (tip_core_x, tip_core_y), c2], fill=(230, 255, 230, 240))

    # B. Anamorphic Horizontal Flare Streak
    draw.ellipse([cx - 460, cy - 6, cx + 460, cy + 6], fill=(0, 255, 85, 120))
    draw.ellipse([cx - 280, cy - 3, cx + 280, cy + 3], fill=(180, 255, 200, 220))
    draw.ellipse([cx - 120, cy - 1.5, cx + 120, cy + 1.5], fill=(255, 255, 255, 255))

    # C. Radial Gaussian Glow Core
    y_grid, x_grid = np.ogrid[:size, :size]
    r = np.sqrt((x_grid - cx) ** 2 + (y_grid - cy) ** 2)

    glow_outer = np.exp(-((r / 160.0) ** 2)) * 0.65
    glow_mid = np.exp(-((r / 75.0) ** 2)) * 0.90
    glow_inner = np.exp(-((r / 28.0) ** 2)) * 1.00

    r_glow = glow_inner * 1.0 + glow_mid * 0.4 + glow_outer * 0.05
    g_glow = glow_inner * 1.0 + glow_mid * 1.0 + glow_outer * 0.95
    b_glow = glow_inner * 1.0 + glow_mid * 0.5 + glow_outer * 0.30
    a_glow = np.clip(glow_outer * 0.75 + glow_mid * 0.90 + glow_inner * 1.0, 0.0, 1.0)

    glow_arr = np.stack([
        np.clip(r_glow * 255, 0, 255).astype(np.uint8),
        np.clip(g_glow * 255, 0, 255).astype(np.uint8),
        np.clip(b_glow * 255, 0, 255).astype(np.uint8),
        np.clip(a_glow * 255, 0, 255).astype(np.uint8),
    ], axis=-1)
    glow_img = Image.fromarray(glow_arr, mode='RGBA')

    # Composite rays with glow
    blurred_rays = img.filter(ImageFilter.GaussianBlur(radius=2.0))
    final_img = Image.alpha_composite(blurred_rays, glow_img)

    out_path = os.path.join(OUT_DIR, "wand_starburst_flash.png")
    final_img.save(out_path, format="PNG")
    print(f" Saved: {out_path}")


# =========================================================================
# 3. VOLDEMORT DARK SHADOW SHROUD (Sketch 4 - Billowing Black Smoke)
# =========================================================================
def generate_dark_shroud():
    print(">>> Generating Voldemort Billowing Dark Shadow Shroud (1024x1024)...")
    size = 1024
    cx, cy = size / 2.0, size / 2.0

    y_grid, x_grid = np.ogrid[:size, :size]
    dx = (x_grid - cx) / (size * 0.5)
    dy = (y_grid - cy) / (size * 0.5)

    noise1 = generate_fractal_noise_2d(size, size, octaves=5, persistence=0.55, seed=777)
    noise2 = generate_fractal_noise_2d(size, size, octaves=4, persistence=0.50, seed=888)

    # Swirling smoke coordinates
    angle = np.arctan2(dy, dx)
    dist = np.sqrt(dx ** 2 + dy ** 2)

    # Organic distorted radius
    dist_distorted = dist + (noise1 - 0.5) * 0.35 + (noise2 - 0.5) * 0.20
    # Smoke density: high in center, ragged feathered edges at radius 0.75 - 0.95
    smoke_mask = smoothstep(0.92, 0.25, dist_distorted) * (noise1 ** 0.85)

    # Additional swirling tendrils at periphery
    tendrils = np.sin(angle * 7.0 + noise2 * 6.0) * 0.5 + 0.5
    smoke_mask = np.maximum(smoke_mask, smoothstep(0.95, 0.40, dist) * tendrils * 0.45)
    smoke_mask = np.clip(smoke_mask, 0.0, 1.0)

    # Color: True Jet-Black Obsidian Smoke with faint sinister charcoal tones (No purple tint!)
    # Charcoal-black core: RGB ~ (10, 10, 14)
    # Edge smoke: RGB ~ (18, 18, 24)
    r_chan = np.full((size, size), 10.0, dtype=np.float32)
    g_chan = np.full((size, size), 10.0, dtype=np.float32)
    b_chan = np.full((size, size), 14.0, dtype=np.float32)
    a_chan = smoke_mask * 0.95

    rgba = np.stack([
        r_chan.astype(np.uint8),
        g_chan.astype(np.uint8),
        b_chan.astype(np.uint8),
        np.clip(a_chan * 255, 0, 255).astype(np.uint8),
    ], axis=-1)

    shroud_img = Image.fromarray(rgba, mode='RGBA')
    shroud_img = shroud_img.filter(ImageFilter.GaussianBlur(radius=4.0))

    out_path = os.path.join(OUT_DIR, "voldemort_dark_shroud.png")
    shroud_img.save(out_path, format="PNG")
    print(f" Saved: {out_path}")


if __name__ == "__main__":
    generate_ethereal_skull()
    generate_wand_starburst()
    generate_dark_shroud()
    print(">>> ALL CINEMATIC VFX TEXTURES GENERATED SUCCESSFULLY!")
