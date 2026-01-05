/**
 * UI Store
 * Manages all UI state including scenes, panels, overlays, dialogs, and notifications
 * Controls navigation between different game screens and UI interactions
 * 
 * Used by:
 * - App.tsx (scene routing, overlay display)
 * - MainScene.tsx (panel management, back button handling)
 * - TopSection.tsx (UI state display)
 * - All panel components (HomePanel, StoragePanel, BuildPanel, etc.)
 * - All overlay components (DeathOverlay, ItemDialog, StatusDialog, etc.)
 * - Game systems (SurvivalSystem, deathCheck, uiUtil)
 */

import { create } from 'zustand'
import type { DeathReason } from '@/common/types/game.types'

export type Scene = 
  | 'menu'
  | 'saveFile'
  | 'choose'
  | 'story'
  | 'main'
  | 'battle'
  | 'map'
  | 'end'

export type Panel = 
  | 'home'
  | 'build'
  | 'storage'
  | 'crafting'
  | 'equipment'
  | 'npc'
  | 'npcStorage'
  | 'site'
  | 'siteStorage'
  | 'siteExplore'
  | 'bazaar'
  | 'dog'
  | 'radio'
  | 'gate'
  | 'gateOut'
  | 'map'
  | null

export type Overlay = 
  | 'day'
  | 'death'
  | 'battleResult'
  | 'itemChange'
  | 'dialog'
  | 'itemDialog'
  | 'attributeDialog'
  | 'statusDialog'
  | 'buildDialog'
  | 'recipeDialog'
  | 'siteDialog'
  | 'npcDialog'
  | 'npcGiftDialog'
  | 'confirmationDialog'
  | null

interface UIStore {
  // Current scene
  currentScene: Scene
  
  // Open panels
  openPanel: Panel
  
  // Building ID for build panel
  buildPanelBuildingId: number | null
  
  // Site ID for site panel
  sitePanelSiteId: number | null
  
  // Site ID for site storage panel
  siteStoragePanelSiteId: number | null
  
  // Site ID for site explore panel
  siteExplorePanelSiteId: number | null
  
  // NPC ID for NPC panel
  npcPanelNpcId: number | null
  
  // NPC ID for NPC storage panel
  npcStoragePanelNpcId: number | null
  
  // Flag to track if we're in work storage view (for handling back button)
  isInWorkStorageView: boolean
  
  // Flush function for work storage items (set by SiteExploreContent)
  workStorageFlushFunction: (() => void) | null
  
  // Flush function for NPC trade temp storage (set by NPCTradePanelContent)
  npcTradeFlushFunction: (() => void) | null
  
  // Flag to track if we're in battle (for disabling back button)
  isInBattle: boolean
  
  // Flag to track if we're in battle end view (for handling back button)
  isInBattleEndView: boolean
  
  // Completion function for battle end (set by SiteExploreContent)
  battleEndCompleteFunction: (() => void) | null
  
  // Active overlay
  activeOverlay: Overlay
  
  // Overlay data (for itemDialog, etc.)
  overlayData: any
  
  // Death reason (stored when death overlay is shown)
  deathReason: DeathReason | null
  
  // Dialog state
  dialog: {
    title: string
    message: string
    buttons: Array<{ label: string; onClick: () => void }>
  } | null
  
  // Notifications
  notifications: Array<{
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    timestamp: number
  }>
  
  // Actions
  setScene: (scene: Scene) => void
  openPanelAction: (panel: Panel, buildingId?: number, siteId?: number, npcId?: number) => void
  closePanel: () => void
  showNPCStoragePanel: (npcId: number) => void
  hideNPCStoragePanel: () => void
  setWorkStorageView: (isInWorkStorageView: boolean) => void
  setWorkStorageFlushFunction: (flushFunction: (() => void) | null) => void
  setNPCTradeFlushFunction: (flushFunction: (() => void) | null) => void
  setInBattle: (isInBattle: boolean) => void
  setBattleEndView: (isInBattleEndView: boolean) => void
  setBattleEndCompleteFunction: (completeFunction: (() => void) | null) => void
  showOverlay: (overlay: Overlay, data?: any) => void
  showItemDialog: (itemId: string, source: 'storage' | 'bag' | 'bazaar', showOnly?: boolean) => void
  showBuildDialog: (buildingId: number, level: number) => void
  showRecipeDialog: (buildingId: number, recipeIndex: number) => void
  hideOverlay: () => void
  showDialog: (dialog: UIStore['dialog']) => void
  hideDialog: () => void
  addNotification: (message: string, type?: UIStore['notifications'][0]['type']) => void
  removeNotification: (id: string) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  currentScene: 'menu',
  openPanel: null,
  buildPanelBuildingId: null,
  sitePanelSiteId: null,
  siteStoragePanelSiteId: null,
  siteExplorePanelSiteId: null,
  npcPanelNpcId: null,
  npcStoragePanelNpcId: null,
  isInWorkStorageView: false,
  workStorageFlushFunction: null,
  npcTradeFlushFunction: null,
  isInBattle: false,
  isInBattleEndView: false,
  battleEndCompleteFunction: null,
  activeOverlay: null,
  overlayData: null,
  deathReason: null,
  dialog: null,
  notifications: [],
  
  setScene: (scene: Scene) => set({ currentScene: scene }),
  
  openPanelAction: (panel: Panel, buildingId?: number, siteId?: number, npcId?: number) => set({ 
    openPanel: panel,
    buildPanelBuildingId: panel === 'build' ? (buildingId ?? null) : null,
    sitePanelSiteId: panel === 'site' ? (siteId ?? null) : null,
    siteStoragePanelSiteId: panel === 'siteStorage' ? (siteId ?? null) : null,
    siteExplorePanelSiteId: panel === 'siteExplore' ? (siteId ?? null) : null,
    npcPanelNpcId: panel === 'npc' ? (npcId ?? null) : null,
    npcStoragePanelNpcId: panel === 'npcStorage' ? (npcId ?? null) : null
  }),
  
  closePanel: () => set({ openPanel: null, buildPanelBuildingId: null, sitePanelSiteId: null, siteStoragePanelSiteId: null, siteExplorePanelSiteId: null, npcPanelNpcId: null, npcStoragePanelNpcId: null, isInWorkStorageView: false, workStorageFlushFunction: null, npcTradeFlushFunction: null, isInBattle: false, isInBattleEndView: false, battleEndCompleteFunction: null }),
  
  showNPCStoragePanel: (npcId: number) => set({ 
    openPanel: 'npcStorage',
    npcStoragePanelNpcId: npcId
  }),
  
  hideNPCStoragePanel: () => set({ 
    openPanel: null,
    npcStoragePanelNpcId: null
  }),
  
  setWorkStorageView: (isInWorkStorageView: boolean) => set({ isInWorkStorageView }),
  
  setWorkStorageFlushFunction: (flushFunction: (() => void) | null) => set({ 
    workStorageFlushFunction: flushFunction
  }),
  
  setNPCTradeFlushFunction: (flushFunction: (() => void) | null) => set({ 
    npcTradeFlushFunction: flushFunction
  }),
  
  setInBattle: (isInBattle: boolean) => set({ isInBattle }),
  
  setBattleEndView: (isInBattleEndView: boolean) => set({ isInBattleEndView }),
  
  setBattleEndCompleteFunction: (completeFunction: (() => void) | null) => set({ 
    battleEndCompleteFunction: completeFunction
  }),
  
  showOverlay: (overlay: Overlay, data?: any) => {
    // Prevent other overlays when death overlay is active (hardlock)
    const currentState = get()
    if (currentState.activeOverlay === 'death' && overlay !== 'death') {
      // Death overlay is active, prevent showing other overlays
      return
    }
    
    if (overlay === 'death' && data?.reason) {
      set({ activeOverlay: overlay, deathReason: data.reason, overlayData: data })
    } else {
      set({ activeOverlay: overlay, overlayData: data })
    }
  },
  
  showItemDialog: (itemId: string, source: 'storage' | 'bag' | 'bazaar', showOnly?: boolean) => {
    // Prevent showing item dialog when death overlay is active (hardlock)
    const currentState = get()
    if (currentState.activeOverlay === 'death') {
      return
    }
    
    set({ 
      activeOverlay: 'itemDialog', 
      overlayData: { itemId, source, showOnly } 
    })
  },
  
  showBuildDialog: (buildingId: number, level: number) => {
    // Prevent showing build dialog when death overlay is active (hardlock)
    const currentState = get()
    if (currentState.activeOverlay === 'death') {
      return
    }
    
    set({ 
      activeOverlay: 'buildDialog', 
      overlayData: { buildingId, level } 
    })
  },
  
  showRecipeDialog: (buildingId: number, recipeIndex: number) => {
    // Prevent showing recipe dialog when death overlay is active (hardlock)
    const currentState = get()
    if (currentState.activeOverlay === 'death') {
      return
    }
    
    set({ 
      activeOverlay: 'recipeDialog', 
      overlayData: { buildingId, recipeIndex } 
    })
  },
  
  hideOverlay: () => set({ activeOverlay: null, overlayData: null, deathReason: null }),
  
  showDialog: (dialog: UIStore['dialog']) => set({ dialog }),
  
  hideDialog: () => set({ dialog: null }),
  
  addNotification: (message: string, type: UIStore['notifications'][0]['type'] = 'info') => set((state: UIStore) => {
    const id = `${Date.now()}-${Math.random()}`
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    }
    return {
      notifications: [...state.notifications, notification]
    }
  }),
  
  removeNotification: (id: string) => set((state: UIStore) => ({
    notifications: state.notifications.filter((n: UIStore['notifications'][0]) => n.id !== id)
  }))
}))

