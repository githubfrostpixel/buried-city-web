/**
 * Survival System
 * Ported from OriginalGame/src/game/player.js
 * 
 * Handles attribute decay, range effects, death conditions, sleep, and temperature
 */

import { usePlayerStore } from '@/store/playerStore'
import { useGameStore } from '@/store/gameStore'
import { playerConfig, playerAttrEffect } from '@/data/player'
import type { PlayerAttributes, AttributeEffect, PlayerAttributeEffectConfig } from '@/types/player.types'
import type { DeathReason } from '@/types/game.types'
import { isInRange } from '@/utils/range'
import { TimeManager } from './TimeManager'

export interface AttributeRangeInfo {
  id: number
  range: string
  effect: AttributeEffect
}

export interface SleepState {
  isSleeping: boolean
  startTime: number
  vigourRecoveryRate: number
}

export class SurvivalSystem {
  private timeManager: TimeManager
  private sleepState: SleepState = {
    isSleeping: false,
    startTime: 0,
    vigourRecoveryRate: 0
  }
  private deathCausedInfect = false
  private isInCure = false // TODO: Implement cure state from medicine system
  private isInBind = false // TODO: Implement bind state from injury treatment

  constructor(timeManager: TimeManager) {
    this.timeManager = timeManager
    this.setupHourlyCallbacks()
  }

  /**
   * Setup hourly callbacks for attribute decay
   */
  private setupHourlyCallbacks(): void {
    // Process hourly decay every hour
    this.timeManager.addTimerCallbackHourByHour(
      this,
      () => this.processHourlyDecay(),
      0
    )
  }

  /**
   * Process hourly attribute decay
   * Called by TimeManager on hourly callbacks
   */
  processHourlyDecay(): void {
    // Get current hour (0-23)
    const format = this.timeManager.formatTime()
    const hour = format.h
    
    // Process sleep recovery if sleeping
    if (this.sleepState.isSleeping) {
      this.processSleepHourly()
    }
    
    // changeByTime has 6 values for hours 0-5 (each hour of the 6-hour cycle)
    // The cycle repeats every 6 hours
    const cycleIndex = hour % 6
    const changeValue = playerConfig.changeByTime[cycleIndex][0]
    
    // Apply decay to starve (hunger)
    if (changeValue !== 0) {
      this.changeAttribute('starve', changeValue)
    }
    
    // Update other attributes that decay hourly
    this.updateStarve()
    this.updateInfect()
    this.updateVigour()
    this.updateInjury()
    
    // Update temperature
    this.updateTemperature()
    
    // Check death conditions
    const deathReason = this.checkDeathConditions()
    if (deathReason) {
      this.handleDeath(deathReason)
    }
  }

  /**
   * Apply attribute range effects
   * Checks each attribute against playerAttrEffect ranges
   */
  applyAttributeRangeEffects(): void {
    this.updateStarve()
    this.updateInfect()
    this.updateVigour()
    this.updateInjury()
    this.updateWater()
    this.updateSpirit()
    this.updateVirus()
    this.updateTemperature()
  }

  /**
   * Update starve (hunger) attribute effects
   */
  private updateStarve(): void {
    // TODO: Check buff ITEM_1107042 prevents starve effects
    // if (this.buffManager.isBuffEffect(BuffItemEffectType.ITEM_1107042)) {
    //   return
    // }
    
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('starve', playerStore.starve)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Update infect (infection) attribute effects
   */
  private updateInfect(): void {
    // TODO: Check buff ITEM_1107022 prevents infect effects
    // if (this.buffManager.isBuffEffect(BuffItemEffectType.ITEM_1107022)) {
    //   return
    // }
    
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('infect', playerStore.infect)
    
    if (attrRangeInfo) {
      const effect = attrRangeInfo.effect
      
      // Special handling for infection effects
      for (const [attr, value] of Object.entries(effect)) {
        if (attr === 'hp') {
          // HP damage from infection is formula-based
          const infectValue = playerStore.infect
          const damage = value! * (infectValue / 100)
          this.changeAttribute('hp', Math.ceil(damage))
          this.deathCausedInfect = true
        } else if (attr === 'infect' || attr === 'spirit') {
          // Only apply if not in cure state
          if (!this.isInCure) {
            this.changeAttribute(attr as keyof PlayerAttributes, value!)
          }
        } else {
          this.changeAttribute(attr as keyof PlayerAttributes, value!)
        }
      }
    }
    
    // Check if death was caused by infection
    const playerStore2 = usePlayerStore.getState()
    if (playerStore2.hp === 0 && this.deathCausedInfect) {
      // Death message would be shown here
      // player.log.addMsg(1108)
    } else {
      this.deathCausedInfect = false
    }
  }

  /**
   * Update vigour (energy) attribute effects
   */
  private updateVigour(): void {
    // TODO: Check buff ITEM_1107032 prevents vigour effects
    // if (this.buffManager.isBuffEffect(BuffItemEffectType.ITEM_1107032)) {
    //   return
    // }
    
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('vigour', playerStore.vigour)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Update injury attribute effects
   */
  private updateInjury(): void {
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('injury', playerStore.injury)
    
    if (attrRangeInfo) {
      const effect = attrRangeInfo.effect
      
      // Special handling for injury effects
      for (const [attr, value] of Object.entries(effect)) {
        if (attr === 'infect' || attr === 'spirit') {
          // Only apply if not in bind state
          if (!this.isInBind) {
            this.changeAttribute(attr as keyof PlayerAttributes, value!)
          }
        } else {
          this.changeAttribute(attr as keyof PlayerAttributes, value!)
        }
      }
    }
  }

  /**
   * Update water (thirst) attribute effects
   */
  private updateWater(): void {
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('water', playerStore.water)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Update spirit (mood) attribute effects
   */
  private updateSpirit(): void {
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('spirit', playerStore.spirit)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Update virus attribute effects
   */
  private updateVirus(): void {
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('virus', playerStore.virus)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Apply attribute effect to player
   */
  private applyAttributeEffect(effect: AttributeEffect): void {
    for (const [attr, value] of Object.entries(effect)) {
      if (value !== undefined) {
        this.changeAttribute(attr as keyof PlayerAttributes, value)
      }
    }
  }

  /**
   * Change player attribute
   */
  private changeAttribute(attr: keyof PlayerAttributes, value: number): void {
    const playerStore = usePlayerStore.getState()
    
    // TODO: Check buff effects that prevent attribute changes
    // For now, we'll skip buff checks
    
    // Special handling for vigour during sleep
    if (attr === 'vigour' && this.sleepState.isSleeping) {
      const vigourMax = playerStore.vigourMax
      if (playerStore.vigour >= vigourMax) {
        // If vigour is max and HP is max, decrease spirit
        if (playerStore.hp >= playerStore.hpMax) {
          this.changeAttribute('spirit', -1)
        }
        return
      }
    }
    
    // Update attribute
    let newValue = playerStore[attr] + value
    newValue = Math.round(newValue)
    
    // Clamp to min/max
    const maxAttr = `${attr}Max` as keyof PlayerAttributes
    const maxValue = playerStore[maxAttr] as number
    
    if (attr === 'temperature') {
      newValue = Math.max(-2, Math.min(newValue, maxValue))
    } else {
      newValue = Math.max(0, Math.min(newValue, maxValue))
    }
    
    playerStore.updateAttribute(attr, newValue)
    
    // TODO: Emit attribute change event if needed
    // utils.emitter.emit(`${attr}_change`, value)
  }

  /**
   * Get attribute range info for a given attribute and value
   */
  getAttrRangeInfo(attr: string, value: number): AttributeRangeInfo | null {
    const attrEffects = playerAttrEffect[attr as keyof typeof playerAttrEffect]
    if (!attrEffects) {
      return null
    }
    
    // Find matching range
    for (const levelKey in attrEffects) {
      const config = attrEffects[levelKey] as PlayerAttributeEffectConfig
      if (isInRange(value, config.range)) {
        return {
          id: config.id,
          range: config.range,
          effect: config.effect
        }
      }
    }
    
    return null
  }

  /**
   * Update temperature based on season, weather, and buildings
   */
  updateTemperature(): void {
    const gameStore = useGameStore.getState()
    const playerStore = usePlayerStore.getState()
    const season = gameStore.season
    
    // Get temperature config for current season
    // temperature array: [baseTemp, changeRate, minChange]
    // Index: 0=Spring, 1=Summer, 2=Autumn, 3=Winter, 4=default
    const tempConfig = playerConfig.temperature[season] || playerConfig.temperature[4]
    
    if (!tempConfig || tempConfig.length === 0) {
      return
    }
    
    const changeRate = tempConfig[1] || 0
    
    // TODO: Check fireplace building (ID 5) for heating
    // For now, apply base temperature change
    const tempChange = changeRate !== 0 ? changeRate : 0
    
    if (tempChange !== 0) {
      // Apply temperature change gradually
      // In original game, this happens hourly
      this.changeAttribute('temperature', tempChange)
    }
    
    // Apply temperature range effects
    const attrRangeInfo = this.getAttrRangeInfo('temperature', playerStore.temperature)
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Check and handle death conditions
   * Returns death reason if player died
   */
  checkDeathConditions(): DeathReason | null {
    const playerStore = usePlayerStore.getState()
    
    // Check HP = 0
    if (playerStore.hp <= 0) {
      if (this.deathCausedInfect) {
        return 'infection'
      }
      return 'hp_zero'
    }
    
    // Check virus overload
    if (playerStore.virus >= playerStore.virusMax) {
      return 'virus_overload'
    }
    
    // Check starvation (starve = 0 for extended period)
    // Note: Original game may have additional checks
    
    // Check thirst (water = 0 for extended period)
    // Note: Original game may have additional checks
    
    return null
  }

  /**
   * Handle death
   */
  private handleDeath(reason: DeathReason): void {
    // TODO: Trigger death overlay
    // This will be handled by UI system
    console.log('Player died:', reason)
    
    // Emit death event if needed
    // utils.emitter.emit('death', reason)
  }

  /**
   * Start sleep mechanics
   * Returns true if sleep can start
   */
  startSleep(): boolean {
    // TODO: Check if bed building (ID 9) exists
    // For now, allow sleep
    
    if (this.sleepState.isSleeping) {
      return false
    }
    
    const playerStore = usePlayerStore.getState()
    
    // TODO: Calculate vigour recovery rate based on bed level
    // bedRate = bedLevel * 0.5 + starve/starveMax * 0.2 + spirit/spiritMax * 0.3
    // vigourRecovery = bedRate * 12 per hour
    // For now, use default rate
    const vigourRecoveryRate = 10 // Default recovery per hour
    
    this.sleepState = {
      isSleeping: true,
      startTime: this.timeManager.now(),
      vigourRecoveryRate
    }
    
    // Accelerate time during sleep
    // Sleep until vigour is full or morning (6:00)
    const timeToMorning = this.timeManager.getTimeFromNowToMorning()
    const vigourNeeded = playerStore.vigourMax - playerStore.vigour
    const hoursNeeded = Math.ceil(vigourNeeded / vigourRecoveryRate)
    const sleepTime = Math.min(timeToMorning, hoursNeeded * 60 * 60)
    
    // Accelerate time
    this.timeManager.accelerate(sleepTime, 3) // 3 real seconds
    
    return true
  }

  /**
   * Process sleep mechanics (hourly)
   * Called during sleep to recover vigour every hour
   */
  private processSleepHourly(): void {
    if (!this.sleepState.isSleeping) {
      return
    }
    
    const playerStore = usePlayerStore.getState()
    const format = this.timeManager.formatTime()
    
    // Check if should wake up (morning or vigour full)
    if (format.h >= 6 && format.h < 20) {
      // Morning - wake up
      this.endSleep()
      return
    }
    
    if (playerStore.vigour >= playerStore.vigourMax) {
      // Vigour full - wake up
      this.endSleep()
      return
    }
    
    // Recover vigour (recovery rate is per hour)
    const vigourRecovery = this.sleepState.vigourRecoveryRate
    
    if (vigourRecovery > 0) {
      this.changeAttribute('vigour', vigourRecovery)
    }
  }

  /**
   * End sleep
   */
  endSleep(): void {
    if (!this.sleepState.isSleeping) {
      return
    }
    
    this.sleepState = {
      isSleeping: false,
      startTime: 0,
      vigourRecoveryRate: 0
    }
    
    // Time acceleration will end automatically when target time is reached
  }

  /**
   * Get current sleep state
   */
  getSleepState(): SleepState {
    return { ...this.sleepState }
  }

  /**
   * Set cure state (from medicine)
   */
  setIsInCure(isInCure: boolean): void {
    this.isInCure = isInCure
  }

  /**
   * Set bind state (from injury treatment)
   */
  setIsInBind(isInBind: boolean): void {
    this.isInBind = isInBind
  }
}

