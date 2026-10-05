import bpy
import bmesh
import math
import os

# Set up paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, "public", "assets", "dueling")
ARTIFACTS_DIR = "/Users/khang/.gemini/antigravity-ide/brain/5cad2af9-e78d-493c-b03a-264f7410ce41"
FACE_TEX_PATH = os.path.join(ASSETS_DIR, "voldemort_2005_face.png")
CAPE_TEX_PATH = os.path.join(ASSETS_DIR, "voldemort_2005_cape.png")

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # Ensure cycles/eevee settings
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.film_transparent = True

def create_materials():
    mats = {}
    
    # 1. Black ABS Plastic
    mat_black = bpy.data.materials.new(name="Lego_Black_ABS")
    mat_black.use_nodes = True
    bsdf = mat_black.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.015, 0.015, 0.018, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.20
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 0.5
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = 0.5
    mats['black'] = mat_black

    # 2. White Hands
    mat_white = bpy.data.materials.new(name="Lego_White_Hands")
    mat_white.use_nodes = True
    bsdf_w = mat_white.node_tree.nodes.get("Principled BSDF")
    if bsdf_w:
        bsdf_w.inputs['Base Color'].default_value = (0.92, 0.93, 0.95, 1.0)
        bsdf_w.inputs['Roughness'].default_value = 0.22
    mats['white'] = mat_white

    # 3. Glow in the Dark Head with Face Texture
    mat_head = bpy.data.materials.new(name="Lego_Voldemort_Head")
    mat_head.use_nodes = True
    nodes = mat_head.node_tree.nodes
    links = mat_head.node_tree.links
    bsdf_h = nodes.get("Principled BSDF")
    
    # Base skin color: Glow in the dark phosphor green-white
    skin_col = (0.73, 0.79, 0.70, 1.0) # #bac5ad
    
    # Image texture node for face print
    if os.path.exists(FACE_TEX_PATH):
        tex_node = nodes.new('ShaderNodeTexImage')
        tex_node.image = bpy.data.images.load(FACE_TEX_PATH)
        
        # Mix base skin with face texture using Alpha
        mix_rgb = nodes.new('ShaderNodeMix')
        mix_rgb.data_type = 'RGBA'
        mix_rgb.inputs[6].default_value = skin_col # A (Base)
        links.new(tex_node.outputs['Color'], mix_rgb.inputs[7]) # B (Face print)
        links.new(tex_node.outputs['Alpha'], mix_rgb.inputs[0]) # Factor
        
        links.new(mix_rgb.outputs[2], bsdf_h.inputs['Base Color'])
    else:
        bsdf_h.inputs['Base Color'].default_value = skin_col
        
    bsdf_h.inputs['Roughness'].default_value = 0.35
    if 'Emission Color' in bsdf_h.inputs:
        bsdf_h.inputs['Emission Color'].default_value = (0.4, 0.7, 0.45, 1.0)
        bsdf_h.inputs['Emission Strength'].default_value = 0.08
    elif 'Emission' in bsdf_h.inputs:
        bsdf_h.inputs['Emission'].default_value = (0.05, 0.12, 0.06, 1.0)
        
    mats['head'] = mat_head

    # 4. Poncho Shroud Cloak Material
    mat_cape = bpy.data.materials.new(name="Lego_Voldemort_Cloak")
    mat_cape.use_nodes = True
    nodes_c = mat_cape.node_tree.nodes
    links_c = mat_cape.node_tree.links
    bsdf_c = nodes_c.get("Principled BSDF")
    
    if os.path.exists(CAPE_TEX_PATH):
        tex_cape = nodes_c.new('ShaderNodeTexImage')
        tex_cape.image = bpy.data.images.load(CAPE_TEX_PATH)
        links_c.new(tex_cape.outputs['Color'], bsdf_c.inputs['Base Color'])
    else:
        bsdf_c.inputs['Base Color'].default_value = (0.38, 0.40, 0.42, 1.0)
        
    bsdf_c.inputs['Roughness'].default_value = 0.95
    mats['cape'] = mat_cape

    return mats

def build_voldemort_mesh(mats):
    root = bpy.data.objects.new("Lego_Voldemort_2005", None)
    bpy.context.collection.objects.link(root)

    # 1. Hips and Legs
    # Waist Bar
    bpy.ops.mesh.primitive_cylinder_add(radius=0.085, depth=0.38, vertices=24, location=(0, 0, 0.34))
    waist = bpy.context.active_object
    waist.rotation_euler = (0, math.pi/2, 0)
    waist.data.materials.append(mats['black'])
    waist.parent = root

    # Crotch connector box
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.28))
    crotch = bpy.context.active_object
    crotch.scale = (0.12, 0.18, 0.12)
    crotch.data.materials.append(mats['black'])
    crotch.parent = root

    # Left & Right Legs
    for sign in [-1, 1]:
        # Upper Leg hinge
        bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.17, vertices=24, location=(sign * 0.095, 0, 0.34))
        hinge = bpy.context.active_object
        hinge.rotation_euler = (0, math.pi/2, 0)
        hinge.data.materials.append(mats['black'])
        hinge.parent = root

        # Leg block
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign * 0.095, 0, 0.17))
        leg = bpy.context.active_object
        leg.scale = (0.17, 0.20, 0.34)
        leg.data.materials.append(mats['black'])
        leg.parent = root

        # Foot / Toe
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sign * 0.095, 0.135, 0.04))
        toe = bpy.context.active_object
        toe.scale = (0.17, 0.07, 0.08)
        toe.data.materials.append(mats['black'])
        toe.parent = root

    # 2. Torso
    bm = bmesh.new()
    # Authentic trapezoid vertices
    bW = 0.20
    tW = 0.15
    d = 0.11
    h_torso = 0.42
    y_base = 0.34
    
    v0 = bm.verts.new((-bW, -d, y_base))
    v1 = bm.verts.new(( bW, -d, y_base))
    v2 = bm.verts.new(( bW,  d, y_base))
    v3 = bm.verts.new((-bW,  d, y_base))
    
    v4 = bm.verts.new((-tW, -d, y_base + h_torso))
    v5 = bm.verts.new(( tW, -d, y_base + h_torso))
    v6 = bm.verts.new(( tW,  d, y_base + h_torso))
    v7 = bm.verts.new((-tW,  d, y_base + h_torso))
    
    bm.faces.new((v0, v1, v2, v3)) # bottom
    bm.faces.new((v7, v6, v5, v4)) # top
    bm.faces.new((v0, v4, v5, v1)) # front
    bm.faces.new((v2, v6, v7, v3)) # back
    bm.faces.new((v3, v7, v4, v0)) # left
    bm.faces.new((v1, v5, v6, v2)) # right
    
    mesh_torso = bpy.data.meshes.new("TorsoMesh")
    bm.to_mesh(mesh_torso)
    bm.free()
    
    torso_obj = bpy.data.objects.new("Torso", mesh_torso)
    bpy.context.collection.objects.link(torso_obj)
    torso_obj.data.materials.append(mats['black'])
    torso_obj.parent = root

    # Neck Stud
    bpy.ops.mesh.primitive_cylinder_add(radius=0.10, depth=0.08, vertices=32, location=(0, 0, 0.80))
    neck = bpy.context.active_object
    neck.data.materials.append(mats['black'])
    neck.parent = root

    # 3. Authentic 2005 Poncho Shroud Cloak
    # Modeled as draped cloth covering front and back with ragged shredded points
    bm_cloak = bmesh.new()
    
    # Front flap with shredded teeth
    # Collar top: y = 0.12, z = 0.74
    # Shroud hangs down to z = 0.25 in front with 7 jagged teeth
    f_teeth_z = [0.28, 0.22, 0.26, 0.20, 0.25, 0.21, 0.29]
    f_teeth_x = [-0.18, -0.12, -0.06, 0.0, 0.06, 0.12, 0.18]
    
    top_front_verts = []
    for x in f_teeth_x:
        top_front_verts.append(bm_cloak.verts.new((x * 0.85, 0.13, 0.74)))
        
    bot_front_verts = []
    for x, z in zip(f_teeth_x, f_teeth_z):
        bot_front_verts.append(bm_cloak.verts.new((x * 1.15, 0.15, z)))
        
    for i in range(len(f_teeth_x) - 1):
        bm_cloak.faces.new((
            top_front_verts[i], top_front_verts[i+1],
            bot_front_verts[i+1], bot_front_verts[i]
        ))
        
    # Back flap with shredded points hanging past the legs (z = 0.08)
    b_teeth_z = [0.12, 0.06, 0.10, 0.05, 0.09, 0.06, 0.14]
    b_teeth_x = [-0.20, -0.13, -0.07, 0.0, 0.07, 0.13, 0.20]
    
    top_back_verts = []
    for x in b_teeth_x:
        top_back_verts.append(bm_cloak.verts.new((x * 0.85, -0.13, 0.74)))
        
    bot_back_verts = []
    for x, z in zip(b_teeth_x, b_teeth_z):
        bot_back_verts.append(bm_cloak.verts.new((x * 1.25, -0.16, z)))
        
    for i in range(len(b_teeth_x) - 1):
        bm_cloak.faces.new((
            top_back_verts[i+1], top_back_verts[i],
            bot_back_verts[i], bot_back_verts[i+1]
        ))

    # Shoulder bridge connections (leaving arm holes on sides)
    # Left shoulder bridge
    bm_cloak.faces.new((top_front_verts[0], top_back_verts[0], top_back_verts[1], top_front_verts[1]))
    # Right shoulder bridge
    bm_cloak.faces.new((top_front_verts[-2], top_back_verts[-2], top_back_verts[-1], top_front_verts[-1]))

    # Neck collar rim
    bpy.ops.mesh.primitive_torus_add(major_radius=0.115, minor_radius=0.022, major_segments=24, minor_segments=8, location=(0, 0, 0.76))
    collar = bpy.context.active_object
    collar.data.materials.append(mats['cape'])
    collar.parent = root

    mesh_cloak = bpy.data.meshes.new("PonchoCloakMesh")
    bm_cloak.to_mesh(mesh_cloak)
    bm_cloak.free()
    
    # Add solidify modifier for authentic thick cloth feel
    cloak_obj = bpy.data.objects.new("PonchoCloak", mesh_cloak)
    bpy.context.collection.objects.link(cloak_obj)
    cloak_obj.data.materials.append(mats['cape'])
    cloak_obj.parent = root
    
    mod_solid = cloak_obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod_solid.thickness = 0.008

    # 4. Contoured Head
    bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.24, vertices=48, location=(0, 0, 0.94))
    head = bpy.context.active_object
    head.data.materials.append(mats['head'])
    head.parent = root

    # Head top stud
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.06, vertices=32, location=(0, 0, 1.09))
    stud = bpy.context.active_object
    stud.data.materials.append(mats['head'])
    stud.parent = root

    # Unwrap cylinder front for face texture
    # Create UV map for head
    uv_layer = head.data.uv_layers.new(name="UVMap")
    head.data.uv_layers.active = uv_layer
    # Map front facing vertices (+Y in Blender coordinate, since front is +Y)
    # Cylinder faces: map front faces [x: -0.14..0.14, y > 0] to UV [0..1]
    for poly in head.data.polygons:
        # If normal points towards front (+Y)
        if poly.normal.y > 0.1 and abs(poly.normal.z) < 0.2:
            for loop_index in poly.loop_indices:
                v_idx = head.data.loops[loop_index].vertex_index
                v = head.data.vertices[v_idx].co
                u = 0.5 - (v.x / 0.28) # Map x from -0.14..0.14 to 1..0
                v_coord = 0.5 + (v.z - 0.94) / 0.24
                uv_layer.data[loop_index].uv = (u, v_coord)
        else:
            # Map back/top faces outside face area
            for loop_index in poly.loop_indices:
                uv_layer.data[loop_index].uv = (0.01, 0.01)

    # 5. Arms & Hands
    for sign in [-1, 1]:
        # Arm socket ball
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.048, location=(sign * 0.20, 0, 0.70))
        arm_ball = bpy.context.active_object
        arm_ball.data.materials.append(mats['black'])
        arm_ball.parent = root

        # Arm tube
        is_right = (sign < 0) # Right arm (wand arm in duel stance)
        arm_angle_x = math.radians(-75) if is_right else math.radians(20)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.26, vertices=20, location=(sign * 0.21, -0.06 if is_right else 0.03, 0.58 if is_right else 0.56))
        arm = bpy.context.active_object
        arm.rotation_euler = (arm_angle_x, 0, sign * math.radians(-10))
        arm.data.materials.append(mats['black'])
        arm.parent = root

        # Hand (C-shape torus)
        hand_y = -0.18 if is_right else 0.08
        hand_z = 0.48 if is_right else 0.42
        bpy.ops.mesh.primitive_torus_add(major_radius=0.042, minor_radius=0.018, major_segments=24, minor_segments=16, location=(sign * 0.21, hand_y, hand_z))
        hand = bpy.context.active_object
        hand.rotation_euler = (math.pi/2, 0, 0 if is_right else math.pi)
        hand.data.materials.append(mats['white']) # PURE WHITE HANDS (2005)
        hand.parent = root

        # Wand held in Right Hand
        if is_right:
            bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.36, vertices=16, location=(sign * 0.21, hand_y - 0.16, hand_z + 0.04))
            wand = bpy.context.active_object
            wand.rotation_euler = (math.radians(-78), 0, 0)
            wand.data.materials.append(mats['black'])
            wand.parent = root

    return root

def setup_lighting_and_camera():
    # Camera
    cam_data = bpy.data.cameras.new("ShowcaseCam")
    cam_data.lens = 65 # Portrait focal length
    cam_obj = bpy.data.objects.new("ShowcaseCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    
    # Front 3/4 dramatic dueling angle
    cam_obj.location = (0.75, -1.85, 0.72)
    cam_obj.rotation_euler = (math.radians(82), 0, math.radians(22))
    bpy.context.scene.camera = cam_obj

    # Key light: Cold greenish-white moonlight / dueling flash
    light1_data = bpy.data.lights.new(name="KeyLight", type='POINT')
    light1_data.energy = 85
    light1_data.color = (0.85, 0.95, 0.90)
    light1 = bpy.data.objects.new("KeyLight", light1_data)
    light1.location = (1.2, -1.2, 1.4)
    bpy.context.collection.objects.link(light1)

    # Rim light: Eerie emerald back-glow (Avada Kedavra vibe)
    light2_data = bpy.data.lights.new(name="RimLight", type='POINT')
    light2_data.energy = 120
    light2_data.color = (0.1, 0.95, 0.4)
    light2 = bpy.data.objects.new("RimLight", light2_data)
    light2.location = (-1.0, 1.2, 1.2)
    bpy.context.collection.objects.link(light2)

    # Fill light: Subtle dark stone bounce
    light3_data = bpy.data.lights.new(name="FillLight", type='POINT')
    light3_data.energy = 25
    light3_data.color = (0.5, 0.55, 0.6)
    light3 = bpy.data.objects.new("FillLight", light3_data)
    light3.location = (-0.8, -1.0, 0.3)
    bpy.context.collection.objects.link(light3)

def export_glb():
    glb_path = os.path.join(ASSETS_DIR, "voldemort_2005.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    print(f"Exported GLB to {glb_path}")

def render_showcase(output_path):
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    print(f"Rendered showcase image to {output_path}")

def main():
    reset_scene()
    mats = create_materials()
    build_voldemort_mesh(mats)
    setup_lighting_and_camera()
    
    # 1. Render 3/4 showcase image
    showcase_path = os.path.join(ARTIFACTS_DIR, "voldemort_2005_blender_render.png")
    render_showcase(showcase_path)
    
    # 2. Render front orthographic view matching Sketchfab reference
    cam = bpy.context.scene.camera
    cam.location = (0, -2.1, 0.65)
    cam.rotation_euler = (math.radians(90), 0, 0)
    cam.data.lens = 75
    front_path = os.path.join(ARTIFACTS_DIR, "voldemort_2005_blender_front.png")
    render_showcase(front_path)

    # 3. Export GLB
    export_glb()

if __name__ == "__main__":
    main()
