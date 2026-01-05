/**
 * useBattleEvents Hook
 * Subscribes to battle events and returns combat logs and monster count
 */

import { useState, useEffect } from 'react'
import { emitter } from '@/common/utils/emitter'

type ViewMode = 
  | 'secretEntry'
  | 'battleBegin'
  | 'battleProcess'
  | 'battleEnd'
  | 'workBegin'
  | 'workProcess'
  | 'workStorage'
  | 'siteEnd'

export function useBattleEvents(viewMode: ViewMode) {
  const [combatLogs, setCombatLogs] = useState<Array<{ log: string; color?: string; bigger?: boolean }>>([])
  const [monsterCount, setMonsterCount] = useState<number>(0)

  useEffect(() => {
    if (viewMode !== 'battleProcess') return

    const handleLog = (data: { log: string; color?: string; bigger?: boolean }) => {
      setCombatLogs(prev => {
        const newLogs = [...prev, data]
        return newLogs.slice(-7)
      })
    }

    const handleMonsterLength = (count: number) => {
      setMonsterCount(count)
    }

    emitter.on('battleProcessLog', handleLog)
    emitter.on('battleMonsterLength', handleMonsterLength)

    return () => {
      emitter.off('battleProcessLog', handleLog)
      emitter.off('battleMonsterLength', handleMonsterLength)
    }
  }, [viewMode])

  return { combatLogs, monsterCount, setCombatLogs, setMonsterCount }
}

