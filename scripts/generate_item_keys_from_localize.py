#!/usr/bin/env python3
"""
Generate meaningful item keys from localization file
Uses actual item titles from en.json to create item_{category}_{name} keys
"""

import json
import re
import os

# Category mapping based on item type structure
CATEGORY_MAP = {
    "11": {
        "01": "mat",      # Materials
        "02": "model",    # Models/Parts
        "03": "food",     # Food
        "04": "med",      # Medicine
        "05": "econ",     # Economy
        "06": "special",  # Specific items
        "07": "buff",     # Buff items
    },
    "13": {
        "01": "weapon_gun",      # Guns
        "02": "weapon_melee",    # Melee weapons/tools
        "03": "weapon_explosive", # Explosives
        "04": "armor",            # Armor
        "05": "ammo",             # Ammunition/Equipment
        "06": "equip_other",      # Other equipment
    }
}

def title_to_key(title: str) -> str:
    """Convert item title to snake_case key"""
    # Remove special characters, convert to lowercase
    key = re.sub(r'[^\w\s]', '', title.lower())
    # Replace spaces and multiple underscores with single underscore
    key = re.sub(r'[\s_]+', '_', key)
    # Remove leading/trailing underscores
    key = key.strip('_')
    return key

def get_category(item_id: str) -> str:
    """Get category prefix for item ID"""
    main_type = item_id[:2]
    sub_type = item_id[2:4]
    
    if main_type in CATEGORY_MAP:
        if sub_type in CATEGORY_MAP[main_type]:
            return CATEGORY_MAP[main_type][sub_type]
    
    # Fallback
    if main_type == "11":
        return "mat"
    elif main_type == "13":
        return "equip"
    else:
        return "unknown"

def generate_item_key(item_id: str, title: str) -> str:
    """Generate item key from ID and title"""
    category = get_category(item_id)
    name = title_to_key(title)
    return f"item_{category}_{name}"

def main():
    # Read localization file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    json_path = os.path.join(project_root, "src", "core", "data", "strings", "en.json")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        strings = json.load(f)
    
    # Generate mapping
    mapping = {}
    reverse_mapping = {}
    
    # Process all item IDs (7-digit numeric strings)
    for key, value in strings.items():
        if isinstance(key, str) and key.isdigit() and len(key) == 7:
            if isinstance(value, dict) and 'title' in value:
                item_id = key
                title = value['title']
                new_key = generate_item_key(item_id, title)
                mapping[item_id] = new_key
                reverse_mapping[new_key] = item_id
    
    # Print mapping
    print("Item ID to Key Mapping")
    print("=" * 80)
    for old_id in sorted(mapping.keys()):
        new_key = mapping[old_id]
        title = strings[old_id]['title']
        print(f"{old_id} -> {new_key:50s} ({title})")
    
    # Save to JSON
    output_path = os.path.join(project_root, "item_id_mapping.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'id_to_key': mapping,
            'key_to_id': reverse_mapping
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nGenerated {len(mapping)} mappings")
    print(f"Saved to {output_path}")
    
    # Also create a TypeScript-friendly export
    ts_output_path = os.path.join(project_root, "scripts", "item_mapping.ts")
    with open(ts_output_path, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated item ID to key mapping\n")
        f.write("// Generated from localization file\n\n")
        f.write("export const ITEM_ID_TO_KEY: Record<string, string> = {\n")
        for old_id in sorted(mapping.keys()):
            new_key = mapping[old_id]
            f.write(f'  "{old_id}": "{new_key}",\n')
        f.write("} as const\n\n")
        
        f.write("export const ITEM_KEY_TO_ID: Record<string, string> = {\n")
        for new_key in sorted(reverse_mapping.keys()):
            old_id = reverse_mapping[new_key]
            f.write(f'  "{new_key}": "{old_id}",\n')
        f.write("} as const\n")

if __name__ == "__main__":
    main()

