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
  | 'bazaar'
  | 'dog'
  | 'radio'
  | null

export type Overlay = 
  | 'day'
  | 'death'
  | 'battleResult'
  | 'itemChange'
  | 'dialog'
  | 'itemDialog'
  | null

interface UIStore {
  // Current scene
  currentScene: Scene
  
  // Open panels
  openPanel: Panel
  
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
  openPanelAction: (panel: Panel) => void
  closePanel: () => void
  showOverlay: (overlay: Overlay, data?: any) => void
  showItemDialog: (itemId: string, source: 'storage' | 'bag' | 'bazaar', showOnly?: boolean) => void
  hideOverlay: () => void
  showDialog: (dialog: UIStore['dialog']) => void
  hideDialog: () => void
  addNotification: (message: string, type?: UIStore['notifications'][0]['type']) => void
  removeNotification: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentScene: 'menu',
  openPanel: null,
  activeOverlay: null,
  overlayData: null,
  deathReason: null,
  dialog: null,
  notifications: [],
  
  setScene: (scene: Scene) => set({ currentScene: scene }),
  
  openPanelAction: (panel: Panel) => set({ openPanel: panel }),
  
  closePanel: () => set({ openPanel: null }),
  
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

