import bpy
import bmesh
import mathutils
import math
import os

OUTPUT_PATH = "/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41/test_blender_skull_render.png"

def build_iconic_phantom_skull():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    mesh = bpy.data.meshes.new(name="PhantomSkullMesh")
    obj = bpy.data.objects.new("PhantomSkull", mesh)
    bpy.context.collection.objects.link(obj)

    bm = bmesh.new()

    # -------------------------------------------------------------------------
    # 1. CRANIUM DOME & FACIAL MASK (True Anatomical Human Skull)
    # -------------------------------------------------------------------------
    u_segs = 36
    v_segs = 28
    cranium = bmesh.ops.create_uvsphere(
        bm,
        u_segments=u_segs,
        v_segments=v_segs,
        radius=0.42
    )

    # Scale to anatomical skull proportions
    bmesh.ops.scale(bm, vec=(0.84, 1.05, 0.96), verts=cranium['verts'])
    bmesh.ops.translate(bm, vec=(0.0, -0.04, 0.44), verts=cranium['verts'])

    # Sculpt facial features directly onto cranium
    for v in cranium['verts']:
        # Flatten anterior face
        if v.co.y > 0.08 and v.co.z < 0.64:
            v.co.y = 0.08 + (v.co.y - 0.08) * 0.28

            # Large Cavernous Orbital Eye Sockets (tilted menacingly inward like angry scowl)
            d_l = math.hypot((v.co.x + 0.14) * 1.1, (v.co.z - 0.42) * 1.25)
            d_r = math.hypot((v.co.x - 0.14) * 1.1, (v.co.z - 0.42) * 1.25)
            if d_l < 0.14:
                depth = (0.14 - d_l) * 2.1
                v.co.y -= depth
            elif d_r < 0.14:
                depth = (0.14 - d_r) * 2.1
                v.co.y -= depth

            # Inverted Heart / Piriform Nasal Cavity (center, z=0.27)
            d_nose = math.hypot(v.co.x * 1.5, (v.co.z - 0.27) * 1.0)
            if d_nose < 0.095:
                v.co.y -= (0.095 - d_nose) * 1.6

        # Angry Furrowed Glabella Brow (V-shape dip between eyes, raised ridges above)
        if 0.45 < v.co.z < 0.54 and v.co.y > 0.06:
            brow_dist = abs(v.co.x)
            if brow_dist < 0.24:
                v.co.y += 0.065 * math.sin(brow_dist / 0.24 * math.pi)

        # Temple Depressions (sides of forehead)
        if 0.38 < v.co.z < 0.58 and v.co.y > -0.08:
            if abs(v.co.x) > 0.28:
                v.co.x *= 0.92

    # -------------------------------------------------------------------------
    # 2. ZYGOMATIC ARCHES (Cheekbones)
    # -------------------------------------------------------------------------
    for sign in [-1, 1]:
        cheek = bmesh.ops.create_cube(bm, size=0.16)
        bmesh.ops.scale(bm, vec=(0.55, 1.20, 0.50), verts=cheek['verts'])
        bmesh.ops.rotate(bm, cent=(0,0,0), matrix=mathutils.Matrix.Rotation(sign * 0.25, 3, 'Z'), verts=cheek['verts'])
        bmesh.ops.translate(bm, vec=(sign * 0.24, 0.11, 0.29), verts=cheek['verts'])

    # -------------------------------------------------------------------------
    # 3. MAXILLA & UPPER INCISORS / FANGS
    # -------------------------------------------------------------------------
    maxilla = bmesh.ops.create_cube(bm, size=0.18)
    bmesh.ops.scale(bm, vec=(1.30, 0.80, 0.40), verts=maxilla['verts'])
    bmesh.ops.translate(bm, vec=(0.0, 0.15, 0.19), verts=maxilla['verts'])

    # Row of 8 Stalactite Bone Teeth / Fangs
    rot_x_pi = mathutils.Matrix.Rotation(math.pi, 3, 'X')
    upper_teeth_x = [-0.13, -0.09, -0.05, -0.02, 0.02, 0.05, 0.09, 0.13]
    for idx, tx in enumerate(upper_teeth_x):
        is_canine = (abs(tx) > 0.07)
        tooth_len = 0.115 if is_canine else 0.090
        tooth_r = 0.016 if is_canine else 0.012
        tooth = bmesh.ops.create_cone(
            bm,
            cap_ends=True,
            cap_tris=True,
            segments=8,
            radius1=tooth_r,
            radius2=0.002,
            depth=tooth_len
        )
        bmesh.ops.rotate(bm, cent=(0,0,0), matrix=rot_x_pi, verts=tooth['verts'])
        t_y = 0.20 - abs(tx) * 0.28
        bmesh.ops.translate(bm, vec=(tx, t_y, 0.15 - tooth_len * 0.45), verts=tooth['verts'])

    # -------------------------------------------------------------------------
    # 4. LOWER JAW / MANDIBLE (Curved Anatomical Screaming Jaw)
    # -------------------------------------------------------------------------
    jaw_pts = [
        (-0.19, 0.02, 0.18),
        (-0.17, 0.10, 0.06),
        (-0.13, 0.18, -0.04),
        (-0.07, 0.22, -0.10),
        (0.0, 0.23, -0.12),
        (0.07, 0.22, -0.10),
        (0.13, 0.18, -0.04),
        (0.17, 0.10, 0.06),
        (0.19, 0.02, 0.18),
    ]
    prev_j = None
    for pt in jaw_pts:
        ring = []
        r = 0.034
        for a in range(8):
            ang = a * math.pi * 2 / 8
            ring.append(bm.verts.new((pt[0] + math.cos(ang) * r, pt[1], pt[2] + math.sin(ang) * r)))
        if prev_j:
            for s in range(8):
                s_next = (s + 1) % 8
                bm.faces.new((prev_j[s], prev_j[s_next], ring[s_next], ring[s]))
        prev_j = ring

    # Lower Jaw Teeth
    for tx in [-0.09, -0.05, -0.02, 0.02, 0.05, 0.09]:
        tooth = bmesh.ops.create_cone(
            bm,
            cap_ends=True,
            cap_tris=True,
            segments=8,
            radius1=0.012,
            radius2=0.002,
            depth=0.070
        )
        t_y = 0.22 - abs(tx) * 0.22
        bmesh.ops.translate(bm, vec=(tx, t_y, -0.06), verts=tooth['verts'])

    bm.to_mesh(mesh)
    bm.free()

    for poly in mesh.polygons:
        poly.use_smooth = True

    # -------------------------------------------------------------------------
    # 5. RADIANT EMERALD LIGHTNING MATERIAL ("trùng màu tia sét")
    # Vibrant Emerald Viridian matching the lightning beam!
    # -------------------------------------------------------------------------
    mat = bpy.data.materials.new(name="AvadaLightningSkullMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type='ShaderNodeOutputMaterial')
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

    # Color match with lightning: Radiant Emerald (#059669 / #10b981) + Mint Incandescent Emissive
    bsdf.inputs['Base Color'].default_value = (0.025, 0.65, 0.35, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.22
    if 'Metallic' in bsdf.inputs:
        bsdf.inputs['Metallic'].default_value = 0.12

    if 'Emission Color' in bsdf.inputs:
        bsdf.inputs['Emission Color'].default_value = (0.15, 0.85, 0.48, 1.0)
        bsdf.inputs['Emission Strength'].default_value = 2.8
    elif 'Emission' in bsdf.inputs:
        bsdf.inputs['Emission'].default_value = (0.15, 0.85, 0.48, 1.0)

    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    obj.data.materials.append(mat)

    # -------------------------------------------------------------------------
    # 6. CAVERNOUS EYE & NOSE VOIDS (Pitch Black Deep Hollows with Glowing Rims)
    # -------------------------------------------------------------------------
    void_mesh = bpy.data.meshes.new(name="SkullVoidsMesh")
    void_obj = bpy.data.objects.new("SkullVoids", void_mesh)
    bpy.context.collection.objects.link(void_obj)

    v_bm = bmesh.new()
    for sign in [-1, 1]:
        # Sunken eye backing
        eye_void = bmesh.ops.create_uvsphere(v_bm, u_segments=16, v_segments=12, radius=0.09)
        bmesh.ops.scale(v_bm, vec=(1.1, 0.4, 1.3), verts=eye_void['verts'])
        bmesh.ops.translate(v_bm, vec=(sign * 0.14, 0.05, 0.42), verts=eye_void['verts'])

    # Nose void backing
    nose_void = bmesh.ops.create_cone(v_bm, segments=8, radius1=0.05, radius2=0.01, depth=0.09)
    bmesh.ops.translate(v_bm, vec=(0.0, 0.07, 0.27), verts=nose_void['verts'])

    v_bm.to_mesh(void_mesh)
    v_bm.free()

    void_mat = bpy.data.materials.new(name="SkullVoidMat")
    void_mat.use_nodes = True
    vnodes = void_mat.node_tree.nodes
    vlinks = void_mat.node_tree.links
    vnodes.clear()
    v_out = vnodes.new(type='ShaderNodeOutputMaterial')
    v_bsdf = vnodes.new(type='ShaderNodeBsdfPrincipled')
    v_bsdf.inputs['Base Color'].default_value = (0.001, 0.005, 0.002, 1.0)
    v_bsdf.inputs['Roughness'].default_value = 0.95
    if 'Emission Color' in v_bsdf.inputs:
        v_bsdf.inputs['Emission Color'].default_value = (0.0, 0.0, 0.0, 1.0)
    vlinks.new(v_bsdf.outputs['BSDF'], v_out.inputs['Surface'])
    void_obj.data.materials.append(void_mat)

    # -------------------------------------------------------------------------
    # Render Preview Image
    # -------------------------------------------------------------------------
    cam_data = bpy.data.cameras.new(name='Cam')
    cam_obj = bpy.data.objects.new('Cam', cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location = (0, 2.3, 0.42)
    cam_obj.rotation_euler = (1.57, 0, 3.14159) # Front face view

    light_data = bpy.data.lights.new(name='KeyLight', type='SUN')
    light_obj = bpy.data.objects.new('KeyLight', light_data)
    bpy.context.collection.objects.link(light_obj)
    light_obj.location = (1.5, 2.0, 2.0)
    light_data.energy = 3.5

    bpy.context.scene.render.resolution_x = 800
    bpy.context.scene.render.resolution_y = 800
    bpy.context.scene.render.filepath = OUTPUT_PATH
    bpy.ops.render.render(write_still=True)
    print(f"✨ [Preview Render] Saved test skull preview to: {OUTPUT_PATH}")

if __name__ == '__main__':
    build_iconic_phantom_skull()
