/**
 * Time formatting utilities for Radio panel
 * Ported from OriginalGame/src/game/TimeManager.js getTimeStr()
 */

import { game } from '@/game/Game'
import type { TimeFormat } from '@/game/systems/TimeManager'

/**
 * Format time from seconds to TimeFormat object
 * Ported from TimerManager.formatT()
 */
function formatTimeFromSeconds(val: number): TimeFormat {
  const d = Math.floor(val / (24 * 60 * 60))
  const dTime = val % (24 * 60 * 60)
  const h = Math.floor(dTime / (60 * 60))
  const hTime = dTime % (60 * 60)
  const m = Math.floor(hTime / 60)
  const mTime = hTime % 60
  const s = Math.floor(mTime)
  return { d, h, m, s }
}

/**
 * Format radio time string from game time in seconds
 * Ported from TimerManager.getTimeStr()
 * Format: "Day X, HH:MM" (using string 1203 format)
 */
export function formatRadioTime(timeSeconds: number): string {
  const timeObj = formatTimeFromSeconds(timeSeconds)
  const hourStr = timeObj.h < 10 ? `0${timeObj.h}` : `${timeObj.h}`
  const minuteStr = timeObj.m < 10 ? `0${timeObj.m}` : `${timeObj.m}`
  
  // String 1203 format: "%s day %s hour %s minute" (English)
  // For radio, we use simplified format: "Day X, HH:MM"
  return `Day ${timeObj.d + 1}, ${hourStr}:${minuteStr}`
}

/**
 * Format radio time label with prefix
 * Ported from MessageView.createOneItem() time label
 * String IDs:
 * - 1149: "%s, listening content:" (other players)
 * - 1150: "%s, calling content:" (player's own messages)
 */
export function formatRadioTimeLabel(timeSeconds: number, isPlayer: boolean): string {
  const timeStr = formatRadioTime(timeSeconds)
  // For now, use simplified format. TODO: Use string IDs 1149/1150 when string system is ready
  if (isPlayer) {
    return `${timeStr}, calling content:`
  } else {
    return `${timeStr}, listening content:`
  }
}


