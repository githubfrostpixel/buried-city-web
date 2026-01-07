/**
 * Save File Scene
 * Ported from OriginalGame/src/ui/SaveFileScene.js
 * 
 * Displays save slots for selecting/creating/loading games
 * Matches original game UI layout: 4 slots with title, description, and action buttons
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { audioManager, MusicPaths, SoundPaths } from '@/core/game/core/AudioManager'
import { setSaveSlot, deleteSaveSlot, loadAll } from '@/core/game/systems/save'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { getImagePath } from '@/common/utils/assets'
import { cocosPosition, cocosToCssPosition } from '@/common/utils/position'
import { getString } from '@/common/utils/stringUtil'

interface SaveSlotData {
  slot: number
  hasData: boolean
  saveName?: string
  metadata?: string
}

export function SaveFileScene() {
  const uiStore = useUIStore()
  const [saveSlots, setSaveSlots] = useState<SaveSlotData[]>([
    { slot: 1, hasData: false },
    { slot: 2, hasData: false },
    { slot: 3, hasData: false },
    { slot: 4, hasData: false }
  ])
  const [cloningState, setCloningState] = useState(0)
  const [renamingState, setRenamingState] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [pendingDeleteSlot, setPendingDeleteSlot] = useState<number | null>(null)

  // Screen dimensions (640x1136 from original game)
  const screenWidth = 640
  const screenHeight = 1136
  const x = screenWidth / 2  // Center x
  const x2 = x - 250  // Left edge for text
  const x3 = x + 230  // Right edge for buttons
  const NODE_HEIGHT = 196
  const heightPadding = 30

  useEffect(() => {
    // Play ABYSS music (if available)
    // audioManager.playMusic(MusicPaths.ABYSS, false)
    
    // Check which slots have save data
    checkSaveSlots()
    
    return () => {
      // Stop music when leaving
      // audioManager.stopMusic()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTimeStr = (timeSeconds: number): string => {
    const d = Math.floor(timeSeconds / (24 * 60 * 60))
    const dTime = timeSeconds % (24 * 60 * 60)
    const h = Math.floor(dTime / (60 * 60))
    const hTime = dTime % (60 * 60)
    const m = Math.floor(hTime / 60)
    const filler = h < 10 ? "0" : ""
    const filler2 = m < 10 ? "0" : ""
    return `Day ${d}, ${filler}${h}:${filler2}${m}`
  }

  const getMetaStr = async (slot: number): Promise<[string, string]> => {
    setSaveSlot(slot)
    const saveData = await loadAll()
    
    let saveName = ""
    let saveMetaStr = ""
    
    if (!saveData) {
      // Empty slot
      saveName = getString(6001) || "Save File" // "Save File"
      if (!cloningState && !renamingState) {
        saveName += getString(6013) || "" // Additional text for empty slot
      }
    } else {
      // Has save data
      saveName = saveData.player.saveName || (getString(6001) || "Save File")
      const timeStr = getTimeStr(saveData.game.time)
      const talentCount = saveData.player.talent?.length || 0
      const currency = saveData.player.money || 0
      const additional = saveData.player.cloned ? (getString(6003) || "") : ""
      
      // Format: "Day X, HH:MM, talent: X, coin: X, [Cloned]"
      saveMetaStr = getString(6002, timeStr, talentCount, currency, additional) || 
        `${timeStr}, talent: ${talentCount}, coin: ${currency}${additional}`
      
      if (!cloningState && !renamingState) {
        saveMetaStr += getString(6014) || ""
      }
    }
    
    return [saveName, saveMetaStr]
  }

  const checkSaveSlots = async () => {
    const slots: SaveSlotData[] = []
    for (let i = 1; i <= 4; i++) {
      const [saveName, metadata] = await getMetaStr(i)
      setSaveSlot(i)
      const data = await loadAll()
      slots.push({
        slot: i,
        hasData: data !== null,
        saveName,
        metadata
      })
    }
    setSaveSlots(slots)
    // Reset to slot 1
    setSaveSlot(1)
  }

  const refreshData = async (slot: number) => {
    setSaveSlot(slot)
    const saveData = await loadAll()
    const [saveName, metadata] = await getMetaStr(slot)
    setSaveSlots(prev => prev.map(s => 
      s.slot === slot ? { ...s, saveName, metadata, hasData: !!saveData } : s
    ))
  }

  const refreshAll = async () => {
    await checkSaveSlots()
  }

  const handleCancel = async () => {
    if (cloningState || renamingState) {
      if (cloningState) {
        setCloningState(0)
        await refreshAll()
      } else {
        // Restore from rename
        setRenamingState(0)
        await refreshAll()
      }
    } else {
      audioManager.playEffect(SoundPaths.CLICK)
      uiStore.setScene('menu')
    }
  }

  const handleSlotClick = async (slot: number) => {
    if (blocked) return
    
    if (cloningState) {
      // Handle clone target selection
      const slotData = saveSlots.find(s => s.slot === slot)
      if (!slotData?.hasData) {
        // Can clone to empty slot
        // TODO: Implement clone functionality
        setCloningState(0)
        await refreshAll()
      } else {
        // Cannot clone to non-empty slot
        // TODO: Show error dialog
      }
      return
    }
    
    setBlocked(true)
    const slotData = saveSlots.find(s => s.slot === slot)
    
    if (!slotData?.hasData) {
      // Empty slot - start new game
      // TODO: Navigate to ChooseScene for talent selection
      setSaveSlot(slot)
      uiStore.setScene('main')
    } else {
      // Load existing save
      setSaveSlot(slot)
      // TODO: Load save data and restore game state
      uiStore.setScene('main')
    }
    setBlocked(false)
  }

  const handleDelete = (slot: number) => {
    if (blocked) return
    setBlocked(true)
    const slotData = saveSlots.find(s => s.slot === slot)
    const message = getString(6012, slot, slotData?.saveName || '') || 
                   `Are you sure you want to delete save slot ${slot}?`
    
    if (confirm(message)) {
      confirmDelete(slot)
    } else {
      setBlocked(false)
    }
  }

  const confirmDelete = async (slot: number) => {
    try {
      await deleteSaveSlot(slot)
      await refreshData(slot)
      setBlocked(false)
    } catch (error) {
      console.error('Failed to delete save slot:', error)
      alert('Failed to delete save slot')
      setBlocked(false)
    }
  }

  const handleRename = (slot: number) => {
    if (blocked) return
    setBlocked(true)
    setRenamingState(slot)
    // TODO: Show rename input dialog
    // For now, just restore
    setRenamingState(0)
    setBlocked(false)
  }

  const handleClone = (slot: number) => {
    if (blocked) return
    setBlocked(true)
    setCloningState(slot)
    // TODO: Show clone dialog
    setBlocked(false)
  }

  const getSlotY = (index: number): number => {
    // Title is at y = screenHeight - 50 = 1086
    // Slot positions: title.y + 180 - (10 + index * (heightPadding + NODE_HEIGHT))
    return 1086 + 180 - (10 + index * (heightPadding + NODE_HEIGHT))
  }

  return (
    <div className="relative w-full h-full" style={{ width: screenWidth, height: screenHeight }}>
      {/* Title */}
      <div 
        className="absolute text-white text-center"
        style={{
          ...cocosPosition(x, screenHeight - 50, 0.5, 0.5, screenHeight),
          fontSize: '24px',
          fontWeight: 'bold'
        }}
      >
        {cloningState ? (getString(6011) || "Select target slot") : 
         renamingState ? (getString(6016) || "Rename save file") :
         (getString(6000) || "Select Save File")}
      </div>

      {/* Save Slots */}
      {saveSlots.map((slotData, index) => {
        const y = getSlotY(index + 1)
        const showButtons = slotData.hasData && !cloningState && !renamingState
        
        return (
          <div key={slotData.slot} className="absolute">
            {/* Save Name (Title) */}
            <div
              className="absolute text-white"
              style={{
                ...cocosToCssPosition(
                  { x: x2, y: y - 40 },
                  { x: 0, y: 1 },  // Top-left anchor
                  undefined,
                  screenHeight
                ),
                fontSize: '20px',
                fontWeight: 'bold',
                display: renamingState === slotData.slot ? 'none' : 'block'
              }}
            >
              {slotData.saveName || `Save File ${slotData.slot}`}
            </div>

            {/* Save Description (Metadata) */}
            <div
              className="absolute text-gray-300"
              style={{
                ...cocosToCssPosition(
                  { x: x2, y: y - 90 },
                  { x: 0, y: 1 },  // Top-left anchor
                  undefined,
                  screenHeight
                ),
                fontSize: '16px'
              }}
            >
              {slotData.metadata || (slotData.hasData ? 'Save data exists' : 'Empty')}
            </div>

            {/* Save Slot Button (560x158) */}
            <button
              onClick={() => handleSlotClick(slotData.slot)}
              className="absolute cursor-pointer"
              style={{
                ...cocosPosition(x, y - 100, 0.5, 0.5, screenHeight),
                width: '560px',
                height: '158px',
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
            >
              <Sprite 
                atlas="new_temp" 
                frame="save_slot.png"
                className="w-full h-full"
              />
            </button>

            {/* Action Buttons (only show if has data and not in special states) */}
            {showButtons && (
              <>
                {/* Rename Button (icon_iap_info.png) */}
                <button
                  onClick={() => handleRename(slotData.slot)}
                  className="absolute cursor-pointer"
                  style={{
                    ...cocosPosition(x3, y - 50, 0.5, 0.5, screenHeight),
                    width: '44px',
                    height: '44px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0
                  }}
                >
                  <img 
                    src={getImagePath('sprites/icon_iap_info.png')} 
                    alt="Rename"
                    className="w-full h-full"
                  />
                </button>

                {/* Clone Button (icon_save_copy.png) */}
                <button
                  onClick={() => handleClone(slotData.slot)}
                  className="absolute cursor-pointer"
                  style={{
                    ...cocosPosition(x3, y - 100, 0.5, 0.5, screenHeight),
                    width: '44px',
                    height: '44px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0
                  }}
                >
                  <img 
                    src={getImagePath('sprites/icon_save_copy.png')} 
                    alt="Clone"
                    className="w-full h-full"
                  />
                </button>

                {/* Delete Button (icon_save_delete.png) */}
                <button
                  onClick={() => handleDelete(slotData.slot)}
                  className="absolute cursor-pointer"
                  style={{
                    ...cocosPosition(x3, y - 150, 0.5, 0.5, screenHeight),
                    width: '44px',
                    height: '44px',
                    background: 'transparent',
                    border: 'none',
                    padding: 0
                  }}
                >
                  <img 
                    src={getImagePath('sprites/icon_save_delete.png')} 
                    alt="Delete"
                    className="w-full h-full"
                  />
                </button>
              </>
            )}
          </div>
        )
      })}

      {/* Cancel Button */}
      <div 
        className="absolute"
        style={{
          ...cocosPosition(x, 60, 0.5, 0.5, screenHeight),
          width: '242px',
          height: '74px'
        }}
      >
        <button
          onClick={handleCancel}
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
          <span className="relative z-10 text-black font-bold text-lg">
            {getString(1193) || "Cancel"}
          </span>
        </button>
      </div>

    </div>
  )
}
