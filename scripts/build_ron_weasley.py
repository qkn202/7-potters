import bpy
import os

BASE_GLB = os.path.abspath("public/assets/dueling/lego_harry_potter_professor_lupin_2004.glb")
TEXTURE_DIR = os.path.abspath("scripts/ron_textures")
OUTPUT_GLB = os.path.abspath("public/assets/dueling/lego_harry_potter_ron_weasley.glb")

# 1. Reset scene & import base model
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=BASE_GLB)

# 2. Remove Lupin's accessory chest patches / collar 3D relief meshes
for name in ['Object_9', 'Object_12', 'Object_13']:
    if name in bpy.data.objects:
        obj = bpy.data.objects[name]
        bpy.data.objects.remove(obj, do_unlink=True)

# 3. Helper to create PBR material with Principled BSDF
def create_pbr_material(name, base_color=None, texture_path=None, roughness=0.3, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # Output node
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_out.location = (300, 0)

    # Principled BSDF node
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.location = (0, 0)
    links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])

    # Set parameters
    if 'Roughness' in node_bsdf.inputs:
        node_bsdf.inputs['Roughness'].default_value = roughness
    if 'Metallic' in node_bsdf.inputs:
        node_bsdf.inputs['Metallic'].default_value = metallic

    if texture_path and os.path.exists(texture_path):
        tex_node = nodes.new(type='ShaderNodeTexImage')
        tex_node.location = (-350, 0)
        img = bpy.data.images.load(texture_path)
        tex_node.image = img
        links.new(tex_node.outputs['Color'], node_bsdf.inputs['Base Color'])
    elif base_color:
        if 'Base Color' in node_bsdf.inputs:
            node_bsdf.inputs['Base Color'].default_value = base_color

    return mat

def assign_mat(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)

# 4. Create Ron materials
# Ginger-orange hair (Lego Dark Orange / Reddish Orange ABS plastic)
# sRGB: (200, 75, 18) -> Linear: (0.578, 0.068, 0.007, 1.0)
mat_hair = create_pbr_material("Ron_Hair", base_color=(0.578, 0.068, 0.007, 1.0), roughness=0.28, metallic=0.0)

# Head with freckled face decal
mat_head = create_pbr_material(
    "Ron_Head",
    texture_path=os.path.join(TEXTURE_DIR, "ron_face_decal.png"),
    roughness=0.25,
    metallic=0.0
)

# Torso front with Gryffindor sweater, tie & lion badge decal
mat_torso = create_pbr_material(
    "Ron_Torso",
    texture_path=os.path.join(TEXTURE_DIR, "ron_torso_front.png"),
    roughness=0.28,
    metallic=0.0
)

# Torso back with knit texture
mat_torso_back = create_pbr_material(
    "Ron_Torso_Back",
    texture_path=os.path.join(TEXTURE_DIR, "ron_torso_back.png"),
    roughness=0.28,
    metallic=0.0
)

# Arms (charcoal sweater sleeves: sRGB (45, 45, 52) -> Linear (0.026, 0.026, 0.035, 1.0))
mat_arms = create_pbr_material("Ron_Arms", base_color=(0.026, 0.026, 0.035, 1.0), roughness=0.30, metallic=0.0)

# Hands (Light Nougat skin: sRGB (242, 190, 155) -> Linear (0.888, 0.518, 0.332, 1.0))
mat_hands = create_pbr_material("Ron_Hands", base_color=(0.888, 0.518, 0.332, 1.0), roughness=0.25, metallic=0.0)

# Trousers (Legs & Hips: sRGB (30, 30, 36) -> Linear (0.012, 0.012, 0.017, 1.0))
mat_trousers = create_pbr_material("Ron_Trousers", base_color=(0.012, 0.012, 0.017, 1.0), roughness=0.30, metallic=0.0)

# Cape (Matte woven fabric: sRGB (22, 22, 26) -> Linear (0.006, 0.006, 0.008, 1.0))
mat_cape = create_pbr_material("Ron_Cape", base_color=(0.006, 0.006, 0.008, 1.0), roughness=0.92, metallic=0.0)

# 5. Assign materials to target meshes
assign_mat(bpy.data.objects['Object_3'], mat_hair)       # Hair
assign_mat(bpy.data.objects['Object_8'], mat_head)       # Head
assign_mat(bpy.data.objects['Object_7'], mat_torso)      # Torso
assign_mat(bpy.data.objects['Object_10'], mat_torso_back)# Torso Back
assign_mat(bpy.data.objects['Object_2'], mat_arms)       # Arms
assign_mat(bpy.data.objects['Object_4'], mat_hands)      # Hands
assign_mat(bpy.data.objects['Object_6'], mat_trousers)   # Hips
assign_mat(bpy.data.objects['Object_11'], mat_trousers)  # Legs
assign_mat(bpy.data.objects['Object_5'], mat_cape)       # Cape

# Rename hierarchy node if present
for obj in bpy.context.scene.objects:
    if 'cleaner.materialmerger.gles' in obj.name:
        obj.name = "Ron Weasley.obj.cleaner.materialmerger.gles"

# 6. Render studio preview test
cam_data = bpy.data.cameras.new('StudioCam')
cam_obj = bpy.data.objects.new('StudioCam', cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
# Position camera in front of Ron
cam_obj.location = (0, -0.62, -0.22)
cam_obj.rotation_euler = (1.5708, 0, 0)

# Three-point studio lighting
# Key light
light_key_data = bpy.data.lights.new('KeyLight', type='SUN')
light_key_data.energy = 4.0
light_key_obj = bpy.data.objects.new('KeyLight', light_key_data)
bpy.context.scene.collection.objects.link(light_key_obj)
light_key_obj.location = (0.6, -1.0, 0.8)

# Fill light
light_fill_data = bpy.data.lights.new('FillLight', type='SUN')
light_fill_data.energy = 2.0
light_fill_obj = bpy.data.objects.new('FillLight', light_fill_data)
bpy.context.scene.collection.objects.link(light_fill_obj)
light_fill_obj.location = (-0.6, -1.0, 0.2)

# Warm rim light for hair
light_rim_data = bpy.data.lights.new('RimLight', type='SUN')
light_rim_data.energy = 3.0
light_rim_obj = bpy.data.objects.new('RimLight', light_rim_data)
bpy.context.scene.collection.objects.link(light_rim_obj)
light_rim_obj.location = (0.0, 1.0, 0.8)

bpy.context.scene.render.resolution_x = 512
bpy.context.scene.render.resolution_y = 512
preview_render_path = os.path.abspath("scripts/ron_studio_preview.png")
bpy.context.scene.render.filepath = preview_render_path
bpy.ops.render.render(write_still=True)
print(f"Rendered preview: {preview_render_path}")

# Remove camera and lights before glTF export to keep model clean
bpy.data.objects.remove(cam_obj, do_unlink=True)
bpy.data.objects.remove(light_key_obj, do_unlink=True)
bpy.data.objects.remove(light_fill_obj, do_unlink=True)
bpy.data.objects.remove(light_rim_obj, do_unlink=True)

# 7. Export GLB
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_GLB,
    export_format='GLB',
    export_image_format='AUTO',
    export_materials='EXPORT',
    export_apply=False
)
print(f"Exported Ron Weasley GLB: {OUTPUT_GLB}")
