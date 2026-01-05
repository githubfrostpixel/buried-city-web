/**
 * Audio Manager System
 * Ported from OriginalGame/src/util/audioManager.js
 * 
 * Manages sound effects and music using Howler.js
 */

import { Howl, Howler } from 'howler'

import { getAudioPath } from '@/common/utils/assets'

export const SoundPaths = {
  ATTACK_1: getAudioPath('sfx/attack_1.mp3'),
  ATTACK_2: getAudioPath('sfx/attack_2.mp3'),
  ATTACK_3: getAudioPath('sfx/attack_3.mp3'),
  ATTACK_4: getAudioPath('sfx/attack_4.mp3'),
  ATTACK_5: getAudioPath('sfx/attack_5.mp3'),
  ATTACK_6: getAudioPath('sfx/attack_6.mp3'),
  ATTACK_7: getAudioPath('sfx/attack_7.mp3'),
  ATTACK_8: getAudioPath('sfx/attack_8.mp3'),
  BOMB: getAudioPath('sfx/bomb.mp3'),
  BUILD_UPGRADE: getAudioPath('sfx/build_upgrade.mp3'),
  CLICK: getAudioPath('sfx/click.mp3'),
  LOG_POP_UP: getAudioPath('sfx/log_pop_up.mp3'),
  LOOT: getAudioPath('sfx/loot.mp3'),
  MONSTER_ATTACK: getAudioPath('sfx/monster_attack.mp3'),
  MONSTER_DIE: getAudioPath('sfx/monster_die.mp3'),
  BANDIT_DIE: getAudioPath('sfx/bandit_die.mp3'),
  POPUP: getAudioPath('sfx/popup.mp3'),
  TRAP: getAudioPath('sfx/trap.mp3'),
  BARK: getAudioPath('sfx/bark.mp3'),
  SHORT_BARK: getAudioPath('sfx/short_bark.mp3'),
  COOK: getAudioPath('sfx/cook.mp3'),
  ESTOVE: getAudioPath('sfx/electricstove.mp3'),
  STOVE: getAudioPath('sfx/stove.mp3'),
  HARVEST: getAudioPath('sfx/harvest.mp3'),
  TOOLBOX: getAudioPath('sfx/toolbox.mp3'),
  CLOSE_DOOR: getAudioPath('sfx/close_door.mp3'),
  OPEN_DOOR: getAudioPath('sfx/open_door.mp3'),
  FOOT_STEP: getAudioPath('sfx/foot_step.mp3'),
  RADIO: getAudioPath('sfx/radio.mp3'),
  BUBBLES: getAudioPath('sfx/bubbles.mp3'),
  PUNCH: getAudioPath('sfx/punch.mp3'),
  EXCHANGE: getAudioPath('sfx/exchange.mp3'),
  BAD_EFFECT: getAudioPath('sfx/bad_effect.mp3'),
  GOOD_EFFECT: getAudioPath('sfx/good_effect.mp3'),
  NPC_KNOCK: getAudioPath('sfx/npc_knock.mp3'),
  BOTTLE_OPEN: getAudioPath('sfx/bottle_open.mp3'),
  COFFEE_POUR: getAudioPath('sfx/coffee_pour.mp3'),
  GOLD: getAudioPath('sfx/gold.mp3'),
  GOLP: getAudioPath('sfx/golp.mp3')
} as const

export const MusicPaths = {
  BATTLE: getAudioPath('music/battle.ogg'),
  BATTLE_OLD: getAudioPath('music/battle_old.ogg'),
  DEATH: getAudioPath('music/death.ogg'),
  HOME: getAudioPath('music/home.ogg'),
  NPC: getAudioPath('music/npc.ogg'),
  NPC_OLD: getAudioPath('music/npc_old.ogg'),
  HOME_REST: getAudioPath('music/home_rest.ogg'),
  HOME_BED: getAudioPath('music/bed.ogg'),
  MAIN_PAGE: getAudioPath('music/mainmenu.ogg'),
  MAP_CLOUDY: getAudioPath('music/cloudy.ogg'),
  MAP_SUNNY: getAudioPath('music/sunny.ogg'),
  MAP_SNOW: getAudioPath('music/snow.ogg'),
  MAP_RAIN: getAudioPath('music/rain.ogg'),
  MAP_FOG: getAudioPath('music/fog.ogg'),
  SITE_1: getAudioPath('music/env1.ogg'),
  SITE_2: getAudioPath('music/env2.ogg'),
  SITE_3: getAudioPath('music/env3.ogg'),
  SITE_4: getAudioPath('music/env4.ogg'),
  BANDITDEN: getAudioPath('music/banditden.ogg'),
  SITE_SECRET: getAudioPath('music/secret_room.ogg'),
  CREDITS: getAudioPath('music/credit.ogg'),
  RECALL: getAudioPath('music/recall.ogg'),
  ABYSS: getAudioPath('music/choose.ogg'),
  AQUARIUM: getAudioPath('music/aquarium.ogg')
} as const

class AudioManager {
  private soundEnabled: boolean = true
  private musicEnabled: boolean = true
  private playingMusic: Howl | null = null
  private lastMusicPath: string | null = null
  private soundCache: Map<string, Howl> = new Map()
  private musicCache: Map<string, Howl> = new Map()

  constructor() {
    this.loadSettings()
  }

  /**
   * Load sound/music settings from localStorage
   */
  private loadSettings(): void {
    const sound = localStorage.getItem('sound')
    const music = localStorage.getItem('music')
    this.soundEnabled = sound !== '2' // 1 = on, 2 = off
    this.musicEnabled = music !== '2'
  }

  /**
   * Set sound enabled state
   */
  setSound(isOn: boolean): void {
    this.soundEnabled = isOn
    localStorage.setItem('sound', isOn ? '1' : '2')
  }

  /**
   * Check if sound is enabled
   */
  needSound(): boolean {
    return this.soundEnabled
  }

  /**
   * Set music enabled state
   */
  setMusic(isOn: boolean): void {
    this.musicEnabled = isOn
    localStorage.setItem('music', isOn ? '1' : '2')
    if (!isOn && this.playingMusic) {
      this.playingMusic.stop()
      this.playingMusic = null
    }
  }

  /**
   * Check if music is enabled
   */
  needMusic(): boolean {
    return this.musicEnabled
  }

  /**
   * Play sound effect
   */
  playEffect(path: string, loop: boolean = false): number | null {
    if (!this.needSound()) {
      return null
    }

    // Get or create sound
    let sound = this.soundCache.get(path)
    if (!sound) {
      sound = new Howl({
        src: [path],
        loop,
        volume: 1.0
      })
      this.soundCache.set(path, sound)
    }

    return sound.play()
  }

  /**
   * Stop sound effect
   */
  stopEffect(soundId: number): void {
    if (!this.needSound()) {
      return
    }
    // Howler.stop() stops all sounds, but we want to stop a specific one
    // We need to track the Howl instance to stop it properly
    // For now, we'll stop all sounds (not ideal, but works)
    Howler.stop()
  }

  /**
   * Play music
   */
  playMusic(path: string, loop: boolean = true): void {
    if (!this.needMusic()) {
      return
    }

    // Don't restart if same music is already playing
    if (path === this.lastMusicPath && loop && this.playingMusic?.playing()) {
      return
    }

    // Stop current music
    if (this.playingMusic) {
      this.playingMusic.stop()
    }

    // Get or create music
    let music = this.musicCache.get(path)
    if (!music) {
      music = new Howl({
        src: [path],
        loop,
        volume: 0.7
      })
      this.musicCache.set(path, music)
    }

    this.playingMusic = music
    this.lastMusicPath = path
    music.play()
  }

  /**
   * Stop music
   */
  stopMusic(releaseData: boolean = false): void {
    if (!this.needMusic()) {
      return
    }

    if (this.playingMusic) {
      this.playingMusic.stop()
      if (releaseData) {
        this.playingMusic.unload()
        if (this.lastMusicPath) {
          this.musicCache.delete(this.lastMusicPath)
        }
      }
      this.playingMusic = null
    }
  }

  /**
   * Insert/resume music (play with loop)
   */
  insertMusic(path: string): void {
    this.playMusic(path, true)
  }

  /**
   * Resume last playing music
   */
  resumeMusic(): void {
    if (this.lastMusicPath) {
      this.playMusic(this.lastMusicPath, true)
    }
  }

  /**
   * Get currently playing music path
   */
  getPlayingMusic(): string | null {
    return this.lastMusicPath
  }

  /**
   * Set global volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    Howler.volume(Math.max(0, Math.min(1, volume)))
  }

  /**
   * Cleanup all audio resources
   */
  cleanup(): void {
    this.stopMusic(true)
    this.soundCache.forEach((sound) => sound.unload())
    this.musicCache.forEach((music) => music.unload())
    this.soundCache.clear()
    this.musicCache.clear()
  }
}

export const audioManager = new AudioManager()

/**
 * Get site music based on siteId
 * Ported from OriginalGame/src/ui/bottomFrame.js:149-163
 * 
 * Logic:
 * - siteId == 502 → AQUARIUM
 * - siteId == 500 → BANDITDEN
 * - Otherwise → random from [SITE_1, SITE_2, SITE_3, SITE_4]
 * 
 * Note: Site music is cached per siteId (matches original behavior)
 */
const siteMusicCache = new Map<number, string>()

export function getSiteMusic(siteId: number): string {
  // Check cache first
  if (siteMusicCache.has(siteId)) {
    return siteMusicCache.get(siteId)!
  }
  
  let musicPath: string
  
  if (siteId === 502) {
    musicPath = MusicPaths.AQUARIUM
  } else if (siteId === 500) {
    musicPath = MusicPaths.BANDITDEN
  } else {
    // Random from site music pool
    const musicPool = [MusicPaths.SITE_1, MusicPaths.SITE_2, MusicPaths.SITE_3, MusicPaths.SITE_4]
    const randomIndex = Math.floor(Math.random() * musicPool.length)
    musicPath = musicPool[randomIndex]
  }
  
  // Cache the result
  siteMusicCache.set(siteId, musicPath)
  return musicPath
}

/**
 * Clear site music cache (called when changing sites)
 * Ported from OriginalGame/src/ui/bottomFrame.js:193-195
 */
export function clearSiteMusicCache(): void {
  siteMusicCache.clear()
}

