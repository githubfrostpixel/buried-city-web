/**
 * Bomb (Explosives) Class
 * Ported from OriginalGame/src/game/Battle.js (lines 667-713)
 */

import { BattleEquipment } from './BattleEquipment'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'
import { usePlayerStore } from '@/store/playerStore'

export class Bomb extends BattleEquipment {
  banditOverride: boolean
  deadMonsterNum: number = 0

  constructor(id: string, bPlayer: any) {
    super(id, bPlayer)
    this.banditOverride = bPlayer.banditOverride
  }

  protected _action(): void {
    if (!this.isEnough()) {
      return
    }

    audioManager.playEffect(SoundPaths.BOMB)
    this.bPlayer.battle.sumRes.tools++

    const monsters = [...this.bPlayer.battle.monsters]

    monsters.forEach((mon) => {
      mon.underAtk(this)
    })

    this.cost()

    const playerStore = usePlayerStore.getState()
    const harm = this.attr.atk || 0
    const isBandit = playerStore.nowSiteId === 500 || this.banditOverride
    
    // Log explosion message (two separate entries matching original)
    // TODO: Get bomb name from string system when available
    const bombName = "Bomb"
    if (isBandit) {
      this.bPlayer.battle.processLog(`${bombName} exploded!`, "#FF8000")
      this.bPlayer.battle.processLog(`Dealt ${harm} damage`, "#FF8000")
    } else {
      this.bPlayer.battle.processLog(`${bombName} exploded!`, "#FF8000")
      this.bPlayer.battle.processLog(`Dealt ${harm} damage`, "#FF8000")
    }

    if (this.deadMonsterNum > 0) {
      const monsterType = isBandit
        ? (this.deadMonsterNum === 1 ? "bandit" : "bandits")
        : (this.deadMonsterNum === 1 ? "zombie" : "zombies")
      const logStr = `Killed ${this.deadMonsterNum} ${monsterType}`
      this.bPlayer.battle.processLog(logStr)
      this.deadMonsterNum = 0
      this.bPlayer.battle.checkGameEnd()
    }
  }

  protected afterCd(): void {
    // Set cooldown flag FIRST to prevent race condition with update loop
    // This ensures action() calls from update loop will return early
    this.isInAtkCD = true
    
    // Call _action() to explode (matches original game behavior)
    this._action()
    
    // Set cooldown timer to clear flag and trigger next explosion
    const playerStore = this.bPlayer.getPlayerStore()
    const vigourEffect = playerStore.vigour < 30 ? 2 : 1
    const cdDuration = (this.attr.atkCD || 1) * vigourEffect
    
    setTimeout(() => {
      this.isInAtkCD = false
      if (!this.bPlayer.battle.isBattleEnd) {
        this.afterCd()
      }
    }, cdDuration * 1000)
  }
}


