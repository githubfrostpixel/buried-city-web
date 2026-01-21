#!/usr/bin/env python3
"""
Update wildcard patterns in data files from old numeric patterns to new string patterns
Old: "1101**" -> New: "item_mat_*"
Old: "1102**" -> New: "item_model_*"
Old: "1103*1" -> New: "item_food_*"
Old: "1105**" -> New: "item_econ_*"
Old: "1301**" -> New: "item_weapon_gun_*"
Old: "1302*1" -> New: "item_weapon_melee_*"
"""

import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Mapping from old patterns to new patterns
pattern_map = {
    '1101**': 'item_mat_*',
    '1101*1': 'item_mat_*',     # Materials (same as 1101**)
    '1102**': 'item_model_*',
    '1103*1': 'item_food_*',
    '1104*1': 'item_med_*',      # Medicines
    '1105**': 'item_econ_*',
    '1301**': 'item_weapon_gun_*',
    '1302*1': 'item_weapon_melee_*',
}

# Files to update
files_to_update = [
    'src/core/data/sites.ts',
    'src/core/data/npcs.ts',
    'src/core/data/secretRooms.ts',
]

for file_path in files_to_update:
    full_path = os.path.join(project_root, file_path)
    if not os.path.exists(full_path):
        print(f'Skipping {file_path} (not found)')
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    updated_count = 0
    
    # Replace each pattern
    for old_pattern, new_pattern in pattern_map.items():
        # Match: itemId: "1101**" or itemId: "1101**", or "itemId": "1101**"
        pattern1 = rf'itemId:\s*"{re.escape(old_pattern)}"'
        pattern2 = rf'"itemId":\s*"{re.escape(old_pattern)}"'
        replacement1 = f'itemId: "{new_pattern}"'
        replacement2 = f'"itemId": "{new_pattern}"'
        
        matches1 = re.findall(pattern1, content)
        matches2 = re.findall(pattern2, content)
        
        if matches1:
            content = re.sub(pattern1, replacement1, content)
            updated_count += len(matches1)
            print(f'{file_path}: Replaced {len(matches1)} occurrences of {old_pattern} -> {new_pattern} (format 1)')
        
        if matches2:
            content = re.sub(pattern2, replacement2, content)
            updated_count += len(matches2)
            print(f'{file_path}: Replaced {len(matches2)} occurrences of {old_pattern} -> {new_pattern} (format 2)')
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'{file_path}: Updated {updated_count} wildcard patterns')
    else:
        print(f'{file_path}: No changes needed')

print('Done!')

