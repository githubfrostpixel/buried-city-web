#!/usr/bin/env python3
"""
Convert numeric formula IDs in buildings.ts produceList to strings
This ensures consistency since all formula IDs in formulas.ts are strings
"""

import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

file_path = os.path.join(project_root, 'src/core/data/buildings.ts')

if not os.path.exists(file_path):
    print(f'File not found: {file_path}')
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

original_content = content
updated_count = 0

# Pattern to match produceList arrays with numeric IDs
# Match: produceList: [1402021, 1402011, ...]
# But don't match if already has strings: produceList: ["item_...", ...]

# Find all produceList arrays
pattern = r'produceList:\s*\[([^\]]+)\]'

def convert_numeric_ids(match):
    array_content = match.group(1)
    
    # Check if array already contains strings (quoted items)
    if '"' in array_content or "'" in array_content:
        # Already has strings, but might have mixed numbers
        # Convert standalone numbers to strings
        def convert_number(m):
            num = m.group(0)
            # Make sure it's not part of a larger number or already quoted
            return f'"{num}"'
        
        # Match standalone numbers (not already quoted)
        # Pattern: number followed by comma or end of string
        converted = re.sub(r'\b(\d{7})\b(?=\s*[,]|\s*$)', r'"\1"', array_content)
        return f'produceList: [{converted}]'
    else:
        # All numbers, convert all to strings
        # Split by comma, convert each number to quoted string
        items = [item.strip() for item in array_content.split(',') if item.strip()]
        converted_items = [f'"{item}"' if item.isdigit() else item for item in items]
        return f'produceList: [{", ".join(converted_items)}]'

# Replace all produceList arrays
content = re.sub(pattern, convert_numeric_ids, content)

if content != original_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # Count changes
    original_matches = re.findall(r'produceList:\s*\[([^\]]+)\]', original_content)
    new_matches = re.findall(r'produceList:\s*\[([^\]]+)\]', content)
    
    for i, (orig, new) in enumerate(zip(original_matches, new_matches)):
        if orig != new:
            updated_count += 1
            print(f'Updated produceList {i+1}: {orig[:50]}... -> {new[:50]}...')
    
    print(f'\nUpdated {updated_count} produceList arrays')
else:
    print('No changes needed')

print('Done!')

