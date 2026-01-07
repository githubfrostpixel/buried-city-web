/**
 * RadioPanelContent Component
 * Radio panel for sending and receiving messages
 * Ported from OriginalGame/src/ui/radioNode.js
 */

import { useEffect, useState, useCallback } from 'react'
import { useBuildingStore } from '@/core/store/buildingStore'
import { useUIStore } from '@/core/store/uiStore'
import { BOTTOM_BAR_LAYOUT } from '@/layout/layoutConstants'
import { RadioMessageView } from './RadioMessageView'
import { RadioEditBox } from './RadioEditBox'
import { UpgradeView } from './UpgradeView'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { processRadioCommand, type RadioMessage } from '@/core/game/shelter/actions/RadioCommandProcessor'
import { getUUID, getSaveSlot } from '@/core/game/systems/save'
import { game } from '@/core/game/Game'
import { audioManager } from '@/core/game/core/AudioManager'
import { SoundPaths } from '@/core/game/core/AudioManager'
import { getString } from '@/common/utils/stringUtil'

const RADIO_BUILDING_ID = 15

/**
 * Load radio messages from localStorage
 */
function loadRadioMessages(saveSlot: number): RadioMessage[] {
  const key = `radio${saveSlot}`
  const data = localStorage.getItem(key) || '[]'
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

/**
 * Save radio message to localStorage
 */
function saveRadioMessage(saveSlot: number, message: RadioMessage): void {
  const key = `radio${saveSlot}`
  const messages = loadRadioMessages(saveSlot)
  
  // Truncate message if > 40 chars (only when saving player's own message)
  let msgToSave = message.msg
  if (msgToSave.length > 40) {
    msgToSave = msgToSave.substring(0, 40) + '...'
  }
  
  const messageToSave = { ...message, msg: msgToSave }
  
  // Add to front (newest first)
  messages.unshift(messageToSave)
  
  // Keep max 30 messages
  if (messages.length > 30) {
    messages.pop()
  }
  
  localStorage.setItem(key, JSON.stringify(messages))
}

export function RadioPanelContent() {
  const buildingStore = useBuildingStore()
  const uiStore = useUIStore()
  const [messages, setMessages] = useState<RadioMessage[]>([])
  const [playerUid, setPlayerUid] = useState<string | number>('')
  const [backupString, setBackupString] = useState<string>('')
  
  const building = buildingStore.getBuilding(RADIO_BUILDING_ID)
  const isVisible = building && building.level >= 0
  
  // Get building name for title
  const buildingName = building && buildingStore.room
    ? buildingStore.room.getBuildCurrentName(RADIO_BUILDING_ID)
    : (() => {
        // Fallback: get from string system using level 0
        const buildingConfig = getString('15_0')
        return typeof buildingConfig === 'object' && buildingConfig !== null && 'title' in buildingConfig
          ? buildingConfig.title as string
          : 'Radio'
      })()
  
  // Load messages and UUID on mount
  useEffect(() => {
    const loadData = async () => {
      const saveSlot = getSaveSlot()
      const uuid = await getUUID()
      setPlayerUid(uuid)
      
      if (isVisible) {
        const loadedMessages = loadRadioMessages(saveSlot)
        // Reverse to show oldest first (for display, newest at bottom)
        setMessages([...loadedMessages].reverse())
      }
    }
    
    loadData()
  }, [isVisible])
  
  // Play radio sound on mount
  useEffect(() => {
    audioManager.playEffect(SoundPaths.RADIO)
  }, [])
  
  // Handle message send
  const handleSendMessage = useCallback(async (command: string) => {
    const timeManager = game.getTimeManager()
    const currentTime = timeManager.now()
    const saveSlot = getSaveSlot()
    
    // Process command
    const result = await processRadioCommand(command, currentTime)
    const responseMessage = result.message
    
    // If backup command, set backup string
    if (result.effects?.type === 'backup' && result.effects.data) {
      setBackupString(JSON.stringify(result.effects.data))
    }
    
    // Save player's original message
    const playerMessage: RadioMessage = {
      uid: playerUid,
      msg: command,
      time: currentTime
    }
    saveRadioMessage(saveSlot, playerMessage)
    
    // Save response message (if different from command)
    if (responseMessage.msg !== command) {
      saveRadioMessage(saveSlot, responseMessage)
    }
    
    // Reload messages
    const loadedMessages = loadRadioMessages(saveSlot)
    setMessages([...loadedMessages].reverse())
  }, [playerUid])
  
  // Handle backup string from edit box
  const handleBackupString = useCallback((backup: string) => {
    setBackupString(backup)
  }, [])
  
  // Layout calculations
  const bgWidth = BOTTOM_BAR_LAYOUT.bgWidth
  const bgHeight = BOTTOM_BAR_LAYOUT.bgHeight
  const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight
  
  // Upgrade view height (from UpgradeView component)
  const upgradeViewHeight = 100 // UpgradeView has fixed height of 100px
  
  // Section view position (below upgrade view)
  const sectionViewTop = contentTopLineHeight - upgradeViewHeight
  
  // MessageView dimensions
  // Original: size(bg.width - 14, sectionView.y - sectionView.height - 60)
  // sectionView.y in Cocos = sectionViewTop
  // sectionView.height estimated = 50
  // So height = sectionViewTop - 50 - 60 = sectionViewTop - 110
  const msgViewWidth = bgWidth - 14
  const msgViewHeight = sectionViewTop - 60 // Approximate
  
  // EditBox dimensions
  const editBoxWidth = bgWidth - 30
  const editBoxHeight = 45
  
  // Placeholder text (String ID 1148: "Call out")
  const placeholder = getString(1148) || 'Call out'
  
  return (
    <div className="relative w-full h-full overflow-x-hidden">
        {/* Upgrade View - positioned at top of content area */}
        {/* Always show upgrade view (even when maxed, shows "Max Level") */}
        {/* In CSS content area: top = 0 (at the very top) */}
        {building && (
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '0px',
              transform: 'translateX(-50%)',
              width: '600px' // UpgradeView has fixed width of 600px
            }}
            data-test-id="radio-upgrade-view"
          >
            <UpgradeView
              building={building}
              onUpgradeComplete={() => {
                // Trigger any necessary updates after upgrade completes
              }}
            />
          </div>
        )}
        
        {/* Section View - frame separator */}
        {/* Positioned at contentTopLineHeight - upgradeView.height with anchor (0.5, 1) */}
        {/* In CSS content area: top = upgradeViewHeight = 100px */}
        <div
          className="absolute"
          style={{
            left: '51.4%',
            top: `${90}px`,
            transform: 'translateX(-50%)',
            width: '600px',
            height: 'auto'
          }}
        >
          <Sprite
            atlas="ui"
            frame="frame_section_bg.png"
            className="block"
            data-test-id="radio-section-view"
          />
          
          {/* Operator text - positioned at (20, sectionView.height / 2) with anchor (0, 0.5) */}
          <div
            className="absolute"
            style={{
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              color: '#000000',
              fontWeight: 'normal'
            }}
          >
            {getString(1004) || 'Operate'}
          </div>
        </div>
        
        {/* MessageView - only visible if building level >= 0 */}
        {isVisible && (
          <RadioMessageView
            messages={messages}
            playerUid={playerUid}
            width={msgViewWidth}
            height={msgViewHeight}
          />
        )}
        
        {/* EditBox - only visible if building level >= 0 */}
        {isVisible && (
          <RadioEditBox
            width={editBoxWidth}
            height={editBoxHeight}
            placeholder={placeholder}
            onSubmit={handleSendMessage}
            onBackupString={handleBackupString}
          />
        )}
    </div>
  )
}

