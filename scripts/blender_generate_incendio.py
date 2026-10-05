import bpy
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def setup_render_common(width=1024, height=1024):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

# ==============================================================================
# 1. GENERATE 3D PROCEDURAL FIRE TORNADO MESH (.GLB)
# ==============================================================================
def create_fire_tornado_glb():
    clear_scene()
    
    mesh = bpy.data.meshes.new(name="FireVortexMesh")
    obj = bpy.data.objects.new("FireVortex", mesh)
    bpy.context.collection.objects.link(obj)

    verts = []
    faces = []
    
    num_arms = 4
    slices_per_arm = 48
    points_per_ring = 8
    
    for arm in range(num_arms):
        arm_phase = (arm / num_arms) * math.pi * 2
        start_v_idx = len(verts)
        
        for s in range(slices_per_arm):
            t = s / (slices_per_arm - 1)
            # Z extends from 0 to 2.8 along flight axis
            z = -t * 2.8
            # Radius expands outward like a fiery vortex cone
            r_center = 0.08 + (t ** 1.3) * 1.10
            angle = arm_phase + t * math.pi * 5.2
            
            cx = math.cos(angle) * r_center
            cy = math.sin(angle) * r_center
            
            # Tube thickness expands then tapers into fire tongues
            tube_r = 0.04 + math.sin(t * math.pi) * 0.14
            
            for p in range(points_per_ring):
                theta = (p / points_per_ring) * math.pi * 2
                vx = cx + math.cos(theta) * tube_r
                vy = cy + math.sin(theta) * tube_r
                verts.append((vx, vy, z))
                
        # Connect slices into quad faces
        for s in range(slices_per_arm - 1):
            for p in range(points_per_ring):
                p_next = (p + 1) % points_per_ring
                v0 = start_v_idx + s * points_per_ring + p
                v1 = start_v_idx + s * points_per_ring + p_next
                v2 = start_v_idx + (s + 1) * points_per_ring + p_next
                v3 = start_v_idx + (s + 1) * points_per_ring + p
                faces.append((v0, v1, v2, v3))

    mesh.from_pydata(verts, [], faces)
    mesh.update()

    # Material: Fiery Magma Shader
    mat = bpy.data.materials.new(name="FireVortexMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    principled = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # Blazing orange base & gold emission
    principled.inputs['Base Color'].default_value = (1.0, 0.35, 0.05, 1.0)
    principled.inputs['Roughness'].default_value = 0.25
    if 'Emission Color' in principled.inputs:
        principled.inputs['Emission Color'].default_value = (1.0, 0.65, 0.1, 1.0)
        principled.inputs['Emission Strength'].default_value = 6.0
    elif 'Emission' in principled.inputs:
        principled.inputs['Emission'].default_value = (1.0, 0.65, 0.1, 1.0)
        
    links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    obj.data.materials.append(mat)
    
    glb_path = os.path.join(OUTPUT_DIR, "incendio_vortex.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_apply=True
    )
    print(f"✅ Exported 3D Fire Tornado GLB: {glb_path}")

# ==============================================================================
# 2. RENDER PROCEDURAL FIRE SPIRAL VORTEX TEXTURE (1024x1024)
# ==============================================================================
def render_fire_spiral_tex():
    clear_scene()
    setup_render_common(1024, 1024)
    
    # Camera
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 3.6
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    cam_obj.location = (0, 0, 4)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Build 8 Archimedean flame ribbons curving outward
    verts = []
    faces = []
    num_ribbons = 8
    steps = 40
    
    for r in range(num_ribbons):
        base_angle = (r / num_ribbons) * math.pi * 2
        start_v = len(verts)
        
        for i in range(steps):
            t = i / (steps - 1)
            radius = 0.15 + (t ** 0.85) * 1.55
            ang = base_angle + t * math.pi * 2.8
            
            # Ribbon width expands then tapers at flame tip
            w = 0.05 + math.sin(t * math.pi) * 0.18
            
            norm_ang = ang + math.pi / 2
            
            x_mid = math.cos(ang) * radius
            y_mid = math.sin(ang) * radius
            
            dx = math.cos(norm_ang) * (w * 0.5)
            dy = math.sin(norm_ang) * (w * 0.5)
            
            verts.append((x_mid - dx, y_mid - dy, 0))
            verts.append((x_mid + dx, y_mid + dy, 0))
            
        for i in range(steps - 1):
            v0 = start_v + i * 2
            v1 = start_v + i * 2 + 1
            v2 = start_v + (i + 1) * 2 + 1
            v3 = start_v + (i + 1) * 2
            faces.append((v0, v1, v2, v3))
            
    mesh = bpy.data.meshes.new("SpiralMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    
    obj = bpy.data.objects.new("SpiralObj", mesh)
    bpy.context.collection.objects.link(obj)
    
    # Glowing flame material with radial gradient
    mat = bpy.data.materials.new("SpiralMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    out_node = nodes.new('ShaderNodeOutputMaterial')
    emit = nodes.new('ShaderNodeEmission')
    emit.inputs['Color'].default_value = (1.0, 0.45, 0.05, 1.0)
    emit.inputs['Strength'].default_value = 8.0
    links.new(emit.outputs['Emission'], out_node.inputs['Surface'])
    obj.data.materials.append(mat)
    
    # Add fiery core disc
    bpy.ops.mesh.primitive_circle_add(radius=0.45, fill_type='TRIFAN', location=(0, 0, 0.02))
    core_obj = bpy.context.active_object
    core_mat = bpy.data.materials.new("CoreMat")
    core_mat.use_nodes = True
    c_nodes = core_mat.node_tree.nodes
    c_nodes.clear()
    c_out = c_nodes.new('ShaderNodeOutputMaterial')
    c_emit = c_nodes.new('ShaderNodeEmission')
    c_emit.inputs['Color'].default_value = (1.0, 0.95, 0.65, 1.0) # White-hot core
    c_emit.inputs['Strength'].default_value = 14.0
    core_mat.node_tree.links.new(c_emit.outputs['Emission'], c_out.inputs['Surface'])
    core_obj.data.materials.append(core_mat)
    
    out_path = os.path.join(OUTPUT_DIR, "blender_fire_spiral.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"✅ Rendered Fire Spiral Texture: {out_path}")

# ==============================================================================
# 3. RENDER VOLUMETRIC BILLOWING DARK SMOKE (1024x1024)
# ==============================================================================
def render_dark_smoke_tex():
    clear_scene()
    setup_render_common(1024, 1024)
    
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 3.2
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    cam_obj.location = (0, 0, 4)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Generate multi-lobed puff clusters
    num_lobes = 18
    for i in range(num_lobes):
        angle = (i / num_lobes) * math.pi * 2 + math.sin(i * 1.5) * 0.4
        dist = 0.25 + (math.sin(i * 2.3) * 0.5 + 0.5) * 0.85
        scale = 0.55 + (math.cos(i * 1.7) * 0.5 + 0.5) * 0.65
        
        px = math.cos(angle) * dist
        py = math.sin(angle) * dist
        
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=scale, location=(px, py, 0))
        sphere = bpy.context.active_object
        
        # Soft dark charcoal shader
        s_mat = bpy.data.materials.new(f"SmokeLobeMat_{i}")
        s_mat.use_nodes = True
        nodes = s_mat.node_tree.nodes
        links = s_mat.node_tree.links
        nodes.clear()
        
        out_n = nodes.new('ShaderNodeOutputMaterial')
        p_bsdf = nodes.new('ShaderNodeBsdfPrincipled')
        
        # Dark charcoal with subtle warm embers reflection
        p_bsdf.inputs['Base Color'].default_value = (0.04, 0.035, 0.04, 0.82)
        p_bsdf.inputs['Roughness'].default_value = 0.95
        
        links.new(p_bsdf.outputs['BSDF'], out_n.inputs['Surface'])
        sphere.data.materials.append(s_mat)
        
    # Ambient top light
    light_data = bpy.data.lights.new(name="TopLight", type='POINT')
    light_data.energy = 150
    light_data.color = (0.3, 0.25, 0.25)
    light_obj = bpy.data.objects.new("TopLight", light_data)
    light_obj.location = (0, 1.0, 2.5)
    bpy.context.collection.objects.link(light_obj)

    out_path = os.path.join(OUTPUT_DIR, "blender_dark_smoke.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"✅ Rendered Dark Smoke Texture: {out_path}")

# ==============================================================================
# 4. RENDER MAGMA SCORCH RUNWAY DECAL (1024x1024)
# ==============================================================================
def render_magma_scorch_tex():
    clear_scene()
    setup_render_common(1024, 1024)
    
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 3.0
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    cam_obj.location = (0, 0, 4)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # Charred crater disc
    bpy.ops.mesh.primitive_circle_add(radius=1.35, fill_type='TRIFAN', location=(0, 0, 0))
    crater = bpy.context.active_object
    
    c_mat = bpy.data.materials.new("CraterMat")
    c_mat.use_nodes = True
    c_nodes = c_mat.node_tree.nodes
    c_nodes.clear()
    c_out = c_nodes.new('ShaderNodeOutputMaterial')
    c_emit = c_nodes.new('ShaderNodeEmission')
    c_emit.inputs['Color'].default_value = (0.02, 0.015, 0.01, 0.95) # Charred black border
    c_emit.inputs['Strength'].default_value = 1.0
    c_mat.node_tree.links.new(c_emit.outputs['Emission'], c_out.inputs['Surface'])
    crater.data.materials.append(c_mat)
    
    # Glowing magma crack lines across the scorch mark
    num_cracks = 12
    for c in range(num_cracks):
        ang = (c / num_cracks) * math.pi * 2
        length = 0.5 + (c % 3) * 0.35
        x2 = math.cos(ang) * length
        y2 = math.sin(ang) * length
        
        # Build crack plane
        bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=length, location=(x2 * 0.5, y2 * 0.5, 0.02))
        crack = bpy.context.active_object
        crack.rotation_euler = (0, math.pi / 2, ang + math.pi / 2)
        
        cr_mat = bpy.data.materials.new(f"CrackMat_{c}")
        cr_mat.use_nodes = True
        nodes = cr_mat.node_tree.nodes
        nodes.clear()
        co = nodes.new('ShaderNodeOutputMaterial')
        ce = nodes.new('ShaderNodeEmission')
        ce.inputs['Color'].default_value = (1.0, 0.55, 0.05, 1.0)
        ce.inputs['Strength'].default_value = 12.0
        cr_mat.node_tree.links.new(ce.outputs['Emission'], co.inputs['Surface'])
        crack.data.materials.append(cr_mat)
        
    # Central molten heart
    bpy.ops.mesh.primitive_circle_add(radius=0.42, fill_type='TRIFAN', location=(0, 0, 0.04))
    heart = bpy.context.active_object
    h_mat = bpy.data.materials.new("HeartMat")
    h_mat.use_nodes = True
    hn = h_mat.node_tree.nodes
    hn.clear()
    ho = hn.new('ShaderNodeOutputMaterial')
    he = hn.new('ShaderNodeEmission')
    he.inputs['Color'].default_value = (1.0, 0.85, 0.25, 1.0)
    he.inputs['Strength'].default_value = 16.0
    h_mat.node_tree.links.new(he.outputs['Emission'], ho.inputs['Surface'])
    heart.data.materials.append(h_mat)

    out_path = os.path.join(OUTPUT_DIR, "blender_magma_scorch.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"✅ Rendered Magma Scorch Decal: {out_path}")

if __name__ == "__main__":
    print("🚀 Running Blender Python Incendio Asset Generator...")
    create_fire_tornado_glb()
    render_fire_spiral_tex()
    render_dark_smoke_tex()
    render_magma_scorch_tex()
    print("✨ All Blender Incendio assets generated successfully!")
