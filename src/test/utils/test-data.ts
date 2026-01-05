/**
 * Test Data Helpers
 * Provides test data for consistent testing scenarios
 */

import type { WeatherType } from '@/common/types/game.types'
import type { PlayerAttributes } from '@/common/types/player.types'

/**
 * Test game states for different scenarios
 */
export const testGameStates = {
  default: {
    day: 0,
    hour: 6,
    minute: 0,
    season: 0, // Spring
    weather: 0 as WeatherType, // Clear
  },
  midday: {
    day: 5,
    hour: 12,
    minute: 30,
    season: 1, // Summer
    weather: 1 as WeatherType, // Cloudy
  },
  night: {
    day: 10,
    hour: 22,
    minute: 45,
    season: 2, // Autumn
    weather: 2 as WeatherType, // Rain
  },
  winter: {
    day: 20,
    hour: 15,
    minute: 0,
    season: 3, // Winter
    weather: 3 as WeatherType, // Snow
  },
  storm: {
    day: 25,
    hour: 18,
    minute: 15,
    season: 0, // Spring
    weather: 4 as WeatherType, // Storm
  },
}

/**
 * Test player attribute states
 */
export const testAttributeStates = {
  full: {
    hp: 100,
    hpMax: 100,
    spirit: 100,
    spiritMax: 100,
    starve: 100,
    starveMax: 100,
    vigour: 100,
    vigourMax: 100,
    injury: 0,
    injuryMax: 100,
    infect: 0,
    infectMax: 100,
    water: 100,
    waterMax: 100,
    virus: 0,
    virusMax: 100,
    temperature: 20,
    temperatureMax: 100,
  } as Partial<PlayerAttributes>,
  low: {
    hp: 25,
    hpMax: 100,
    spirit: 20,
    spiritMax: 100,
    starve: 15,
    starveMax: 100,
    vigour: 10,
    vigourMax: 100,
    injury: 80,
    injuryMax: 100,
    infect: 75,
    infectMax: 100,
    water: 5,
    waterMax: 100,
    virus: 90,
    virusMax: 100,
    temperature: 5,
    temperatureMax: 100,
  } as Partial<PlayerAttributes>,
  medium: {
    hp: 50,
    hpMax: 100,
    spirit: 50,
    spiritMax: 100,
    starve: 50,
    starveMax: 100,
    vigour: 50,
    vigourMax: 100,
    injury: 50,
    injuryMax: 100,
    infect: 50,
    infectMax: 100,
    water: 50,
    waterMax: 100,
    virus: 50,
    virusMax: 100,
    temperature: 15,
    temperatureMax: 100,
  } as Partial<PlayerAttributes>,
  warning: {
    hp: 30,
    hpMax: 100,
    spirit: 30,
    spiritMax: 100,
    starve: 20,
    starveMax: 100,
    vigour: 25,
    vigourMax: 100,
    injury: 60,
    injuryMax: 100,
    infect: 80,
    infectMax: 100,
    water: 10,
    waterMax: 100,
    virus: 25,
    virusMax: 100,
    temperature: 10,
    temperatureMax: 100,
  } as Partial<PlayerAttributes>,
}

/**
 * Test log messages
 */
export const testLogs = [
  { txt: 'Welcome to Buried City!', timestamp: Date.now() - 10000 },
  { txt: 'You found some supplies in the ruins.', timestamp: Date.now() - 8000 },
  { txt: 'Your hunger is increasing. Find food soon!', timestamp: Date.now() - 5000 },
  { txt: 'A zombie approaches from the east!', timestamp: Date.now() - 3000 },
  { txt: 'You successfully defended yourself.', timestamp: Date.now() - 1000 },
  { txt: 'Day 1 begins. The sun rises over the wasteland.', timestamp: Date.now() },
]

/**
 * Test building levels
 */
export const testBuildingLevels = {
  allInactive: Array.from({ length: 21 }, (_, i) => ({ bid: i + 1, level: -1 })),
  allLevel0: Array.from({ length: 21 }, (_, i) => ({ bid: i + 1, level: 0 })),
  allLevel1: Array.from({ length: 21 }, (_, i) => ({ bid: i + 1, level: 1 })),
  allLevel2: Array.from({ length: 21 }, (_, i) => ({ bid: i + 1, level: 2 })),
  mixed: [
    { bid: 1, level: 2 },
    { bid: 2, level: 1 },
    { bid: 3, level: 0 },
    { bid: 4, level: 2 },
    { bid: 5, level: 1 },
    { bid: 6, level: 0 },
    { bid: 7, level: -1 },
    { bid: 8, level: 1 },
    { bid: 9, level: 0 },
    { bid: 10, level: 2 },
    { bid: 11, level: 1 },
    { bid: 12, level: 0 },
    { bid: 13, level: 1 },
    { bid: 14, level: 2 },
    { bid: 15, level: 1 },
    { bid: 16, level: 0 },
    { bid: 17, level: 1 },
    { bid: 18, level: 2 },
    { bid: 19, level: 0 },
    { bid: 20, level: 1 },
    { bid: 21, level: 0 },
  ],
}

/**
 * Test scenarios
 */
export const testScenarios = {
  newGame: {
    gameState: testGameStates.default,
    attributes: testAttributeStates.full,
    buildingLevels: testBuildingLevels.allInactive,
    currency: 0,
    fuel: 0,
    workSiteActive: false,
    gasSiteActive: false,
    dogActive: false,
  },
  midGame: {
    gameState: testGameStates.midday,
    attributes: testAttributeStates.medium,
    buildingLevels: testBuildingLevels.mixed,
    currency: 500,
    fuel: 50,
    workSiteActive: true,
    gasSiteActive: true,
    dogActive: true,
  },
  warningState: {
    gameState: testGameStates.night,
    attributes: testAttributeStates.warning,
    buildingLevels: testBuildingLevels.allLevel1,
    currency: 100,
    fuel: 10,
    workSiteActive: false,
    gasSiteActive: false,
    dogActive: true,
  },
}

