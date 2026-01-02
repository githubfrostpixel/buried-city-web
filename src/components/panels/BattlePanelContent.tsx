/**
 * Battle Panel Content Component
 * Battle panel showing battle begin, process, and end views
 * Ported from OriginalGame/src/ui/battleAndWorkNode.js (battle sections)
 * 
 * This is the content-only component that goes inside BottomBar.
 * BottomBar handles the frame/layout and action bar.
 * This component handles the battle UI (begin, process, end views).
 */

import { useState, useEffect } from 'react'
import { Battle, BattleInfo, BattleResult } from '@/game/combat/Battle'
import { BattlePlayer, type BattlePlayerState } from '@/game/combat/BattlePlayer'
import { Monster } from '@/game/combat/Monster'
import { BattleConfig, Equipment } from '@/game/combat/BattleConfig'
import { usePlayerStore } from '@/store/playerStore'
import { emitter } from '@/utils/emitter'
import { Sprite } from '@/components/sprites/Sprite'
import { BOTTOM_BAR_LAYOUT } from '@/components/layout/layoutConstants'
import { itemConfig } from '@/data/items'
import { CommonListItemButton } from '@/components/common/CommonListItemButton'

interface BattlePanelContentProps {
  battleInfo: BattleInfo
  difficulty: number
  isBandit?: boolean
  onBattleEnd?: (result: BattleResult) => void
  onBack?: () => void
}

type BattleView = 'begin' | 'process' | 'end'

export function BattlePanelContent({
  battleInfo,
  difficulty,
  isBandit = false,
  onBattleEnd,
  onBack
}: BattlePanelContentProps) {
  const [view, setView] = useState<BattleView>('begin')
  const [battle, setBattle] = useState<Battle | null>(null)
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [combatLogs, setCombatLogs] = useState<Array<{ log: string; color?: string; bigger?: boolean }>>([])
  const [monsterCount, setMonsterCount] = useState<number>(0)
  const [dodgeProgress, setDodgeProgress] = useState<number>(0)

  const playerStore = usePlayerStore.getState()
  const { leftEdge, rightEdge, content, screenWidth } = BOTTOM_BAR_LAYOUT

  // Subscribe to battle events
  useEffect(() => {
    const handleLog = (data: { log: string; color?: string; bigger?: boolean }) => {
      setCombatLogs(prev => {
        const newLogs = [...prev, data]
        // Keep only last 7 logs
        return newLogs.slice(-7)
      })
    }

    const handleMonsterLength = (count: number) => {
      setMonsterCount(count)
    }

    const handleDodgeProgress = (percentage: number) => {
      setDodgeProgress(percentage)
    }

    emitter.on('battleProcessLog', handleLog)
    emitter.on('battleMonsterLength', handleMonsterLength)
    emitter.on('battleDodgePercentage', handleDodgeProgress)

    return () => {
      emitter.off('battleProcessLog', handleLog)
      emitter.off('battleMonsterLength', handleMonsterLength)
      emitter.off('battleDodgePercentage', handleDodgeProgress)
    }
  }, [])


  const startBattle = () => {
    // Create battle instance
    const battleInstance = new Battle(battleInfo, false, difficulty, isBandit, false)

    // Create player state
    const playerState: BattlePlayerState = {
      bulletNum: playerStore.getBagItemCount(BattleConfig.BULLET_ID),
      homemadeNum: playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID),
      toolNum: playerStore.getBagItemCount(playerStore.equipment.tool || ''),
      hp: playerStore.hp,
      virus: playerStore.virus,
      virusMax: playerStore.virusMax,
      injury: playerStore.injury,
      weapon1: playerStore.equipment.gun,
      weapon2: playerStore.equipment.weapon || Equipment.HAND,
      equip: playerStore.equipment.tool,
      def: playerStore.equipment.equip ? (itemConfig[playerStore.equipment.equip]?.effect_arm?.def || 0) : 0
    }

    // Create battle player
    const battlePlayer = new BattlePlayer(battleInstance, playerState, isBandit, false)

    // Create monsters
    const monsters = battleInfo.monsterList.map((monId) => {
      return new Monster(battleInstance, monId, isBandit)
    })

    // Initialize battle
    battleInstance.initialize(monsters, battlePlayer)

    // Set game end listener
    battleInstance.setGameEndListener((result) => {
      setBattleResult(result)
      setView('end')
      if (onBattleEnd) {
        onBattleEnd(result)
      }
    })

    setBattle(battleInstance)
    setView('process')
    setCombatLogs([])
    setMonsterCount(monsters.length)
  }

  const totalMonsters = battleInfo.monsterList.length
  const remainingMonsters = monsterCount
  const progressPercentage = totalMonsters > 0 ? ((totalMonsters - remainingMonsters) / totalMonsters) * 100 : 0

  // Common image position - same for all views
  const digDesY = content.top - 40 
  const estimatedImageHeight = 400 // Reduced from 480 (image is smaller now)
  const imageBottom = digDesY + estimatedImageHeight
  const contentAreaTop = imageBottom - 120 // Reduced gap to move content area up

  // Shared image component - Stack: npc_dig_bg (bottom) -> monster_dig_mid_bg (middle) -> monster_dig (top)
  // Hide monster images if player won (view === 'end' && battleResult?.win)
  const showMonsterImages = !(view === 'end' && battleResult?.win)
  const battleImageStack = (
    <div
      className="absolute"
      style={{
        left: `${screenWidth / 2 - 20}px`,
        top: `${digDesY}px`,
        transform: 'translateX(-50%)',
        width: 'max-content',
      }}
    >
      {/* Bottom layer: npc_dig_bg */}
      <Sprite
        atlas="npc"
        frame="npc_dig_bg.png"
        style={{ width: '500px', height: 'auto', position: 'relative', zIndex: 1 }}
      />
      {/* Middle layer: monster_dig_mid_bg - hidden if player won */}
      {showMonsterImages && (
        <Sprite
          atlas="dig_monster"
          frame="monster_dig_mid_bg.png"
          style={{ 
            width: '500px', 
            height: 'auto', 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        />
      )}
      {/* Top layer: monster_dig or bandit_dig - hidden if player won */}
      {showMonsterImages && (
        <Sprite
          atlas="dig_monster"
          frame={isBandit ? `bandit_dig_${difficulty}.png` : `monster_dig_${difficulty}.png`}
          style={{ 
            width: '500px', 
            height: 'auto', 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 3
          }}
        />
      )}
    </div>
  )

  // Battle Begin View
  if (view === 'begin') {
    const hasGun = !!playerStore.equipment.gun
    const hasWeapon = !!playerStore.equipment.weapon || playerStore.equipment.weapon === Equipment.HAND

    return (
      <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
        {/* Part 1: Image - Fixed position, same for all views */}
        {battleImageStack}

        {/* Part 2: Content Area - Equipment / Difficulty */}
        <div
          className="absolute"
          style={{
            left: `${leftEdge}px`,
            top: `${contentAreaTop}px`,
            width: `${rightEdge - leftEdge}px`,
          }}
        >
          {/* Equipment Label */}
          <div
            className="text-white"
            style={{
              fontSize: '20px',
              marginBottom: '10px',
            }}
          >
            Equipment:
          </div>

          {/* Equipment Icons */}
          <div
            className="flex gap-2"
            style={{
              marginBottom: '25px',
            }}
          >
            {playerStore.equipment.gun && (
              <div style={{ position: 'relative' }}>
                <Sprite
                  atlas="icon"
                  frame={`icon_item_${playerStore.equipment.gun}.png`}
                  style={{ width: '40px', height: '40px' }}
                />
                {/* Bullet count for gun */}
                {playerStore.equipment.gun !== "1301091" && (
                  <div
                    className="text-white"
                    style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {playerStore.getBagItemCount(BattleConfig.BULLET_ID) + playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}
                  </div>
                )}
              </div>
            )}
            {playerStore.equipment.weapon && (
              <Sprite
                atlas="icon"
                frame={`icon_item_${playerStore.equipment.weapon}.png`}
                style={{ width: '40px', height: '40px' }}
              />
            )}
            {playerStore.equipment.tool && (
              <div style={{ position: 'relative' }}>
                <Sprite
                  atlas="icon"
                  frame={`icon_item_${playerStore.equipment.tool}.png`}
                  style={{ width: '40px', height: '40px' }}
                />
                {/* Bomb count for bomb tools */}
                {(playerStore.equipment.tool === "1303012" || 
                  playerStore.equipment.tool === "1303033" || 
                  playerStore.equipment.tool === "1303044") && (
                  <div
                    className="text-white"
                    style={{
                      position: 'absolute',
                      bottom: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '16px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {playerStore.getBagItemCount(playerStore.equipment.tool)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Difficulty Label */}
          <div
            className="text-white"
            style={{
              fontSize: '20px',
              color: difficulty > 2 ? '#FF0000' : '#FFFFFF',
              marginBottom: '10px',
            }}
          >
            {isBandit ? `Difficulty: ${difficulty + 5}` : `Difficulty: ${difficulty}`}
          </div>

          {/* Warnings */}
          <div
            className="text-red-500"
            style={{
              fontSize: '20px',
              marginBottom: '20px',
            }}
          >
            {!hasGun && !hasWeapon && <div>No weapon equipped!</div>}
            {playerStore.vigour < 30 && <div>Low energy!</div>}
          </div>

          {/* Start Battle Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CommonListItemButton
              text="Start Battle"
              onClick={startBattle}
              enabled={true}
            />
          </div>
        </div>
      </div>
    )
  }

  // Battle Process View
  if (view === 'process') {
    return (
      <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
        {/* Part 1: Image - Fixed position, same for all views */}
        {battleImageStack}


        {/* Part 2: Content Area - Log / Progress Bar */}
        <div
          className="absolute"
          style={{
            left: `${leftEdge}px`,
            top: `${contentAreaTop}px`,
            width: `${rightEdge - leftEdge}px`,
          }}
        >
          {/* Combat Log */}
          <div
            style={{
              width: '100%',
              height: '200px',
              fontSize: '20px',
              fontFamily: "'Noto Sans', sans-serif",
              marginBottom: '20px',
            }}
          >
            {combatLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  color: log.color || '#FFFFFF',
                  fontSize: log.bigger ? '24px' : '20px',
                  marginBottom: '4px',
                }}
              >
                {log.log}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              marginTop: '40px',
              marginBottom: '10px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Progress Bar Container - centered horizontally */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Progress Bar Background */}
              <div style={{ position: 'relative' }}>
                <Sprite
                  atlas="ui"
                  frame="pb_bg.png"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                />
                
                {/* Progress Bar Fill - positioned on top of background, aligned to background height */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: `${progressPercentage}%`,
                    height: '100%',
                    overflow: 'hidden',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Sprite
                    atlas="ui"
                    frame="pb.png"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>
              
              {/* Label - positioned above progress bar, right-aligned to match pbBg.x + pbBg.width/2 (matches original anchor 1,0) */}
              <div 
                className="text-white"
                style={{ 
                  fontSize: '20px',
                  textAlign: 'right',
                  marginTop: '5px',
                  width: '100%',
                }}
              >
                {isBandit ? 'Bandits' : 'Monsters'}: {remainingMonsters}/{totalMonsters}
              </div>
            </div>
          </div>

          {/* Dodge Progress (for road encounters) */}
          {dodgeProgress > 0 && (
            <div
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              <div className="text-white mb-1" style={{ fontSize: '20px' }}>Dodging: {Math.round(dodgeProgress)}%</div>
              <div className="w-full bg-gray-700 h-4 rounded">
                <div
                  className="bg-blue-500 h-full rounded transition-all"
                  style={{ width: `${dodgeProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Escape Button (only for room/site battles, not dodge) */}
          {view === 'process' && (
            <div
              style={{
                width: '100%',
                marginTop: '15px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CommonListItemButton
                text="Escape"
                onClick={() => {
                  console.log('[Escape Button] Clicked')
                  const battleInstance = battle
                  console.log('[Escape Button] battle:', battleInstance)
                  if (battleInstance) {
                    console.log('[Escape Button] battle.player:', battleInstance.player)
                    if (battleInstance.player) {
                      console.log('[Escape Button] Calling player.escape()')
                      battleInstance.player.escape()
                    } else {
                      console.log('[Escape Button] ERROR: battle.player is null')
                    }
                  } else {
                    console.log('[Escape Button] ERROR: battle is null')
                  }
                }}
                enabled={true}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Battle End View
  if (view === 'end' && battleResult) {
    const consumedItems: Array<{ itemId: string; num: number }> = []
    if (battleResult.bulletNum > 0) {
      consumedItems.push({ itemId: BattleConfig.BULLET_ID, num: battleResult.bulletNum })
    }
    if (battleResult.homemadeNum > 0) {
      consumedItems.push({ itemId: BattleConfig.HOMEMADE_ID, num: battleResult.homemadeNum })
    }
    if (battleResult.tools > 0 && battleResult.toolItemId) {
      consumedItems.push({ itemId: battleResult.toolItemId, num: battleResult.tools })
    }
    if (battleResult.fuel > 0) {
      consumedItems.push({ itemId: "gas", num: battleResult.fuel })
    }

    return (
      <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
        {/* Part 1: Image - Fixed position, same for all views */}
        {battleImageStack}

        {/* Part 2: Content Area - Battle Results */}
        <div
          className="absolute"
          style={{
            left: `${leftEdge}px`,
            top: `${contentAreaTop}px`,
            width: `${rightEdge - leftEdge}px`,
          }}
        >
          {/* Consumed Items */}
          {consumedItems.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <div className="text-white mb-2" style={{ fontSize: '20px' }}>Consumed Items:</div>
              <div className="flex gap-2 flex-wrap">
                {consumedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Sprite
                      atlas="icon"
                      frame={`icon_item_${item.itemId}.png`}
                      style={{ width: '24px', height: '24px' }}
                    />
                    <span className="text-xs text-white">x{item.num}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Damage Summary */}
          <div className="text-white mb-4" style={{ fontSize: '20px' }}>
            <div>HP Lost: {battleResult.totalHarm}</div>
            {battleResult.totalVirus > 0 && <div>Virus Gained: {battleResult.totalVirus}</div>}
          </div>

          {/* Broken Weapons */}
          {battleResult.brokenWeapon && battleResult.brokenWeapon.length > 0 && (
            <div className="mb-4">
              <div className="text-white mb-2" style={{ fontSize: '20px' }}>Broken Weapons:</div>
              <div className="flex gap-2">
                {battleResult.brokenWeapon.map((itemId, index) => (
                  <Sprite
                    key={index}
                    atlas="icon"
                    frame={`icon_item_${itemId}.png`}
                    style={{ width: '32px', height: '32px' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CommonListItemButton
              text="Continue"
              onClick={onBack}
              enabled={true}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}

