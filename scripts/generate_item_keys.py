#!/usr/bin/env python3
"""
Generate meaningful item keys from numeric IDs
Creates mapping: old_id -> item_{category}_{name}
"""

import json
import re

# Category mapping based on item type structure
# First 2 digits: main category, next 2 digits: subcategory
CATEGORY_MAP = {
    "11": {
        "01": "mat",  # Materials
        "02": "model",  # Models
        "03": "food",  # Food
        "04": "med",  # Medicine
        "05": "econ",  # Economy
        "06": "special",  # Specific items
        "07": "buff",  # Buff items
    },
    "13": {
        "01": "weapon_gun",  # Guns
        "02": "weapon_melee",  # Melee weapons/tools
        "03": "weapon_explosive",  # Explosives
        "04": "armor",  # Armor
        "05": "ammo",  # Ammunition
        "06": "equip_other",  # Other equipment
    }
}

# Name mapping based on item properties and effects
# This will be refined based on actual item data
NAME_MAP = {
    # Materials (1101xx)
    "1101011": "wood",
    "1101021": "stone",
    "1101031": "iron",
    "1101041": "cloth",
    "1101051": "leather",
    "1101061": "water",
    "1101071": "oil",
    "1101073": "gasoline",
    "1101081": "coal",
    
    # Models (1102xx)
    "1102011": "model_wood",
    "1102022": "model_stone",
    "1102033": "model_iron",
    "1102042": "model_cloth",
    "1102053": "model_leather",
    "1102063": "model_water",
    "1102073": "model_oil",
    
    # Food (1103xx)
    "1103011": "bread",
    "1103022": "canned_food",
    "1103033": "meat",
    "1103041": "rotten_food",
    "1103052": "canned_meat",
    "1103063": "canned_fish",
    "1103074": "luxury_food",
    "1103083": "preserved_food",
    "1103094": "energy_drink",
    
    # Medicine (1104xx)
    "1104011": "bandage",
    "1104021": "antibiotic",
    "1104032": "penicillin",
    "1104043": "antidote",
    
    # Economy (1105xx)
    "1105011": "currency",
    "1105022": "alcohol",
    "1105033": "tobacco",
    "1105042": "book",
    "1105051": "newspaper",
    
    # Specific (1106xx)
    "1106013": "backpack",
    "1106014": "key",
    "1106054": "first_aid_kit",
    
    # Buff (1107xx)
    "1107012": "vitamin",
    "1107022": "protein",
    "1107032": "calcium",
    "1107042": "iron_pill",
    "1107052": "multivitamin",
    
    # Guns (1301xx)
    "1301011": "pistol",
    "1301022": "revolver",
    "1301033": "shotgun",
    "1301041": "rifle",
    "1301052": "hunting_rifle",
    "1301063": "assault_rifle",
    "1301071": "sniper_rifle",
    "1301082": "heavy_sniper",
    "1301091": "crossbow",
    
    # Melee/Tools (1302xx)
    "1302011": "axe",
    "1302021": "pickaxe",
    "1302032": "machete",
    "1302043": "chainsaw",
    
    # Explosives (1303xx)
    "1303012": "grenade",
    "1303022": "molotov",
    "1303033": "bomb",
    "1303044": "heavy_bomb",
    
    # Armor (1304xx)
    "1304012": "light_armor",
    "1304023": "heavy_armor",
    
    # Ammo (1305xx)
    "1305011": "pistol_ammo",
    "1305012": "rifle_ammo",
    "1305023": "small_bag",
    "1305024": "medium_bag",
    "1305034": "large_bag",
    "1305053": "ammo_box",
    "1305064": "ammo_case",
    "1305075": "bullet",
    
    # Other Equipment (1306xx)
    "1306001": "radio",
}

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

def get_item_key(old_id: str) -> str:
    """Generate item key from old ID"""
    if old_id in NAME_MAP:
        name = NAME_MAP[old_id]
        category = get_category(old_id)
        return f"item_{category}_{name}"
    
    # Fallback: use category + numeric suffix
    category = get_category(old_id)
    return f"item_{category}_{old_id}"

def generate_mapping(items_data: dict) -> dict:
    """Generate mapping from old IDs to new keys"""
    mapping = {}
    reverse_mapping = {}
    
    for old_id in items_data.keys():
        new_key = get_item_key(old_id)
        mapping[old_id] = new_key
        reverse_mapping[new_key] = old_id
    
    return mapping, reverse_mapping

if __name__ == "__main__":
    # Read items.ts file (we'll parse it manually or use a JSON export)
    # For now, generate the mapping structure
    print("Item Key Mapping Generator")
    print("=" * 50)
    
    # Example: generate mapping for all known IDs
    all_ids = [
        "1101011", "1101021", "1101031", "1101041", "1101051", "1101061", 
        "1101071", "1101073", "1101081",
        "1102011", "1102022", "1102033", "1102042", "1102053", "1102063", "1102073",
        "1103011", "1103022", "1103033", "1103041", "1103052", "1103063", 
        "1103074", "1103083", "1103094",
        "1104011", "1104021", "1104032", "1104043",
        "1105011", "1105022", "1105033", "1105042", "1105051",
        "1106013", "1106014", "1106054",
        "1107012", "1107022", "1107032", "1107042", "1107052",
        "1301011", "1301022", "1301033", "1301041", "1301052", "1301063",
        "1301071", "1301082", "1301091",
        "1302011", "1302021", "1302032", "1302043",
        "1303012", "1303022", "1303033", "1303044",
        "1304012", "1304023",
        "1305011", "1305012", "1305023", "1305024", "1305034", 
        "1305053", "1305064", "1305075",
        "1306001",
    ]
    
    mapping = {}
    for old_id in all_ids:
        new_key = get_item_key(old_id)
        mapping[old_id] = new_key
        print(f"{old_id} -> {new_key}")
    
    # Save to JSON for reference
    with open("item_id_mapping.json", "w") as f:
        json.dump(mapping, f, indent=2)
    
    print(f"\nGenerated {len(mapping)} mappings")
    print("Saved to item_id_mapping.json")

