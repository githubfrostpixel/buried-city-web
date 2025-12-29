/**
 * Log Bar Component
 * Displays last 4 log messages with expandable full log view
 * Used in TopBar third line
 */

import { useState } from 'react'

interface LogMessage {
  txt: string
  timestamp?: number
}

interface LogBarProps {
  logs?: LogMessage[]
  onExpand?: () => void
  className?: string
}

export function LogBar({ logs = [], onExpand, className = '' }: LogBarProps) {
  const [expanded, setExpanded] = useState(false)
  
  // Get last 4 log messages (oldest to newest)
  const displayLogs = logs.slice(-4)
  
  const handleClick = () => {
    setExpanded(!expanded)
    if (onExpand) {
      onExpand()
    }
  }
  
  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Log lines - display last 4 messages */}
      {/* Order: oldest at top (i=3), newest at bottom (i=0) */}
      {/* In Cocos, labels positioned at (0, i * 30 + 4) with anchor (0, 0) = bottom-left */}
      {/* CSS: line 0 (bottom, newest) = 4px, line 1 = 34px, line 2 = 64px, line 3 (top, oldest) = 94px from bottom */}
      {[0, 1, 2, 3].map(i => {
        // Reverse index: i=0 (bottom) shows newest (displayLogs[3]), i=3 (top) shows oldest (displayLogs[0])
        const logIndex = 3 - i
        const log = displayLogs[logIndex]
        const cssBottom = i * 30 + 4
        return (
          <div
            key={i}
            className="absolute text-white text-xs"
            style={{
              left: '0px',
              bottom: `${cssBottom}px`,
              width: '580px',
              fontSize: '12px',
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {log?.txt || ''}
          </div>
        )
      })}
      
      {/* Clickable area to expand/collapse */}
      <button
        className="absolute inset-0"
        onClick={handleClick}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer'
        }}
        aria-label="Toggle log view"
      />
    </div>
  )
}

/**
 * Log Table View Component
 * Full expanded log view (to be implemented when log system is ready)
 */
export function LogTableView() {
  // TODO: Implement full log table view
  // This will be a scrollable list of all log messages
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75">
      <div className="text-white p-4">
        <p>Full log view - Coming soon</p>
      </div>
    </div>
  )
}

