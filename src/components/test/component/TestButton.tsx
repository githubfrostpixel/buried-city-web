/**
 * TestButton Component
 * Standardized button for test actions with color variants
 */

import { ReactNode, ButtonHTMLAttributes } from 'react'

export type TestButtonVariant = 'position' | 'state' | 'interaction' | 'data' | 'default'

interface TestButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: TestButtonVariant
  fullWidth?: boolean
}

const variantClasses: Record<TestButtonVariant, string> = {
  position: 'bg-blue-600 hover:bg-blue-700',
  state: 'bg-green-600 hover:bg-green-700',
  interaction: 'bg-purple-600 hover:bg-purple-700',
  data: 'bg-yellow-600 hover:bg-yellow-700',
  default: 'bg-gray-600 hover:bg-gray-700',
}

export function TestButton({
  children,
  variant = 'default',
  fullWidth = true,
  className = '',
  ...props
}: TestButtonProps) {
  return (
    <button
      className={`
        ${fullWidth ? 'w-full' : ''}
        text-left px-2 py-1 text-xs mb-1 text-white
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

