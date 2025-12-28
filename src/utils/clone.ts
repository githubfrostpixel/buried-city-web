/**
 * Deep clone utility
 * Ported from OriginalGame/src/util/utils.js
 */

export function clone<T>(origin: T): T {
  if (!origin || typeof origin !== 'object') {
    throw new Error('clone: wrong args')
  }

  if (Array.isArray(origin)) {
    return origin.map((item) => {
      if (item && typeof item === 'object') {
        return clone(item)
      }
      return item
    }) as T
  }

  const newObj = {} as T
  for (const key in origin) {
    if (Object.prototype.hasOwnProperty.call(origin, key)) {
      const value = origin[key]
      if (value && typeof value === 'object') {
        newObj[key] = clone(value)
      } else {
        newObj[key] = value
      }
    }
  }

  return newObj
}


