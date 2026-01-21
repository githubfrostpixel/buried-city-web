#!/usr/bin/env python3
"""
Update localization file to include new item keys alongside old numeric IDs
This allows getString() to work with both old and new item IDs
"""

import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Read the item mapping
mapping_file = os.path.join(project_root, 'scripts', 'item_mapping.ts')
localization_file = os.path.join(project_root, 'src', 'core', 'data', 'strings', 'en.json')

# Parse the mapping from TypeScript file
item_id_to_key = {}
with open(mapping_file, 'r', encoding='utf-8') as f:
    content = f.read()
    # Extract the mapping object
    import re
    # Find the ITEM_ID_TO_KEY object
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

# Read the localization file
with open(localization_file, 'r', encoding='utf-8') as f:
    localization = json.load(f)

# Add new item keys with the same content as old IDs
added_count = 0
for old_id, new_key in item_id_to_key.items():
    if old_id in localization:
        # Copy the content from old ID to new key
        if new_key not in localization:
            localization[new_key] = localization[old_id].copy()
            added_count += 1
        else:
            print(f'Warning: {new_key} already exists in localization')
    else:
        print(f'Warning: Old ID {old_id} not found in localization')

print(f'Added {added_count} new item keys to localization')

# Write back
with open(localization_file, 'w', encoding='utf-8') as f:
    json.dump(localization, f, indent=2, ensure_ascii=False)

print('Localization file updated!')

