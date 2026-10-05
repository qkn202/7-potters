import bpy
import math
import os

OUTPUT_DIR = os.path.abspath("public/assets/dueling")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def setup_ortho_camera(scale=2.0):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    
    cam_data = bpy.data.cameras.new("OrthoCam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = scale
    cam_obj = bpy.data.objects.new("OrthoCam", cam_data)
    cam_obj.location = (0, 0, 5)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    return cam_obj

# ==============================================================================
# 1. RENDER ULTRA-REALISTIC PROCEDURAL FIRE SPIRAL VORTEX (1024x1024)
# ==============================================================================
def render_procedural_fire_spiral():
    clear_scene()
    setup_ortho_camera(scale=2.0)
    
    # Plane for shader rendering
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0, 0, 0))
    plane = bpy.context.active_object
    
    mat = bpy.data.materials.new("ProcFireSpiralMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    # Node Graph
    out_node = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Location'].default_value = (-0.5, -0.5, 0) # Center UV
    links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
    
    # Distance to center (r)
    dist_node = nodes.new('ShaderNodeVectorMath')
    dist_node.operation = 'LENGTH'
    links.new(mapping.outputs['Vector'], dist_node.inputs[0])
    
    # Organic Swirling Flame Texture
    noise1 = nodes.new('ShaderNodeTexNoise')
    noise1.inputs['Scale'].default_value = 4.2
    noise1.inputs['Detail'].default_value = 12.0
    noise1.inputs['Roughness'].default_value = 0.60
    noise1.inputs['Distortion'].default_value = 6.5 # High distortion creates swirling vortex licks!
    links.new(mapping.outputs['Vector'], noise1.inputs['Vector'])
    
    noise2 = nodes.new('ShaderNodeTexNoise')
    noise2.inputs['Scale'].default_value = 8.5
    noise2.inputs['Detail'].default_value = 8.0
    noise2.inputs['Roughness'].default_value = 0.5
    noise2.inputs['Distortion'].default_value = 3.0
    links.new(mapping.outputs['Vector'], noise2.inputs['Vector'])
    
    # Mix the two noises
    mix_noise = nodes.new('ShaderNodeMix')
    mix_noise.data_type = 'FLOAT'
    mix_noise.inputs['Factor'].default_value = 0.35
    links.new(noise1.outputs['Fac'], mix_noise.inputs['A'])
    links.new(noise2.outputs['Fac'], mix_noise.inputs['B'])
    
    # Radial mask: smooth fade from center out to 0.85 radius
    map_range = nodes.new('ShaderNodeMapRange')
    map_range.inputs['From Min'].default_value = 0.05
    map_range.inputs['From Max'].default_value = 0.80
    map_range.inputs['To Min'].default_value = 1.0
    map_range.inputs['To Max'].default_value = 0.0
    links.new(dist_node.outputs['Value'], map_range.inputs['Value'])
    
    # Multiply noise with radial falloff
    mult = nodes.new('ShaderNodeMath')
    mult.operation = 'MULTIPLY'
    links.new(mix_noise.outputs['Result'], mult.inputs[0])
    links.new(map_range.outputs['Result'], mult.inputs[1])
    
    # Fire Color Ramp - Vibrant, deep, saturated flame spectrum!
    ramp_color = nodes.new('ShaderNodeValToRGB')
    elements = ramp_color.color_ramp.elements
    elements[0].position = 0.02
    elements[0].color = (0.35, 0.02, 0.0, 1.0) # Deep dark garnet ember
    
    elements[1].position = 0.98
    elements[1].color = (1.0, 0.95, 0.70, 1.0) # Golden-white incandescent core
    
    e2 = elements.new(0.25)
    e2.color = (0.90, 0.12, 0.01, 1.0) # Fiery crimson
    
    e3 = elements.new(0.48)
    e3.color = (1.0, 0.42, 0.02, 1.0) # Blazing orange
    
    e4 = elements.new(0.72)
    e4.color = (1.0, 0.78, 0.05, 1.0) # Radiant molten gold
    
    links.new(mult.outputs['Value'], ramp_color.inputs['Fac'])
    
    # Alpha Ramp
    ramp_alpha = nodes.new('ShaderNodeValToRGB')
    a_elem = ramp_alpha.color_ramp.elements
    a_elem[0].position = 0.08
    a_elem[0].color = (0, 0, 0, 1) # Transparent outer
    a_elem[1].position = 0.38
    a_elem[1].color = (0.95, 0.95, 0.95, 1) # High opacity flame
    links.new(mult.outputs['Value'], ramp_alpha.inputs['Fac'])
    
    # Connect to Principled BSDF with moderate emission to preserve deep colors
    links.new(ramp_color.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(ramp_color.outputs['Color'], bsdf.inputs['Emission Color'])
    bsdf.inputs['Emission Strength'].default_value = 1.4
    bsdf.inputs['Roughness'].default_value = 0.35
    links.new(ramp_alpha.outputs['Color'], bsdf.inputs['Alpha'])
    
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    plane.data.materials.append(mat)
    
    out_path = os.path.join(OUTPUT_DIR, "blender_fire_spiral.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"🔥 Successfully rendered Procedural Fire Spiral: {out_path}")

# ==============================================================================
# 2. RENDER PROCEDURAL VOLUMETRIC BILLOWING DARK SMOKE (1024x1024)
# ==============================================================================
def render_procedural_dark_smoke():
    clear_scene()
    setup_ortho_camera(scale=2.0)
    
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0, 0, 0))
    plane = bpy.context.active_object
    
    mat = bpy.data.materials.new("ProcSmokeMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    out_node = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Location'].default_value = (-0.5, -0.5, 0)
    links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
    
    # Distance to center
    dist = nodes.new('ShaderNodeVectorMath')
    dist.operation = 'LENGTH'
    links.new(mapping.outputs['Vector'], dist.inputs[0])
    
    # Multi-frequency organic smoke noise
    noise1 = nodes.new('ShaderNodeTexNoise')
    noise1.inputs['Scale'].default_value = 3.8
    noise1.inputs['Detail'].default_value = 15.0
    noise1.inputs['Roughness'].default_value = 0.72
    noise1.inputs['Distortion'].default_value = 2.4
    links.new(mapping.outputs['Vector'], noise1.inputs['Vector'])
    
    # Falloff
    falloff = nodes.new('ShaderNodeMapRange')
    falloff.inputs['From Min'].default_value = 0.08
    falloff.inputs['From Max'].default_value = 0.78
    falloff.inputs['To Min'].default_value = 1.0
    falloff.inputs['To Max'].default_value = 0.0
    links.new(dist.outputs['Value'], falloff.inputs['Value'])
    
    mult = nodes.new('ShaderNodeMath')
    mult.operation = 'MULTIPLY'
    links.new(noise1.outputs['Fac'], mult.inputs[0])
    links.new(falloff.outputs['Result'], mult.inputs[1])
    
    # Charcoal Color Ramp
    ramp_col = nodes.new('ShaderNodeValToRGB')
    elements = ramp_col.color_ramp.elements
    elements[0].position = 0.1
    elements[0].color = (0.02, 0.015, 0.02, 1.0) # Pitch charcoal
    elements[1].position = 0.8
    elements[1].color = (0.12, 0.09, 0.10, 1.0) # Soft ash grey
    links.new(mult.outputs['Value'], ramp_col.inputs['Fac'])
    
    # Alpha Ramp
    ramp_a = nodes.new('ShaderNodeValToRGB')
    a_elem = ramp_a.color_ramp.elements
    a_elem[0].position = 0.18
    a_elem[0].color = (0, 0, 0, 1)
    a_elem[1].position = 0.65
    a_elem[1].color = (0.92, 0.92, 0.92, 1)
    links.new(mult.outputs['Value'], ramp_a.inputs['Fac'])
    
    links.new(ramp_col.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.98
    links.new(ramp_a.outputs['Color'], bsdf.inputs['Alpha'])
    
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    plane.data.materials.append(mat)
    
    out_path = os.path.join(OUTPUT_DIR, "blender_dark_smoke.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"💨 Successfully rendered Procedural Dark Smoke: {out_path}")

# ==============================================================================
# 3. RENDER PROCEDURAL MAGMA SCORCH RUNWAY CRATER (1024x1024)
# ==============================================================================
def render_procedural_magma_scorch():
    clear_scene()
    setup_ortho_camera(scale=2.0)
    
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0, 0, 0))
    plane = bpy.context.active_object
    
    mat = bpy.data.materials.new("ProcMagmaScorchMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    out_node = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    
    tex_coord = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Location'].default_value = (-0.5, -0.5, 0)
    links.new(tex_coord.outputs['UV'], mapping.inputs['Vector'])
    
    dist = nodes.new('ShaderNodeVectorMath')
    dist.operation = 'LENGTH'
    links.new(mapping.outputs['Vector'], dist.inputs[0])
    
    # Voronoi Distance to Edge creates procedural magma crack fissures!
    voronoi = nodes.new('ShaderNodeTexVoronoi')
    voronoi.feature = 'DISTANCE_TO_EDGE'
    voronoi.inputs['Scale'].default_value = 8.5
    links.new(mapping.outputs['Vector'], voronoi.inputs['Vector'])
    
    # Invert cracks so edges glow
    crack_ramp = nodes.new('ShaderNodeValToRGB')
    cr_elem = crack_ramp.color_ramp.elements
    cr_elem[0].position = 0.0
    cr_elem[0].color = (1.0, 0.75, 0.1, 1.0) # Molten yellow fissure
    cr_elem[1].position = 0.18
    cr_elem[1].color = (0.015, 0.01, 0.01, 1.0) # Burnt charred rock
    links.new(voronoi.outputs['Distance'], crack_ramp.inputs['Fac'])
    
    # Falloff to circle
    falloff = nodes.new('ShaderNodeMapRange')
    falloff.inputs['From Min'].default_value = 0.10
    falloff.inputs['From Max'].default_value = 0.85
    falloff.inputs['To Min'].default_value = 1.0
    falloff.inputs['To Max'].default_value = 0.0
    links.new(dist.outputs['Value'], falloff.inputs['Value'])
    
    # Alpha
    alpha_math = nodes.new('ShaderNodeMath')
    alpha_math.operation = 'MULTIPLY'
    links.new(falloff.outputs['Result'], alpha_math.inputs[0])
    alpha_math.inputs[1].default_value = 0.95
    
    links.new(crack_ramp.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(crack_ramp.outputs['Color'], bsdf.inputs['Emission Color'])
    bsdf.inputs['Emission Strength'].default_value = 4.0
    bsdf.inputs['Roughness'].default_value = 0.85
    links.new(alpha_math.outputs['Value'], bsdf.inputs['Alpha'])
    
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    plane.data.materials.append(mat)
    
    out_path = os.path.join(OUTPUT_DIR, "blender_magma_scorch.png")
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f"🌋 Successfully rendered Procedural Magma Scorch: {out_path}")

# ==============================================================================
# 4. EXPORT 3D VOLUMETRIC PROCEDURAL FLAME TORNADO MESH (.GLB)
# ==============================================================================
def create_procedural_fire_vortex_glb():
    clear_scene()
    
    mesh = bpy.data.meshes.new(name="IncendioFireMesh")
    obj = bpy.data.objects.new("IncendioFireVortex", mesh)
    bpy.context.collection.objects.link(obj)

    verts = []
    faces = []
    
    num_spirals = 6
    steps = 42
    points_per_ring = 8
    
    for s_idx in range(num_spirals):
        spiral_phase = (s_idx / num_spirals) * math.pi * 2
        start_v = len(verts)
        
        for i in range(steps):
            t = i / (steps - 1)
            # Extends 2.6m along flight vector (-Z in standard camera space)
            z = -t * 2.6
            
            # Swirling radius: expands like an aerodynamic fiery funnel
            radius = 0.06 + (t ** 1.25) * 0.95
            angle = spiral_phase + t * math.pi * 4.5
            
            cx = math.cos(angle) * radius
            cy = math.sin(angle) * radius
            
            # Tube radius tapers at both ends
            tube_r = (0.02 + math.sin(t * math.pi) * 0.12) * (1.0 + math.cos(angle * 3) * 0.15)
            
            for p in range(points_per_ring):
                theta = (p / points_per_ring) * math.pi * 2
                vx = cx + math.cos(theta) * tube_r
                vy = cy + math.sin(theta) * tube_r
                verts.append((vx, vy, z))
                
        for i in range(steps - 1):
            for p in range(points_per_ring):
                p_next = (p + 1) % points_per_ring
                v0 = start_v + i * points_per_ring + p
                v1 = start_v + i * points_per_ring + p_next
                v2 = start_v + (i + 1) * points_per_ring + p_next
                v3 = start_v + (i + 1) * points_per_ring + p
                faces.append((v0, v1, v2, v3))

    mesh.from_pydata(verts, [], faces)
    mesh.update()

    # Material
    mat = bpy.data.materials.new(name="FireVortexMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    out_node = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = (1.0, 0.40, 0.05, 1.0)
    bsdf.inputs['Roughness'].default_value = 0.20
    bsdf.inputs['Emission Color'].default_value = (1.0, 0.70, 0.12, 1.0)
    bsdf.inputs['Emission Strength'].default_value = 8.0
    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
    obj.data.materials.append(mat)
    
    glb_path = os.path.join(OUTPUT_DIR, "incendio_vortex.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_apply=True
    )
    print(f"🌪️ Exported 3D Fire Tornado GLB: {glb_path}")

if __name__ == "__main__":
    print("🚀 Running Blender Procedural VFX Suite for Incendio...")
    render_procedural_fire_spiral()
    render_procedural_dark_smoke()
    render_procedural_magma_scorch()
    create_procedural_fire_vortex_glb()
    print("✨ All Blender Procedural Assets Finished Successfully!")
