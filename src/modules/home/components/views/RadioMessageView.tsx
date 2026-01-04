/**
 * RadioMessageView Component
 * Scrollable message list for radio panel
 * Ported from OriginalGame/src/ui/LogView.js MessageView
 */

import { useEffect, useRef } from 'react'
import { formatRadioTimeLabel } from '@/shared/utils/ui/timeFormat'
import type { RadioMessage } from '@/core/game/systems/RadioCommandProcessor'

interface RadioMessageViewProps {
  messages: RadioMessage[]
  playerUid: string | number
  width: number
  height: number
}

interface MessageItemProps {
  message: RadioMessage
  isPlayer: boolean
  width: number
}

function MessageItem({ message, isPlayer, width }: MessageItemProps) {
  const timeLabel = formatRadioTimeLabel(message.time, isPlayer)
  
  return (
    <div
      className="relative"
      style={{
        width: `${width}px`,
        padding: '5px 0',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Time label - top, left-aligned */}
      <div
        style={{
          color: '#fff',
          marginBottom: '5px',
          lineHeight: '1.2',
          fontSize: '16px',
          fontFamily: "'Noto Sans', sans-serif"
        }}
      >
        {timeLabel}
      </div>
      
      {/* Message text - below time, left-aligned */}
      <div
        style={{
          color: isPlayer ? '#ff6b6b' : '#fff',
          lineHeight: '1.4',
          wordWrap: 'break-word',
          fontSize: '18px',
          fontFamily: "'Noto Sans', sans-serif"
        }}
      >
        {message.msg}
      </div>
    </div>
  )
}

export function RadioMessageView({ messages, playerUid, width, height }: RadioMessageViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [messages])
  
  return (
    <div
      ref={scrollContainerRef}
      className="absolute overflow-auto overflow-x-hidden"
      style={{
        width: `${width}px`,
        height: `${height-60}px`,
        left: '7px',
        top: `${140}px` // 60px from top of content area (matches Cocos Y=60 from bottom)
      }}
      data-test-id="radio-message-view"
    >
      {/* Messages stack from top to bottom (newest at bottom) */}
      <div className="relative" style={{ width: `${width}px` }}>
        {messages.map((message, index) => {
          const isPlayer = String(message.uid) === String(playerUid)
          return (
            <MessageItem
              key={`${message.uid}-${message.time}-${index}`}
              message={message}
              isPlayer={isPlayer}
              width={width}
            />
          )
        })}
      </div>
    </div>
  )
}

