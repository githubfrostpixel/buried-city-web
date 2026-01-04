/**
 * useMainSceneMusic Hook
 * Handles music playback based on current panel
 * Extracted from MainScene.tsx
 */

import { useEffect } from 'react'
import { audioManager, MusicPaths, getSiteMusic } from '@/core/game/systems/AudioManager'
import type { Panel } from '@/core/store/uiStore'

interface UseMainSceneMusicProps {
  currentPanel: Panel
  sitePanelSiteId: number | null
}

/**
 * Plays music based on the current panel
 * Matches Navigation.current() logic from OriginalGame
 * Ported from OriginalGame/src/ui/bottomFrame.js:40-143
 */
export function useMainSceneMusic({ currentPanel, sitePanelSiteId }: UseMainSceneMusicProps) {
  // Play music based on current panel
  useEffect(() => {
    let musicPath: string | null = null
    
    switch (currentPanel) {
      case 'home':
      case 'build':
      case 'storage':
      case 'gate':
      case 'radio':
      case 'gateOut':
        musicPath = MusicPaths.HOME
        break
      
      case 'map': {
        // Weather-based music (handled in MapPanelContent)
        // Don't set music here, let MapPanelContent handle it
        return
      }
      
      case 'site': {
        // Site music based on siteId
        if (sitePanelSiteId) {
          musicPath = getSiteMusic(sitePanelSiteId)
        }
        break
      }
      
      case 'siteStorage':
      case 'siteExplore': {
        // Use same site music as parent site
        if (sitePanelSiteId) {
          musicPath = getSiteMusic(sitePanelSiteId)
        }
        break
      }
      
      // Future panels:
      // case 'death':
      //   musicPath = MusicPaths.DEATH
      //   break
      // case 'npc':
      //   musicPath = MusicPaths.NPC_OLD
      //   break
    }
    
    if (musicPath) {
      audioManager.playMusic(musicPath, true)
    }
  }, [currentPanel, sitePanelSiteId])
  
  // Stop music when leaving main scene (matches Navigation.stopMusic())
  useEffect(() => {
    return () => {
      audioManager.stopMusic()
    }
  }, [])
}

