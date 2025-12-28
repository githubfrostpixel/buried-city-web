/**
 * BottomBar Component (BottomFrame)
 * Bottom frame container for panels
 * Ported from OriginalGame/src/ui/bottomFrame.js
 */

import { Sprite } from '@/components/sprites/Sprite'

interface BottomBarProps {
  title?: string
  leftBtn?: boolean
  rightBtn?: boolean
  onLeftClick?: () => void
  onRightClick?: () => void
  children?: React.ReactNode
  fullScreen?: boolean // If true, hide action bar and line, fill entire bottom bar
}

export function BottomBar({ 
  title = "", 
  leftBtn = false, 
  rightBtn = true,
  onLeftClick,
  onRightClick,
  children,
  fullScreen = false
}: BottomBarProps) {
  const screenFix: number = 0 // TODO: Get from settings
  
  // Background position (Cocos: width/2, 18, anchor: 0.5, 0)
  // In Cocos: anchor (0.5, 0) means center horizontally, bottom edge at Y
  // Y = 18 means 18px from bottom of screen
  // According to COCOS_TO_CSS_POSITION_MAPPING.md:
  // - anchor.y = 0: bottom edge at cssY, use bottom property
  // - But to move closer to top bar, calculate from top instead
  const bgScale = screenFix === 1 ? 0.87 : 1.0
  const bgHeight = 834 * bgScale
  const bgWidth = 596 * bgScale
  
  // Position bottom bar at top of screen (below TopBar)
  // TopBar: top at 18px, height 244px, so bottom at 18 + 244 = 262px
  // Bottom bar starts right below TopBar
  const topBarHeight = 244 * bgScale
  const topBarBottom = 18 + topBarHeight // TopBar bottom edge
  const desiredGap = 10 // Small margin between top and bottom bar
  const bottomBarTop = topBarBottom + desiredGap
  
  const bgStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: `${bottomBarTop}px`, // Position from top, right below TopBar
    transform: 'translateX(-50%)',
    width: `${bgWidth}px`,
    height: `${bgHeight}px`
  }
  
  // Action bar is at top: 1px, height: 70px
  // Line separator is below action bar at top: 76px
  // Content area fills remaining space below line
  
  return (
    <div className="absolute" style={bgStyle}>
      {/* Background sprite - on top layer above home bg, but doesn't block clicks */}
      <Sprite 
        atlas="ui" 
        frame="frame_bg_bottom.png"
        className="absolute inset-0"
        style={{ 
          transform: `scale(${bgScale})`,
          zIndex: 10, // Above home bg
          pointerEvents: 'none' // Don't block clicks on buildings
        }}
      />
      
      {/* Action bar row: buttons and title in same row - hidden if fullScreen */}
      {!fullScreen && (
        <div
          className="absolute flex items-center"
          style={{
            left: '0px',
            top: '1px', // Position at top of bottom bar
            width: `${bgWidth}px`,
            height: '70px',
            paddingTop: '5px', // 5px top padding
            boxSizing: 'border-box'
          }}
        >
          {/* Left button - absolutely positioned at left edge */}
          {leftBtn && (
            <button
              onClick={onLeftClick}
              className="absolute"
              style={{
                left: '15px', // Matches original: 60px from left edge
                top: '5px',
                width: '100px',
                height: '70px',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <Sprite
                atlas="ui"
                frame="btn_back.png"
                className="w-full h-full block"
              />
            </button>
          )}
          
          {/* Title - always centered at 50% width (matches original) */}
          {title && (
            <div
              className="absolute text-center text-white"
              style={{
                left: '50%',
                top: '5px',
                transform: 'translateX(-50%)',
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                lineHeight: '70px',
                height: '70px'
              }}
            >
              {title}
            </div>
          )}
          
          {/* Right button - absolutely positioned at right edge */}
          {rightBtn && (
            <button
              onClick={onRightClick}
              className="absolute"
              style={{
                right: '10px', // Matches original: 60px from right edge
                top: '5px',
                width: '100px',
                height: '70px',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              <Sprite
                atlas="ui"
                frame="btn_forward.png"
                className="w-full h-full block"
              />
            </button>
          )}
        </div>
      )}
      
      {/* Line separator - below the action bar row - hidden if fullScreen */}
      {!fullScreen && (
        <Sprite
          atlas="ui"
          frame="frame_line.png"
          className="absolute"
          style={{
            left: '50%',
            top: '76px', // Below action bar (1px top + 5px padding + 70px height)
            transform: 'translateX(-50%)'
          }}
        />
      )}
      
      {/* Content area - fills entire bottom bar if fullScreen, otherwise below line */}
      <div 
        className="absolute" 
        style={{ 
          left: '0px',
          top: fullScreen ? '-1px' : '76px', // Top of bar if fullScreen, below line otherwise
          width: `${bgWidth}px`,
          height: fullScreen ? `${bgHeight}px` : `${bgHeight - 76}px`, // Full height if fullScreen
          overflow: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {children}
      </div>
    </div>
  )
}

