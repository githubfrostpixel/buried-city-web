/**
 * Recipe Icon Utility
 * Determines which icon to use for a recipe based on building ID and recipe index
 * 
 * Ported from OriginalGame/src/game/buildAction.js
 * 
 * Rules:
 * - Default: Use produced item's icon (icon_item_{itemId}.png)
 * - Special buildings: Use build_action_{bid}_{index}.png for specific building actions
 */

/**
 * Get recipe icon name and atlas
 * @param buildingId Building ID
 * @param recipeIndex Recipe index in building's recipe list
 * @param producedItemId Produced item ID (for default case)
 * @returns Object with icon name and atlas
 */
export function getRecipeIcon(
  buildingId: number,
  recipeIndex: number,
  producedItemId: number | string | null
): { iconName: string; atlas: string } {
  // Special buildings that use build_action icons
  // Based on OriginalGame/src/game/buildAction.js
  const BUILD_ACTION_BUILDINGS = [5, 8, 9, 10, 12, 17] // Bonfire, Trap, Bed, Rest, Dog, Bomb
  
  if (BUILD_ACTION_BUILDINGS.includes(buildingId)) {
    // Use build_action icon
    // Special cases:
    // - Building 9 (Bed): Uses type-1, but we'll use index for now
    // - Building 10 (Rest): Uses index (0 or 1)
    const iconName = `build_action_${buildingId}_${recipeIndex}.png`
    return { iconName, atlas: 'build' }
  }
  
  // Default: Use produced item's icon
  if (producedItemId) {
    const iconName = `icon_item_${producedItemId}.png`
    return { iconName, atlas: 'icon' }
  }
  
  // Fallback
  return { iconName: 'icon_item_1101051.png', atlas: 'icon' }
}




