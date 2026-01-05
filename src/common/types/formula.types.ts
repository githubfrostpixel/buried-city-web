/**
 * Formula Type Definitions
 * Types for crafting recipes (formulas)
 */

export interface FormulaCost {
  itemId: number | string
  num: number
}

export interface FormulaProduce {
  itemId: number | string
  num: number
}

export interface FormulaConfig {
  id: string | number
  produce: FormulaProduce[]
  cost: FormulaCost[]
  makeTime: number // in minutes
  placedTime?: number[] // Optional placement time requirements
}

export type FormulaConfigMap = Record<string, FormulaConfig>

