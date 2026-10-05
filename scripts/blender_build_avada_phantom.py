import bpy
import bmesh
import mathutils
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PREVIEW_PATH = os.path.abspath("scripts/avada_skull_blender_preview.png")

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def apply_boolean(target, cutter, operation='DIFFERENCE'):
    bpy.context.view_layer.objects.active = target
    target.select_set(True)
    cutter.select_set(False)
    mod = target.modifiers.new(name="BoolMod", type='BOOLEAN')
    mod.operation = operation
    mod.object = cutter
    mod.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)

def build_death_skull():
    reset_scene()
    
    # -------------------------------------------------------------------------
    # 1. BASE CRANIUM & FACE MASS (Anatomically Proportioned, No Alien Balloon)
    # -------------------------------------------------------------------------
    # Cranium vault: lower, tapered, sloping back
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=36,
        ring_count=24,
        radius=0.34,
        location=(0, -0.04, 0.35)
    )
    cranium = bpy.context.active_object
    cranium.name = "Skull_Main"
    # Scale to human skull proportions: flattened top (Z=0.82), elongated back (Y=0.96)
    cranium.scale = (0.82, 0.96, 0.82)
    bpy.ops.object.transform_apply(scale=True)
    
    # Maxilla & facial bone mass extending down from cranium
    bpy.ops.mesh.primitive_cube_add(size=0.26, location=(0, 0.07, 0.17))
    face_block = bpy.context.active_object
    face_block.scale = (0.88, 0.85, 0.82)
    bpy.ops.object.transform_apply(scale=True)
    
    # Union cranium and face mass
    apply_boolean(cranium, face_block, 'UNION')
    
    # -------------------------------------------------------------------------
    # 2. BOOLEAN CUTTERS: MASSIVE CAVERNOUS ORBITS, PIRIFORM NOSE, GAUNT CHEEKS
    # -------------------------------------------------------------------------
    
    # A. Large Angled Menacing Eye Sockets (Deep, sharp, tilted inward like angry scowl)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=24,
            radius=0.088,
            depth=0.55,
            location=(sign * 0.122, 0.13, 0.32)
        )
        cutter = bpy.context.active_object
        # Angle inward and down for aggressive predatory gaze
        cutter.rotation_euler = (
            math.radians(90 + 10),
            math.radians(sign * -16),
            math.radians(sign * 12)
        )
        bpy.ops.object.transform_apply(rotation=True)
        # Squarish anatomical orbital aperture
        cutter.scale = (1.10, 1.25, 0.90)
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(cranium, cutter, 'DIFFERENCE')
        
    # B. Piriform Nasal Aperture (Inverted heart / triangular bone hole)
    bpy.ops.mesh.primitive_cone_add(
        vertices=8,
        radius1=0.068,
        radius2=0.012,
        depth=0.50,
        location=(0.0, 0.16, 0.19)
    )
    nose_cutter = bpy.context.active_object
    nose_cutter.rotation_euler = (math.radians(-90), 0, math.radians(180))
    bpy.ops.object.transform_apply(rotation=True)
    apply_boolean(cranium, nose_cutter, 'DIFFERENCE')
    
    # C. Gaunt Skeletal Cheek Hollows (sub-zygomatic indentation for gaunt skeletal look)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=16,
            ring_count=12,
            radius=0.17,
            location=(sign * 0.25, 0.08, 0.12)
        )
        cheek_cutter = bpy.context.active_object
        cheek_cutter.scale = (0.55, 1.2, 0.65)
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(cranium, cheek_cutter, 'DIFFERENCE')

    # D. Temple Indentations (Temporal Fossa on both sides of forehead)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=16,
            radius=0.16,
            depth=0.45,
            location=(sign * 0.29, -0.04, 0.36)
        )
        temple_cutter = bpy.context.active_object
        temple_cutter.scale = (0.45, 1.0, 1.1)
        bpy.ops.object.transform_apply(scale=True)
        apply_boolean(cranium, temple_cutter, 'DIFFERENCE')

    # -------------------------------------------------------------------------
    # 3. ANATOMICAL SKELETAL LANDMARKS: BROW RIDGE, CHEEKBONES, TEETH
    # -------------------------------------------------------------------------
    
    # Heavy Arched Supraorbital Brow Ridge (Angry V-shape bone overhang)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(
            size=0.10,
            location=(sign * 0.12, 0.165, 0.385)
        )
        brow = bpy.context.active_object
        brow.scale = (1.35, 0.65, 0.38)
        brow.rotation_euler = (math.radians(15), math.radians(sign * -18), math.radians(sign * 12))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        apply_boolean(cranium, brow, 'UNION')
    
    # Zygomatic Cheekbone Arches (flaring out laterally)
    for sign in [-1, 1]:
        bpy.ops.mesh.primitive_cube_add(
            size=0.12,
            location=(sign * 0.23, 0.09, 0.23)
        )
        arch = bpy.context.active_object
        arch.scale = (0.55, 1.45, 0.38)
        arch.rotation_euler = (0, 0, math.radians(sign * 25))
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        apply_boolean(cranium, arch, 'UNION')

    # Upper Predatory Teeth (Anchored along Maxilla Alveolar Margin)
    upper_teeth_x = [-0.115, -0.082, -0.048, -0.016, 0.016, 0.048, 0.082, 0.115]
    for tx in upper_teeth_x:
        is_canine = (abs(tx) > 0.065)
        t_len = 0.110 if is_canine else 0.080
        t_rad = 0.015 if is_canine else 0.011
        bpy.ops.mesh.primitive_cone_add(
            vertices=8,
            radius1=t_rad,
            radius2=0.002,
            depth=t_len,
            location=(tx, 0.18 - abs(tx) * 0.24, 0.04 - t_len * 0.35)
        )
        t_obj = bpy.context.active_object
        t_obj.rotation_euler = (math.radians(180), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        apply_boolean(cranium, t_obj, 'UNION')

    # -------------------------------------------------------------------------
    # 4. SCREAMING AGAPE MANDIBLE (Hinged lower jaw dropped wide in agony)
    # -------------------------------------------------------------------------
    jaw_bm = bmesh.new()
    jaw_mesh = bpy.data.meshes.new(name="JawMesh")
    jaw_obj = bpy.data.objects.new("Skull_Jaw", jaw_mesh)
    bpy.context.collection.objects.link(jaw_obj)
    
    jaw_pts = [
        (-0.19, -0.02, 0.15),    # Left condyle
        (-0.18, 0.05, 0.01),     # Left ramus
        (-0.15, 0.13, -0.10),    # Left gonial angle
        (-0.085, 0.20, -0.19),   # Left mandibular body
        (0.0, 0.23, -0.22),      # Mental protuberance (chin)
        (0.085, 0.20, -0.19),    # Right mandibular body
        (0.15, 0.13, -0.10),     # Right gonial angle
        (0.18, 0.05, 0.01),      # Right ramus
        (0.19, -0.02, 0.15),     # Right condyle
    ]
    prev_j = None
    for pt in jaw_pts:
        ring = []
        r = 0.035
        for a in range(8):
            ang = a * math.pi * 2 / 8
            ring.append(jaw_bm.verts.new((pt[0] + math.cos(ang) * r, pt[1] + math.sin(ang) * r * 0.8, pt[2])))
        if prev_j:
            for s in range(8):
                s_next = (s + 1) % 8
                jaw_bm.faces.new((prev_j[s], prev_j[s_next], ring[s_next], ring[s]))
        prev_j = ring
        
    # Lower Teeth (Row of 6 sharp teeth pointing up from dropped jaw)
    lower_teeth_x = [-0.09, -0.054, -0.018, 0.018, 0.054, 0.09]
    for tx in lower_teeth_x:
        is_canine = (abs(tx) > 0.045)
        t_len = 0.090 if is_canine else 0.070
        t_rad = 0.014 if is_canine else 0.010
        tooth = bmesh.ops.create_cone(
            jaw_bm,
            cap_ends=True,
            cap_tris=True,
            segments=8,
            radius1=t_rad,
            radius2=0.002,
            depth=t_len
        )
        t_y = 0.22 - abs(tx) * 0.24
        t_z = -0.18 + abs(tx) * 0.05
        bmesh.ops.translate(jaw_bm, vec=(tx, t_y, t_z + t_len * 0.45), verts=tooth['verts'])
        
    jaw_bm.to_mesh(jaw_mesh)
    jaw_bm.free()

    # -------------------------------------------------------------------------
    # 5. SINISTER DARK INNER CAVITY VOID (Prevents see-through, creates deep black eye sockets)
    # -------------------------------------------------------------------------
    void_bm = bmesh.new()
    void_mesh = bpy.data.meshes.new(name="SkullVoidMesh")
    void_obj = bpy.data.objects.new("SkullVoid", void_mesh)
    bpy.context.collection.objects.link(void_obj)
    
    # Backing plates deep inside the eye sockets to block background light
    for sign in [-1, 1]:
        v_quad = bmesh.ops.create_cube(void_bm, size=0.12)
        bmesh.ops.scale(void_bm, vec=(1.1, 0.2, 1.2), verts=v_quad['verts'])
        bmesh.ops.translate(void_bm, vec=(sign * 0.12, -0.04, 0.32), verts=v_quad['verts'])
    
    # Nasal cavity void backing
    n_quad = bmesh.ops.create_cube(void_bm, size=0.09)
    bmesh.ops.scale(void_bm, vec=(0.8, 0.2, 1.0), verts=n_quad['verts'])
    bmesh.ops.translate(void_bm, vec=(0.0, -0.02, 0.19), verts=n_quad['verts'])
    
    void_bm.to_mesh(void_mesh)
    void_bm.free()

    # -------------------------------------------------------------------------
    # 6. WHITE-HOT PIERCING SOUL EMBERS (Inside Eye Sockets)
    # -------------------------------------------------------------------------
    eyes_bm = bmesh.new()
    eyes_mesh = bpy.data.meshes.new(name="SoulEyesMesh")
    eyes_obj = bpy.data.objects.new("SoulEyes", eyes_mesh)
    bpy.context.collection.objects.link(eyes_obj)
    
    for sign in [-1, 1]:
        ember = bmesh.ops.create_uvsphere(eyes_bm, u_segments=12, v_segments=8, radius=0.032)
        bmesh.ops.translate(eyes_bm, vec=(sign * 0.122, 0.02, 0.32), verts=ember['verts'])
        # Horizontal piercing death slit flare
        slit = bmesh.ops.create_cube(eyes_bm, size=0.02)
        bmesh.ops.scale(eyes_bm, vec=(2.6, 0.4, 0.22), verts=slit['verts'])
        bmesh.ops.translate(eyes_bm, vec=(sign * 0.122, 0.04, 0.32), verts=slit['verts'])
        
    eyes_bm.to_mesh(eyes_mesh)
    eyes_bm.free()

    # -------------------------------------------------------------------------
    # 7. INTERNAL LIGHTNING CONDUIT (Surging directly through jaw & throat)
    # -------------------------------------------------------------------------
    conduit_bm = bmesh.new()
    conduit_mesh = bpy.data.meshes.new(name="PlasmaConduitMesh")
    conduit_obj = bpy.data.objects.new("Skull_PlasmaConduit", conduit_mesh)
    bpy.context.collection.objects.link(conduit_obj)
    
    conduit_pts = [
        (0.0, 0.34, -0.14),   # Blasting forward out of the agape teeth!
        (-0.02, 0.17, -0.05), # Center oral opening
        (0.02, 0.05, 0.04),   # Throat junction
        (-0.02, -0.04, 0.15), # Base of cranium
        (0.01, -0.02, 0.28),  # Center brain vault
        (-0.02, 0.05, 0.39),  # Cranial crown apex
    ]
    prev_c = None
    for pt in conduit_pts:
        ring = []
        r = 0.022
        for a in range(8):
            ang = a * math.pi * 2 / 8
            ring.append(conduit_bm.verts.new((pt[0] + math.cos(ang) * r, pt[1] + math.sin(ang) * r, pt[2])))
        if prev_c:
            for s in range(8):
                s_next = (s + 1) % 8
                conduit_bm.faces.new((prev_c[s], prev_c[s_next], ring[s_next], ring[s]))
        prev_c = ring
        
    conduit_bm.to_mesh(conduit_mesh)
    conduit_bm.free()

    # -------------------------------------------------------------------------
    # 8. MATERIALS: DEEP MENACING VIRIDIAN BONE + PITCH VOID + INCANDESCENT MINT
    # -------------------------------------------------------------------------
    # Bone Material: Deep emerald viridian with intense luminescence (#024b33 + #059669)
    bone_mat = bpy.data.materials.new(name="AvadaSkullBoneMat")
    bone_mat.use_nodes = True
    bn = bone_mat.node_tree.nodes
    bl = bone_mat.node_tree.links
    bn.clear()
    b_out = bn.new(type='ShaderNodeOutputMaterial')
    b_bsdf = bn.new(type='ShaderNodeBsdfPrincipled')
    b_bsdf.inputs['Base Color'].default_value = (0.012, 0.36, 0.19, 1.0) # Deep Emerald #024b33
    b_bsdf.inputs['Roughness'].default_value = 0.35
    if 'Metallic' in b_bsdf.inputs:
        b_bsdf.inputs['Metallic'].default_value = 0.12
    if 'Emission Color' in b_bsdf.inputs:
        b_bsdf.inputs['Emission Color'].default_value = (0.03, 0.60, 0.33, 1.0) # Electric Viridian
        b_bsdf.inputs['Emission Strength'].default_value = 2.0
    bl.new(b_bsdf.outputs['BSDF'], b_out.inputs['Surface'])
    
    cranium.data.materials.append(bone_mat)
    jaw_obj.data.materials.append(bone_mat)
    
    # Void Material: Pure darkness for eye sockets & throat (#000201)
    void_mat = bpy.data.materials.new(name="SkullVoidMat")
    void_mat.use_nodes = True
    vn = void_mat.node_tree.nodes
    vl = void_mat.node_tree.links
    vn.clear()
    v_out = vn.new(type='ShaderNodeOutputMaterial')
    v_bsdf = vn.new(type='ShaderNodeBsdfPrincipled')
    v_bsdf.inputs['Base Color'].default_value = (0.001, 0.003, 0.001, 1.0)
    v_bsdf.inputs['Roughness'].default_value = 0.98
    if 'Emission Color' in v_bsdf.inputs:
        v_bsdf.inputs['Emission Color'].default_value = (0.0, 0.0, 0.0, 1.0)
    vl.new(v_bsdf.outputs['BSDF'], v_out.inputs['Surface'])
    void_obj.data.materials.append(void_mat)
    
    # Soul Embers Material: White-hot mint (#ecfeff)
    ember_mat = bpy.data.materials.new(name="SoulEyesMat")
    ember_mat.use_nodes = True
    en = ember_mat.node_tree.nodes
    el = ember_mat.node_tree.links
    en.clear()
    e_out = en.new(type='ShaderNodeOutputMaterial')
    e_bsdf = en.new(type='ShaderNodeBsdfPrincipled')
    e_bsdf.inputs['Base Color'].default_value = (0.92, 1.0, 0.98, 1.0)
    if 'Emission Color' in e_bsdf.inputs:
        e_bsdf.inputs['Emission Color'].default_value = (0.92, 1.0, 0.98, 1.0)
        e_bsdf.inputs['Emission Strength'].default_value = 18.0
    el.new(e_bsdf.outputs['BSDF'], e_out.inputs['Surface'])
    eyes_obj.data.materials.append(ember_mat)
    
    # Plasma Conduit Material: Incandescent Mint Core (#ecfeff)
    conduit_mat = bpy.data.materials.new(name="PlasmaConduitMat")
    conduit_mat.use_nodes = True
    cn = conduit_mat.node_tree.nodes
    cl = conduit_mat.node_tree.links
    cn.clear()
    c_out = cn.new(type='ShaderNodeOutputMaterial')
    c_bsdf = cn.new(type='ShaderNodeBsdfPrincipled')
    c_bsdf.inputs['Base Color'].default_value = (0.85, 1.0, 0.95, 1.0)
    if 'Emission Color' in c_bsdf.inputs:
        c_bsdf.inputs['Emission Color'].default_value = (0.75, 1.0, 0.92, 1.0)
        c_bsdf.inputs['Emission Strength'].default_value = 14.0
    cl.new(c_bsdf.outputs['BSDF'], c_out.inputs['Surface'])
    conduit_obj.data.materials.append(conduit_mat)

    # Auto-smooth
    for ob in [cranium, jaw_obj]:
        for poly in ob.data.polygons:
            poly.use_smooth = True

    # -------------------------------------------------------------------------
    # 9. RENDER PREVIEW CAMERA & LIGHT
    # -------------------------------------------------------------------------
    cam_data = bpy.data.cameras.new(name="PreviewCam")
    cam_obj = bpy.data.objects.new("PreviewCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # 25-degree three-quarter view from front-right
    cam_obj.location = (0.50, 1.65, 0.22)
    cam_dir = mathutils.Vector((0.0, 0.05, 0.08)) - cam_obj.location
    rot_quat = cam_dir.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    
    # Lighting
    key_light = bpy.data.lights.new(name="KeyLight", type='POINT')
    key_light.energy = 110
    key_light.color = (0.2, 0.95, 0.55)
    key_light_obj = bpy.data.objects.new("KeyLight", key_light)
    key_light_obj.location = (-0.9, 1.2, 0.6)
    bpy.context.collection.objects.link(key_light_obj)
    
    rim_light = bpy.data.lights.new(name="RimLight", type='POINT')
    rim_light.energy = 70
    rim_light.color = (0.8, 1.0, 0.9)
    rim_light_obj = bpy.data.objects.new("RimLight", rim_light)
    rim_light_obj.location = (0.8, -0.6, 0.7)
    bpy.context.collection.objects.link(rim_light_obj)
    
    bpy.context.scene.render.resolution_x = 800
    bpy.context.scene.render.resolution_y = 600
    bpy.context.scene.render.filepath = PREVIEW_PATH
    bpy.ops.render.render(write_still=True)
    print(f"📸 [Blender Preview] Saved to: {PREVIEW_PATH}")

    # -------------------------------------------------------------------------
    # 10. EXPORT GLB
    # -------------------------------------------------------------------------
    glb_path = os.path.join(OUTPUT_DIR, "avada_death_phantom.glb")
    for o in [cam_obj, key_light_obj, rim_light_obj]:
        bpy.data.objects.remove(o, do_unlink=True)
        
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
    )
    print(f"✨ [Blender Production] Pure Anatomical Phantom Skull GLB exported: {glb_path} ({os.path.getsize(glb_path)} bytes)")

if __name__ == '__main__':
    print("==================================================================")
    print("🚀 BLENDER: REBUILDING ANATOMICAL DEATH SKULL (BALANCED PROPORTIONS + VOID SOCKETS)")
    print("==================================================================")
    build_death_skull()
    print("✅ Build complete!")
