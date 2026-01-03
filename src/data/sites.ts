/**
 * Site configuration data
 * Ported from OriginalGame/src/data/siteConfig.js
 * 
 * TODO: Full conversion of all 5807 lines
 * For now, this is a stub with minimal entries for testing
 */

import type { SiteConfigMap } from '@/types/site.types'

// Stub siteConfig - will be fully populated later
export const siteConfig: SiteConfigMap = {
  "100": {
    id: 100,
    coordinate: { x: 45, y: 50 },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20
  },
  "201": {
    id: 201,
    coordinate: { x: 108, y: 127 },
    battleRoom: 1,
    difficulty: [1, 1],
    workRoom: 1,
    produceList: [],
    fixedProduceList: [
      { itemId: "1101031", num: 7 },
      { itemId: "1101041", num: 2 },
      { itemId: "1101021", num: 2 },
      { itemId: "1101061", num: 3 },
      { itemId: "1103083", num: 1 }
    ],
    unlockValue: {
      site: ["1", "202"]
    },
    def: 20
  },
  "202": {
    id: 202,
    coordinate: { x: 130, y: 207 },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20
  },
  "204": {
    id: 204,
    coordinate: { x: 150, y: 250 },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 20
  },
  "400": {
    id: 400,
    coordinate: { x: 140, y: 407 },
    difficulty: [],
    produceList: [],
    fixedProduceList: [],
    unlockValue: {},
    def: 50
  }
  // TODO: Add all other sites from siteConfig.js (5807 lines total)
}

