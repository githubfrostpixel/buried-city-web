/**
 * ConfirmationDialog Component
 * Simple confirmation dialog with title, message, and two buttons
 * Ported from OriginalGame/src/ui/DialogTiny.js
 * 
 * Used for:
 * - Secret room leave warning (String 1229)
 * - Other confirmation dialogs
 */

import { useEffect, useState } from 'react'
import { useUIStore } from '@/core/store/uiStore'
import { Sprite } from '@/common/ui/sprite/Sprite'
import { DialogButton } from '@/common/ui/DialogButton'
import { getString } from '@/common/utils/stringUtil'
import { audioManager, SoundPaths } from '@/core/game/systems/AudioManager'

interface ConfirmationDialogData {
  title?: string
  message: string
  confirmText?: string  // Default: String 1228 ("Leave")
  cancelText?: string   // Default: String 1157 ("Never mind")
  onConfirm: () => void
  onCancel?: () => void
}

export function ConfirmationDialog() {
  const uiStore = useUIStore()
  const [bottomBarRect, setBottomBarRect] = useState<DOMRect | null>(null)
  
  // Get dialog data from overlay state
  const dialogData = (uiStore.activeOverlay === 'confirmationDialog' 
    ? (uiStore as any).overlayData as ConfirmationDialogData 
    : null)
  
  // Play popup sound when dialog appears (matches OriginalGame/src/ui/dialog.js:133)
  useEffect(() => {
    if (dialogData) {
      audioManager.playEffect(SoundPaths.POPUP)
    }
  }, [dialogData])

  // Get BottomBar position dynamically (same as ItemDialog)
  useEffect(() => {
    const updatePosition = () => {
      const bottomBar = document.querySelector('[data-test-id="bottombar-bg"]')
      if (bottomBar) {
        setBottomBarRect(bottomBar.getBoundingClientRect())
      }
    }
    
    updatePosition()
    window.addEventListener('resize', updatePosition)
    const interval = setInterval(updatePosition, 100)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      clearInterval(interval)
    }
  }, [])
  
  // Handle ESC key
  useEffect(() => {
    if (!dialogData) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dialogData.onCancel) {
        dialogData.onCancel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogData])
  
  // Early return after all hooks are called
  if (!dialogData || !bottomBarRect) return null
  
  const { title, message, confirmText, cancelText, onConfirm, onCancel } = dialogData
  
  // Dialog dimensions (based on dialog_big_bg.png sprite)
  const dialogWidth = 400
  const dialogHeight = 300
  
  // Title section: 90px height
  const titleHeight = 90
  // Action section: 72px height
  const actionHeight = 72
  // Content section: remaining height
  const contentHeight = dialogHeight - titleHeight - actionHeight
  
  // Left/Right edges: 20px from dialog edges
  const leftEdge = 20
  const rightEdge = dialogWidth - 20
  
  const handleClose = () => {
    uiStore.hideOverlay()
    if (onCancel) {
      onCancel()
    }
  }
  
  const handleConfirm = () => {
    uiStore.hideOverlay()
    onConfirm()
  }
  
  return (
    <div
      className="fixed z-[9999]"
      style={{
        left: `${bottomBarRect.left}px`,
        top: `${bottomBarRect.top}px`,
        width: `${bottomBarRect.width}px`,
        height: `${bottomBarRect.height}px`,
        animation: 'fadeIn 0.3s ease-in'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
      data-test-id="confirmation-dialog-overlay"
    >
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          width: '100%',
          height: '100%'
        }}
        onClick={handleClose}
      />
      
      {/* Dialog container */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${dialogWidth}px`,
          height: `${dialogHeight}px`,
          zIndex: 51
        }}
        onClick={(e) => e.stopPropagation()}
        data-test-id="confirmation-dialog"
      >
      {/* Background */}
      <Sprite
        atlas="ui"
        frame="dialog_big_bg.png"
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Title section */}
      {title && (
        <div
          className="absolute text-white text-center"
          style={{
            left: `${leftEdge}px`,
            right: `${rightEdge}px`,
            top: '20px',
            fontSize: '24px',
            fontFamily: "'Noto Sans', sans-serif",
            fontWeight: 'bold'
          }}
        >
          {title}
        </div>
      )}
      
      {/* Content section */}
      <div
        className="absolute text-white text-center"
        style={{
          left: `${leftEdge}px`,
          right: `${rightEdge}px`,
          top: `${titleHeight}px`,
          height: `${contentHeight}px`,
          fontSize: '18px',
          fontFamily: "'Noto Sans', sans-serif",
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {message}
      </div>
      
      {/* Action section */}
      <div
        className="absolute"
        style={{
          left: 0,
          bottom: '0px',
          width: `${dialogWidth}px`,
          height: `${actionHeight}px`
        }}
      >
        {/* Cancel button (btn_1) */}
        <DialogButton
          text={cancelText || getString(1157) || 'Never mind'}
          position={{ x: 25, y: 50 }}
          onClick={handleClose}
          enabled={true}
        />
        
        {/* Confirm button (btn_2) */}
        <DialogButton
          text={confirmText || getString(1228) || 'Leave'}
          position={{ x: 75, y: 50 }}
          onClick={handleConfirm}
          enabled={true}
        />
      </div>
      </div>
    </div>
  )
}

