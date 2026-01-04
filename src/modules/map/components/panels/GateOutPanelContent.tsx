/**
 * GateOutPanelContent Component
 * Transition panel shown when leaving home through the gate
 * Ported from OriginalGame/src/ui/gateOutNode.js
 * 
 * Structure:
 * - Background image (gate_out_bg.png)
 * - Tip label (string 1167)
 * - Random tip (string 3011 array)
 * - Auto-navigates to map after 3 seconds
 * - Click anywhere to navigate immediately
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { usePlayerStore } from '@/core/store/playerStore'
import { Sprite } from '@/shared/components/sprites/Sprite'

export function GateOutPanelContent() {
  const uiStore = useUIStore()
  const playerStore = usePlayerStore()
  const [hasNavigated, setHasNavigated] = useState(false)

  // goOut function - navigates to map scene
  const goOut = () => {
    if (hasNavigated) return // Prevent double navigation
    setHasNavigated(true)

    // Call deleteUnusableSite if map exists
    // Note: Map should always be initialized in new game, but check for safety
    const map = playerStore.map
    if (map) {
      map.deleteUnusableSite()
    } else {
      // Edge case: Map not initialized (shouldn't happen in new game)
      // Initialize map if missing (defensive programming)
      console.warn('Map is null, initializing map...')
      playerStore.initializeMap()
      // Now deleteUnusableSite (will be empty on fresh init, but safe to call)
      const newMap = playerStore.map
      if (newMap) {
        newMap.deleteUnusableSite()
      }
    }

    // Navigate to map panel (in main scene)
    // Original: this.forward(Navigation.nodeName.MAP_NODE)
    uiStore.setScene('main')
    uiStore.openPanelAction('map')
  }

  // Auto-navigate after 3 seconds
  useEffect(() => {
    if (hasNavigated) return

    const timer = setTimeout(() => {
      goOut()
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run on mount, goOut is stable

  // Layout constants
  const screenWidth = 640
  const screenHeight = 1136
  const leftPadding = 30
  const labelTipY = 600 // Position from screen top (moved down from 400)
  const tipY = labelTipY - 20 // 20px above label tip

  // String resources (TODO: Replace with actual string IDs 1167 and 3011)
  const tipLabel = 'Leaving home...' // String 1167
  const randomTips = [
    'Tip: Always check your equipment before leaving.',
    'Tip: Make sure you have enough supplies.',
    'Tip: The world outside is dangerous.',
    'Tip: Return home before nightfall.',
    'Tip: Keep your weapons ready.'
  ]
  const randomTip = randomTips[Math.floor(Math.random() * randomTips.length)] // String 3011

  return (
    <div className="absolute inset-0" style={{ width: `auto`, height: `auto`,overflow: 'hidden' }}>
      {/* Background image - spans full screen like home_bg */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        <Sprite
          atlas="gate"
          frame="gate_out_bg.png"
          className="w-full h-full object-cover"
          style={{
            width: `${screenWidth}px`,
            height: `${screenHeight}px`
          }}
        />
      </div>

      {/* Clickable area - full content area */}
      <button
        onClick={goOut}
        className="absolute inset-0 cursor-pointer"
        style={{
          zIndex: 1,
          background: 'transparent',
          border: 'none',
          padding: 0
        }}
        aria-label="Go to map"
      />

      {/* Tip label - String 1167 */}
      <div
        className="absolute text-white"
        style={{
          left: `${leftPadding}px`,
          top: `${labelTipY}px`,
          width: `${screenWidth - 2 * leftPadding}px`,
          zIndex: 2,
          fontSize: '20px', // COMMON_2 size
          lineHeight: '1.4'
        }}
      >
        {tipLabel}
      </div>

      {/* Random tip - String 3011 */}
      <div
        className="absolute text-white"
        style={{
          left: `${leftPadding}px`,
          top: `${tipY}px`,
          width: `${screenWidth - 2 * leftPadding}px`,
          zIndex: 2,
          fontSize: '20px', // COMMON_2 size
          lineHeight: '1.4',
          textAlign: 'left'
        }}
      >
        {randomTip}
      </div>
    </div>
  )
}

