/**
 * RadioEditBox Component
 * Text input for sending radio messages
 * Ported from OriginalGame/src/ui/radioNode.js EditBox
 */

import { useState, KeyboardEvent } from 'react'
import { Sprite } from '@/components/sprites/Sprite'

interface RadioEditBoxProps {
  width: number
  height: number
  placeholder: string
  onSubmit: (message: string) => void
  onBackupString?: (backupString: string) => void
}

export function RadioEditBox({ 
  width, 
  height, 
  placeholder, 
  onSubmit,
  onBackupString 
}: RadioEditBoxProps) {
  const [value, setValue] = useState('')
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim()) {
        onSubmit(value.trim())
        setValue('')
      }
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    
    // Check if this is a backup string (starts with { and contains "hash")
    // If so, notify parent to set it as backup string
    if (newValue.startsWith('{') && newValue.includes('"hash"')) {
      onBackupString?.(newValue)
    }
  }
  
  return (
    <div
      className="absolute"
      style={{
        left: '50%',
        bottom: '60px',
        transform: 'translateX(-50%)',
        width: `${width}px`,
        height: `${height}px`
      }}
      data-test-id="radio-edit-box"
    >
      {/* Background sprite (edit_text_bg.png scale9) */}
      <Sprite
        atlas="ui"
        frame="edit_text_bg.png"
        className="absolute inset-0"
        style={{
          // Scale9 sprite - stretch to fit
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Text input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="absolute inset-0 bg-transparent border-none outline-none px-3 py-2 text-sm text-black"
        style={{
          fontFamily: 'Noto Sans, sans-serif',
          fontSize: '14px'
        }}
        data-test-id="radio-input"
      />
    </div>
  )
}



