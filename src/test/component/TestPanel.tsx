/**
 * TestPanel Component
 * Collapsible and draggable panel for test controls
 */

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react'

interface TestPanelProps {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
  defaultPosition?: { x: number; y: number }
  width?: number
  maxHeight?: string
  zIndex?: number
}

export function TestPanel({
  title,
  children,
  defaultCollapsed = false,
  defaultPosition = { x: 16, y: 16 },
  width = 280,
  maxHeight = '60vh',
  zIndex = 10001,
}: TestPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [position, setPosition] = useState(defaultPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag from header area
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    e.preventDefault()
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.current.x
    const newY = e.clientY - dragOffset.current.y

    // Clamp to viewport
    const maxX = window.innerWidth - (panelRef.current?.offsetWidth || width)
    const maxY = window.innerHeight - 40 // Leave some header visible

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }, [isDragging, width])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className="fixed bg-gray-800/95 text-white rounded-lg shadow-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        zIndex,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Header - Draggable */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 
          bg-gray-700 rounded-t-lg cursor-move
          ${isDragging ? 'bg-gray-600' : ''}
        `}
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-bold">{title}</span>
        <button
          data-no-drag
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-lg leading-none px-1"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '+' : '-'}
        </button>
      </div>

      {/* Content */}
      <div
        className={`
          overflow-hidden transition-all duration-200
          ${collapsed ? 'max-h-0' : ''}
        `}
        style={{
          maxHeight: collapsed ? 0 : maxHeight,
        }}
      >
        <div className="p-3 overflow-y-auto" style={{ maxHeight }}>
          {children}
        </div>
      </div>
    </div>
  )
}



