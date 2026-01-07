/**
 * User Data Manager
 * Manages UUID and username
 */

import localforage from 'localforage'

/**
 * Get UUID for analytics/identification
 */
export async function getUUID(): Promise<string> {
  let uuid = await localforage.getItem<string>('uuid')
  
  if (!uuid) {
    uuid = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    await localforage.setItem('uuid', uuid)
  }
  
  return uuid
}

/**
 * Get username
 */
export async function getUsername(): Promise<string> {
  const username = await localforage.getItem<string>('username')
  
  if (!username || username === '0' || username === '') {
    const uid = await getUUID()
    return uid.substring(uid.length - 5)
  }
  
  return username
}

/**
 * Set username
 */
export async function setUsername(username: string): Promise<void> {
  await localforage.setItem('username', username)
}

/**
 * Check if this is first time playing
 */
export async function isFirstTime(): Promise<boolean> {
  const record = await localforage.getItem('record')
  return !record
}

/**
 * Initialize save system
 */
export async function initSaveSystem(_recordName: string = 'record'): Promise<void> {
  // Initialize localforage
  await localforage.ready()
  
  // Check if first time
  const firstTime = await isFirstTime()
  if (firstTime) {
    // Initialize default save
    await localforage.setItem('record', {})
  }
}

