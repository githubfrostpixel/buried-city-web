import { create } from 'zustand'
import type { DeathReason } from '@/types/game.types'

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
  | 'site'
  | 'siteStorage'
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
  openPanelAction: (panel: Panel, buildingId?: number, siteId?: number) => void
  closePanel: () => void
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

export const useUIStore = create<UIStore>((set) => ({
  currentScene: 'menu',
  openPanel: null,
  buildPanelBuildingId: null,
  sitePanelSiteId: null,
  siteStoragePanelSiteId: null,
  activeOverlay: null,
  overlayData: null,
  deathReason: null,
  dialog: null,
  notifications: [],
  
  setScene: (scene: Scene) => set({ currentScene: scene }),
  
  openPanelAction: (panel: Panel, buildingId?: number, siteId?: number) => set({ 
    openPanel: panel,
    buildPanelBuildingId: panel === 'build' ? (buildingId ?? null) : null,
    sitePanelSiteId: panel === 'site' ? (siteId ?? null) : null,
    siteStoragePanelSiteId: panel === 'siteStorage' ? (siteId ?? null) : null
  }),
  
  closePanel: () => set({ openPanel: null, buildPanelBuildingId: null, sitePanelSiteId: null, siteStoragePanelSiteId: null }),
  
  showOverlay: (overlay: Overlay, data?: any) => {
    if (overlay === 'death' && data?.reason) {
      set({ activeOverlay: overlay, deathReason: data.reason, overlayData: data })
    } else {
      set({ activeOverlay: overlay, overlayData: data })
    }
  },
  
  showItemDialog: (itemId: string, source: 'storage' | 'bag' | 'bazaar', showOnly?: boolean) => {
    set({ 
      activeOverlay: 'itemDialog', 
      overlayData: { itemId, source, showOnly } 
    })
  },
  
  showBuildDialog: (buildingId: number, level: number) => {
    set({ 
      activeOverlay: 'buildDialog', 
      overlayData: { buildingId, level } 
    })
  },
  
  showRecipeDialog: (buildingId: number, recipeIndex: number) => {
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

