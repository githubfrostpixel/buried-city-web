/**
 * Viewport Scale Context
 * Provides viewport scale factor to overlay components
 * Ensures overlays scale proportionally with the game container
 */

import { createContext, useContext, ReactNode } from 'react'

interface ViewportScaleContextValue {
  scale: number
  viewportWidth: number
  viewportHeight: number
}

const ViewportScaleContext = createContext<ViewportScaleContextValue | undefined>(undefined)

interface ViewportScaleProviderProps {
  children: ReactNode
  scale: number
  viewportWidth: number
  viewportHeight: number
}

export function ViewportScaleProvider({
  children,
  scale,
  viewportWidth,
  viewportHeight
}: ViewportScaleProviderProps) {
  return (
    <ViewportScaleContext.Provider value={{ scale, viewportWidth, viewportHeight }}>
      {children}
    </ViewportScaleContext.Provider>
  )
}

/**
 * Hook to access viewport scale context
 * @returns Viewport scale, width, and height
 * @throws Error if used outside ViewportScaleProvider
 */
export function useViewportScaleContext(): ViewportScaleContextValue {
  const context = useContext(ViewportScaleContext)
  if (context === undefined) {
    throw new Error('useViewportScaleContext must be used within a ViewportScaleProvider')
  }
  return context
}

