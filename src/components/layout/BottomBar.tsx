/**
 * BottomBar Component (BottomFrame)
 * Bottom frame container for panels
 * Ported from OriginalGame/src/ui/bottomFrame.js
 * 
 * This is the base container component that all panels use.
 * Panels provide content as children, BottomBar handles the frame/layout.
 */

import { Sprite } from '@/components/sprites/Sprite'
import { BOTTOM_BAR_LAYOUT, getBottomBarTop } from './layoutConstants'

interface BottomBarProps {
  // Title displayed in action bar center
  title?: string
  // Show left (back) button
  leftBtn?: boolean
  // Show right (forward) button
  rightBtn?: boolean
  // Left button click handler
  onLeftClick?: () => void
  // Right button click handler
  onRightClick?: () => void
  // Panel content
  children?: React.ReactNode
  // If true, hide action bar and line, fill entire bottom bar
  fullScreen?: boolean
  // Subtext displayed below title on left side (e.g., "Progress: 2/5")
  leftSubtext?: string
  // Subtext displayed on right side (e.g., "Items: 10")
  rightSubtext?: string
}

export function BottomBar({ 
  title = "", 
  leftBtn = false, 
  rightBtn = true,
  onLeftClick,
  onRightClick,
  children,
  fullScreen = false,
  leftSubtext,
  rightSubtext
}: BottomBarProps) {
  const { bgWidth, bgHeight, actionBar, lineTop, content } = BOTTOM_BAR_LAYOUT
  const bottomBarTop = getBottomBarTop()
  
  const bgStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: `${bottomBarTop}px`,
    transform: 'translateX(-50%)',
    width: `${bgWidth}px`,
    height: `${bgHeight}px`
  }
  
  // Calculate title position (centered, or offset if buttons present)
  const leftBtnWidth = actionBar.buttonWidth
  const titleX = actionBar.leftButtonX + leftBtnWidth / 2 + 10
  
  return (
    <div className="absolute" style={bgStyle} data-test-id="bottombar-bg" data-test-label="BottomBar Background" data-test-position>
      {/* Background sprite - on top layer above home bg, but doesn't block clicks */}
      <Sprite 
        atlas="ui" 
        frame="frame_bg_bottom.png"
        className="absolute inset-0"
        style={{ 
          transform: `scale(${BOTTOM_BAR_LAYOUT.scale})`,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />
      
      {/* Action bar row: buttons, title, and subtexts - hidden if fullScreen */}
      {!fullScreen && (
        <div
          className="absolute flex items-center"
          style={{
            left: '0px',
            top: `${actionBar.top}px`,
            width: `${bgWidth}px`,
            height: `${actionBar.height}px`,
            paddingTop: `${actionBar.paddingTop}px`,
            boxSizing: 'border-box'
          }}
          data-test-id="bottombar-action-bar"
          data-test-label="Action Bar Row"
          data-test-position
        >
          {/* Left button */}
          {leftBtn && (
            <button
              onClick={onLeftClick}
              className="absolute"
              style={{
                left: `${actionBar.leftButtonX}px`,
                top: `${actionBar.paddingTop}px`,
                width: `${actionBar.buttonWidth}px`,
                height: `${actionBar.buttonHeight}px`,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              data-test-id="bottombar-left-btn"
              data-test-label="Left Button"
              data-test-position
            >
              <Sprite
                atlas="ui"
                frame="btn_back.png"
                className="w-full h-full block"
              />
            </button>
          )}
          
          {/* Title - positioned after left button area */}
          {title && (
            <div
              data-test-id="bottombar-title"
              className="absolute text-white"
              style={{
                left: `${titleX + 30}px`,
                top: `${actionBar.paddingTop - 10}px`,
                fontSize: '18px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                lineHeight: `${actionBar.buttonHeight}px`,
                height: `${actionBar.buttonHeight}px`
              }}
            >
              {title}
            </div>
          )}
          
          {/* Right button */}
          {rightBtn && (
            <button
              onClick={onRightClick}
              className="absolute"
              style={{
                right: `${actionBar.rightButtonX}px`,
                top: `${actionBar.paddingTop}px`,
                width: `${actionBar.buttonWidth}px`,
                height: `${actionBar.buttonHeight}px`,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              data-test-id="bottombar-right-btn"
              data-test-label="Right Button"
              data-test-position
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
      
      {/* Subtext row - below action bar, above line - hidden if fullScreen */}
      {!fullScreen && (leftSubtext || rightSubtext) && (
        <div
          className="absolute flex justify-between items-center"
          style={{
            left: `${titleX + 30}px`,
            right: `${actionBar.rightButtonX + 10}px`,
            top: `${actionBar.top + actionBar.height - 20}px`,
            height: '20px',
          }}
          data-test-id="bottombar-subtext-row"
          data-test-label="Subtext Row"
          data-test-position
        >
          {/* Left subtext (e.g., "Progress: 2/5") */}
          {leftSubtext && (
            <div
              className="text-white"
              style={{
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
              }}
              data-test-id="bottombar-left-subtext"
            >
              {leftSubtext}
            </div>
          )}
          
          {/* Right subtext (e.g., "Items: 10") */}
          {rightSubtext && (
            <div
              className="text-white text-right"
              style={{
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
              }}
              data-test-id="bottombar-right-subtext"
            >
              {rightSubtext}
            </div>
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
            top: `${lineTop}px`,
            transform: 'translateX(-50%)'
          }}
          data-test-id="bottombar-line"
          data-test-label="Line Separator"
          data-test-position
        />
      )}
      
      {/* Content area - fills entire bottom bar if fullScreen, otherwise below line */}
      <div 
        className="absolute" 
        style={{ 
          left: '0px',
          top: fullScreen ? `${content.fullScreenTop}px` : `${content.top}px`,
          width: `${bgWidth}px`,
          height: fullScreen ? `${content.fullScreenHeight}px` : `${content.height}px`,
          overflow: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
        data-test-id="bottombar-content"
        data-test-label="Content Area"
        data-test-position
      >
        {children}
      </div>
    </div>
  )
}
