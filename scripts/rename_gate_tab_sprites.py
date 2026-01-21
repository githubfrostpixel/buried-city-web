#!/usr/bin/env python3
"""
Rename gate icon_tab sprite files from numeric IDs to new item keys
Example: icon_tab_content_1301011.png -> icon_tab_content_item_weapon_gun_pistol.png
         icon_tab_1301011.png -> icon_tab_item_weapon_gun_pistol.png
"""

import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Read the item mapping
mapping_file = os.path.join(project_root, 'scripts', 'item_mapping.ts')
sprite_dir = os.path.join(project_root, 'public', 'assets', 'sprites', 'gate')

# Parse the mapping from TypeScript file
item_id_to_key = {}
with open(mapping_file, 'r', encoding='utf-8') as f:
    content = f.read()
    # Extract the mapping object
    match = re.search(r'export const ITEM_ID_TO_KEY: Record<string, string> = \{([^}]+)\}', content, re.DOTALL)
    if match:
        mapping_content = match.group(1)
        # Parse each line: "1101011": "item_mat_wood",
        for line in mapping_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('//'):
                continue
            # Match: "1101011": "item_mat_wood",
            match_line = re.match(r'"(\d+)":\s*"([^"]+)"', line)
            if match_line:
                old_id = match_line.group(1)
                new_key = match_line.group(2)
                item_id_to_key[old_id] = new_key

print(f'Found {len(item_id_to_key)} item mappings')

# Get all icon_tab sprite files
if not os.path.exists(sprite_dir):
    print(f'Error: Sprite directory not found: {sprite_dir}')
    exit(1)

sprite_files = [f for f in os.listdir(sprite_dir) if f.startswith('icon_tab') and f.endswith('.png')]
print(f'Found {len(sprite_files)} icon_tab sprite files')

# Rename files
renamed_count = 0
not_found_count = 0
skipped_count = 0

for filename in sprite_files:
    # Extract numeric ID from filename patterns:
    # icon_tab_content_1301011.png -> 1301011
    # icon_tab_1301011.png -> 1301011
    match = re.match(r'icon_tab(_content)?_(\d+)\.png', filename)
    if not match:
        # Check if it's already using new format or is a special file
        if 'item_' in filename or filename in ['icon_tab_content_hand.png', 'icon_tab_weapon.png', 'icon_tab_tool.png', 'icon_tab_equip.png', 'icon_tab_gun.png']:
            print(f'Skipping {filename} (already renamed or special file)')
            skipped_count += 1
            continue
        print(f'Skipping {filename} (does not match pattern)')
        continue
    
    prefix = match.group(1) or ''  # '_content' or ''
    old_id = match.group(2)
    
    if old_id in item_id_to_key:
        new_key = item_id_to_key[old_id]
        new_filename = f'icon_tab{prefix}_{new_key}.png'
        old_path = os.path.join(sprite_dir, filename)
        new_path = os.path.join(sprite_dir, new_filename)
        
        if os.path.exists(new_path):
            print(f'Warning: {new_filename} already exists, skipping {filename}')
            skipped_count += 1
            continue
        
        os.rename(old_path, new_path)
        print(f'Renamed: {filename} -> {new_filename}')
        renamed_count += 1
    else:
        print(f'Warning: No mapping found for ID {old_id} in {filename}')
        not_found_count += 1

print(f'\nDone! Renamed {renamed_count} files.')
if skipped_count > 0:
    print(f'Skipped {skipped_count} files (already renamed or special)')
if not_found_count > 0:
    print(f'Warning: {not_found_count} files could not be renamed (no mapping found)')

