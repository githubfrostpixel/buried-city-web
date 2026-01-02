/**
 * Battle Line Class
 * Represents a distance line in the battle system (0-5, where 0 is closest to player)
 * Ported from OriginalGame/src/game/Battle.js
 */

import type { Monster } from './Monster'

export class BattleLine {
  index: number // 0-5, 0 = closest to player
  monster: Monster | null = null

  constructor(index: number) {
    this.index = index
  }

  isEmpty(): boolean {
    return this.monster === null
  }

  setMonster(monster: Monster | null): void {
    this.monster = monster
  }
}


