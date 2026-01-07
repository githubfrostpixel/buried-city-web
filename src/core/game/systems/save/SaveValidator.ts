/**
 * Save Validator
 * Validates save data using Zod schemas
 * Internal module - not exported publicly
 */

import { z } from 'zod'
import { SaveDataSchema, type ValidatedSaveData } from './saveSchemas'

/**
 * Validate save data with Zod
 * @param data Data to validate
 * @returns Validated save data
 * @throws Error if validation fails
 */
export function validateSaveData(data: unknown): ValidatedSaveData {
  try {
    return SaveDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Save data validation failed:', error.errors)
      throw new Error(`Invalid save data: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

