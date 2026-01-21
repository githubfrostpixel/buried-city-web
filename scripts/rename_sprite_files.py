#!/usr/bin/env python3
"""
Rename sprite files from numeric IDs to readable keys
Renames files in public/assets/sprites/icon/ from icon_item_1101011.png to icon_item_mat_wood.png
"""

import json
import os
import shutil
from pathlib import Path

# Load the mapping
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
mapping_path = os.path.join(project_root, "item_id_mapping.json")

with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)
    id_to_key = mapping_data['id_to_key']

# Sprite directories to process
sprite_dirs = [
    os.path.join(project_root, "public", "assets", "sprites", "icon"),
    os.path.join(project_root, "public", "assets", "sprites", "new"),
    os.path.join(project_root, "public", "assets", "sprites", "new_temp"),
]

renamed_count = 0
not_found_count = 0

for sprite_dir in sprite_dirs:
    if not os.path.exists(sprite_dir):
        print(f"Skipping {sprite_dir} (does not exist)")
        continue
    
    print(f"\nProcessing {sprite_dir}...")
    
    for old_id, new_key in id_to_key.items():
        old_filename = f"icon_item_{old_id}.png"
        # new_key already includes "item_" prefix, so just use it directly
        new_filename = f"icon_{new_key}.png"
        
        old_path = os.path.join(sprite_dir, old_filename)
        new_path = os.path.join(sprite_dir, new_filename)
        
        if os.path.exists(old_path):
            try:
                shutil.move(old_path, new_path)
                print(f"  Renamed: {old_filename} -> {new_filename}")
                renamed_count += 1
            except Exception as e:
                print(f"  Error renaming {old_filename}: {e}")
        else:
            # Check if new filename already exists (might have been renamed manually)
            if os.path.exists(new_path):
                print(f"  Already exists: {new_filename}")
            else:
                not_found_count += 1

print(f"\nSummary:")
print(f"  Renamed: {renamed_count} files")
print(f"  Not found: {not_found_count} files")
print(f"\nNote: Some sprite files may not exist for all items.")

