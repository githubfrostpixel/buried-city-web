#!/usr/bin/env python3
"""
Fix sprite name generation - change icon_item_${itemId} to icon_${itemId}
since itemId already includes "item_" prefix
"""

import re
import os

# Files to update
files_to_update = [
    'src/module/overlay/AttributeDialog.tsx',
    'src/module/location/BattleBeginView.tsx',
    'src/module/overlay/ItemDialog.tsx',
    'src/module/overlay/ItemSliderDialog.tsx',
    'src/module/BattlePanelContent.tsx',
    'src/common/ui/EquipPanel.tsx',
    'src/module/overlay/NpcGiftDialog.tsx',
    'src/module/overlay/NpcDialog.tsx',
    'src/module/overlay/NpcHelpDialog.tsx',
    'src/module/location/BattleEndView.tsx',
    'src/module/location/CacheBeginView.tsx',
    'src/common/ui/ItemCostDisplay.tsx',
]

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

for file_path in files_to_update:
    full_path = os.path.join(project_root, file_path)
    if not os.path.exists(full_path):
        print(f'Skipping {file_path} (not found)')
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Replace icon_item_${...} with icon_${...}
    # Pattern: icon_item_${variable} -> icon_${variable}
    content = re.sub(r'icon_item_\$\{', r'icon_${', content)
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file_path}')
    else:
        print(f'No changes needed in {file_path}')

print('Done!')

