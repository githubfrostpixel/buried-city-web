import { create } from 'zustand'
import type { Monster } from '@/types/combat.types'

export interface BattleInfo {
  id: string
  monsterList: number[]
  difficulty?: number
}

export interface BattlePlayerState {
  hp: number
  hpMax: number
  virus: number
  virusMax: number
  injury: number
  bulletNum: number
  homemadeNum: number
  toolNum: number
  weapon1: string | null // Gun
  weapon2: string | null // Melee
  equip: string | null // Tool
  defense: number
}

export interface BattleResult {
  id: string
  underAtk: number
  totalVirus: number
  totalHarm: number
  weapon1: number // Uses
  weapon2: number // Uses
  bulletNum: number // Consumed
  homemadeNum: number // Consumed
  fuel: number
  tools: number
  win: boolean
  isDodge: boolean
  monsterKilledNum: number
}

interface BattleStore {
  // Battle state
  isInBattle: boolean
  battleId: string | null
  
  // Monster state
  monsters: Monster[]
  playerDistance: number // 0-6 lines
  
  // Player combat state
  battlePlayer: BattlePlayerState | null
  
  // Battle result tracking
  battleResult: BattleResult | null
  
  // Escape state
  isDodging: boolean
  dodgeProgress: number // 0-1
  
  // Actions
  startBattle: (battleInfo: BattleInfo) => void
  endBattle: (result: BattleResult) => void
  updateMonster: (monsterId: number, updates: Partial<Monster>) => void
  updatePlayerDistance: (distance: number) => void
  updateBattlePlayer: (updates: Partial<BattlePlayerState>) => void
  setDodging: (isDodging: boolean) => void
  updateDodgeProgress: (progress: number) => void
  resetBattle: () => void
}

export const useBattleStore = create<BattleStore>((set) => ({
  // Initial state
  isInBattle: false,
  battleId: null,
  monsters: [],
  playerDistance: 6, // Start at max distance
  battlePlayer: null,
  battleResult: null,
  isDodging: false,
  dodgeProgress: 0,
  
  // Actions
  startBattle: (battleInfo: BattleInfo) => {
    // Initialize monsters from battleInfo
    // This will be populated by the Battle system when it's implemented
    const monsters: Monster[] = battleInfo.monsterList.map((monId) => ({
      id: monId,
      config: {
        id: monId,
        hp: 100,
        speed: 1,
        attackSpeed: 1,
        attack: 10,
        range: 1,
        prefixType: 0
      },
      hp: 100,
      hpMax: 100,
      distance: 6
    }))
    
    set({
      isInBattle: true,
      battleId: battleInfo.id,
      monsters,
      playerDistance: 6,
      isDodging: false,
      dodgeProgress: 0,
      battleResult: null
    })
  },
  
  endBattle: (result: BattleResult) => {
    set({
      isInBattle: false,
      battleResult: result,
      isDodging: false,
      dodgeProgress: 0
    })
  },
  
  updateMonster: (monsterId: number, updates: Partial<Monster>) => {
    set((state) => ({
      monsters: state.monsters.map((monster) =>
        monster.id === monsterId ? { ...monster, ...updates } : monster
      )
    }))
  },
  
  updatePlayerDistance: (distance: number) => {
    const clampedDistance = Math.max(0, Math.min(6, distance))
    set({ playerDistance: clampedDistance })
  },
  
  updateBattlePlayer: (updates: Partial<BattlePlayerState>) => {
    set((state) => ({
      battlePlayer: state.battlePlayer
        ? { ...state.battlePlayer, ...updates }
        : null
    }))
  },
  
  setDodging: (isDodging: boolean) => {
    set({ isDodging, dodgeProgress: isDodging ? 0 : 0 })
  },
  
  updateDodgeProgress: (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, progress))
    set({ dodgeProgress: clampedProgress })
  },
  
  resetBattle: () => {
    set({
      isInBattle: false,
      battleId: null,
      monsters: [],
      playerDistance: 6,
      battlePlayer: null,
      battleResult: null,
      isDodging: false,
      dodgeProgress: 0
    })
  }
}))

