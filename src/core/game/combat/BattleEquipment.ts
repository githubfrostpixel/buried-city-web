/**
 * Battle Equipment Base Class
 * Ported from OriginalGame/src/game/Battle.js (lines 622-665)
 * 
 * Base class for all weapons and tools used in battle
 */

import type { ItemConfig, WeaponEffect } from '@/common/types/item.types'
import { itemConfig } from '@/core/data/items'
import { clone } from '@/common/utils/clone'
import type { BattlePlayer } from './BattlePlayer'

export abstract class BattleEquipment {
  id: string
  bPlayer: BattlePlayer
  itemConfig: ItemConfig
  attr: WeaponEffect
  isInAtkCD: boolean = false

  constructor(id: string, bPlayer: BattlePlayer) {
    this.id = id
    this.bPlayer = bPlayer

    if (this.id === "1") {
      // Hand-to-hand combat
      this.itemConfig = clone(itemConfig["1302011"])
      // Name will be retrieved from string system when needed
      if (this.itemConfig.effect_weapon) {
        this.itemConfig.effect_weapon = {
          ...this.itemConfig.effect_weapon,
          atk: 20,
          atkCD: 1
        }
      }
    } else {
      const config = itemConfig[this.id]
      if (!config) {
        throw new Error(`Item config not found for ID: ${this.id}`)
      }
      this.itemConfig = clone(config)
      // Name will be retrieved from string system when needed
    }

    if (!this.itemConfig.effect_weapon) {
      throw new Error(`Item ${this.id} does not have weapon effect`)
    }
    this.attr = this.itemConfig.effect_weapon
  }

  /**
   * Main action method with cooldown
   */
  action(): void {
    if (this.isInAtkCD) {
      return
    }
    
    this.beforeCd()
    this.isInAtkCD = true
    
    // Calculate cooldown duration
    const playerStore = this.bPlayer.getPlayerStore()
    const vigourEffect = playerStore.vigour < 30 ? 2 : 1 // vigourEffect: 2 if low, 1 otherwise
    const cdDuration = (this.attr.atkCD || 1) * vigourEffect
    
    // Schedule cooldown end
    setTimeout(() => {
      this.isInAtkCD = false
      if (!this.bPlayer.battle.isBattleEnd) {
        this.afterCd()
      }
    }, cdDuration * 1000)
  }

  /**
   * Override for specific weapon logic (called before cooldown)
   */
  protected abstract _action(): void

  /**
   * Called before cooldown starts
   */
  protected beforeCd(): void {
    this._action()
  }

  /**
   * Called after cooldown ends
   */
  protected afterCd(): void {
    // Override in subclasses if needed
  }

  /**
   * Consume tool/item
   */
  protected cost(): void {
    this.bPlayer.toolNum--
  }

  /**
   * Check if enough resources available
   */
  protected isEnough(): boolean {
    return this.bPlayer.toolNum > 0
  }
}

