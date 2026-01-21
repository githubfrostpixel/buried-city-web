#!/usr/bin/env python3
"""
Rename dig_item sprite files from numeric IDs to new item keys
Example: dig_item_1101021.png -> dig_item_item_mat_metal.png
"""

import os
import re
import json

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Read the item mapping
mapping_file = os.path.join(project_root, 'scripts', 'item_mapping.ts')
sprite_dir = os.path.join(project_root, 'public', 'assets', 'sprites', 'dig_item')

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

# Get all dig_item sprite files
if not os.path.exists(sprite_dir):
    print(f'Error: Sprite directory not found: {sprite_dir}')
    exit(1)

sprite_files = [f for f in os.listdir(sprite_dir) if f.startswith('dig_item_') and f.endswith('.png')]
print(f'Found {len(sprite_files)} dig_item sprite files')

# Rename files
renamed_count = 0
not_found_count = 0

for filename in sprite_files:
    # Extract numeric ID from filename: dig_item_1101021.png -> 1101021
    match = re.match(r'dig_item_(\d+)\.png', filename)
    if not match:
        print(f'Skipping {filename} (does not match pattern)')
        continue
    
    old_id = match.group(1)
    
    if old_id in item_id_to_key:
        new_key = item_id_to_key[old_id]
        new_filename = f'dig_item_{new_key}.png'
        old_path = os.path.join(sprite_dir, filename)
        new_path = os.path.join(sprite_dir, new_filename)
        
        if os.path.exists(new_path):
            print(f'Warning: {new_filename} already exists, skipping {filename}')
            continue
        
        os.rename(old_path, new_path)
        print(f'Renamed: {filename} -> {new_filename}')
        renamed_count += 1
    else:
        print(f'Warning: No mapping found for ID {old_id} in {filename}')
        not_found_count += 1

print(f'\nDone! Renamed {renamed_count} files.')
if not_found_count > 0:
    print(f'Warning: {not_found_count} files could not be renamed (no mapping found)')

