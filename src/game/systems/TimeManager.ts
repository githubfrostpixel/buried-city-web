/**
 * Time Manager System
 * Ported from OriginalGame/src/game/TimeManager.js
 * 
 * Manages game time, day/night cycle, seasons, and timed callbacks
 */

import type { Season, TimeOfDay } from '@/types/game.types'
import { useGameStore } from '@/store/gameStore'

export interface TimeFormat {
  d: number // Days
  h: number // Hours
  m: number // Minutes
  s: number // Seconds
}

export interface TimerCallbackDelegate {
  process?: (dtTime: number) => void
  end?: () => void
}

export class TimerCallback {
  internalTime: number
  target: any
  delegate: TimerCallbackDelegate
  repeat: number
  priority: number
  startTime: number
  endTime: number

  constructor(
    internalTime: number,
    target: any,
    delegate: TimerCallbackDelegate,
    repeat: number = 1
  ) {
    this.internalTime = internalTime
    this.target = target
    this.delegate = delegate
    this.repeat = repeat
    this.priority = 0
    this.startTime = 0
    this.endTime = 0
  }

  setStartTime(now: number): void {
    this.startTime = now
    this.updateEndTime()
  }

  setPriority(p: number): void {
    this.priority = p
  }

  updateEndTime(): void {
    this.endTime = this.startTime + this.internalTime
  }

  getEndTime(): number {
    return this.endTime
  }

  process(dtTime: number): void {
    if (this.delegate.process) {
      this.delegate.process.call(this.target, dtTime)
    }
  }

  end(): void {
    if (this.delegate.end) {
      this.delegate.end.call(this.target)
    }
    this.repeat--
  }

  reset(now: number): boolean {
    if (this.repeat > 0) {
      this.setStartTime(now)
      return true
    }
    return false
  }
}

export const REPEAT_FOREVER = Number.MAX_VALUE

export class TimeManager {
  // Time scale: 1 real second = 100 game seconds (10 * 60 / 6)
  private timeScaleOrigin = (10 * 60) / 6
  private timeScale = this.timeScaleOrigin
  private pausedRef = 0
  
  // Day/night stage times (6:00 - 20:00 = day)
  private stageTime = [6, 20]
  
  // Game time in seconds (starts at 6:00:01)
  private time = 6 * 60 * 60 + 1
  
  // Real time tracking
  private realTime = this.time / this.timeScale
  
  // Acceleration
  private isAccelerated = false
  private accelerateEndTime = 0
  
  // Callbacks
  private callbackList: TimerCallback[] = []
  private endCallbackList: TimerCallback[] = []
  
  constructor() {
    // Initialize season from current time
    this.getSeason()
    this.restore()
    this.updateStore()
  }

  /**
   * Format time to days, hours, minutes, seconds
   */
  formatTime(time?: number): TimeFormat {
    const t = time ?? this.time
    const d = Math.floor(t / (24 * 60 * 60))
    const dTime = t % (24 * 60 * 60)
    const h = Math.floor(dTime / (60 * 60))
    const hTime = dTime % (60 * 60)
    const m = Math.floor(hTime / 60)
    const s = Math.floor(hTime % 60)
    return { d, h, m, s }
  }

  /**
   * Convert time format object to seconds
   */
  objToTime(obj: TimeFormat): number {
    return obj.d * 24 * 60 * 60 + obj.h * 60 * 60 + obj.m * 60 + obj.s
  }

  /**
   * Update game time (called every frame)
   */
  update(dt: number): void {
    if (this.isPaused()) return

    const beforeRealTime = this.realTime
    this.realTime += dt
    const realTimeDelta = this.realTime - beforeRealTime
    const dtTime = dt * this.timeScale
    
    // Log time updates when accelerated (every 0.1 real seconds to avoid spam)
    const wasAccelerated = this.isAccelerated
    const shouldLog = wasAccelerated && Math.floor(this.realTime * 10) % 1 === 0
    if (shouldLog) {
      const beforeTime = this.time
      const beforeTimeFormat = this.formatTime()
      this.updateTime(dtTime)
      const afterTime = this.time
      const afterTimeFormat = this.formatTime()
      const timeDelta = afterTime - beforeTime
      const accelerationRatio = realTimeDelta > 0 ? (timeDelta / realTimeDelta).toFixed(2) + 'x' : 'N/A'
      console.log('[TimeManager] Time update (accelerated):', {
        realTime: this.realTime.toFixed(3),
        realTimeDelta: realTimeDelta.toFixed(4),
        dt,
        timeScale: this.timeScale,
        dtTime: dtTime.toFixed(4),
        beforeTime: beforeTime.toFixed(2),
        afterTime: afterTime.toFixed(2),
        timeDelta: timeDelta.toFixed(4),
        accelerationRatio,
        isAccelerated: this.isAccelerated,
        accelerateEndTime: this.accelerateEndTime,
        timeRemaining: (this.accelerateEndTime - this.time).toFixed(2),
        beforeFormatted: `${beforeTimeFormat.d}d ${beforeTimeFormat.h}h ${beforeTimeFormat.m}m ${beforeTimeFormat.s}s`,
        afterFormatted: `${afterTimeFormat.d}d ${afterTimeFormat.h}h ${afterTimeFormat.m}m ${afterTimeFormat.s}s`
      })
    } else {
      this.updateTime(dtTime)
    }
  }

  /**
   * Update game time by delta
   */
  updateTime(dtTime: number): void {
    this.time += dtTime

    // Process callbacks
    this.callbackList.forEach((cb) => {
      cb.process(dtTime)
      if (this.time >= cb.getEndTime()) {
        cb.end()
        this.endCallbackList.push(cb)
      }
    })

    // Check acceleration end
    if (this.isAccelerated && this.time >= this.accelerateEndTime) {
      console.log('[TimeManager] Acceleration ended:', {
        currentTime: this.time,
        accelerateEndTime: this.accelerateEndTime,
        timeScaleBefore: this.timeScale,
        timeScaleAfter: this.timeScaleOrigin
      })
      this.isAccelerated = false
      this.timeScale = this.timeScaleOrigin
    }

    // Reset completed callbacks
    while (this.endCallbackList.length > 0) {
      const endCb = this.endCallbackList.pop()!
      if (!endCb.reset(this.time)) {
        this.removeTimerCallback(endCb)
      }
    }

    this.updateStore()
  }

  /**
   * Update Zustand store with current time state
   */
  private updateStore(): void {
    const stage = this.getStage()
    const season = this.getSeason()
    const gameStore = useGameStore.getState()

    gameStore.setTime(this.time)
    gameStore.setStage(stage)
    gameStore.setSeason(season)
  }

  pause(): void {
    this.pausedRef++
    useGameStore.getState().pause()
  }

  resume(): void {
    this.pausedRef = Math.max(0, this.pausedRef - 1)
    useGameStore.getState().resume()
  }

  isPaused(): boolean {
    return this.pausedRef > 0
  }

  /**
   * Accelerate time for work/crafting
   */
  accelerateWorkTime(time: number): void {
    const realTime = 3 // 3 real seconds
    if (time / this.timeScale > realTime) {
      this.accelerate(time, realTime)
    }
  }

  /**
   * Accelerate time (public method for travel acceleration)
   * @param time Game time duration to accelerate (in game seconds)
   * @param realTime Real-world time it should take (in real seconds)
   * @param force If true, override existing acceleration (for travel)
   */
  accelerate(time: number, realTime: number, force: boolean = false): void {
    if (this.isAccelerated && !force) {
      console.log('[TimeManager] Already accelerated, skipping. Use force=true to override.')
      return
    }

    // Calculate timeScale: how many game seconds per real second
    // Normal: timeScale = 100 (100 game seconds per 1 real second)
    // Accelerated: timeScale = time / realTime
    this.timeScale = time / realTime
    this.isAccelerated = true
    this.accelerateEndTime = this.time + time
    console.log('[TimeManager] Time accelerated:', { 
      time, 
      realTime, 
      timeScale: this.timeScale, 
      accelerateEndTime: this.accelerateEndTime,
      currentTime: this.time
    })
  }

  /**
   * Accelerate time by factor (for travel - matches original game API)
   * @param time Game time duration to accelerate (in game seconds)
   * @param factor Acceleration factor (2 or 3 - how many times faster)
   * @param force If true, override existing acceleration (for travel)
   */
  accelerateByFactor(time: number, factor: number, force: boolean = false): void {
    if (this.isAccelerated && !force) {
      console.log('[TimeManager] Already accelerated, skipping. Use force=true to override.')
      return
    }

    // Make time pass factor times faster by multiplying timeScale
    // Normal: timeScale = 100 (100 game seconds per 1 real second)
    // Accelerated by factor: timeScale = 100 * factor (e.g., 300 for 3x faster)
    const beforeTime = this.time
    const beforeTimeScale = this.timeScale
    const beforeRealTime = this.realTime
    
    // Calculate end time BEFORE changing timeScale (to avoid timing issues)
    // Use beforeTime (captured before any changes) to calculate end time correctly
    this.accelerateEndTime = beforeTime + time
    
    // Now set the accelerated timeScale
    this.timeScale = this.timeScaleOrigin * factor
    this.isAccelerated = true
    
    console.log('[TimeManager] Time accelerated by factor:', { 
      time, 
      factor,
      timeScaleOrigin: this.timeScaleOrigin,
      beforeTimeScale,
      afterTimeScale: this.timeScale,
      accelerateEndTime: this.accelerateEndTime,
      currentTime: this.time,
      beforeTime,
      beforeRealTime,
      expectedTimeDelta: time,
      expectedRealTime: time / this.timeScale,
      timeUntilEnd: (this.accelerateEndTime - this.time)
    })
  }

  /**
   * Get current season (0-3: 0=Autumn, 1=Winter, 2=Spring, 3=Summer)
   */
  getSeason(timeObj?: TimeFormat): Season {
    const format = timeObj || this.formatTime()
    const day = format.d % 120 // 120 day cycle (30 days * 4 seasons)
    return Math.floor(day / 30) as Season
  }

  /**
   * Get current stage (day/night)
   */
  getStage(): TimeOfDay {
    const format = this.formatTime()
    if (format.h < this.stageTime[0]) {
      return 'night'
    } else if (format.h >= this.stageTime[0] && format.h < this.stageTime[1]) {
      return 'day'
    } else {
      return 'night'
    }
  }

  /**
   * Skip to next stage (day/night transition)
   */
  skipStage(): void {
    const format = this.formatTime()
    let endTime = 0

    if (format.h < this.stageTime[0]) {
      endTime = this.objToTime({
        d: format.d,
        h: this.stageTime[0],
        m: 0,
        s: 0
      })
    } else if (format.h >= this.stageTime[0] && format.h < this.stageTime[1]) {
      endTime = this.objToTime({
        d: format.d,
        h: this.stageTime[1],
        m: 0,
        s: 0
      })
    } else {
      endTime = this.objToTime({
        d: format.d + 1,
        h: this.stageTime[0],
        m: 0,
        s: 0
      })
    }

    const dtTime = endTime - this.time
    this.updateTime(dtTime)
  }

  /**
   * Get time from now to morning (6:00)
   */
  getTimeFromNowToMorning(): number {
    const format = this.formatTime()
    let endTime = 0

    if (format.h < this.stageTime[0]) {
      endTime = this.objToTime({
        d: format.d,
        h: this.stageTime[0],
        m: 0,
        s: 0
      })
    } else {
      endTime = this.objToTime({
        d: format.d + 1,
        h: this.stageTime[0],
        m: 0,
        s: 0
      })
    }

    return endTime - this.time
  }

  /**
   * Add timer callback
   */
  addTimerCallback(
    callback: TimerCallback,
    startTime?: number,
    priority?: number
  ): TimerCallback {
    const now = startTime === undefined || startTime === null ? this.time : startTime
    callback.setStartTime(now)

    if (priority !== undefined) {
      callback.setPriority(priority)
    }

    this.callbackList.push(callback)
    this.callbackList.sort((a, b) => b.priority - a.priority)

    return callback
  }

  /**
   * Add hourly callback
   */
  addTimerCallbackByHour(
    time: { m?: number; s?: number },
    target: any,
    func: () => void,
    priority?: number
  ): TimerCallback {
    const nowTime = this.time
    const now = this.formatTime()

    let targetTimeObj: TimeFormat = {
      d: now.d,
      h: now.h,
      m: time.m || 0,
      s: time.s || 0
    }

    let targetTime = this.objToTime(targetTimeObj)
    if (targetTime >= nowTime) {
      if (targetTimeObj.h === 0) {
        targetTimeObj.d--
        targetTimeObj.h = 23
      } else {
        targetTimeObj.h--
      }
      targetTime = this.objToTime(targetTimeObj)
    }

    const cb = new TimerCallback(60 * 60, target, { end: func }, REPEAT_FOREVER)
    return this.addTimerCallback(cb, targetTime, priority)
  }

  /**
   * Add hourly callback (every hour)
   */
  addTimerCallbackHourByHour(target: any, func: () => void, priority?: number): TimerCallback {
    return this.addTimerCallbackByHour({}, target, func, priority)
  }

  /**
   * Add minute-by-minute callback
   */
  addTimerCallbackByMinute(
    time: { m?: number; s?: number },
    target: any,
    func: () => void,
    priority?: number
  ): TimerCallback {
    const nowTime = this.time
    const now = this.formatTime()

    let targetTimeObj: TimeFormat = {
      d: now.d,
      h: now.h,
      m: time.m || 0,
      s: time.s || 0
    }

    let targetTime = this.objToTime(targetTimeObj)
    if (targetTime >= nowTime) {
      if (targetTimeObj.m === 0) {
        targetTimeObj.h--
        targetTimeObj.m = 59
      } else {
        targetTimeObj.m--
      }
      targetTime = this.objToTime(targetTimeObj)
    }

    const cb = new TimerCallback(60, target, { end: func }, REPEAT_FOREVER)
    return this.addTimerCallback(cb, targetTime, priority)
  }

  /**
   * Add minute-by-minute callback (every minute)
   */
  addTimerCallbackMinuteByMinute(target: any, func: () => void, priority?: number): TimerCallback {
    return this.addTimerCallbackByMinute({}, target, func, priority)
  }

  /**
   * Add daily callback
   */
  addTimerCallbackByDay(
    time: { h?: number; m?: number; s?: number },
    target: any,
    func: () => void,
    priority?: number
  ): TimerCallback {
    const nowTime = this.time
    const now = this.formatTime()

    let targetTimeObj: TimeFormat = {
      d: now.d,
      h: time.h || 0,
      m: time.m || 0,
      s: time.s || 0
    }

    let targetTime = this.objToTime(targetTimeObj)
    if (targetTime >= nowTime) {
      targetTimeObj.d--
      targetTime = this.objToTime(targetTimeObj)
    }

    const cb = new TimerCallback(24 * 60 * 60, target, { end: func }, REPEAT_FOREVER)
    return this.addTimerCallback(cb, targetTime, priority)
  }

  /**
   * Add daily callback at midnight (0:00)
   */
  addTimerCallbackDayByDay(target: any, func: () => void, priority?: number): TimerCallback {
    return this.addTimerCallbackByDay({ h: 0 }, target, func, priority)
  }

  /**
   * Add daily callback at 1:05 AM
   */
  addTimerCallbackDayByDayOneAM(target: any, func: () => void, priority?: number): TimerCallback {
    return this.addTimerCallbackByDay({ h: 1, m: 5 }, target, func, priority)
  }

  /**
   * Add day/night transition callbacks
   */
  addTimerCallbackDayAndNight(
    target: any,
    func: (stage: TimeOfDay) => void,
    priority?: number
  ): TimerCallback[] {
    const cb1 = this.addTimerCallbackByDay(
      { h: this.stageTime[0] },
      this,
      () => func.call(target, 'day'),
      priority
    )
    const cb2 = this.addTimerCallbackByDay(
      { h: this.stageTime[1] },
      this,
      () => func.call(target, 'night'),
      priority
    )
    return [cb1, cb2]
  }

  removeTimerCallback(callback: TimerCallback): void {
    const index = this.callbackList.indexOf(callback)
    if (index !== -1) {
      this.callbackList.splice(index, 1)
    }
  }

  removeTimerCallbackDayAndNight(callbacks: TimerCallback[]): void {
    callbacks.forEach((cb) => this.removeTimerCallback(cb))
  }

  /**
   * Get current time in seconds
   */
  now(): number {
    return this.time
  }

  /**
   * Get day number (1-based)
   */
  getTimeNum(): number {
    const timeObj = this.formatTime()
    return timeObj.d + 1
  }

  /**
   * Get formatted time string (HH:MM)
   */
  getTimeHourStr(): string {
    const timeObj = this.formatTime()
    const h = timeObj.h < 10 ? `0${timeObj.h}` : `${timeObj.h}`
    const m = timeObj.m < 10 ? `0${timeObj.m}` : `${timeObj.m}`
    return `${h}:${m}`
  }

  /**
   * Save time state
   */
  save(): { time: number } {
    return { time: this.time }
  }

  /**
   * Restore time state
   */
  restore(saveData?: { time?: number }): void {
    if (saveData?.time) {
      this.time = saveData.time
    }
    this.realTime = this.time / this.timeScale
    this.updateStore()
  }
}

