/**
 * Zod validation schemas for save data
 * Ensures type safety and data integrity for save/load operations
 */

import { z } from 'zod'

// Player attributes schema
const PlayerAttributesSchema = z.object({
  hp: z.number().min(0),
  hpMax: z.number().min(0),
  spirit: z.number().min(0),
  spiritMax: z.number().min(0),
  starve: z.number().min(0),
  starveMax: z.number().min(0),
  vigour: z.number().min(0),
  vigourMax: z.number().min(0),
  injury: z.number().min(0),
  injuryMax: z.number().min(0),
  infect: z.number().min(0),
  infectMax: z.number().min(0),
  water: z.number().min(0),
  waterMax: z.number().min(0),
  virus: z.number().min(0),
  virusMax: z.number().min(0),
  temperature: z.number(),
  temperatureMax: z.number().min(0)
})

// Player save schema
const PlayerSaveDataSchema = z.object({
  attributes: PlayerAttributesSchema,
  level: z.number().int().min(1),
  exp: z.number().min(0),
  money: z.number().min(0),
  talent: z.array(z.string()),
  bag: z.record(z.string(), z.number().int().min(0)),
  storage: z.record(z.string(), z.number().int().min(0)),
  safe: z.record(z.string(), z.number().int().min(0)),
  equipment: z.object({
    gun: z.string().nullable(),
    weapon: z.string().nullable(),
    equip: z.string().nullable(),
    tool: z.string().nullable(),
    special: z.string().nullable()
  }),
  dog: z.object({
    hunger: z.number().min(0),
    hungerMax: z.number().min(0),
    mood: z.number().min(0),
    moodMax: z.number().min(0),
    injury: z.number().min(0),
    injuryMax: z.number().min(0),
    active: z.boolean()
  }),
  weaponRound: z.record(z.string(), z.number().int().min(0)).optional()
})

// Weather save schema
const WeatherSaveDataSchema = z.object({
  weatherId: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  Tomorrow: z.tuple([
    z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
  ]),
  Random: z.string(),
  lastDays: z.number().int(),
  aa: z.boolean()
})

// Building save schema
const BuildingSaveDataSchema = z.object({
  id: z.number().int(),
  level: z.number().int().min(-1), // -1 means needs to be built
  active: z.boolean().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  activeBtnIndex: z.number().int().optional(),
  saveActions: z.record(z.string(), z.any()).optional() // For formula states
})

// Gift schema for NPC save data
const GiftSchema = z.object({
  itemId: z.string().optional(),
  num: z.string().optional(),
  siteId: z.string().optional()
})

// Steal log entry schema
const StealLogEntrySchema = z.object({
  ti: z.number(), // Time
  ar: z.array(z.object({
    itemId: z.string(),
    num: z.number()
  })) // Stolen items
})

// NPC save schema (matches NPCSaveData interface)
const NPCSaveDataSchema = z.object({
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  reputation: z.number().int().min(0).max(10),
  maxRep: z.number().int().min(-1).max(10),
  storage: z.record(z.string(), z.number().int().min(0)), // Storage.save() format
  needSendGiftList: z.object({
    item: z.array(GiftSchema).optional(),
    site: z.array(GiftSchema).optional()
  }),
  isUnlocked: z.boolean(),
  tradingCount: z.number().int().min(0),
  isSteal: z.boolean(),
  Alert: z.number().int().min(0).max(30),
  log: z.array(StealLogEntrySchema),
  sentGiftNumbers: z.array(z.number().int()).optional(), // Array of gift numbers (1, 2, 3, 4, 5, 6, 7...)
  lastGiftDay: z.number().int().optional() // Day when last gift was sent (-1 if never sent)
})

// NPC Manager save schema
const NPCManagerSaveDataSchema = z.object({
  npcList: z.record(z.string(), NPCSaveDataSchema),
  lastGiftDay: z.number().int().optional() // Day when last gift was sent globally (-1 if never sent)
})

// Room schema for site save data
const RoomSchema = z.object({
  list: z.array(z.union([z.string(), z.any()])),
  type: z.union([z.literal("battle"), z.literal("work")]),
  difficulty: z.number().optional(),
  workType: z.number().optional(),
  itemsFlushed: z.boolean().optional()  // Track if items from this room have been flushed to site storage
  // Note: tempStorage is not persisted (it's temporary)
})

// Site save schema (matches Site.save() return type)
const SiteSaveDataSchema = z.object({
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  step: z.number().int(),
  rooms: z.array(RoomSchema),
  storage: z.record(z.string(), z.number().int().min(0)), // Storage.save() returns Record<string, number>
  secretRoomsShowedCount: z.number().int().optional(),
  isSecretRoomsEntryShowed: z.boolean().optional(),
  isInSecretRooms: z.boolean().optional(),
  secretRooms: z.array(RoomSchema).optional(),
  secretRoomsStep: z.number().int().optional(),
  secretRoomType: z.number().int().optional(),
  closed: z.boolean().optional(),
  isUnderAttacked: z.boolean().optional(),
  haveNewItems: z.boolean().optional(),
  isActive: z.boolean().optional(),
  fixedTime: z.number().optional()
})

// Map save schema
const MapSaveDataSchema = z.object({
  npcMap: z.array(z.number().int()),
  siteMap: z.record(z.string(), SiteSaveDataSchema),
  pos: z.object({
    x: z.number(),
    y: z.number()
  }),
  needDeleteSiteList: z.array(z.number().int())
})

// Game save schema (must be after MapSaveDataSchema)
const GameSaveDataSchema = z.object({
  time: z.number().min(0),
  season: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  day: z.number().int().min(0),
  weather: WeatherSaveDataSchema,
  map: MapSaveDataSchema.optional() // Optional for backward compatibility
})

// Complete save data schema
export const SaveDataSchema = z.object({
  version: z.string(),
  timestamp: z.number().int(),
  player: PlayerSaveDataSchema,
  game: GameSaveDataSchema,
  buildings: z.array(BuildingSaveDataSchema),
  npcManager: NPCManagerSaveDataSchema.optional(), // New NPC manager system
  npcs: z.array(z.object({
    id: z.number().int(),
    friendship: z.number().min(0),
    visited: z.boolean(),
    lastVisitDay: z.number().int().optional()
  })).optional(), // Legacy NPC schema for backward compatibility
  sites: z.array(z.object({
    id: z.number().int(),
    explored: z.boolean().optional(),
    cleared: z.boolean().optional()
  })) // Legacy site schema for backward compatibility
})

export type ValidatedSaveData = z.infer<typeof SaveDataSchema>

