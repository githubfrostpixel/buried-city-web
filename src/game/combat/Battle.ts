/**
 * Battle Controller Class
 * Ported from OriginalGame/src/game/Battle.js (lines 12-265)
 * 
 * Main battle controller that manages the entire battle
 */

import { BattleLine } from './BattleLine'
import { BattleConfig, Equipment } from './BattleConfig'
import { emitter } from '@/utils/emitter'
import { audioManager, MusicPaths } from '@/game/systems/AudioManager'
import { usePlayerStore } from '@/store/playerStore'
import { game } from '@/game/Game'
import type { BattlePlayer } from './BattlePlayer'
import type { Monster } from './Monster'

export interface BattleInfo {
  id: string
  monsterList: string[]
}

export interface BattleResult {
  id: string
  underAtk: number
  totalVirus: number
  totalHarm: number
  weapon1: number
  weapon2: number
  bulletNum: number
  homemadeNum: number
  fuel: number
  tools: number
  win: boolean
  isDodge: boolean
  monsterKilledNum: number
  brokenWeapon?: string[]
  toolItemId?: string
}

export class Battle {
  battleInfo: BattleInfo
  isDodge: boolean
  difficulty: number
  banditOverride: boolean
  endLogOverride: boolean
  
  indicateLines: BattleLine[]
  monsters: Monster[]
  targetMon: Monster | null = null
  player: BattlePlayer | null = null
  
  isMonsterStop: boolean = false
  isMonsterStopDog: boolean = false
  
  sumRes: BattleResult
  isBattleEnd: boolean = false
  
  // Dodge state
  dodgeTime: number = 0
  dodgePassTime: number = 0
  
  // Update intervals
  private monsterUpdateInterval: number | null = null
  private playerUpdateInterval: number | null = null
  private dodgeUpdateInterval: number | null = null
  
  // Game end callback
  gameEndListener: ((result: BattleResult) => void) | null = null
  
  private static monsterIdCounter: number = 0

  constructor(
    battleInfo: BattleInfo,
    isDodge: boolean = false,
    difficulty: number = 1,
    banditOverride: boolean = false,
    endLogOverride: boolean = false
  ) {
    this.battleInfo = battleInfo
    this.isDodge = isDodge
    this.difficulty = difficulty
    this.banditOverride = banditOverride
    this.endLogOverride = endLogOverride

    // Initialize battle lines (6 lines)
    this.indicateLines = []
    for (let i = 0; i < BattleConfig.LINE_LENGTH; i++) {
      this.indicateLines.push(new BattleLine(i))
    }

    // Initialize monsters (will be set by BattlePlayer or external code)
    this.monsters = []

    // Initialize battle result
    this.sumRes = {
      id: this.battleInfo.id,
      underAtk: 0,
      totalVirus: 0,
      totalHarm: 0,
      weapon1: 0,
      weapon2: 0,
      bulletNum: 0,
      homemadeNum: 0,
      fuel: 0,
      tools: 0,
      win: false,
      isDodge: this.isDodge,
      monsterKilledNum: 0
    }
  }

  /**
   * Initialize battle with monsters and player
   * This should be called after BattlePlayer is created
   */
  initialize(monsters: Monster[], player: BattlePlayer): void {
    this.monsters = monsters
    this.player = player
    
    // Set toolItemId if tool is equipped
    if (player.equip) {
      this.sumRes.toolItemId = player.equip.id
    }
    
    // Place first monster at last line
    if (this.monsters.length > 0) {
      this.updateTargetMonster()
      this.monsters[0].moveToLine(this.getLastLine())
    }

    // Start update loops
    this.startUpdateLoops()

    // Pause game timer
    const timeManager = game.getTimeManager()
    timeManager.pause()

    // Play battle music
    if (this.useBandit()) {
      audioManager.playMusic(MusicPaths.BATTLE, true)
    } else {
      audioManager.playMusic(MusicPaths.BATTLE_OLD, true)
    }

    // Log battle start
    if (this.useBandit()) {
      this.processLog(`Encountered ${this.monsters.length} bandits!`)
    } else {
      this.processLog(`Encountered ${this.monsters.length} zombies!`)
    }

    // Setup dodge if needed
    if (this.isDodge) {
      if (this.banditOverride) {
        this.dodgeTime = 5
        this.dodgePassTime = 1
      } else {
        this.dodgeTime = 6
        this.dodgePassTime = 0
      }
    }
  }

  useBandit(): boolean {
    const playerStore = usePlayerStore.getState()
    return playerStore.nowSiteId === 500 || this.banditOverride
  }

  getNextMonsterId(): number {
    return Battle.monsterIdCounter++
  }

  getLastLine(): BattleLine {
    return this.indicateLines[this.indicateLines.length - 1]
  }

  getLine(index: number): BattleLine | null {
    if (index >= 0 && index < this.indicateLines.length) {
      return this.indicateLines[index]
    }
    return null
  }

  updateTargetMonster(): void {
    if (this.monsters.length > 0) {
      this.targetMon = this.monsters[0]
    } else {
      this.targetMon = null
    }
  }

  removeMonster(monster: Monster): void {
    const index = this.monsters.indexOf(monster)
    if (index > -1) {
      this.monsters.splice(index, 1)
    }

    emitter.emit("battleMonsterLength", this.monsters.length)
    this.updateTargetMonster()
  }

  checkGameEnd(): boolean {
    // Prevent checking if battle already ended
    if (this.isBattleEnd) {
      return false
    }
    
    if (this.monsters.length === 0) {
      this.gameEnd(true)
      return true
    }
    return false
  }

  gameEnd(isWin: boolean): void {
    // Prevent race condition: if battle already ended, don't process again
    if (this.isBattleEnd) {
      console.log('[Battle.gameEnd] Battle already ended, ignoring duplicate call')
      return
    }
    
    this.isBattleEnd = true
    this.sumRes.win = isWin
    this.isMonsterStop = true

    // Stop update loops
    this.stopUpdateLoops()

    // Reset monster ID counter
    Battle.monsterIdCounter = 0

    // Remove used items from bag (items stay in bag during battle)
    if (this.player) {
      const playerStore = usePlayerStore.getState()
      
      // Remove used bullets
      const usedBullets = this.sumRes.bulletNum
      if (usedBullets > 0) {
        playerStore.removeItemFromBag(BattleConfig.BULLET_ID, usedBullets)
      }
      
      // Remove used homemade bullets
      const usedHomemade = this.sumRes.homemadeNum
      if (usedHomemade > 0) {
        playerStore.removeItemFromBag(BattleConfig.HOMEMADE_ID, usedHomemade)
      }
      
      // Remove used tools/bombs
      if (this.player.equip && this.sumRes.toolItemId) {
        // Calculate used tools: current bag count - remaining count
        const currentToolCount = playerStore.getBagItemCount(this.sumRes.toolItemId)
        const remainingToolCount = this.player.toolNum
        const usedTools = currentToolCount - remainingToolCount
        
        if (usedTools > 0) {
          playerStore.removeItemFromBag(this.sumRes.toolItemId, usedTools)
        }
        
        // Unequip tool if count reaches 0
        if (this.player.toolNum === 0) {
          playerStore.unequipItem('tool')
        }
      }
    }

    // Calculate weapon breaking if win
    if (isWin && this.player) {
      const brokenWeapon: string[] = []
      const playerStore = usePlayerStore.getState()
      
      // Check gun breaking
      const gunItemId = this.player.weapon1?.id
      if (gunItemId && this.sumRes.weapon1 > 0) {
        // Calculate multiplier based on bullet type
        let multiplier = 0.2
        if (this.sumRes.homemadeNum > 0) {
          const totalBullets = this.sumRes.homemadeNum + this.sumRes.bulletNum
          multiplier = (this.sumRes.homemadeNum / totalBullets) + 
                       ((this.sumRes.bulletNum / totalBullets) * 0.2)
        }
        // Special guns use multiplier 1
        if (gunItemId === "1301091" || gunItemId === "1301071" || gunItemId === "1301082") {
          multiplier = 1
        }
        if (playerStore.testWeaponBroken(gunItemId, 0, multiplier)) {
          brokenWeapon.push(gunItemId)
        }
      }
      
      // Check melee weapon breaking
      const weaponItemId = this.player.weapon2?.id
      if (weaponItemId && weaponItemId !== Equipment.HAND && this.sumRes.weapon2 > 0) {
        if (playerStore.testWeaponBroken(weaponItemId, 0, 1)) {
          brokenWeapon.push(weaponItemId)
        }
      }
      
      // Check armor breaking (if took damage)
      if (this.sumRes.totalHarm > 0) {
        const armItemId = this.player.equip?.id
        if (armItemId && playerStore.testWeaponBroken(armItemId, 1, 1)) {
          brokenWeapon.push(armItemId)
        }
      }
      
      this.sumRes.brokenWeapon = brokenWeapon
    }

    // Resume game timer
    const timeManager = game.getTimeManager()
    timeManager.resume()

    // Stop battle music
    audioManager.stopMusic()

    // Call game end listener
    if (this.gameEndListener) {
      this.gameEndListener(this.sumRes)
    }
  }

  processLog(log: string, color?: string, bigger?: boolean): void {
    emitter.emit("battleProcessLog", {
      log,
      color,
      bigger
    })
  }

  setGameEndListener(listener: (result: BattleResult) => void): void {
    this.gameEndListener = listener
  }

  private startUpdateLoops(): void {
    // Monster update: every 1 second
    this.monsterUpdateInterval = window.setInterval(() => {
      if (!this.isMonsterStop && !this.isMonsterStopDog) {
        this.monsters.forEach((mon) => {
          mon.move()
        })
      }
    }, 1000)

    // Player update: every 0.1 seconds
    this.playerUpdateInterval = window.setInterval(() => {
      if (this.player && !this.isDodge) {
        this.player.action(0.1)
      }
    }, 100)

    // Dodge update: every 0.1 seconds
    if (this.isDodge) {
      this.dodgeUpdateInterval = window.setInterval(() => {
        this.dodgePassTime += 0.1
        const percentage = (this.dodgePassTime / this.dodgeTime) * 100
        emitter.emit("battleDodgePercentage", percentage)
        
        if (this.dodgePassTime >= this.dodgeTime) {
          if (this.player) {
            const playerStore = usePlayerStore.getState()
            playerStore.updateAttribute("virus", this.sumRes.totalVirus)
          }
          this.gameEnd(true)
        }
      }, 100)
    }
  }

  private stopUpdateLoops(): void {
    if (this.monsterUpdateInterval !== null) {
      clearInterval(this.monsterUpdateInterval)
      this.monsterUpdateInterval = null
    }
    if (this.playerUpdateInterval !== null) {
      clearInterval(this.playerUpdateInterval)
      this.playerUpdateInterval = null
    }
    if (this.dodgeUpdateInterval !== null) {
      clearInterval(this.dodgeUpdateInterval)
      this.dodgeUpdateInterval = null
    }
  }
}


