import os
import math
from PIL import Image, ImageDraw, ImageFilter

TEXTURE_DIR = os.path.abspath("scripts/ron_textures")
os.makedirs(TEXTURE_DIR, exist_ok=True)

def create_ron_face():
    size = (512, 512)
    # Authentic Lego Light Nougat skin tone
    face = Image.new('RGBA', size, (244, 192, 158, 255))
    draw = ImageDraw.Draw(face)

    # 1. Eyebrows (Warm ginger-brown, bold and expressive Lego stroke)
    # Left eyebrow (curved, inquisitive)
    draw.polygon([
        (130, 160), (170, 132), (222, 138),
        (220, 148), (172, 142), (135, 166)
    ], fill=(128, 48, 14, 255))

    # Right eyebrow (arched higher - signature Ron puzzled / determined expression)
    draw.polygon([
        (290, 138), (342, 122), (388, 142),
        (382, 152), (342, 132), (294, 146)
    ], fill=(128, 48, 14, 255))

    # 2. Eyes (Lego style: crisp dark rim, rich blue iris, black pupil, bold specular catchlight)
    # Left eye: center at (187, 202)
    draw.ellipse([156, 172, 218, 234], fill=(18, 62, 118, 255), outline=(15, 15, 18, 255), width=4)
    draw.ellipse([168, 184, 208, 224], fill=(10, 10, 12, 255))
    # Primary top-right white specular catchlight
    draw.ellipse([174, 186, 188, 200], fill=(255, 255, 255, 255))
    # Secondary bottom-right subtle catchlight
    draw.ellipse([196, 208, 204, 216], fill=(255, 255, 255, 220))

    # Right eye: center at (325, 202)
    draw.ellipse([294, 172, 356, 234], fill=(18, 62, 118, 255), outline=(15, 15, 18, 255), width=4)
    draw.ellipse([306, 184, 346, 224], fill=(10, 10, 12, 255))
    # Primary catchlight
    draw.ellipse([312, 186, 326, 200], fill=(255, 255, 255, 255))
    # Secondary catchlight
    draw.ellipse([334, 208, 342, 216], fill=(255, 255, 255, 220))

    # Eyelid subtle creases
    draw.arc([154, 164, 220, 180], start=190, end=350, fill=(175, 110, 75, 220), width=2)
    draw.arc([292, 164, 358, 180], start=190, end=350, fill=(175, 110, 75, 220), width=2)

    # 3. Signature Freckles (Natural scatter of warm ginger-brown spots on cheeks and nose bridge)
    freckles = [
        # Left cheek
        (140, 240, 3.5), (152, 232, 4.0), (145, 254, 3.0), (160, 246, 4.5), (172, 236, 3.5),
        (180, 252, 4.0), (192, 242, 3.5), (166, 264, 3.0), (184, 268, 3.5), (152, 266, 2.5),
        # Nose bridge
        (238, 235, 3.5), (250, 230, 4.0), (264, 232, 3.5), (244, 244, 3.5), (258, 246, 3.5), (252, 252, 2.5),
        # Right cheek
        (318, 242, 3.5), (330, 252, 4.0), (338, 236, 3.5), (348, 246, 4.5), (358, 232, 4.0),
        (366, 240, 3.5), (344, 264, 3.0), (356, 256, 3.5), (326, 268, 3.5), (364, 260, 2.5),
    ]
    for x, y, r in freckles:
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(170, 78, 28, 240))
        draw.ellipse([x-r+1, y-r+1, x+r-1, y+r-1], fill=(138, 54, 18, 255))

    # 4. Nose crease
    draw.arc([242, 248, 270, 262], start=20, end=160, fill=(175, 105, 70, 255), width=2)

    # 5. Mouth (Lego quirky smirk/grin, slightly tilted up to the right)
    draw.arc([196, 286, 316, 336], start=10, end=170, fill=(45, 18, 8, 255), width=6)
    # Smile corner dimples
    draw.line([(198, 314), (190, 305)], fill=(45, 18, 8, 255), width=5)
    draw.line([(314, 298), (324, 288)], fill=(45, 18, 8, 255), width=5)
    # Lower lip shadow accent
    draw.arc([232, 334, 280, 348], start=20, end=160, fill=(188, 118, 82, 255), width=3)
    # Chin dimple crease
    draw.arc([246, 372, 266, 384], start=30, end=150, fill=(195, 130, 95, 255), width=2)

    # Flip vertically for correct glTF mesh UV mapping
    face = face.transpose(Image.FLIP_TOP_BOTTOM)

    output_path = os.path.join(TEXTURE_DIR, "ron_face_decal.png")
    face.save(output_path)
    print(f"Saved enhanced: {output_path}")
    return output_path

def create_ron_torso_front():
    size = (512, 512)
    # Base dark charcoal knit sweater
    torso = Image.new('RGBA', size, (42, 42, 48, 255))
    draw = ImageDraw.Draw(torso)

    # Knit pattern: subtle vertical weave texture
    for x in range(0, 512, 4):
        tint = (35, 35, 40, 255) if (x % 8 == 0) else (48, 48, 55, 255)
        draw.line([(x, 0), (x, 512)], fill=tint, width=1)

    # 1. White shirt V-triangle
    v_top_y = 35
    v_bottom_y = 250
    shirt_poly = [(256, v_bottom_y), (175, v_top_y), (337, v_top_y)]
    draw.polygon(shirt_poly, fill=(244, 244, 248, 255))

    # Shirt collar flaps
    # Left collar flap
    draw.polygon([(256, 125), (175, v_top_y), (218, 168)], fill=(255, 255, 255, 255), outline=(205, 205, 215, 255), width=3)
    # Right collar flap
    draw.polygon([(256, 125), (337, v_top_y), (294, 168)], fill=(255, 255, 255, 255), outline=(205, 205, 215, 255), width=3)

    # 2. Gryffindor Tie
    # Tie knot
    tie_knot = [(242, 118), (270, 118), (266, 152), (246, 152)]
    draw.polygon(tie_knot, fill=(142, 20, 24, 255), outline=(90, 10, 14, 255), width=2)
    draw.line([(244, 130), (268, 142)], fill=(230, 175, 40, 255), width=4)

    # Tie body hanging down to Y=400
    tie_body = [(246, 152), (266, 152), (274, 370), (256, 405), (238, 370)]
    draw.polygon(tie_body, fill=(142, 20, 24, 255), outline=(90, 10, 14, 255), width=2)

    # Diagonal Gold stripes across tie body
    tie_mask = Image.new('L', size, 0)
    tie_mask_draw = ImageDraw.Draw(tie_mask)
    tie_mask_draw.polygon(tie_body, fill=255)

    stripe_img = Image.new('RGBA', size, (0, 0, 0, 0))
    stripe_draw = ImageDraw.Draw(stripe_img)

    for sy in range(130, 440, 30):
        # Bright Gold diagonal stripe
        stripe_draw.polygon([
            (205, sy - 16), (315, sy + 38),
            (315, sy + 48), (205, sy - 6)
        ], fill=(232, 178, 42, 255))
        # Inner fine scarlet pinstripe
        stripe_draw.line([(205, sy + 22), (315, sy + 76)], fill=(95, 12, 16, 255), width=2)

    torso.paste(stripe_img, (0, 0), tie_mask)

    # 3. V-Neck border trim (Dual Scarlet & Gold bands)
    # Scarlet outer band
    draw.line([(175, v_top_y), (256, v_bottom_y)], fill=(142, 20, 24, 255), width=10)
    draw.line([(337, v_top_y), (256, v_bottom_y)], fill=(142, 20, 24, 255), width=10)
    # Gold inner band
    draw.line([(180, v_top_y), (256, v_bottom_y - 4)], fill=(232, 178, 42, 255), width=5)
    draw.line([(332, v_top_y), (256, v_bottom_y - 4)], fill=(232, 178, 42, 255), width=5)

    # 4. Gryffindor Crest Badge on chest (Right side of image = character's left chest)
    crest_x = 372
    crest_y = 210
    shield_pts = [
        (crest_x - 34, crest_y - 40),
        (crest_x + 34, crest_y - 40),
        (crest_x + 34, crest_y + 12),
        (crest_x, crest_y + 46),
        (crest_x - 34, crest_y + 12),
    ]
    # Gold border
    draw.polygon(shield_pts, fill=(224, 165, 38, 255), outline=(135, 90, 16, 255), width=3)
    # Scarlet inner field
    inner_shield = [
        (crest_x - 27, crest_y - 34),
        (crest_x + 27, crest_y - 34),
        (crest_x + 27, crest_y + 8),
        (crest_x, crest_y + 38),
        (crest_x - 27, crest_y + 8),
    ]
    draw.polygon(inner_shield, fill=(142, 20, 24, 255))

    # Rampant Lion emblem in Gold
    # Head & Mane
    draw.ellipse([crest_x - 14, crest_y - 28, crest_x + 6, crest_y - 12], fill=(235, 185, 45, 255))
    # Body
    draw.polygon([
        (crest_x - 12, crest_y - 16), (crest_x + 8, crest_y - 10),
        (crest_x + 3, crest_y + 16), (crest_x - 10, crest_y + 14)
    ], fill=(235, 185, 45, 255))
    # Forelegs raised
    draw.line([(crest_x + 3, crest_y - 14), (crest_x + 18, crest_y - 24)], fill=(235, 185, 45, 255), width=4)
    draw.line([(crest_x + 6, crest_y - 6), (crest_x + 20, crest_y - 12)], fill=(235, 185, 45, 255), width=4)
    # Hind legs
    draw.line([(crest_x - 6, crest_y + 12), (crest_x - 14, crest_y + 26)], fill=(235, 185, 45, 255), width=4)
    draw.line([(crest_x + 3, crest_y + 14), (crest_x + 10, crest_y + 28)], fill=(235, 185, 45, 255), width=4)
    # Tail curving up
    draw.arc([crest_x - 24, crest_y - 6, crest_x - 2, crest_y + 20], start=80, end=270, fill=(235, 185, 45, 255), width=3)

    # 5. Bottom Ribbed Waistband Hem (Y=435 to 512)
    draw.rectangle([0, 435, 512, 512], fill=(32, 32, 38, 255))
    draw.line([(0, 435), (512, 435)], fill=(20, 20, 25, 255), width=4)
    for rx in range(15, 498, 8):
        draw.line([(rx, 438), (rx, 510)], fill=(45, 45, 52, 255), width=2)
        draw.line([(rx + 3, 438), (rx + 3, 510)], fill=(20, 20, 25, 255), width=2)

    # 6. Side Seam Shadows
    draw.line([(14, 30), (60, 435)], fill=(22, 22, 26, 255), width=5)
    draw.line([(498, 30), (452, 435)], fill=(22, 22, 26, 255), width=5)

    # Flip vertically for correct glTF mesh UV mapping
    torso = torso.transpose(Image.FLIP_TOP_BOTTOM)

    output_path = os.path.join(TEXTURE_DIR, "ron_torso_front.png")
    torso.save(output_path)
    print(f"Saved enhanced: {output_path}")
    return output_path

def create_ron_torso_back():
    size = (512, 512)
    torso = Image.new('RGBA', size, (42, 42, 48, 255))
    draw = ImageDraw.Draw(torso)

    for x in range(0, 512, 4):
        tint = (35, 35, 40, 255) if (x % 8 == 0) else (48, 48, 55, 255)
        draw.line([(x, 0), (x, 512)], fill=tint, width=1)

    # Back neck ribbing
    draw.arc([175, 20, 337, 75], start=0, end=180, fill=(142, 20, 24, 255), width=7)
    draw.arc([180, 25, 332, 70], start=0, end=180, fill=(232, 178, 42, 255), width=4)

    # Spine seam
    draw.line([(256, 80), (256, 435)], fill=(28, 28, 34, 255), width=2)

    # Bottom ribbed hem
    draw.rectangle([0, 435, 512, 512], fill=(32, 32, 38, 255))
    draw.line([(0, 435), (512, 435)], fill=(20, 20, 25, 255), width=4)
    for rx in range(15, 498, 8):
        draw.line([(rx, 438), (rx, 510)], fill=(45, 45, 52, 255), width=2)
        draw.line([(rx + 3, 438), (rx + 3, 510)], fill=(20, 20, 25, 255), width=2)

    # Side seam shadows
    draw.line([(14, 30), (60, 435)], fill=(22, 22, 26, 255), width=5)
    draw.line([(498, 30), (452, 435)], fill=(22, 22, 26, 255), width=5)

    # Flip vertically for correct glTF mesh UV mapping
    torso = torso.transpose(Image.FLIP_TOP_BOTTOM)

    output_path = os.path.join(TEXTURE_DIR, "ron_torso_back.png")
    torso.save(output_path)
    print(f"Saved enhanced: {output_path}")
    return output_path

if __name__ == "__main__":
    create_ron_face()
    create_ron_torso_front()
    create_ron_torso_back()
