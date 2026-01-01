/**
 * TestSection Component
 * Collapsible section for grouping related test controls
 */

import { ReactNode, useState } from 'react'

interface TestSectionProps {
  title: string
  children: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function TestSection({
  title,
  children,
  collapsible = true,
  defaultCollapsed = false,
}: TestSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className="mb-2">
      <div
        className={`
          flex items-center justify-between text-sm font-semibold mb-1
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <span>{title}</span>
        {collapsible && (
          <span className="text-gray-400 text-xs">
            {collapsed ? '[+]' : '[-]'}
          </span>
        )}
      </div>
      
      <div
        className={`
          overflow-hidden transition-all duration-200
          ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}
        `}
      >
        {children}
      </div>
    </div>
  )
}


