/**
 * Battle Player Entity Class
 * Ported from OriginalGame/src/game/Battle.js (lines 444-594)
 * 
 * Represents the player in battle
 */

import type { Battle } from './Battle'
import { BattleConfig, EquipmentPos, Equipment, WORK_SITE } from './BattleConfig'
import { usePlayerStore } from '@/store/playerStore'
import { useBuildingStore } from '@/store/buildingStore'
import { getRandomInt } from '@/utils/random'
import type { BattleEquipment } from './BattleEquipment'
import { createEquipment } from './createEquipment'
import type { Monster } from './Monster'
import { emitter } from '@/utils/emitter'

export interface BattlePlayerState {
  bulletNum: number
  homemadeNum: number
  toolNum: number
  hp: number
  virus: number
  virusMax: number
  injury: number
  weapon1: string | null // Gun
  weapon2: string | null // Melee
  equip: string | null // Tool
  def: number
}

export class BattlePlayer {
  battle: Battle
  banditOverride: boolean
  isDodge: boolean

  hp: number
  virus: number
  maxHp: number
  injury: number
  def: number
  dogState: number = 0

  bulletNum: number
  homemadeNum: number
  toolNum: number

  weapon1: BattleEquipment | null = null
  weapon2: BattleEquipment | null = null
  equip: BattleEquipment | null = null

  // Escape state
  private escapeTimeoutId: number | null = null
  private escapeStartTime: number = 0
  private isEscaping: boolean = false

  constructor(
    battle: Battle,
    playerObj: BattlePlayerState,
    banditOverride: boolean = false,
    isDodge: boolean = false
  ) {
    this.battle = battle
    this.banditOverride = banditOverride
    this.isDodge = isDodge

    this.hp = playerObj.hp
    this.virus = playerObj.virus
    this.maxHp = this.hp
    this.injury = playerObj.injury
    this.def = playerObj.def
    this.dogState = 0

    this.bulletNum = playerObj.bulletNum
    this.homemadeNum = playerObj.homemadeNum
    this.toolNum = playerObj.toolNum

    this.weapon1 = createEquipment(playerObj.weapon1, this)
    this.weapon2 = createEquipment(playerObj.weapon2, this)
    this.equip = createEquipment(playerObj.equip, this)
  }

  useBandit(): boolean {
    const playerStore = usePlayerStore.getState()
    return playerStore.nowSiteId === 500 || this.banditOverride
  }

  getPlayerStore() {
    return usePlayerStore.getState()
  }

  action(dt: number): void {
    // Don't use weapons if escaping - escape takes priority
    if (this.isEscaping) {
      console.log('[BattlePlayer.action] Skipping weapon use - player is escaping')
      return
    }

    // Update dog state
    if (this.dogState < 50) {
      this.dogState += 1
    }
    if (this.dogState === 9) {
      if (this.battle.isMonsterStopDog) {
        this.battle.isMonsterStopDog = false
      }
    }

    // Use dog if available
    const playerStore = usePlayerStore.getState()
    const buildingStore = useBuildingStore.getState()
    if (playerStore.dog?.active && buildingStore.getBuildLevel(12) >= 0) {
      this.useDog()
    }

    // Use weapon1 (gun) - except flamethrower at site 502
    const gunId = playerStore.equipment.gun
    if (gunId === "1301091" || playerStore.nowSiteId !== WORK_SITE) {
      this.useWeapon1()
    }

    // Use weapon2 (melee)
    this.useWeapon2()

    // Use equip (tool) - except certain tools at site 502
    if (playerStore.nowSiteId === WORK_SITE) {
      const toolEquip = playerStore.equipment.tool
      if (!(toolEquip === "1303012" || toolEquip === "1303033" || toolEquip === "1303044")) {
        this.useEquip()
      }
    } else {
      this.useEquip()
    }
  }

  useDog(): void {
    if (this.dogState < 10) {
      return
    }
    if (this.dogState > 9) {
      this.dogState = 0
    }

    const rand = Math.random()
    const playerStore = usePlayerStore.getState()
    
    if (rand < 0.2) {
      // Dog attacks enemy (20% chance)
      const monster = this.battle.targetMon
      if (monster) {
        monster.underAtk("Dog")
        // TODO: Play SHORT_BARK sound
        playerStore.updateAttribute("dogInjury", playerStore.dog.injury + 2)
      }
    } else if (rand > 0.9) {
      // Dog kites enemy (10% chance)
      this.battle.isMonsterStopDog = true
      const dogName = playerStore.dog?.name || "Dog"
      if (this.useBandit()) {
        this.battle.processLog(`${dogName} distracted the bandits!`, "#00FF00")
      } else {
        this.battle.processLog(`${dogName} distracted the zombies!`, "#00FF00")
      }
      playerStore.updateAttribute("dogMood", playerStore.dog.mood - 2)
    }
  }

  underAtk(monster: Monster): void {
    let harm = monster.attr.attack - this.def
    
    if (this.useBandit()) {
      if (!this.banditOverride && !this.isDodge) {
        harm = Math.max(1, harm + 10)
      }
      this.hp -= harm
      const prefixType = `banditType_${monster.attr.prefixType}`
      this.battle.processLog(`Bandit ${monster.attr.prefixType} attacked for -${harm}`, "#FF0000")
    } else {
      harm = Math.max(1, harm)
      this.hp -= harm
      const prefixType = `monsterType_${monster.attr.prefixType}`
      this.battle.processLog(`Zombie ${monster.attr.prefixType} attacked for -${harm}`, "#FF0000")
    }

    this.battle.sumRes.totalHarm += harm
    this.battle.sumRes.underAtk++
    this.hp = Math.max(0, this.hp)

    if (this.hp === 0) {
      this.die()
    }

    // Update player attributes
    const playerStore = usePlayerStore.getState()
    playerStore.updateAttribute("hp", playerStore.hp - harm)
    playerStore.updateAttribute("injury", playerStore.injury + 1)

    // Virus chance
    if (harm > 0) {
      const rand = Math.random()
      let threshold = 0.8
      const equipId = playerStore.equipment.equip
      if (equipId === "1304023") {
        threshold = 0.5
      } else if (equipId === "1304012") {
        threshold = 0.65
      }

      if (rand <= threshold && !this.useBandit() && this.battle.difficulty > 2) {
        // TODO: Check buff effect ITEM_1107052
        this.battle.sumRes.totalVirus += 1
      }
    }
  }

  die(): void {
    const playerStore = usePlayerStore.getState()
    // TODO: Add log message (string ID 1109 or 9109)
    this.battle.processLog("You died!")
    this.battle.gameEnd(false)
  }

  isDie(): boolean {
    return this.hp <= 0
  }

  useWeapon1(): void {
    if (!this.weapon1) {
      return
    }
    this.weapon1.action()
    this.interruptEscape()
  }

  useWeapon2(): void {
    if (!this.weapon2) {
      return
    }
    this.weapon2.action()
    this.interruptEscape()
  }

  useEquip(): void {
    if (!this.equip) {
      return
    }
    this.equip.action()
    this.interruptEscape()
  }

  escape(): void {
    console.log('[BattlePlayer.escape] Called, isEscaping:', this.isEscaping)
    if (this.isEscaping) {
      console.log('[BattlePlayer.escape] Already escaping, returning')
      return // Already escaping
    }

    console.log('[BattlePlayer.escape] Starting escape sequence')
    this.isEscaping = true
    this.escapeStartTime = Date.now()

    // Log escape attempt
    this.battle.processLog("You trying to escape", "#FFAA00")

    // Set timeout for escape completion
    console.log('[BattlePlayer.escape] Setting escape timeout:', BattleConfig.ESCAPE_TIME * 1000, 'ms')
    this.escapeTimeoutId = window.setTimeout(() => {
      console.log('[BattlePlayer.escape] Escape timeout fired')
      this.clearEscapeProgress()
      this.escapeAction()
    }, BattleConfig.ESCAPE_TIME * 1000)
  }

  escapeAction(): void {
    console.log('[BattlePlayer.escapeAction] Called, ending battle as loss')
    
    // Prevent escape if battle already ended (e.g., all monsters killed)
    if (this.battle.isBattleEnd) {
      console.log('[BattlePlayer.escapeAction] Battle already ended, cancelling escape')
      this.isEscaping = false
      return
    }
    
    // Log escape success
    this.battle.processLog("Escape success", "#00FF00")
    this.isEscaping = false
    this.battle.gameEnd(false)
  }

  interruptEscape(): void {
    // Escape is interrupted by any weapon use
    console.log('[BattlePlayer.interruptEscape] Called, isEscaping:', this.isEscaping)
    if (this.isEscaping) {
      console.log('[BattlePlayer.interruptEscape] Interrupting escape')
      this.clearEscapeProgress()
      this.isEscaping = false
      console.log('[BattlePlayer.interruptEscape] Escape interrupted')
    }
  }

  private clearEscapeProgress(): void {
    console.log('[BattlePlayer.clearEscapeProgress] Called')
    if (this.escapeTimeoutId !== null) {
      console.log('[BattlePlayer.clearEscapeProgress] Clearing timeout:', this.escapeTimeoutId)
      clearTimeout(this.escapeTimeoutId)
      this.escapeTimeoutId = null
    }
  }
}


