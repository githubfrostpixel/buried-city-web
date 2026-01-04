import i18n from '../i18n/config'

/**
 * Get a localized string by ID, matching the original game's stringUtil.getString behavior
 * 
 * @param stringId - String ID (numeric or string key)
 * @param args - Optional arguments for format string replacement (%s, %d)
 * @returns Localized string or object, or empty string if not found
 * 
 * @example
 * // Simple string
 * getString(6000) // "Select a save file"
 * 
 * // Format string
 * getString(6002, "Player", "Survivor", "100", "") // "Player, talent: Survivor, coin: 100"
 * 
 * // Nested object
 * getString("1.title") // "Date"
 * getString("1.des") // "Number of days..."
 * 
 * // Array access
 * getString("water_name.0") // "Severe Thirst"
 * 
 * // Object return (for complex configs)
 * getString("statusDialog") // Returns full object
 */
export function getString(stringId: string | number, ...args: any[]): any {
  const key = String(stringId)
  
  try {
    // Get the translation (may be a string, object, or array)
    const translation = i18n.t(key, { returnObjects: true, defaultValue: '' })
    
    // If translation is empty or not found, return empty string (matching original behavior)
    if (!translation || translation === '') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[stringUtil] String ID "${key}" not found`)
      }
      return ''
    }
    
    // If we have format arguments, process the string
    if (args.length > 0 && typeof translation === 'string') {
      return formatString(translation, ...args)
    }
    
    // Return the translation as-is (string, object, or array)
    return translation
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[stringUtil] Error getting string "${key}":`, error)
    }
    return ''
  }
}

/**
 * Format a string with placeholders, matching original game's cc.formatStr behavior
 * Supports %s (string), %d (number), %1s, %2s (positional)
 */
function formatString(str: string, ...args: any[]): string {
  if (!str || typeof str !== 'string') {
    return str
  }
  
  let result = str
  let argIndex = 0
  
  // Process all placeholders
  while (argIndex < args.length) {
    const arg = args[argIndex]
    
    // Try to match %d or %s first
    let match = result.match(/(%d)|(%s)/)
    if (match) {
      result = result.replace(/(%d)|(%s)/, String(arg))
      argIndex++
      continue
    }
    
    // Try positional placeholders %1s, %2s, etc.
    match = result.match(/%(\d+)s/)
    if (match) {
      const pos = parseInt(match[1], 10) - 1
      if (pos >= 0 && pos < args.length) {
        result = result.replace(/%\d+s/, String(args[pos]))
        argIndex++
        continue
      }
    }
    
    // If no match found, append the argument (original game behavior)
    result += '    ' + String(arg)
    argIndex++
  }
  
  return result
}


