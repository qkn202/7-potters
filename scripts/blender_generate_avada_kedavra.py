import bpy
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_tube_mesh(points, radii, segments=12):
    """
    Generates vertices and faces for a smooth 3D tube along 3D waypoints.
    Coordinate system in Blender:
    - X: lateral (-X = left, +X = right)
    - Y: depth / forward (+Y = forward towards Voldemort, -Y = back towards Harry)
    - Z: vertical (+Z = UP towards Great Hall ceiling)
    """
    verts = []
    faces = []
    rings = []

    for i, pt in enumerate(points):
        r = radii[i]
        # Calculate tangent
        if i < len(points) - 1:
            t = (points[i+1][0] - pt[0], points[i+1][1] - pt[1], points[i+1][2] - pt[2])
        else:
            t = (pt[0] - points[i-1][0], pt[1] - points[i-1][1], pt[2] - points[i-1][2])
            
        t_len = math.sqrt(t[0]**2 + t[1]**2 + t[2]**2) or 1.0
        tx, ty, tz = t[0]/t_len, t[1]/t_len, t[2]/t_len
        
        # Arbitrary normal
        if abs(tz) < 0.9:
            nx, ny, nz = 0, 0, 1
        else:
            nx, ny, nz = 1, 0, 0
            
        # Gram-Schmidt orthogonalize
        dot = nx*tx + ny*ty + nz*tz
        nx, ny, nz = nx - dot*tx, ny - dot*ty, nz - dot*tz
        n_len = math.sqrt(nx**2 + ny**2 + nz**2) or 1.0
        nx, ny, nz = nx/n_len, ny/n_len, nz/n_len
        
        # Binormal
        bx = ty*nz - tz*ny
        by = tz*nx - tx*nz
        bz = tx*ny - ty*nx
        
        ring_v = []
        for s in range(segments):
            angle = (s / segments) * math.pi * 2
            cos_a = math.cos(angle) * r
            sin_a = math.sin(angle) * r
            vx = pt[0] + nx * cos_a + bx * sin_a
            vy = pt[1] + ny * cos_a + by * sin_a
            vz = pt[2] + nz * cos_a + bz * sin_a
            verts.append((vx, vy, vz))
            ring_v.append(len(verts) - 1)
        rings.append(ring_v)
        
    for i in range(len(rings) - 1):
        r0 = rings[i]
        r1 = rings[i+1]
        for s in range(segments):
            s_next = (s + 1) % segments
            faces.append((r0[s], r0[s_next], r1[s_next], r1[s]))
            
    # Add end caps
    start_center = len(verts)
    verts.append(points[0])
    for s in range(segments):
        s_next = (s + 1) % segments
        faces.append((start_center, rings[0][s_next], rings[0][s]))
        
    end_center = len(verts)
    verts.append(points[-1])
    for s in range(segments):
        s_next = (s + 1) % segments
        faces.append((end_center, rings[-1][s], rings[-1][s_next]))
        
    return verts, faces

def merge_mesh_data(target_verts, target_faces, new_verts, new_faces):
    offset = len(target_verts)
    target_verts.extend(new_verts)
    for f in new_faces:
        target_faces.append(tuple(idx + offset for idx in f))

# ==============================================================================
# PROCEDURAL 3D DARK MARK DEATH PHANTOM GENERATOR
# ==============================================================================
def create_avada_death_phantom_glb():
    clear_scene()
    
    all_verts = []
    all_faces = []
    
    # -------------------------------------------------------------------------
    # A. THE SKULL CRANIUM (Blender Coords: Z is Up, Y is Forward, X is Lateral)
    # -------------------------------------------------------------------------
    # Sagittal cranium arch: starting from back occipital, over crown vault, to forehead brow
    cranium_sagittal = [
        (0.0, -0.42, 0.45),  # Posterior base
        (0.0, -0.38, 0.72),  # Occipital curve
        (0.0, -0.15, 0.95),  # Parietal crown
        (0.0, 0.12, 0.92),   # Frontal vault
        (0.0, 0.28, 0.75),   # Forehead slope
        (0.0, 0.35, 0.58),   # Glabella brow shelf
        (0.0, 0.38, 0.44),   # Nasal bridge
        (0.0, 0.34, 0.32),   # Nasal piriform aperture
        (0.0, 0.32, 0.22),   # Upper alveolar arch (teeth root)
    ]
    sagittal_radii = [0.18, 0.24, 0.28, 0.28, 0.25, 0.22, 0.18, 0.14, 0.12]
    v, f = create_tube_mesh(cranium_sagittal, sagittal_radii, segments=12)
    merge_mesh_data(all_verts, all_faces, v, f)

    # Lateral Parietal/Temporal Cranium Shell (Left & Right hemispheres)
    for sign in [-1, 1]:
        parietal_pts = [
            (sign * 0.14, -0.32, 0.52),
            (sign * 0.28, -0.18, 0.70),
            (sign * 0.32, 0.05, 0.68),
            (sign * 0.26, 0.22, 0.55),
            (sign * 0.18, 0.30, 0.45),
        ]
        parietal_radii = [0.12, 0.18, 0.19, 0.16, 0.11]
        v, f = create_tube_mesh(parietal_pts, parietal_radii, segments=10)
        merge_mesh_data(all_verts, all_faces, v, f)

    # -------------------------------------------------------------------------
    # B. ORBITAL CAVITIES (Sunken Hollow Eye Sockets) & BROW RIDGES
    # -------------------------------------------------------------------------
    for sign in [-1, 1]:
        # Supraorbital Brow Shelf (Heavy predatory ridge)
        brow_pts = [
            (sign * 0.02, 0.34, 0.58),
            (sign * 0.12, 0.35, 0.59),
            (sign * 0.22, 0.32, 0.55),
            (sign * 0.26, 0.25, 0.48),
        ]
        brow_radii = [0.055, 0.065, 0.060, 0.045]
        v, f = create_tube_mesh(brow_pts, brow_radii, segments=8)
        merge_mesh_data(all_verts, all_faces, v, f)

        # Orbital Rim Ring (Surrounding deep hollow eye cavity)
        orbit_pts = [
            (sign * 0.08, 0.32, 0.54),
            (sign * 0.20, 0.31, 0.53),
            (sign * 0.24, 0.28, 0.42),
            (sign * 0.18, 0.29, 0.34),
            (sign * 0.08, 0.31, 0.36),
            (sign * 0.08, 0.32, 0.54),
        ]
        orbit_radii = [0.035, 0.038, 0.038, 0.035, 0.035, 0.035]
        v, f = create_tube_mesh(orbit_pts, orbit_radii, segments=8)
        merge_mesh_data(all_verts, all_faces, v, f)

        # Zygomatic Arch (Cheekbone flares)
        cheek_pts = [
            (sign * 0.22, 0.26, 0.38),
            (sign * 0.28, 0.12, 0.35),
            (sign * 0.25, -0.05, 0.32),
            (sign * 0.20, -0.15, 0.36),
        ]
        cheek_radii = [0.045, 0.040, 0.035, 0.030]
        v, f = create_tube_mesh(cheek_pts, cheek_radii, segments=8)
        merge_mesh_data(all_verts, all_faces, v, f)

    # -------------------------------------------------------------------------
    # C. UPPER TEETH & GAPING LOWER JAW (Mandible)
    # -------------------------------------------------------------------------
    # Maxilla Teeth (Predatory pointed bone teeth)
    for tx in [-0.10, -0.06, -0.02, 0.02, 0.06, 0.10]:
        tooth_pts = [
            (tx, 0.32 - abs(tx)*0.3, 0.22),
            (tx, 0.34 - abs(tx)*0.3, 0.14 - (0.04 if abs(tx) in [0.06, 0.10] else 0.0)),
        ]
        v, f = create_tube_mesh(tooth_pts, [0.016, 0.003], segments=6)
        merge_mesh_data(all_verts, all_faces, v, f)

    # Gaping Agonized Mandible (Lower Jaw dropped in a terrifying scream)
    mandible_pts = [
        (-0.20, -0.02, 0.22),
        (-0.18, 0.10, 0.10),
        (-0.14, 0.24, -0.02),
        (0.0, 0.28, -0.06),
        (0.14, 0.24, -0.02),
        (0.18, 0.10, 0.10),
        (0.20, -0.02, 0.22),
    ]
    mandible_radii = [0.040, 0.045, 0.050, 0.055, 0.050, 0.045, 0.040]
    v, f = create_tube_mesh(mandible_pts, mandible_radii, segments=8)
    merge_mesh_data(all_verts, all_faces, v, f)

    # Mandibular Teeth (Lower predatory fangs pointing up)
    for tx in [-0.08, -0.04, 0.0, 0.04, 0.08]:
        tooth_pts = [
            (tx, 0.26 - abs(tx)*0.2, -0.04),
            (tx, 0.27 - abs(tx)*0.2, 0.04),
        ]
        v, f = create_tube_mesh(tooth_pts, [0.014, 0.003], segments=6)
        merge_mesh_data(all_verts, all_faces, v, f)

    # -------------------------------------------------------------------------
    # D. THE BASILISK DEATH SERPENT (Mãng Xà Tử Thần)
    # Erupts directly from the skull's gaping throat (Y=0.0, Z=0.08)
    # and lunges forward along +Y towards Voldemort!
    # -------------------------------------------------------------------------
    serpent_spine = [
        # Tail coiling inside and behind the skull vault
        (0.0, -0.55, 0.40),
        (-0.24, -0.42, 0.28),
        (-0.30, -0.18, 0.15),
        (-0.16, 0.02, 0.06),
        # Erupting through the agape jaws forward!
        (0.0, 0.20, 0.08),
        (0.08, 0.45, 0.12),
        (-0.06, 0.75, 0.18),
        (-0.18, 1.05, 0.24),
        (-0.08, 1.35, 0.28),
        (0.10, 1.65, 0.26),
        # Rising flared striking neck & cobra hood
        (0.06, 1.95, 0.32),
        (0.0, 2.22, 0.38),   # Cobra neck crest
        (0.0, 2.45, 0.35),   # Basilisk Head
        (0.0, 2.58, 0.32),   # Snout tip
    ]
    
    serpent_radii = [
        0.030,  # Tail tip
        0.060,
        0.095,
        0.120,
        0.140,  # Emerging from throat
        0.145,
        0.150,
        0.155,
        0.160,
        0.170,
        0.220,  # Expanding flared hood
        0.240,  # Broadest hood section
        0.180,  # Striking head
        0.090,  # Snout
    ]
    v, f = create_tube_mesh(serpent_spine, serpent_radii, segments=12)
    merge_mesh_data(all_verts, all_faces, v, f)

    # Basilisk Cobra Hood Lateral Wings (Left & Right Flaps)
    for sign in [-1, 1]:
        hood_pts = [
            (sign * 0.14, 1.80, 0.28),
            (sign * 0.32, 2.05, 0.34),
            (sign * 0.38, 2.22, 0.36),
            (sign * 0.28, 2.38, 0.34),
            (sign * 0.12, 2.48, 0.32),
        ]
        hood_radii = [0.035, 0.045, 0.048, 0.038, 0.025]
        v, f = create_tube_mesh(hood_pts, hood_radii, segments=8)
        merge_mesh_data(all_verts, all_faces, v, f)

        # Lethal Venomous Upper Fangs on Basilisk Head
        fang_pts = [
            (sign * 0.08, 2.48, 0.32),
            (sign * 0.07, 2.54, 0.18),  # Curved needle tip
        ]
        v, f = create_tube_mesh(fang_pts, [0.022, 0.003], segments=6)
        merge_mesh_data(all_verts, all_faces, v, f)

    # -------------------------------------------------------------------------
    # E. ECTOPLASMIC SKELETON RIBS / TENDRILS (Wrapping the curse axis)
    # -------------------------------------------------------------------------
    for r in range(4):
        y_pos = -0.15 + r * 0.22
        z_base = 0.20 - r * 0.04
        for sign in [-1, 1]:
            rib_pts = [
                (0.0, y_pos, z_base + 0.12),
                (sign * 0.22, y_pos + 0.05, z_base + 0.08),
                (sign * 0.30, y_pos + 0.10, z_base - 0.05),
                (sign * 0.24, y_pos + 0.15, z_base - 0.15),
                (sign * 0.08, y_pos + 0.18, z_base - 0.18),
            ]
            rib_radii = [0.030, 0.028, 0.024, 0.018, 0.012]
            v, f = create_tube_mesh(rib_pts, rib_radii, segments=6)
            merge_mesh_data(all_verts, all_faces, v, f)

    # Build Phantom Mesh Object
    phantom_mesh = bpy.data.meshes.new(name="AvadaDeathPhantomMesh")
    phantom_mesh.from_pydata(all_verts, [], all_faces)
    phantom_mesh.update()

    phantom_obj = bpy.data.objects.new("AvadaDeathPhantom", phantom_mesh)
    bpy.context.collection.objects.link(phantom_obj)

    for poly in phantom_mesh.polygons:
        poly.use_smooth = True

    # PBR Material: Deep Saturated Dark Obsidian Emerald ("màu đậm hơn")
    mat = bpy.data.materials.new(name="AvadaDeathPhantomMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type='ShaderNodeOutputMaterial')
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')

    # Rich dark emerald viridian base
    principled.inputs['Base Color'].default_value = (0.008, 0.095, 0.045, 1.0)
    principled.inputs['Roughness'].default_value = 0.32
    if 'Metallic' in principled.inputs:
        principled.inputs['Metallic'].default_value = 0.22

    # Subtle inner emerald luminescence
    if 'Emission Color' in principled.inputs:
        principled.inputs['Emission Color'].default_value = (0.015, 0.35, 0.14, 1.0)
        principled.inputs['Emission Strength'].default_value = 2.4
    elif 'Emission' in principled.inputs:
        principled.inputs['Emission'].default_value = (0.015, 0.35, 0.14, 1.0)

    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    phantom_obj.data.materials.append(mat)

    # -------------------------------------------------------------------------
    # F. PIERCING SOUL EYE ORBS (Searing Mint-White Incandescent Glow)
    # -------------------------------------------------------------------------
    eye_verts = []
    eye_faces = []

    for sign in [-1, 1]:
        # Skull hollow eye orbs (set deep inside the orbital cavity)
        s_pts = [
            (sign * 0.14, 0.22, 0.44),
            (sign * 0.14, 0.30, 0.44),
        ]
        v_e, f_e = create_tube_mesh(s_pts, [0.048, 0.010], segments=8)
        merge_mesh_data(eye_verts, eye_faces, v_e, f_e)
        
        # Basilisk Serpent glowing eyes (set on side of serpent head)
        se_pts = [
            (sign * 0.10, 2.42, 0.36),
            (sign * 0.10, 2.50, 0.36),
        ]
        v_se, f_se = create_tube_mesh(se_pts, [0.030, 0.008], segments=8)
        merge_mesh_data(eye_verts, eye_faces, v_se, f_se)

    eye_mesh = bpy.data.meshes.new(name="SoulEyesMesh")
    eye_mesh.from_pydata(eye_verts, [], eye_faces)
    eye_mesh.update()
    eye_obj = bpy.data.objects.new("SoulEyes", eye_mesh)
    bpy.context.collection.objects.link(eye_obj)

    eye_mat = bpy.data.materials.new(name="SoulEyesMat")
    eye_mat.use_nodes = True
    enodes = eye_mat.node_tree.nodes
    elinks = eye_mat.node_tree.links
    enodes.clear()

    e_out = enodes.new(type='ShaderNodeOutputMaterial')
    e_bsdf = enodes.new(type='ShaderNodeBsdfPrincipled')
    e_bsdf.inputs['Base Color'].default_value = (0.92, 1.0, 0.96, 1.0)
    if 'Emission Color' in e_bsdf.inputs:
        e_bsdf.inputs['Emission Color'].default_value = (0.85, 1.0, 0.92, 1.0)
        e_bsdf.inputs['Emission Strength'].default_value = 16.0
    elif 'Emission' in e_bsdf.inputs:
        e_bsdf.inputs['Emission'].default_value = (0.85, 1.0, 0.92, 1.0)

    elinks.new(e_bsdf.outputs['BSDF'], e_out.inputs['Surface'])
    eye_obj.data.materials.append(eye_mat)

    # Export to GLB
    glb_path = os.path.join(OUTPUT_DIR, "avada_death_phantom.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
    )
    print(f"✨ [Blender Production] Avada Death Phantom GLB exported: {glb_path} ({os.path.getsize(glb_path)} bytes)")

# ==============================================================================
# PROCEDURAL BLENDER EEVEE TEXTURES (1024x1024)
# ==============================================================================
def render_avada_blender_textures():
    clear_scene()
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    cam_data = bpy.data.cameras.new("OrthoCam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 2.0
    cam_obj = bpy.data.objects.new("OrthoCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0, 0, 3.0)
    cam_obj.rotation_euler = (0, 0, 0)
    scene.camera = cam_obj

    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0, 0, 0))
    plane = bpy.context.active_object

    mat = bpy.data.materials.new(name="AvadaRuneMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type='ShaderNodeOutputMaterial')
    emission = nodes.new(type='ShaderNodeEmission')
    tex_coord = nodes.new(type='ShaderNodeTexCoord')
    mapping = nodes.new(type='ShaderNodeMapping')
    grad = nodes.new(type='ShaderNodeTexGradient')
    color_ramp = nodes.new(type='ShaderNodeValToRGB')

    # Concentric deep emerald death seal
    color_ramp.color_ramp.elements[0].position = 0.0
    color_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 0.0)
    color_ramp.color_ramp.elements[1].position = 0.65
    color_ramp.color_ramp.elements[1].color = (0.015, 0.28, 0.12, 0.88)

    elem_core = color_ramp.color_ramp.elements.new(0.88)
    elem_core.color = (0.04, 0.75, 0.32, 1.0)

    links.new(tex_coord.outputs['Generated'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], grad.inputs['Vector'])
    links.new(grad.outputs['Color'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], emission.inputs['Color'])
    emission.inputs['Strength'].default_value = 3.5
    links.new(emission.outputs['Emission'], out.inputs['Surface'])

    plane.data.materials.append(mat)

    rune_path = os.path.join(OUTPUT_DIR, "blender_avada_rune.png")
    scene.render.filepath = rune_path
    bpy.ops.render.render(write_still=True)
    print(f"✨ [Blender Production] Avada Death Rune rendered: {rune_path}")

if __name__ == '__main__':
    print("==================================================================")
    print("🚀 BLENDER PRODUCTION: GENERATING AVADA KEDAVRA 3D ASSETS")
    print("==================================================================")
    create_avada_death_phantom_glb()
    render_avada_blender_textures()
    print("✅ All Avada Kedavra Blender assets generated successfully!")
