/**
 * Time Formatting Utilities
 * Format time values for display
 * Ported from OriginalGame/src/util/utils.js
 */

/**
 * Format time duration as string (e.g., "2 hours 30 minutes")
 * @param time Time in seconds
 * @returns Formatted time string
 */
export function getTimeDistanceStr(time: number): string {
  // time is in seconds
  let timeStr = ""
  const hour = Math.floor(time / 60 / 60)
  if (hour) {
    timeStr += hour + " hour" + (hour > 1 ? "s " : " ")  // TODO: Use string ID 1151
  }
  const minute = hour ? Math.floor(time / 60 % 60) : Math.floor(time / 60)
  timeStr += minute + " minute" + (minute > 1 ? "s" : "")  // TODO: Use string ID 1152
  return timeStr
}

