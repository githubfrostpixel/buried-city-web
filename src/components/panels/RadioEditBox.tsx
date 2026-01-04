/**
 * RadioEditBox Component
 * Text input for sending radio messages
 * Ported from OriginalGame/src/ui/radioNode.js EditBox
 */

import { useState, KeyboardEvent } from 'react'

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
        bottom: '10px',
        transform: 'translateX(-50%)',
        width: `${width}px`,
        height: `${height}px`
      }}
      data-test-id="radio-edit-box"
    >
      {/* Text input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="absolute inset-0 bg-transparent outline-none px-3 py-2"
        style={{
          fontFamily: "'Noto Sans', sans-serif",
          fontSize: '20px', // Bigger font
          color: '#ffffff', // White text
          border: '1px solid #ffffff', // White border
          borderRadius: '4px'
        }}
        data-test-id="radio-input"
      />
    </div>
  )
}





