/**
 * Battle Configuration Constants
 * Ported from OriginalGame/src/game/Battle.js
 */

export const BattleConfig = {
  LINE_LENGTH: 6,
  MAX_REAL_DISTANCE: 1000, // meters
  REAL_DISTANCE_PER_LINE: 100, // meters per line
  ESCAPE_TIME: 1.5, // seconds
  BULLET_ID: "1305011",
  HOMEMADE_ID: "1305012"
} as const

export const EquipmentPos = {
  GUN: 0,
  WEAPON: 1,
  EQUIP: 2,
  TOOL: 3,
  SPECIAL: 4
} as const

export const Equipment = {
  HAND: "1" // Hand-to-hand combat item ID
} as const

export const WORK_SITE = 502 // Work site ID




