/**
 * Trap Class
 * Ported from OriginalGame/src/game/Battle.js (lines 786-811)
 */

import { BattleEquipment } from './BattleEquipment'
import { audioManager, SoundPaths } from '@/game/systems/AudioManager'
import { usePlayerStore } from '@/store/playerStore'

export class Trap extends BattleEquipment {
  banditOverride: boolean

  constructor(id: string, bPlayer: any) {
    super(id, bPlayer)
    this.banditOverride = bPlayer.banditOverride
  }

  protected _action(): void {
    if (!this.isEnough()) {
      return
    }

    audioManager.playEffect(SoundPaths.TRAP)
    this.bPlayer.battle.sumRes.tools++
    this.bPlayer.battle.isMonsterStop = true
    this.cost()

    const playerStore = usePlayerStore.getState()
    const logMsg = playerStore.nowSiteId === 500 || this.banditOverride
      ? `Trap deployed!`
      : `Trap deployed!`
    this.bPlayer.battle.processLog(logMsg)
  }

  protected afterCd(): void {
    this._action()
    this.bPlayer.battle.isMonsterStop = false
  }
}



