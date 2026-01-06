/**
 * Save File Scene
 * Ported from OriginalGame/src/ui/SaveFileScene.js
 * 
 * Allows players to:
 * - View 4 save slots
 * - Create new games (empty slots)
 * - Load existing games
 * - Rename save files
 * - Clone save files
 * - Delete save files
 */

import { useEffect, useState, useRef } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { audioManager, MusicPaths, SoundPaths } from '@/core/game/systems/AudioManager'
import { cocosPosition } from '@/common/utils/position'
import { getString } from '@/common/utils/stringUtil'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { 
  setSaveSlot, 
  getSaveSlotMetadata, 
  loadAllForSlot, 
  cloneSaveSlot, 
  deleteSaveSlotComplete,
  saveMetadata,
  loadMetadata
} from '@/core/game/systems/SaveSystem'
import { game } from '@/core/game/Game'
import { restoreFromSave } from '@/core/game/systems/SaveSystem'
import { usePlayerStore } from '@/core/store/playerStore'
import { useBuildingStore } from '@/core/store/buildingStore'
import { useGameStore } from '@/core/store/gameStore'

const SCREEN_WIDTH = 640
const SCREEN_HEIGHT = 1136

interface SlotMetadata {
  name: string
  description: string
}

export function SaveFileScene() {
  const uiStore = useUIStore()
  const [cloningState, setCloningState] = useState<number | null>(null)
  const [renamingState, setRenamingState] = useState<number | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [slotMetadata, setSlotMetadata] = useState<(SlotMetadata | null)[]>(Array(4).fill(null))
  const renameInputRefs = useRef<(HTMLInputElement | null)[]>(Array(4).fill(null))

  useEffect(() => {
    // Play music if not in special mode
    audioManager.playMusic(MusicPaths.ABYSS, false)
    
    // Load all slot metadata
    refreshAllSlots()
    
    return () => {
      audioManager.stopMusic()
    }
  }, [])

  const refreshSlotData = async (slot: number) => {
    try {
      const metadata = await getSaveSlotMetadata(slot)
      setSlotMetadata(prev => {
        const newData = [...prev]
        newData[slot - 1] = metadata
        return newData
      })
    } catch (error) {
      console.error(`Failed to refresh slot ${slot}:`, error)
    }
  }

  const refreshAllSlots = async () => {
    for (let i = 1; i <= 4; i++) {
      await refreshSlotData(i)
    }
  }

  const handleBack = () => {
    audioManager.playEffect(SoundPaths.CLICK)
    
    if (cloningState) {
      setCloningState(null)
      refreshAllSlots()
    } else if (renamingState) {
      restoreFromRename(renamingState)
    } else {
      uiStore.setScene('menu')
    }
  }

  const handleSlotClick = async (slot: number) => {
    if (blocked) return
    
    audioManager.playEffect(SoundPaths.CLICK)
    
    if (cloningState) {
      // Clone mode: clone to this slot
      const metadata = slotMetadata[slot - 1]
      if (metadata?.description) {
        // Slot is not empty
        setBlocked(true)
        uiStore.showOverlay('confirmationDialog', {
          title: '',
          message: getString('6004', cloningState.toString(), slot.toString()),
          confirmText: getString('1030'),
          cancelText: getString('1193'),
          onConfirm: () => {
            performClone(cloningState, slot)
          },
          onCancel: () => {
            setBlocked(false)
          }
        })
      } else {
        // Slot is empty, clone directly
        await performClone(cloningState, slot)
      }
    } else {
      // Normal mode: new game or load
      const metadata = slotMetadata[slot - 1]
      if (!metadata?.description) {
        // Empty slot - start new game
        await startNewGame(slot)
      } else {
        // Has save - load game
        await loadGame(slot)
      }
    }
  }

  const performClone = async (sourceSlot: number, targetSlot: number) => {
    try {
      setBlocked(true)
      await cloneSaveSlot(sourceSlot, targetSlot)
      setCloningState(null)
      await refreshAllSlots()
      setBlocked(false)
    } catch (error) {
      console.error('Failed to clone save:', error)
      uiStore.addNotification('Failed to clone save file', 'error')
      setBlocked(false)
    }
  }

  const startNewGame = async (slot: number) => {
    try {
      setBlocked(true)
      setSaveSlot(slot)
      
      // Initialize new game (same as MenuScene)
      game.initialize()
      game.resume()
      
      const playerStore = usePlayerStore.getState()
      const buildingStore = useBuildingStore.getState()
      const gameStore = useGameStore.getState()
      
      // Reset player attributes
      playerStore.updateAttribute('hp', 100)
      playerStore.updateAttribute('spirit', 50)
      playerStore.updateAttribute('starve', 50)
      playerStore.updateAttribute('vigour', 50)
      playerStore.updateAttribute('injury', 0)
      playerStore.updateAttribute('infect', 0)
      playerStore.updateAttribute('water', 50)
      playerStore.updateAttribute('virus', 0)
      playerStore.updateAttribute('temperature', 20)
      
      playerStore.setCurrency(0)
      
      // Set default save name if empty
      if (!playerStore.saveName) {
        playerStore.setSaveName(getString('6007')) // "Save File"
      }
      
      // Clear inventory
      Object.keys(playerStore.bag).forEach(itemId => {
        playerStore.removeItemFromBag(itemId, playerStore.getBagItemCount(itemId))
      })
      Object.keys(playerStore.storage).forEach(itemId => {
        playerStore.removeItemFromStorage(itemId, playerStore.getStorageItemCount(itemId))
      })
      
      // Reset equipment
      playerStore.equipItem('gun', null)
      playerStore.equipItem('weapon', null)
      playerStore.equipItem('equip', null)
      playerStore.equipItem('tool', null)
      playerStore.equipItem('special', null)
      
      // Reset dog
      playerStore.updateDogHunger(50)
      playerStore.updateDogMood(50)
      playerStore.updateDogInjury(0)
      playerStore.setDogActive(false)
      
      // Initialize map
      playerStore.initializeMap()
      playerStore.setLocation({ isAtHome: true, isAtBazaar: false, isAtSite: false, siteId: null })
      
      // Initialize buildings
      buildingStore.initialize()
      
      // Initialize game time
      gameStore.setTime(6 * 60 * 60 + 1)
      gameStore.initializeWeatherSystem()
      
      // Save initial state FIRST before navigating
      const { saveAll } = await import('@/core/game/systems/SaveSystem')
      await saveAll()
      
      // Navigate to main scene after save completes
      setBlocked(false)
      uiStore.setScene('main')
    } catch (error) {
      console.error('Failed to start new game:', error)
      setBlocked(false)
    }
  }

  const loadGame = async (slot: number) => {
    try {
      setBlocked(true)
      setSaveSlot(slot)
      
      const saveData = await loadAllForSlot(slot)
      if (!saveData) {
        uiStore.addNotification('Failed to load save file', 'error')
        setBlocked(false)
        return
      }
      
      await restoreFromSave(saveData)
      
      // Restore save name
      const metadata = await loadMetadata(slot)
      if (metadata?.saveName) {
        const playerStore = usePlayerStore.getState()
        playerStore.setSaveName(metadata.saveName)
      }
      
      setBlocked(false)
      uiStore.setScene('main')
    } catch (error) {
      console.error('Failed to load game:', error)
      uiStore.addNotification('Failed to load save file', 'error')
      setBlocked(false)
    }
  }

  const handleRename = (slot: number) => {
    if (blocked) return
    
    audioManager.playEffect(SoundPaths.CLICK)
    setRenamingState(slot)
    refreshAllSlots()
    
    // Focus input after state update
    setTimeout(() => {
      const input = renameInputRefs.current[slot - 1]
      if (input) {
        input.focus()
        input.select()
      }
    }, 100)
  }

  const handleRenameSubmit = async (slot: number, value: string) => {
    // Validate: no commas or pipes
    if (value.match(/[,|]/)) {
      uiStore.addNotification(getString('1234'), 'error')
      const input = renameInputRefs.current[slot - 1]
      if (input) {
        input.value = ''
      }
      return
    }
    
    // Calculate real length (accounting for character width)
    let realLen = 0
    let realStr = ''
    const maxLen = 36
    
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i)
      if (charCode >= 65 && charCode <= 90) {
        realLen += 1.3
      } else if (charCode >= 0 && charCode <= 128) {
        realLen += 1
      } else {
        realLen += 2
      }
      realStr += value[i]
      if (realLen >= maxLen) {
        break
      }
    }
    
    if (realStr === '') {
      realStr = getString('6007') // "Save File"
    }
    
    // Save metadata
    const metadata = await loadMetadata(slot)
    if (metadata) {
      metadata.saveName = realStr
      await saveMetadata(slot, metadata)
    }
    
    restoreFromRename(slot)
  }

  const restoreFromRename = (slot: number) => {
    const input = renameInputRefs.current[slot - 1]
    if (input) {
      input.style.display = 'none'
    }
    setBlocked(false)
    setRenamingState(null)
    refreshAllSlots()
  }

  const handleClone = (slot: number) => {
    if (blocked) return
    
    audioManager.playEffect(SoundPaths.CLICK)
    const metadata = slotMetadata[slot - 1]
    
    setBlocked(true)
    uiStore.showOverlay('confirmationDialog', {
      title: getString('6009'), // "Save Cloning"
      message: getString('6010', slot.toString(), metadata?.name || ''),
      confirmText: getString('1143'), // "Continue"
      cancelText: getString('1193'), // "Return"
      onConfirm: () => {
        setCloningState(slot)
        setBlocked(false)
      },
      onCancel: () => {
        setBlocked(false)
      }
    })
  }

  const handleDelete = (slot: number) => {
    if (blocked) return
    
    audioManager.playEffect(SoundPaths.CLICK)
    const metadata = slotMetadata[slot - 1]
    
    setBlocked(true)
    uiStore.showOverlay('confirmationDialog', {
      title: '',
      message: `Are you sure you want to delete "${metadata?.name || 'Save File'}"?`,
      confirmText: getString('1030'), // "Continue"
      cancelText: getString('1193'), // "Return"
      onConfirm: async () => {
        try {
          await deleteSaveSlotComplete(slot)
          // Refresh the slot to show it as empty
          await refreshSlotData(slot)
          setBlocked(false)
        } catch (error) {
          console.error('Failed to delete save:', error)
          uiStore.addNotification('Failed to delete save file', 'error')
          setBlocked(false)
        }
      },
      onCancel: () => {
        setBlocked(false)
      }
    })
  }

  const getTitle = () => {
    if (cloningState) {
      return getString('6011') // "Select Empty Save Slot to Clone"
    } else if (renamingState) {
      return getString('6016') // "Rename Save File"
    } else {
      return getString('6000') // "Select a save file"
    }
  }

  const slotCoords = [
    { y: 1056 }, // Slot 1 (moved up by 80)
    { y: 830 },  // Slot 2 (moved up by 80)
    { y: 604 },  // Slot 3 (moved up by 80)
    { y: 378 }   // Slot 4 (moved up by 80)
  ]

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ maxWidth: SCREEN_WIDTH, maxHeight: SCREEN_HEIGHT }}>
      {/* Title */}
      <div 
        className="absolute text-white text-center"
        style={cocosPosition(320, 1086, 0.5, 0.5, SCREEN_HEIGHT)}
      >
        <div className="text-lg font-bold">{getTitle()}</div>
      </div>

      {/* Save Slots */}
      {[1, 2, 3, 4].map((slot) => {
        const metadata = slotMetadata[slot - 1]
        const isEmpty = !metadata || !metadata.description
        const coords = slotCoords[slot - 1]
        const x2 = 90 // x - 250 (320 - 250 = 70, but using 90 for better spacing)
        const x3 = 550 // x + 230 (320 + 230 = 550)
        const isRenaming = renamingState === slot
        
        return (
          <div key={slot}>
            {/* Slot Background */}
            <div
              className="absolute cursor-pointer"
              style={{
                ...cocosPosition(320, coords.y - 100, 0.5, 0.5, SCREEN_HEIGHT),
                width: '560px',
                height: '158px'
              }}
              onClick={() => handleSlotClick(slot)}
            >
              <Sprite 
                atlas="new_temp" 
                frame="save_slot.png"
                className="w-full h-full"
              />
            </div>

            {/* Title Text */}
            {!isRenaming && (
              <div
                className="absolute text-white"
                style={{
                  ...cocosPosition(x2, coords.y - 60, 0, 1, SCREEN_HEIGHT),
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                {metadata?.name || getString('6001')}
              </div>
            )}

            {/* Description Text */}
            {!isRenaming && (
              <div
                className="absolute text-white"
                style={{
                  ...cocosPosition(x2, coords.y - 110, 0, 1, SCREEN_HEIGHT),
                  fontSize: '16px'
                }}
              >
                {metadata?.description || ''}
              </div>
            )}

            {/* Rename Input */}
            {isRenaming && (
              <input
                ref={(el) => { renameInputRefs.current[slot - 1] = el }}
                type="text"
                className="absolute bg-transparent border border-white text-white px-2 py-1"
                style={{
                  ...cocosPosition(x2, coords.y - 60, 0, 1, SCREEN_HEIGHT),
                  width: '343px',
                  height: '40px',
                  fontSize: '16px'
                }}
                placeholder={getString('6008')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameSubmit(slot, e.currentTarget.value)
                  } else if (e.key === 'Escape') {
                    restoreFromRename(slot)
                  }
                }}
                onBlur={(e) => {
                  handleRenameSubmit(slot, e.currentTarget.value)
                }}
              />
            )}

            {/* Action Buttons (only show if slot has save and not in special modes) */}
            {!isEmpty && !cloningState && !renamingState && (
              <>
                {/* Rename Button */}
                <button
                  className="absolute w-11 h-11 cursor-pointer"
                  style={cocosPosition(x3, coords.y - 70, 0.5, 0.5, SCREEN_HEIGHT)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRename(slot)
                  }}
                >
                  <Sprite atlas="icon" frame="icon_iap_info.png" className="w-full h-full" />
                </button>

                {/* Clone Button */}
                <button
                  className="absolute w-11 h-11 cursor-pointer"
                  style={cocosPosition(x3, coords.y - 120, 0.5, 0.5, SCREEN_HEIGHT)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClone(slot)
                  }}
                >
                  <Sprite atlas="new_temp" frame="icon_save_copy.png" className="w-full h-full" />
                </button>

                {/* Delete Button */}
                <button
                  className="absolute w-11 h-11 cursor-pointer"
                  style={cocosPosition(x3, coords.y - 170, 0.5, 0.5, SCREEN_HEIGHT)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(slot)
                  }}
                >
                  <Sprite atlas="new_temp" frame="icon_save_delete.png" className="w-full h-full" />
                </button>
              </>
            )}
          </div>
        )
      })}

      {/* Back Button */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(320, 60, 0.5, 0.5, SCREEN_HEIGHT),
          width: '242px',
          height: '74px'
        }}
      >
        <button
          onClick={handleBack}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <Sprite 
            atlas="ui" 
            frame="btn_common_white_normal.png"
            className="absolute inset-0"
            style={{ width: '242px', height: '74px' }}
          />
          <span className="relative z-10 text-black font-bold text-lg">{getString('1193')}</span>
        </button>
      </div>
    </div>
  )
}

