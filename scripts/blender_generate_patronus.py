import bpy
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def create_tube_mesh(points, radii, segments=8):
    """Generates vertices and faces for a 3D tube along 3D waypoints."""
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
        if abs(tx) < 0.9:
            nx, ny, nz = 1, 0, 0
        else:
            nx, ny, nz = 0, 1, 0
            
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
# PROCEDURAL 3D SILVER STAG GENERATOR
# ==============================================================================
def create_patronus_stag_glb():
    clear_scene()
    
    all_verts = []
    all_faces = []
    
    # Coordinates in Blender:
    # X: Left (-) / Right (+)
    # Y: Forward (+) (Muzzle/Head) / Backward (-) (Rump/Tail)
    # Z: Up (+) / Down (-)
    
    # 1. TORSO (Aerodynamic leaping arch with withers, chest, haunches)
    torso_pts = [
        (0.0, -0.75, 0.15),  # Rump / Croup
        (0.0, -0.45, 0.18),  # Loins / Flank
        (0.0, -0.15, 0.16),  # Back saddle
        (0.0,  0.15, 0.22),  # Withers (top of shoulder)
        (0.0,  0.35, 0.12),  # Front chest breast
    ]
    torso_radii = [0.26, 0.24, 0.28, 0.32, 0.27]
    v, f = create_tube_mesh(torso_pts, torso_radii, segments=12)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # 2. NECK (Arching regally forward and up)
    neck_pts = [
        (0.0,  0.28, 0.18),
        (0.0,  0.42, 0.38),
        (0.0,  0.55, 0.62),
        (0.0,  0.65, 0.82),  # Throat / Crown
    ]
    neck_radii = [0.22, 0.17, 0.13, 0.10]
    v, f = create_tube_mesh(neck_pts, neck_radii, segments=10)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # 3. HEAD & MUZZLE
    head_pts = [
        (0.0,  0.62, 0.82),  # Crown
        (0.0,  0.78, 0.85),  # Forehead
        (0.0,  0.94, 0.83),  # Bridge of nose
        (0.0,  1.08, 0.78),  # Velvet muzzle tip
    ]
    head_radii = [0.10, 0.085, 0.065, 0.045]
    v, f = create_tube_mesh(head_pts, head_radii, segments=10)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # Ears (Left & Right)
    for sign in [-1, 1]:
        ear_pts = [
            (sign * 0.08, 0.64, 0.86),
            (sign * 0.16, 0.58, 0.98),
            (sign * 0.22, 0.52, 1.06),
        ]
        ear_radii = [0.035, 0.025, 0.008]
        v, f = create_tube_mesh(ear_pts, ear_radii, segments=6)
        merge_mesh_data(all_verts, all_faces, v, f)
        
    # 4. FORELEGS (Dynamic galloping leap - reaching forward)
    # Right Foreleg (reaching high forward)
    r_front_pts = [
        ( 0.18,  0.25,  0.08),  # Shoulder
        ( 0.22,  0.42, -0.05),  # Upper arm
        ( 0.20,  0.62, -0.15),  # Knee
        ( 0.16,  0.82, -0.18),  # Cannon
        ( 0.14,  0.96, -0.16),  # Pastern & pointed hoof
    ]
    r_front_radii = [0.08, 0.06, 0.045, 0.035, 0.025]
    v, f = create_tube_mesh(r_front_pts, r_front_radii, segments=8)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # Left Foreleg (tucked back under chest)
    l_front_pts = [
        (-0.18,  0.22,  0.06),  # Shoulder
        (-0.20,  0.15, -0.12),  # Upper arm
        (-0.18,  0.05, -0.32),  # Knee bent
        (-0.15, -0.08, -0.48),  # Cannon trailing
        (-0.14, -0.18, -0.58),  # Hoof
    ]
    l_front_radii = [0.075, 0.055, 0.042, 0.032, 0.022]
    v, f = create_tube_mesh(l_front_pts, l_front_radii, segments=8)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # 5. HIND LEGS (Massive driving leap)
    # Left Hind Leg (extended far back in trail)
    l_hind_pts = [
        (-0.20, -0.55,  0.15),  # Hip / Muscular haunch
        (-0.22, -0.78, -0.05),  # Stifle
        (-0.18, -1.05, -0.22),  # Gaskin
        (-0.14, -1.28, -0.45),  # Hock
        (-0.12, -1.50, -0.62),  # Pointed trailing hoof
    ]
    l_hind_radii = [0.12, 0.085, 0.06, 0.04, 0.025]
    v, f = create_tube_mesh(l_hind_pts, l_hind_radii, segments=8)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # Right Hind Leg (tucked forward preparing push)
    r_hind_pts = [
        ( 0.20, -0.50,  0.15),  # Hip
        ( 0.24, -0.42, -0.08),  # Stifle
        ( 0.20, -0.52, -0.30),  # Gaskin
        ( 0.16, -0.65, -0.52),  # Hock
        ( 0.14, -0.75, -0.68),  # Hoof
    ]
    r_hind_radii = [0.11, 0.08, 0.055, 0.038, 0.024]
    v, f = create_tube_mesh(r_hind_pts, r_hind_radii, segments=8)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # Tail
    tail_pts = [
        (0.0, -0.78, 0.16),
        (0.0, -0.92, 0.12),
        (0.0, -1.02, 0.04),
    ]
    tail_radii = [0.05, 0.035, 0.015]
    v, f = create_tube_mesh(tail_pts, tail_radii, segments=6)
    merge_mesh_data(all_verts, all_faces, v, f)
    
    # 6. MAGNIFICENT BRANCHING ANTLERS (Sweeping Silver Crown)
    for sign in [-1, 1]:
        # Main Beam (Curves outward, backward, then sweeps high up)
        beam_pts = [
            (sign * 0.06, 0.68, 0.88),  # Pedicle
            (sign * 0.18, 0.62, 1.05),
            (sign * 0.28, 0.50, 1.25),
            (sign * 0.32, 0.35, 1.45),
            (sign * 0.28, 0.22, 1.62),
            (sign * 0.22, 0.12, 1.78),  # High Crown Fork
        ]
        beam_radii = [0.032, 0.026, 0.022, 0.018, 0.014, 0.008]
        v, f = create_tube_mesh(beam_pts, beam_radii, segments=6)
        merge_mesh_data(all_verts, all_faces, v, f)
        
        # Brow Tine (pointing forward over brow)
        brow_pts = [
            (sign * 0.14, 0.64, 0.98),
            (sign * 0.22, 0.82, 1.08),
            (sign * 0.26, 0.95, 1.15),
        ]
        brow_radii = [0.020, 0.014, 0.006]
        v, f = create_tube_mesh(brow_pts, brow_radii, segments=5)
        merge_mesh_data(all_verts, all_faces, v, f)
        
        # Bez Tine (second forward tine)
        bez_pts = [
            (sign * 0.24, 0.55, 1.18),
            (sign * 0.32, 0.70, 1.30),
            (sign * 0.36, 0.80, 1.38),
        ]
        bez_radii = [0.018, 0.012, 0.005]
        v, f = create_tube_mesh(bez_pts, bez_radii, segments=5)
        merge_mesh_data(all_verts, all_faces, v, f)
        
        # Trez Tine (mid-beam upward tine)
        trez_pts = [
            (sign * 0.30, 0.42, 1.36),
            (sign * 0.40, 0.46, 1.54),
            (sign * 0.44, 0.48, 1.66),
        ]
        trez_radii = [0.016, 0.011, 0.005]
        v, f = create_tube_mesh(trez_pts, trez_radii, segments=5)
        merge_mesh_data(all_verts, all_faces, v, f)
        
        # Crown Top Fork 1
        fork1_pts = [
            (sign * 0.24, 0.16, 1.70),
            (sign * 0.34, 0.22, 1.86),
            (sign * 0.38, 0.26, 1.94),
        ]
        fork1_radii = [0.014, 0.009, 0.004]
        v, f = create_tube_mesh(fork1_pts, fork1_radii, segments=5)
        merge_mesh_data(all_verts, all_faces, v, f)
        
        # Crown Top Fork 2
        fork2_pts = [
            (sign * 0.22, 0.12, 1.78),
            (sign * 0.18, 0.02, 1.92),
            (sign * 0.14, -0.06, 2.02),
        ]
        fork2_radii = [0.012, 0.008, 0.003]
        v, f = create_tube_mesh(fork2_pts, fork2_radii, segments=5)
        merge_mesh_data(all_verts, all_faces, v, f)

    # CREATE BLENDER MESH OBJECT
    mesh = bpy.data.meshes.new(name="PatronusStagMesh")
    mesh.from_pydata(all_verts, [], all_faces)
    mesh.update()
    
    obj = bpy.data.objects.new("PatronusStag", mesh)
    bpy.context.collection.objects.link(obj)
    
    # Center origin and scale to comfortable unit size
    # Apply smooth shading
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    
    # Add Subdivision Surface Modifier for organic sleek body
    subsurf = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    subsurf.levels = 1
    subsurf.render_levels = 1
    
    # Add Ethereal Silver Emission Material
    mat = bpy.data.materials.new(name="PatronusSilverMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # Pure Silver-Cyan Luminous Base
    principled.inputs['Base Color'].default_value = (0.92, 0.96, 1.0, 1.0)
    principled.inputs['Roughness'].default_value = 0.15
    if 'Metallic' in principled.inputs:
        principled.inputs['Metallic'].default_value = 0.2
        
    if 'Emission Color' in principled.inputs:
        principled.inputs['Emission Color'].default_value = (0.85, 0.95, 1.0, 1.0)
        principled.inputs['Emission Strength'].default_value = 5.0
    elif 'Emission' in principled.inputs:
        principled.inputs['Emission'].default_value = (0.85, 0.95, 1.0, 1.0)
        
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    obj.data.materials.append(mat)
    
    glb_path = os.path.join(OUTPUT_DIR, "patronus_stag.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_materials='EXPORT',
        export_apply=True
    )
    print(f"✅ [Blender Pipeline] Exported 3D Patronus Stag GLB: {glb_path} ({os.path.getsize(glb_path):,} bytes)")

    # 7. RENDER HIGH-RES SHOWCASE VIEW OF THE 3D MESH
    render_showcase_path = os.path.abspath("docs/screenshots/patronus_stag_blender_render.png")
    os.makedirs(os.path.dirname(render_showcase_path), exist_ok=True)
    
    # Setup Camera angled 3/4 perspective to highlight depth, antlers and leap
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.lens = 45
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    cam_obj.location = (6.2, -6.0, 3.2)
    
    # Point camera at center of stag
    direction = (0.0 - cam_obj.location.x, 0.0 - cam_obj.location.y, 0.75 - cam_obj.location.z)
    rot_quat = direction_to_rotation(direction)
    cam_obj.rotation_mode = 'QUATERNION'
    cam_obj.rotation_quaternion = rot_quat
    
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Lighting: Celestial silver rim light + key light + blue fill
    key_light_data = bpy.data.lights.new("KeyLight", type='POINT')
    key_light_data.energy = 450
    key_light_data.color = (0.85, 0.95, 1.0)
    key_light = bpy.data.objects.new("KeyLight", key_light_data)
    key_light.location = (2.5, 2.0, 3.5)
    bpy.context.collection.objects.link(key_light)
    
    rim_light_data = bpy.data.lights.new("RimLight", type='POINT')
    rim_light_data.energy = 850
    rim_light_data.color = (0.6, 0.85, 1.0)
    rim_light = bpy.data.objects.new("RimLight", rim_light_data)
    rim_light.location = (-3.5, -2.5, 4.0)
    bpy.context.collection.objects.link(rim_light)

    # Ambient Blue Underfill
    under_data = bpy.data.lights.new("UnderLight", type='POINT')
    under_data.energy = 200
    under_data.color = (0.1, 0.4, 0.8)
    under_light = bpy.data.objects.new("UnderLight", under_data)
    under_light.location = (0, 0, -2.0)
    bpy.context.collection.objects.link(under_light)
    
    scene = bpy.context.scene
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.film_transparent = False
    
    # Add dark mystical world background
    world = bpy.data.worlds.new("PatronusWorld")
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.015, 0.03, 0.06, 1.0)
        bg_node.inputs['Strength'].default_value = 0.5
    scene.world = world
    
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.render.filepath = render_showcase_path
    
    bpy.ops.render.render(write_still=True)
    print(f"✅ [Blender Pipeline] Rendered 3D Showcase PNG: {render_showcase_path}")

def direction_to_rotation(d):
    import mathutils
    vec = mathutils.Vector(d).normalized()
    up = mathutils.Vector((0, 0, 1))
    return vec.to_track_quat('-Z', 'Y')

if __name__ == '__main__':
    create_patronus_stag_glb()
