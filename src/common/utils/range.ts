/**
 * Range utility for parsing and checking range strings like "[-,25]" or "(25,50]"
 * Ported from OriginalGame/src/util/range.js
 */

export class Range {
  private leftInclude: boolean
  private leftNum: number
  private rightInclude: boolean
  private rightNum: number

  constructor(rangeStr: string) {
    const array = rangeStr.split(',')
    
    // Parse left side
    this.leftInclude = array[0].substring(0, 1) === '['
    const leftNumStr = array[0].substring(1)
    this.leftNum = leftNumStr === '-' ? -Number.MAX_VALUE : Number(leftNumStr)

    // Parse right side
    this.rightInclude = array[1].substring(array[1].length - 1) === ']'
    const rightNumStr = array[1].substring(0, array[1].length - 1)
    this.rightNum = rightNumStr === '-' ? Number.MAX_VALUE : Number(rightNumStr)
  }

  isInRange(value: number): boolean {
    const leftRes = this.leftInclude 
      ? value >= this.leftNum 
      : value > this.leftNum

    const rightRes = this.rightInclude 
      ? value <= this.rightNum 
      : value < this.rightNum

    return leftRes && rightRes
  }
}

/**
 * Check if a value is within a range string
 */
export function isInRange(value: number, rangeStr: string): boolean {
  const range = new Range(rangeStr)
  return range.isInRange(value)
}

/**
 * Range result interface for attribute range info
 */
export interface RangeResult {
  min: number | null
  max: number | null
  minInclusive: boolean
  maxInclusive: boolean
}

/**
 * Parse range string and return range result
 * Used for getting attribute range information
 */
export function parseRange(rangeStr: string): RangeResult {
  const array = rangeStr.split(',')
  
  // Parse left side
  const leftInclude = array[0].substring(0, 1) === '['
  const leftNumStr = array[0].substring(1)
  const leftNum = leftNumStr === '-' ? null : Number(leftNumStr)
  
  // Parse right side
  const rightInclude = array[1].substring(array[1].length - 1) === ']'
  const rightNumStr = array[1].substring(0, array[1].length - 1)
  const rightNum = rightNumStr === '-' ? null : Number(rightNumStr)
  
  return {
    min: leftNum,
    max: rightNum,
    minInclusive: leftInclude,
    maxInclusive: rightInclude
  }
}


