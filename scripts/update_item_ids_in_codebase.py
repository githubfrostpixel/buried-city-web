#!/usr/bin/env python3
"""
Update all hardcoded numeric item IDs in the codebase to use new readable keys
"""

import json
import os
import re
from pathlib import Path

# Load the mapping
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
mapping_path = os.path.join(project_root, "item_id_mapping.json")

with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)
    id_to_key = mapping_data['id_to_key']

# Files to process (TypeScript/TSX files)
src_dir = os.path.join(project_root, "src")
ts_files = []
for root, dirs, files in os.walk(src_dir):
    # Skip node_modules and other irrelevant directories
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            ts_files.append(os.path.join(root, file))

print(f"Found {len(ts_files)} TypeScript files to process")

# Sort IDs by length (longest first) to avoid partial replacements
sorted_ids = sorted(id_to_key.items(), key=lambda x: len(x[0]), reverse=True)

total_replacements = 0
files_modified = []

for file_path in ts_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        file_replacements = 0
        
        # Replace all occurrences of numeric IDs with new keys
        for old_id, new_key in sorted_ids:
            # Pattern: quoted string (single or double quotes)
            patterns = [
                (rf"'{old_id}'", f"'{new_key}'"),
                (rf'"{old_id}"', f'"{new_key}"'),
                (rf'\b{old_id}\b', new_key),  # Word boundary for unquoted
            ]
            
            for pattern, replacement in patterns:
                matches = len(re.findall(pattern, content))
                if matches > 0:
                    content = re.sub(pattern, replacement, content)
                    file_replacements += matches
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            files_modified.append(file_path)
            total_replacements += file_replacements
            print(f"  Updated {file_path}: {file_replacements} replacements")
    
    except Exception as e:
        print(f"  Error processing {file_path}: {e}")

print(f"\nTotal: {len(files_modified)} files modified, {total_replacements} replacements")

