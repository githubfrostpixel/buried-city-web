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
  })
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

// Game save schema
const GameSaveDataSchema = z.object({
  time: z.number().min(0),
  season: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  day: z.number().int().min(0),
  weather: WeatherSaveDataSchema
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

// NPC save schema
const NPCSaveDataSchema = z.object({
  id: z.number().int(),
  friendship: z.number().min(0),
  visited: z.boolean(),
  lastVisitDay: z.number().int().optional()
})

// Site save schema
const SiteSaveDataSchema = z.object({
  id: z.number().int(),
  explored: z.boolean().optional(),
  cleared: z.boolean().optional()
})

// Complete save data schema
export const SaveDataSchema = z.object({
  version: z.string(),
  timestamp: z.number().int(),
  player: PlayerSaveDataSchema,
  game: GameSaveDataSchema,
  buildings: z.array(BuildingSaveDataSchema),
  npcs: z.array(NPCSaveDataSchema),
  sites: z.array(SiteSaveDataSchema)
})

export type ValidatedSaveData = z.infer<typeof SaveDataSchema>

