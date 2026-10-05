import bpy
import os
import json

GLB_DIR = os.path.abspath("public/assets/dueling")
models = [
    "lego_harry_potter_harry_potter2019-1st_task.glb",
    "lego_harry_potter_voldemort_2005.glb",
    "lego_harry_potter_professor_lupin_2004.glb",
    "lego_harry_potter_mad-eye_moody_2018.glb",
    "lego_harry_potter_tom_riddle_classic.glb",
    "lego_harry_potter_death_eater_2019.glb",
]

report = {}

for m in models:
    file_path = os.path.join(GLB_DIR, m)
    if not os.path.exists(file_path):
        continue

    # Reset scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # Import GLB
    bpy.ops.import_scene.gltf(filepath=file_path)
    
    model_info = {
        "file": m,
        "objects": [],
        "materials": [],
        "textures": []
    }
    
    for obj in bpy.context.scene.objects:
        obj_data = {
            "name": obj.name,
            "type": obj.type,
            "parent": obj.parent.name if obj.parent else None,
            "location": list(obj.location),
            "rotation": list(obj.rotation_euler),
            "scale": list(obj.scale),
            "dimensions": list(obj.dimensions),
        }
        
        if obj.type == 'MESH':
            mesh = obj.data
            obj_data["vertices"] = len(mesh.vertices)
            obj_data["polygons"] = len(mesh.polygons)
            obj_data["materials"] = [slot.material.name for slot in obj.material_slots if slot.material]
            obj_data["uv_layers"] = [uv.name for uv in mesh.uv_layers]
            
            # Bounding box
            bbox = [list(corner) for corner in obj.bound_box]
            obj_data["bbox_min"] = [min(corner[i] for corner in bbox) for i in range(3)]
            obj_data["bbox_max"] = [max(corner[i] for corner in bbox) for i in range(3)]
            
        model_info["objects"].append(obj_data)
        
    for mat in bpy.data.materials:
        mat_info = {
            "name": mat.name,
            "use_nodes": mat.use_nodes,
            "textures": []
        }
        if mat.use_nodes and mat.node_tree:
            for node in mat.node_tree.nodes:
                if node.type == 'TEX_IMAGE' and node.image:
                    img = node.image
                    mat_info["textures"].append({
                        "name": img.name,
                        "size": list(img.size),
                        "channels": img.channels,
                        "filepath": img.filepath
                    })
                    # Save a sample image if not yet saved
                    tex_dir = os.path.abspath("scripts/extracted_textures")
                    os.makedirs(tex_dir, exist_ok=True)
                    clean_name = f"{m.replace('.glb','')}_{mat.name}_{img.name}.png".replace("/", "_")
                    save_path = os.path.join(tex_dir, clean_name)
                    if not os.path.exists(save_path):
                        try:
                            img.save_render(save_path)
                        except Exception as e:
                            pass
                elif node.type == 'BSDF_PRINCIPLED':
                    # Extract principled inputs
                    base_color = list(node.inputs['Base Color'].default_value) if 'Base Color' in node.inputs else None
                    roughness = node.inputs['Roughness'].default_value if 'Roughness' in node.inputs else None
                    metallic = node.inputs['Metallic'].default_value if 'Metallic' in node.inputs else None
                    mat_info["principled"] = {
                        "base_color": base_color,
                        "roughness": roughness,
                        "metallic": metallic
                    }
        model_info["materials"].append(mat_info)
        
    report[m] = model_info

with open("scripts/glb_architecture_report.json", "w") as f:
    json.dump(report, f, indent=2)

print("Study completed! Saved report to scripts/glb_architecture_report.json")
