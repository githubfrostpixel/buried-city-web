/**
 * Monster Entity Class
 * Ported from OriginalGame/src/game/Battle.js (lines 268-442)
 * 
 * Represents a monster/zombie/bandit in battle
 */

import type { MonsterConfig } from '@/shared/types/combat.types'
import { monsterConfig } from '@/core/data/monsters'
import { clone } from '@/shared/utils/data/clone'
import { getRandomInt } from '@/shared/utils/math/random'
import { BattleLine } from './BattleLine'
import { Battle } from './Battle'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'
import { usePlayerStore } from '@/core/store/playerStore'
import { useGameStore } from '@/core/store/gameStore'
import type { BattleEquipment } from './BattleEquipment'
import { Bomb } from './Bomb'
import { Flamethrower } from './Flamethrower'

export class Monster {
  id: number
  battle: Battle
  attr: MonsterConfig
  dead: boolean = false
  line: BattleLine | null = null
  banditOverride: boolean
  effectId: number | null = null // Sound effect ID

  constructor(battle: Battle, type: string | number, banditOverride: boolean = false) {
    this.id = battle.getNextMonsterId()
    this.battle = battle
    this.banditOverride = banditOverride
    
    const config = monsterConfig[String(type)]
    if (!config) {
      throw new Error(`Monster config not found for type: ${type}`)
    }
    this.attr = clone(config)
  }

  useBandit(): boolean {
    const playerStore = usePlayerStore.getState()
    return playerStore.nowSiteId === 500 || this.banditOverride
  }

  playEffect(soundName: string): void {
    if (this.effectId !== null) {
      audioManager.stopEffect(this.effectId)
    }
    this.effectId = audioManager.playEffect(soundName)
  }

  move(): void {
    let targetLine: BattleLine | null = null
    
    if (this.line) {
      // Calculate monster speed (affected by weather)
      const gameStore = useGameStore.getState()
      const weatherSystem = gameStore.weatherSystem
      const monsterSpeed = Math.max(1, this.attr.speed + (weatherSystem.getValue("monster_speed") || 0))
      
      const targetIndex = Math.max(0, this.line.index - monsterSpeed)
      
      // Find first empty line from current position toward target
      for (let i = this.line.index - 1; i >= targetIndex; i--) {
        const l = this.battle.getLine(i)
        if (l && l.isEmpty()) {
          targetLine = l
        } else {
          break // Stop if line is occupied
        }
      }
    } else {
      // First move - start at last line
      targetLine = this.battle.getLastLine()
    }
    
    if (targetLine && targetLine.isEmpty()) {
      this.moveToLine(targetLine)
    }
    
    // Check if can attack
    if ((this.line || this.useBandit()) && this.isInRange()) {
      // Schedule attack after attackSpeed seconds
      setTimeout(() => {
        if (!this.battle.isBattleEnd && !this.dead) {
          this.atk()
        }
      }, this.attr.attackSpeed * 1000)
    }
  }

  moveToLine(l: BattleLine): void {
    if (l === this.line) {
      return
    }

    if (this.line) {
      this.line.setMonster(null)
    }
    l.setMonster(this)
    this.line = l
    
    // Log position change if this is the target monster
    if (this.id === this.battle.targetMon?.id) {
      // TODO: Use string system for log messages
      const logMsg = this.useBandit() 
        ? `Bandit ${this.attr.prefixType} moved to line ${l.index}`
        : `Zombie ${this.attr.prefixType} moved to line ${l.index}`
      this.battle.processLog(logMsg)
    }
  }

  atk(): void {
    if (this.battle.isBattleEnd || this.dead) {
      return
    }
    
    if (this.useBandit()) {
      this.playEffect(SoundPaths.ATTACK_3)
    } else {
      this.playEffect(SoundPaths.MONSTER_ATTACK)
    }
    
    const player = this.battle.player
    if (player) {
      player.underAtk(this)
      if (player.isDie()) {
        // Stop attacking if player is dead
        return
      }
    }
  }

  underAtk(obj: BattleEquipment | "Dog" | Bomb | Flamethrower, providedHarm?: number): void {
    let harm = 0
    
    if (obj instanceof Object && 'getHarm' in obj) {
      // Weapon attack
      harm = (obj as any).getHarm(this)
      
      // Log attack
      const weaponName = (obj as any).itemConfig?.id || "weapon"
      
      if ((obj as any).constructor.name === 'Gun') {
        const logMsg = this.useBandit()
          ? `Shot ${weaponName} at bandit ${this.attr.prefixType}`
          : `Shot ${weaponName} at zombie ${this.attr.prefixType}`
        this.battle.processLog(logMsg)
      } else if ((obj as any).id === "1") { // Hand
        const logMsg = this.useBandit()
          ? `Punched bandit ${this.attr.prefixType}`
          : `Punched zombie ${this.attr.prefixType}`
        this.battle.processLog(logMsg)
      } else {
        const logMsg = this.useBandit()
          ? `Attacked with ${weaponName} at bandit ${this.attr.prefixType}`
          : `Attacked with ${weaponName} at zombie ${this.attr.prefixType}`
        this.battle.processLog(logMsg)
      }
      
      if (harm === Number.MAX_VALUE) {
        const logMsg = this.useBandit()
          ? `Instantly killed bandit ${this.attr.prefixType}!`
          : `Instantly killed zombie ${this.attr.prefixType}!`
        this.battle.processLog(logMsg)
      } else if (harm === 0) {
        this.battle.processLog("Missed!")
      } else {
        const logMsg = this.useBandit()
          ? `Dealt ${harm} damage to bandit ${this.attr.prefixType}`
          : `Dealt ${harm} damage to zombie ${this.attr.prefixType}`
        this.battle.processLog(logMsg)
      }
    } else if (obj instanceof Bomb) {
      harm = obj.attr.atk || 0
    } else if (obj instanceof Flamethrower) {
      harm = providedHarm || 0
    } else if (obj === "Dog") {
      harm = getRandomInt(10, 25)
      const playerStore = usePlayerStore.getState()
      const dogName = (playerStore.dog as any)?.name || "Dog"
      const logMsg = this.useBandit()
        ? `${dogName} attacked bandit ${this.attr.prefixType} for ${harm} damage`
        : `${dogName} attacked zombie ${this.attr.prefixType} for ${harm} damage`
      this.battle.processLog(logMsg, "#00FF00") // Green color
    }

    this.attr.hp -= harm
    this.attr.hp = Math.max(0, this.attr.hp)

    if (this.attr.hp === 0) {
      this.die(obj)
    }
  }

  die(obj: BattleEquipment | "Dog" | Bomb | Flamethrower | null): void {
    this.battle.sumRes.monsterKilledNum++
    this.dead = true
    this.battle.removeMonster(this)
    
    if (obj instanceof Bomb || obj instanceof Flamethrower) {
      // Bomb or Flamethrower - they track dead monsters
      obj.deadMonsterNum++
    } else {
      // Regular kill
      const logMsg = this.useBandit()
        ? `Killed 1 bandit ${this.attr.prefixType}`
        : `Killed 1 zombie ${this.attr.prefixType}`
      this.battle.processLog(logMsg)
      this.battle.checkGameEnd()
    }
    
    if (this.line) {
      this.line.setMonster(null)
    }
    
    if (!this.useBandit()) {
      audioManager.playEffect(SoundPaths.MONSTER_DIE)
    } else {
      audioManager.playEffect(SoundPaths.BANDIT_DIE)
    }
  }

  isInRange(): boolean {
    if (this.useBandit()) {
      // Bandits: 66% chance to attack (0-2 < 2)
      return getRandomInt(0, 2) < 2
    }
    // Zombies: Attack when at line 0
    return this.line?.index === 0
  }

  isDie(): boolean {
    return this.dead
  }
}

