#!/usr/bin/env python3
"""
Refactor items.ts to use readable keys instead of numeric IDs
"""

import json
import re
import os

# Load the mapping
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
mapping_path = os.path.join(project_root, "item_id_mapping.json")

with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)
    id_to_key = mapping_data['id_to_key']

# Read items.ts
items_ts_path = os.path.join(project_root, "src", "core", "data", "items.ts")
with open(items_ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace expireRate keys
expire_rate_pattern = r'export const expireRate: ExpireRate = \{([^}]+)\} as const'
expire_match = re.search(expire_rate_pattern, content)
if expire_match:
    expire_content = expire_match.group(1)
    for old_id, new_key in id_to_key.items():
        if old_id in expire_content:
            expire_content = expire_content.replace(f'"{old_id}"', f'"{new_key}"')
    content = content.replace(expire_match.group(0), 
                              f'export const expireRate: ExpireRate = {{{expire_content}}} as const')

# Replace fertilizerRate keys
fertilizer_rate_pattern = r'export const fertilizerRate: FertilizerRate = \{([^}]+)\} as const'
fertilizer_match = re.search(fertilizer_rate_pattern, content)
if fertilizer_match:
    fertilizer_content = fertilizer_match.group(1)
    for old_id, new_key in id_to_key.items():
        if old_id in fertilizer_content:
            fertilizer_content = fertilizer_content.replace(f'"{old_id}"', f'"{new_key}"')
    content = content.replace(fertilizer_match.group(0),
                             f'export const fertilizerRate: FertilizerRate = {{{fertilizer_content}}} as const')

# Replace itemConfig keys and id fields
# Pattern: "1101011": { "id": "1101011", ... }
for old_id, new_key in sorted(id_to_key.items(), key=lambda x: len(x[0]), reverse=True):
    # Replace the key in itemConfig
    key_pattern = rf'"{old_id}":\s*\{{'
    key_replacement = f'"{new_key}": {{'
    content = re.sub(key_pattern, key_replacement, content)
    
    # Replace "id" field inside the config object
    # Match: "id": "1101011" (with proper context)
    id_pattern = rf'(\s+)"id":\s*"{old_id}"'
    id_replacement = rf'\1"id": "{new_key}"'
    content = re.sub(id_pattern, id_replacement, content)
    
    # Replace id in nested effect objects (effect_food, effect_medicine, etc.)
    effect_id_pattern = rf'(\s+)"id":\s*"{old_id}"'
    content = re.sub(effect_id_pattern, id_replacement, content)

# Write back
with open(items_ts_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Refactored {items_ts_path}")
print(f"Replaced {len(id_to_key)} item keys")

