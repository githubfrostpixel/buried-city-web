/**
 * Survival System
 * Ported from OriginalGame/src/game/player.js
 * 
 * Handles attribute decay, range effects, death conditions, sleep, and temperature
 */

import { usePlayerStore } from '@/store/playerStore'
import { useGameStore } from '@/store/gameStore'
import { useBuildingStore } from '@/store/buildingStore'
import { useUIStore } from '@/store/uiStore'
import { useLogStore } from '@/store/logStore'
import { playerConfig, playerAttrEffect } from '@/data/player'
import { weatherConfig } from '@/data/weather'
import type { PlayerAttributes, AttributeEffect, PlayerAttributeEffectConfig } from '@/types/player.types'
import type { DeathReason } from '@/types/game.types'
import { isInRange } from '@/utils/range'
import { TimeManager, TimerCallback } from './TimeManager'

export interface AttributeRangeInfo {
  id: number
  range: string
  effect: AttributeEffect
}

export type SleepDuration = '1hour' | '4hours' | 'untilMorning'

export interface SleepState {
  isSleeping: boolean
  startTime: number
  endTime: number
  vigourRecoveryRate: number
  hpRecoveryRate: number
}

export class SurvivalSystem {
  private timeManager: TimeManager
  private sleepState: SleepState = {
    isSleeping: false,
    startTime: 0,
    endTime: 0,
    vigourRecoveryRate: 0,
    hpRecoveryRate: 0
  }
  private sleepCallback: TimerCallback | null = null // Store sleep timer callback for cleanup
  private deathCausedInfect = false
  private isInCure = false // TODO: Implement cure state from medicine system
  private isInBind = false // TODO: Implement bind state from injury treatment

  constructor(timeManager: TimeManager) {
    this.timeManager = timeManager
    this.setupHourlyCallbacks()
    this.setupMinuteCallbacks()
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
   * Setup minute-by-minute callbacks for death condition checks
   */
  private setupMinuteCallbacks(): void {
    // Check death conditions every minute
    this.timeManager.addTimerCallbackMinuteByMinute(
      this,
      () => this.checkDeathConditionsMinute(),
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
    
    // Sleep recovery is handled by timer callback, not hourly
    // (Sleep applies all recovery at once when timer completes)
    
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
    
    // Update temperature (updates during sleep, matching original game)
    this.updateTemperature()
    
    // Apply weather effects (vigour, spirit)
    // Original: this.changeVigour(this.weather.getValue("vigour")); this.changeSpirit(this.weather.getValue("spirit"));
    this.applyWeatherEffects()
  }

  /**
   * Check death conditions every minute
   * Called by TimeManager on minute-by-minute callbacks
   */
  private checkDeathConditionsMinute(): void {
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
   * Initialize base temperature based on season and day/night
   * Ported from OriginalGame/src/game/player.js:1008-1020
   * 
   * Season mapping: 0=Autumn, 1=Winter, 2=Spring, 3=Summer
   * Temperature config: [baseTemp, dayModifier, nightModifier]
   */
  private initTemperature(): number {
    const gameStore = useGameStore.getState()
    const season = gameStore.season
    const stage = gameStore.stage // 'day' or 'night'
    
    // Get temperature config for current season
    // Index: 0=Autumn, 1=Winter, 2=Spring, 3=Summer, 4=default (for building bonus)
    const configBySeason = playerConfig.temperature[season]
    
    if (!configBySeason || configBySeason.length === 0) {
      return 0
    }
    
    // Base temperature from season
    let temperature = configBySeason[0]
    
    // Add day/night modifier
    if (stage === 'day') {
      temperature += configBySeason[1] || 0
    } else {
      temperature += configBySeason[2] || 0
    }
    
    return temperature
  }

  /**
   * Update temperature based on season, weather, and buildings
   * Ported from OriginalGame/src/game/player.js:980-994
   * 
   * Calculates target temperature and applies the difference to current temperature
   */
  updateTemperature(): void {
    const gameStore = useGameStore.getState()
    const playerStore = usePlayerStore.getState()
    const buildingStore = useBuildingStore.getState()
    
    // Calculate base target temperature (season + day/night)
    let targetTemperature = this.initTemperature()
    
    // Add building bonuses
    // Building 18 = Electric Stove, Building 5 = Fireplace
    const electricStove = buildingStore.getBuilding(18) // Electric Stove
    const fireplace = buildingStore.getBuilding(5) // Fireplace
    
    // Building bonus value from config[4][0] = 13
    const buildingBonusValue = playerConfig.temperature[4]?.[0] || 13
    
    if (electricStove && electricStove.level >= 0 && electricStove.active) {
      // Electric Stove is active: add base bonus
      targetTemperature += buildingBonusValue
      
      // If Fireplace is also active: add half bonus
      if (fireplace && fireplace.level >= 0 && fireplace.active) {
        targetTemperature += Math.floor(buildingBonusValue / 2)
      }
    } else if (fireplace && fireplace.level >= 0 && fireplace.active) {
      // Only Fireplace is active: add base bonus
      targetTemperature += buildingBonusValue
    }
    
    // Add weather effect
    const weatherId = gameStore.weather
    const weather = weatherConfig[weatherId.toString()]
    if (weather && weather.temperature !== undefined) {
      targetTemperature += weather.temperature
    }
    
    // Apply the difference (target - current)
    // This gradually moves temperature toward target
    const temperatureChange = targetTemperature - playerStore.temperature
    if (temperatureChange !== 0) {
      this.changeAttribute('temperature', temperatureChange)
    }
    
    // Apply temperature range effects (infection from cold)
    this.updateTemperatureEffect()
  }

  /**
   * Update temperature range effects (infection from cold)
   * Ported from OriginalGame/src/game/player.js:996-1006
   */
  private updateTemperatureEffect(): void {
    const playerStore = usePlayerStore.getState()
    const attrRangeInfo = this.getAttrRangeInfo('temperature', playerStore.temperature)
    
    if (attrRangeInfo) {
      this.applyAttributeEffect(attrRangeInfo.effect)
    }
  }

  /**
   * Apply weather effects to player attributes
   * Ported from OriginalGame/src/game/player.js:878-879
   * 
   * Applies vigour and spirit effects from weather
   * Note: Temperature effect is already applied in updateTemperature()
   * Note: Item-specific and building-specific effects are handled in their respective systems
   * 
   * Made public for testing purposes
   */
  applyWeatherEffects(): void {
    const gameStore = useGameStore.getState()
    const weatherSystem = gameStore.weatherSystem
    const weatherConfig = weatherSystem.getWeatherConfig()
    
    // Apply vigour effect
    if (weatherConfig.vigour !== undefined) {
      this.changeAttribute('vigour', weatherConfig.vigour)
    }
    
    // Apply spirit effect
    if (weatherConfig.spirit !== undefined) {
      this.changeAttribute('spirit', weatherConfig.spirit)
    }
    
    // Note: Other weather effects are applied in their respective systems:
    // - Temperature: Already applied in updateTemperature()
    // - Speed: Applied in travel system (Phase 4)
    // - Gun accuracy: Applied in combat system (Phase 4)
    // - Monster speed: Applied in combat system (Phase 4)
    // - Item-specific effects (item_1101061, item_1103041): Applied in item production systems
    // - Building-specific effects (build_2): Applied in building production systems
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
    // Pause game
    this.timeManager.pause()
    
    // Show death overlay
    const uiStore = useUIStore.getState()
    uiStore.showOverlay('death', { reason })
    
    // Emit death event if needed
    // utils.emitter.emit('death', reason)
  }

  /**
   * Start sleep mechanics
   * Returns true if sleep can start
   */
  startSleep(duration: SleepDuration = 'untilMorning'): boolean {
    // Check if bed building (ID 9) exists
    const buildingStore = useBuildingStore.getState()
    const bed = buildingStore.getBuilding(9) // Bed building ID
    
    if (!bed || bed.level < 0 || !bed.active) {
      return false // Cannot sleep without bed
    }
    
    if (this.sleepState.isSleeping) {
      return false
    }
    
    const playerStore = usePlayerStore.getState()
    
    // Calculate bed rate (sleep quality)
    // bedRate = bedLevel * 0.5 + starve/starveMax * 0.2 + spirit/spiritMax * 0.3
    const bedLevel = Math.max(0, bed.level)
    const bedRate = bedLevel * 0.5 + 
                    (playerStore.starve / playerStore.starveMax) * 0.2 + 
                    (playerStore.spirit / playerStore.spiritMax) * 0.3
    
    // Calculate sleep duration based on parameter
    const currentTime = this.timeManager.now()
    let sleepTimeSeconds = 0
    let endTime = 0
    
    switch (duration) {
      case '1hour':
        sleepTimeSeconds = 1 * 60 * 60
        endTime = currentTime + sleepTimeSeconds
        break
      case '4hours':
        sleepTimeSeconds = 4 * 60 * 60
        endTime = currentTime + sleepTimeSeconds
        break
      case 'untilMorning':
        const timeToMorning = this.timeManager.getTimeFromNowToMorning()
        sleepTimeSeconds = timeToMorning
        endTime = currentTime + sleepTimeSeconds
        break
    }
    
    // Calculate recovery per hour
    // Original: vigour = bedRate * 12 per hour, hp = bedRate * 20 per hour
    const vigourPerHour = bedRate * 12
    const hpPerHour = bedRate * 20
    
    // Calculate total recovery based on hours (like original: effect[key] * hours)
    const hours = sleepTimeSeconds / (60 * 60)
    const totalVigourRecovery = Math.ceil(vigourPerHour * hours)
    const totalHpRecovery = Math.ceil(hpPerHour * hours)
    
    // Set sleep state
    this.sleepState = {
      isSleeping: true,
      startTime: currentTime,
      endTime: endTime,
      vigourRecoveryRate: vigourPerHour,
      hpRecoveryRate: hpPerHour
    }
    
    // Format sleep duration for log message
    let durationText = ''
    switch (duration) {
      case '1hour':
        durationText = '1 hour'
        break
      case '4hours':
        durationText = '4 hours'
        break
      case 'untilMorning':
        const timeToMorning = this.timeManager.getTimeFromNowToMorning()
        const hoursToMorning = Math.floor(timeToMorning / (60 * 60))
        durationText = `until morning (${hoursToMorning} hours)`
        break
    }
    
    // Log sleep start with duration
    this.addLogMessage(`You are sleeping for ${durationText}`)
    
    // Create timer callback to apply recovery when sleep completes
    // Original: this.addTimer(time, time, function() { player.applyEffect(totalEffect); player.wakeUp(); })
    // The timer callback will apply all recovery at once when sleep duration completes
    this.sleepCallback = new TimerCallback(
      sleepTimeSeconds,
      this,
      {
        end: () => {
          // Apply all recovery at once (like original game)
          const currentPlayerStore = usePlayerStore.getState()
          
          // Apply vigour recovery (cap at max)
          const vigourRecovery = Math.min(totalVigourRecovery, currentPlayerStore.vigourMax - currentPlayerStore.vigour)
          if (vigourRecovery > 0) {
            this.changeAttribute('vigour', vigourRecovery)
          }
          
          // Apply HP recovery (cap at max)
          const hpRecovery = Math.min(totalHpRecovery, currentPlayerStore.hpMax - currentPlayerStore.hp)
          if (hpRecovery > 0) {
            this.changeAttribute('hp', hpRecovery)
          }
          
          // Wake up
          this.endSleep()
        }
      },
      1 // Single execution (not repeating)
    )
    
    // Add timer callback
    this.timeManager.addTimerCallback(this.sleepCallback, currentTime)
    
    // Accelerate time during sleep (like original: accelerateWorkTime)
    // Original: cc.timer.accelerateWorkTime(time) which accelerates to 3 real seconds
    this.timeManager.accelerateWorkTime(sleepTimeSeconds)
    
    return true
  }

  // Note: Sleep recovery is now handled by timer callback (applies all at once when timer completes)
  // The old processSleepHourly method has been removed to match original game behavior

  // Note: checkAttributeWarnings() removed - warning checks disabled for now
  // Can be re-enabled later when needed

  /**
   * Add log message to TopBar log
   */
  private addLogMessage(message: string): void {
    const logStore = useLogStore.getState()
    logStore.addLog(message)
  }

  /**
   * End sleep
   */
  endSleep(): void {
    if (!this.sleepState.isSleeping) {
      return
    }
    
    // Remove sleep timer callback if it exists
    if (this.sleepCallback) {
      this.timeManager.removeTimerCallback(this.sleepCallback)
      this.sleepCallback = null
    }
    
    this.sleepState = {
      isSleeping: false,
      startTime: 0,
      endTime: 0,
      vigourRecoveryRate: 0,
      hpRecoveryRate: 0
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

