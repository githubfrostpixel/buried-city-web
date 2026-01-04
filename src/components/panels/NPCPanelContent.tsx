/**
 * NPCPanelContent Component
 * NPC interaction panel for trading, gifting, and dialog
 * Ported from OriginalGame/src/ui/npcNode.js
 * 
 * Structure:
 * - Title: NPC name with heart display (reputation)
 * - NPC description image (npc_dig_bg.png with npc_dig_{id}.png)
 * - NPC dialog text
 * - Need item section (give item button)
 * - Trade section (trade button)
 * - Steal section (steal button, alert level, steal chance)
 * - Steal log button
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { usePlayerStore } from '@/store/playerStore'
import { Sprite } from '@/components/sprites/Sprite'
import { getString } from '@/utils/stringUtil'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { cocosToCssY } from '@/utils/position'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'
import type { NPC } from '@/game/entities/NPC'

/**
 * Heart display component for reputation
 * Ported from OriginalGame/src/ui/uiUtil.js createHeartNode()
 */
function HeartDisplay({ reputation }: { reputation: number }) {
  const heartNum = 5
  const heartPadding = 5
  const heartWidth = 20  // Approximate width of icon_heart_bg.png
  const heartHeight = 20  // Approximate height
  
  // Calculate which hearts to show
  // Reputation is 0-10, displayed as 5 hearts (each heart = 2 reputation)
  const min = Math.floor(reputation / 2)  // Full hearts
  const max = Math.ceil(reputation / 2)   // Total hearts (including half)
  const hasHalf = max !== min
  
  return (
    <div
      style={{
        display: 'flex',
        gap: `${heartPadding}px`,
        alignItems: 'center',
        height: `${heartHeight}px`
      }}
    >
      {Array.from({ length: heartNum }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            width: `${heartWidth}px`,
            height: `${heartHeight}px`
          }}
        >
          {/* Heart background */}
          <Sprite
            atlas="icon"
            frame="icon_heart_bg.png"
            style={{
              width: `${heartWidth}px`,
              height: `${heartHeight}px`
            }}
          />
          {/* Full heart */}
          {i < min && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: 1
              }}
            >
              <Sprite
                atlas="icon"
                frame="icon_heart_full.png"
                style={{
                  width: `${heartWidth}px`,
                  height: `${heartHeight}px`
                }}
              />
            </div>
          )}
          {/* Half heart */}
          {hasHalf && i === (max - 1) && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                zIndex: 1
              }}
            >
              <Sprite
                atlas="icon"
                frame="icon_heart_half.png"
                style={{
                  width: `${heartWidth}px`,
                  height: `${heartHeight}px`
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function NPCPanelContent() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const npcId = uiStore.npcPanelNpcId
  
  // Get NPC instance
  const [npc, setNpc] = useState<NPC | null>(null)
  const [dialogText, setDialogText] = useState<string>('')
  const [needItemInfo, setNeedItemInfo] = useState<{ itemId: string; num: number } | null>(null)
  const [hasNeedItem, setHasNeedItem] = useState<number>(0)
  const [tradeItemCount, setTradeItemCount] = useState<number>(0)
  
  // Get content area dimensions
  const bgWidth = BOTTOM_BAR_LAYOUT.bgWidth
  const leftEdge = 40
  
  // Load NPC data
  useEffect(() => {
    if (!npcId) return
    
    try {
      const npcManager = playerStore.getNPCManager()
      const npcInstance = npcManager.getNPC(npcId)
      setNpc(npcInstance)
      
      // Get dialog text
      setDialogText(npcInstance.getDialog())
      
      // Get need item info
      const needItem = npcInstance.getNeedItem()
      if (needItem) {
        setNeedItemInfo({
          itemId: String(needItem.itemId),
          num: needItem.num
        })
        // Check if player has the item
        const playerCount = playerStore.getBagItemCount(String(needItem.itemId)) + 
                          playerStore.getStorageItemCount(String(needItem.itemId))
        setHasNeedItem(playerCount)
      } else {
        setNeedItemInfo(null)
        setHasNeedItem(0)
      }
      
      // Get trade item count (number of unique item types)
      const tradeCount = Object.keys(npcInstance.storage.items).length
      setTradeItemCount(tradeCount)
    } catch (error) {
      console.error('[NPCPanelContent] Error loading NPC:', error)
    }
  }, [npcId, playerStore])
  
  // Handle give item button click
  const handleGiveItem = () => {
    if (!npc || !needItemInfo) return
    
    // TODO: Implement takeNeedItem in Phase 5
    // For now, just log
    console.log('[NPCPanelContent] Give item clicked:', needItemInfo)
    
    // Refresh dialog and need item info
    setDialogText(npc.getDialog())
    const needItem = npc.getNeedItem()
    if (needItem) {
      setNeedItemInfo({
        itemId: String(needItem.itemId),
        num: needItem.num
      })
      const playerCount = playerStore.getBagItemCount(String(needItem.itemId)) + 
                          playerStore.getStorageItemCount(String(needItem.itemId))
      setHasNeedItem(playerCount)
    } else {
      setNeedItemInfo(null)
      setHasNeedItem(0)
    }
    
    // Update trade item count (number of unique item types)
    setTradeItemCount(Object.keys(npc.storage.items).length)
  }
  
  // Handle trade button click
  const handleTrade = () => {
    if (!npc) return
    
    // Navigate to NPC storage panel
    uiStore.showNPCStoragePanel(npc.id)
  }
  
  // Handle steal button click
  const handleSteal = () => {
    if (!npc) return
    
    // TODO: Implement steal logic in Phase 5
    // For now, just log
    console.log('[NPCPanelContent] Steal clicked')
  }
  
  // Handle steal log button click
  const handleStealLog = () => {
    if (!npc) return
    
    // TODO: Show steal log dialog in Phase 5
    // For now, just log
    console.log('[NPCPanelContent] Steal log clicked')
  }
  
  if (!npcId || !npc) {
    return (
      <div className="text-center p-8 text-white">
        <p>NPC not found</p>
      </div>
    )
  }
  
  // Calculate positions (matching original game layout)
  // All Y positions are in Cocos coordinates (from bottom), need to convert to CSS (from top)
  const bgHeight = BOTTOM_BAR_LAYOUT.bgHeight
  const contentTopLineHeight = BOTTOM_BAR_LAYOUT.cocosRef.contentTopLineHeight  // 770 in Cocos
  const actionBarBaseHeight = BOTTOM_BAR_LAYOUT.cocosRef.actionBarBaseHeight    // 803 in Cocos
  
  // digDes: at width/2, contentTopLineHeight - 20 (750 in Cocos)
  const digDesCocosY = contentTopLineHeight - 20
  const digDesCssY = cocosToCssY(digDesCocosY, bgHeight)
  
  // Dialog text: at width/2, digDes.y - digDes.height - 20
  // digDes height is approximately 200px, so dialog is at digDesCocosY - 200 - 20 = digDesCocosY - 220
  const dialogCocosY = digDesCocosY - 220
  const dialogCssY = cocosToCssY(dialogCocosY, bgHeight)
  
  // Button positions (from original: Y positions are in Cocos coordinates)
  // Text row: All text at Y=130 (have, steal) or Y=40 (trade) or Y=160 (alert)
  // Button row: All buttons at Y=100
  // stealLog: at width/4 * 3 + 68, 212 (Cocos Y)
  const haveX = bgWidth / 4 - 33
  const textRowCocosY = 130  // Common Y for most text
  const textRowCssY = cocosToCssY(textRowCocosY, bgHeight) -100
  
  const tradeX = bgWidth / 4 * 2
  const tradeTextCocosY = 40  // Trade text is higher
  const tradeTextCssY = cocosToCssY(tradeTextCocosY, bgHeight)
  
  const stealX = bgWidth / 4 * 3 + 33
  const alertCocosY = 160  // Alert text is higher
  const alertCssY = cocosToCssY(alertCocosY, bgHeight)
  
  // All buttons at same Y=100
  const buttonRowCocosY = 100
  const buttonRowCssY = cocosToCssY(buttonRowCocosY, bgHeight) - 50
  
  const stealLogX = bgWidth / 4 * 3 + 30
  const stealLogCocosY = 212
  const stealLogCssY = cocosToCssY(stealLogCocosY, bgHeight) - 75
  
  // Heart display: at rightEdge, actionBarBaseHeight (803 in Cocos)
  const heartCocosY = actionBarBaseHeight
  const heartCssY = cocosToCssY(heartCocosY, bgHeight)
  
  // Increase value for NPCs 2 and 4 (from original)
  const increase = (npcId === 2 || npcId === 4) ? 5 : 0
  const alertValue = npc.Alert + increase
  
  return (
    <div
      className="relative w-full h-full overflow-auto"
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      {/* Heart display - positioned at top right (matching original actionBarBaseHeight) */}
      <div
        className="absolute"
        style={{
          right: `${leftEdge+30}px`,  // rightEdge = right side, same as leftEdge from right
          top: `${heartCssY+20}px`,
          transform: 'translateY(-50%)',
          zIndex: 10
        }}
      >
        <HeartDisplay reputation={npc.reputation} />
      </div>
      
      {/* NPC description image background */}
      <div
        className="absolute"
        style={{
          left: '0%',
          top: `${digDesCssY+200}px`,
          transform: 'translate(7%, -100%)',
          width: 'auto',
          height: 'auto'
        }}
      >
        <Sprite
          atlas="npc"
          frame="npc_dig_bg.png"
          style={{
            width: 'auto',
            height: 'auto'
          }}
        />
        {/* NPC description image */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Sprite
            atlas="npc"
            frame={`npc_dig_${npc.id}.png`}
            style={{
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      </div>
      
      {/* NPC dialog text */}
      <div
        className="absolute text-white"
        style={{
          left: `${leftEdge}px`,
          right: `${leftEdge}px`,
          top: `${dialogCssY+80}px`,
          transform: 'translateY(-100%)',
          fontSize: '20px',
          fontFamily: "'Noto Sans', sans-serif",
          lineHeight: '1.4',
          textAlign: 'center',
          maxHeight: '200px',
          overflow: 'auto'
        }}
      >
        {dialogText}
      </div>
      
      {/* Text Row - All text labels */}
      {/* Need item text */}
      {needItemInfo && (
        <div
          className="absolute text-green-500"
          style={{
            left: `${haveX}px`,
            top: `${textRowCssY}px`,
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '260px',
            fontSize: '20px',
            fontFamily: "'Noto Sans', sans-serif"
          }}
        >
          {(() => {
            const itemName = getString(needItemInfo.itemId)?.title || needItemInfo.itemId
            const needStr = `${itemName}x${needItemInfo.num}`
            return getString(1036, needStr) + ', ' + getString(1038, hasNeedItem)
          })()}
        </div>
      )}
      
      {/* Trade item count text */}
      <div
        className="absolute text-green-500"
        style={{
          left: `${tradeX}px`,
          top: `${textRowCssY}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '20px',
          fontFamily: "'Noto Sans', sans-serif"
        }}
      >
        {getString(1137, tradeItemCount) || `Trade Items: ${tradeItemCount}`}
      </div>
      
      {/* Alert level text */}
      <div
        className="absolute text-red-500"
        style={{
          left: `${stealX}px`,
          top: `${textRowCssY-125}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '20px',
          fontFamily: "'Noto Sans', sans-serif"
        }}
      >
        {getString(9009) + alertValue}
      </div>
      
      {/* Steal chance text */}
      <div
        className="absolute text-green-500"
        style={{
          left: `${stealX}px`,
          top: `${textRowCssY}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '20px',
          fontFamily: "'Noto Sans', sans-serif"
        }}
      >
        {getString(9005) + (playerStore as any).Steal + "%"}
      </div>
      
      {/* Button Row - All buttons at same Y position */}
      {/* Give item button */}
      <div
        className="absolute"
        style={{
          left: `${haveX}px`,
          top: `${buttonRowCssY}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}
      >
        <CommonListItemButton
          text={getString(1036, '') || 'Give Item'}
          onClick={handleGiveItem}
          enabled={!!needItemInfo && !npc.isReputationMax()}
        />
      </div>
      
      {/* Trade button */}
      <div
        className="absolute"
        style={{
          left: `${tradeX}px`,
          top: `${buttonRowCssY}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}
      >
        <CommonListItemButton
          text={getString(1040) || 'Trade'}
          onClick={handleTrade}
          enabled={true}
        />
      </div>
      
      {/* Steal button */}
      <div
        className="absolute"
        style={{
          left: `${stealX}px`,
          top: `${buttonRowCssY}px`,
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}
      >
        <CommonListItemButton
          text={getString(9015) || 'Steal'}
          onClick={handleSteal}
          enabled={npc.isSteal && tradeItemCount > 0 && npc.reputation > 0}
        />
      </div>
      
      {/* Steal log button */}
      <button
        onClick={handleStealLog}
        className="absolute"
        style={{
          left: `${stealLogX}px`,
          top: `${stealLogCssY}px`,
          transform: 'translateX(-50%)'
        }}
      >
        <Sprite
          atlas="ui"
          frame="stealLogBtn.png"
          style={{
            width: 'auto',
            height: 'auto'
          }}
        />
      </button>
    </div>
  )
}

