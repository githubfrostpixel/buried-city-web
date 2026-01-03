/**
 * Monster utility functions
 * Ported from OriginalGame/src/util/utils.js
 */

import { monsterList } from '@/data/monsters'
import { getRandomInt } from './random'

/**
 * Get monster list by difficulty
 * Ported from OriginalGame/src/util/utils.js:getMonsterListByDifficulty
 * 
 * Filters monsterList entries by difficulty and returns a random one's list
 */
export function getMonsterListByDifficulty(difficulty: number): string[] | null {
  // Get all monster list IDs
  const monsterListIds = Object.keys(monsterList)
  
  // Filter by difficulty
  const matchingIds = monsterListIds.filter((mid) => {
    return monsterList[mid].difficulty === difficulty
  })
  
  if (matchingIds.length > 0) {
    // Pick a random one
    const randomIndex = getRandomInt(0, matchingIds.length - 1)
    const selectedId = matchingIds[randomIndex]
    return monsterList[selectedId].list
  } else {
    return null
  }
}

