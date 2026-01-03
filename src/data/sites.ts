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
  "2": {
    id: 2,
    coordinate: { x: 144, y: 287 },
    battleRoom: 7,
    difficulty: [2, 3],
    workRoom: 8,
    produceValue: 278,
    produceList: [
      { itemId: "1101011", weight: 15 },
      { itemId: "1101021", weight: 15 },
      { itemId: "1101031", weight: 6 },
      { itemId: "1101041", weight: 5 },
      { itemId: "1101051", weight: 5 },
      { itemId: "1101**", weight: 10 },
      { itemId: "1102011", weight: 1 },
      { itemId: "1103*1", weight: 10 },
      { itemId: "1104011", weight: 5 },
      { itemId: "1104021", weight: 5 },
      { itemId: "1104043", weight: 0 },
      { itemId: "1105011", weight: 10 },
      { itemId: "1105042", weight: 2 },
      { itemId: "1105**", weight: 0 },
      { itemId: "1305011", weight: 30 },
      { itemId: "1103083", weight: 3 },
      { itemId: "1102**", weight: 2 },
      { itemId: "1301**", weight: 0 },
      { itemId: "1105022", weight: 5 },
      { itemId: "1105033", weight: 1 },
      { itemId: "1302*1", weight: 1 },
      { itemId: "1106013", weight: 0 },
      { itemId: "1101071", weight: 5 }
    ],
    fixedProduceList: [
      { itemId: "1103083", num: 3 },
      { itemId: "1103094", num: 2 }
    ],
    unlockValue: {
      site: ["4", "5"]
    },
    def: 20
  },
  "3": {
    id: 3,
    coordinate: { x: 212, y: 127 },
    battleRoom: 4,
    difficulty: [2, 3],
    workRoom: 4,
    produceValue: 138,
    produceList: [
      { itemId: "1101011", weight: 15 },
      { itemId: "1101021", weight: 10 },
      { itemId: "1101031", weight: 4 },
      { itemId: "1101041", weight: 4 },
      { itemId: "1101051", weight: 4 },
      { itemId: "1101**", weight: 10 },
      { itemId: "1102011", weight: 1 },
      { itemId: "1103*1", weight: 0 },
      { itemId: "1104011", weight: 2 },
      { itemId: "1104021", weight: 2 },
      { itemId: "1101061", weight: 4 },
      { itemId: "1105011", weight: 5 },
      { itemId: "1105042", weight: 0 },
      { itemId: "1105**", weight: 0 },
      { itemId: "1305011", weight: 20 },
      { itemId: "1103083", weight: 2 },
      { itemId: "1102**", weight: 1 },
      { itemId: "1301**", weight: 0 },
      { itemId: "1105022", weight: 3 },
      { itemId: "1105033", weight: 0 },
      { itemId: "1302*1", weight: 1 },
      { itemId: "1106013", weight: 0 },
      { itemId: "1101071", weight: 2 }
    ],
    fixedProduceList: [
      { itemId: "1101061", num: 4 }
    ],
    unlockValue: {
      site: ["10", "11"]
    },
    secretRoomsId: 1,
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

