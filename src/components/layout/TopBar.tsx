/**
 * TopBar Component (TopFrame)
 * Top status bar with time, weather, attributes, and log
 * Ported from OriginalGame/src/ui/topFrame.js
 */

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { usePlayerStore } from '@/store/playerStore'
import { useLogStore } from '@/store/logStore'
import { cocosToCssPosition } from '@/utils/position'
import { Sprite } from '@/components/sprites/Sprite'
import { StatusButton, AttrButton, LogBar } from '@/components/common'
import { attributeWarningRanges } from '@/data/attributeWarningRanges'
import { emitter } from '@/utils/emitter'
import type { WeatherType } from '@/types/game.types'

// Season names
const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter']

// Helper functions for time formatting
function getTimeHourStr(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0')
  const m = minute.toString().padStart(2, '0')
  return `${h}:${m}`
}

function getTimeDayStr(day: number): string {
  return `Day ${day + 1}`
}

function getSeasonStr(season: number): string {
  return SEASON_NAMES[season] || 'Unknown'
}


// Placeholder for status dialogs (to be implemented later)
function showStatusDialog(stringId: number, value: string | number, iconName: string) {
  console.log('Status dialog:', { stringId, value, iconName })
  // TODO: Implement status dialog
}

function showAttrStatusDialog(stringId: number, attr: string) {
  console.log('Attribute status dialog:', { stringId, attr })
  // TODO: Implement attribute status dialog
}

interface TopBarProps {
  testLogs?: Array<{ txt: string; timestamp?: number }>
}

export function TopBar({ testLogs = [] }: TopBarProps = {}) {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const logStore = useLogStore()
  
  // Use log store if available, otherwise fall back to testLogs
  const logs = logStore.logs.length > 0 
    ? logStore.logs.map(log => ({ txt: log.txt, timestamp: log.timestamp }))
    : testLogs
  
  // Screen dimensions
  const screenWidth = 640
  const screenHeight = 1136
  const screenFix: number = 0 // TODO: Get from settings
  
  // Background position (Cocos: width/2, height-18, anchor: 0.5, 1)
  const bgScale = screenFix === 1 ? 0.87 : 1.0
  const bgCocosY = screenFix === 1 ? screenHeight - 90 : screenHeight - 18
  const bgStyle = {
    ...cocosToCssPosition(
      { x: screenWidth / 2, y: bgCocosY },
      { x: 0.5, y: 1 }
    ),
    width: `${596 * bgScale}px`, // frame_bg_top.png width
    height: `${244 * bgScale}px` // frame_bg_top.png height
  }
  
  // Button sizes for first line
  const btnSize = { width: 584 / 6, height: 50 }
  
  // Update time display every minute
  useEffect(() => {
    // Time updates are handled by TimeManager
    // This component will re-render when gameStore updates
  }, [gameStore.hour, gameStore.minute, gameStore.day, gameStore.season, gameStore.weather])
  
  // Listen for weather change events
  useEffect(() => {
    const handleWeatherChange = (_weatherId: WeatherType) => {
      // WeatherSystem already updated GameStore
      // This just triggers re-render
      gameStore.updateWeather()
    }
    
    emitter.on('weather_change', handleWeatherChange)
    
    return () => {
      emitter.off('weather_change', handleWeatherChange)
    }
  }, [])
  
  // Placeholder for work site and gas site active states
  const workSiteActive = false // TODO: Get from gameStore or site system
  const hasMotorcycle = false // TODO: Get from playerStore or equipment
  
  // Background height for coordinate conversion
  const bgHeight = 244
  
  return (
    <div className="absolute" style={bgStyle} data-test-id="topbar-bg" data-test-label="TopBar Background" data-test-position>
      {/* Background sprite */}
      <Sprite 
        atlas="ui" 
        frame="frame_bg_top.png"
        className="absolute inset-0"
        style={{ transform: `scale(${bgScale})` }}
      />
      
      {/* First Line - Status Icons */}
      {/* In Cocos, children positioned relative to bg: setPosition(6, 190) with anchor (0, 0) */}
      {/* Cocos Y=190 from bottom, bg height=244, so CSS top = 244 - 190 - 50 = 4px (accounting for line height) */}
      {/* Actually, anchor (0,0) means bottom-left, so Y=190 means 190px from bottom */}
      {/* CSS: top = bgHeight - cocosY - lineHeight = 244 - 190 - 50 = 4px */}
      <div className="absolute" style={{ left: '6px', top: `${bgHeight - 190 - 50}px`, width: '584px', height: '50px' }} data-test-id="topbar-first-line" data-test-label="First Line (Status)" data-test-position>
        {/* Day button */}
        <StatusButton
          icon="icon_day.png"
          iconAtlas="icon"
          label={String(gameStore.day + 1)}
          position={{ x: btnSize.width * 0.4 + 7.3, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(1, getTimeDayStr(gameStore.day), 'icon_day.png')}
        />
        
        {/* Season button */}
        <StatusButton
          icon={`icon_season_${gameStore.season}.png`}
          iconAtlas="icon"
          label=""
          position={{ x: btnSize.width * 1.1 + 4.8, y: 25 }}
          scale={0.4}
          noLabel={true}
          onClick={() => showStatusDialog(2, getSeasonStr(gameStore.season), 'icon_season.png')}
        />
        
        {/* Time button */}
        <StatusButton
          icon="icon_time.png"
          iconAtlas="icon"
          label={getTimeHourStr(gameStore.hour, gameStore.minute)}
          position={{ x: btnSize.width * 1.8 + 5.5, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(4, getTimeHourStr(gameStore.hour, gameStore.minute), 'icon_time.png')}
        />
        
        {/* Weather button */}
        <StatusButton
          icon={`icon_weather_${gameStore.weather}.png`}
          iconAtlas="icon"
          label=""
          position={{ x: btnSize.width * 2.7 - 3, y: 25 }}
          scale={0.4}
          noLabel={true}
          onClick={() => showStatusDialog(11, gameStore.weatherSystem?.getWeatherName() || 'Unknown', 'icon_weather.png')}
        />
        
        {/* Temperature button */}
        <StatusButton
          icon="icon_temperature_0.png"
          iconAtlas="icon"
          label={String(playerStore.temperature)}
          position={{ x: btnSize.width * 3.3 - 4, y: 25 }}
          scale={0.4}
          onClick={() => showStatusDialog(3, playerStore.temperature, 'icon_temperature_0.png')}
        />
        
        {/* Electric button */}
        <StatusButton
          icon={`icon_electric_${workSiteActive ? 'active' : 'inactive'}.png`}
          iconAtlas="icon"
          label=""
          position={{ x: btnSize.width * 3.9 + 4.5, y: 25 }}
          scale={0.5}
          noLabel={true}
          onClick={() => showStatusDialog(12, workSiteActive ? 'Active' : 'Inactive', 'icon_electric.png')}
        />
        
        {/* Currency button */}
        <StatusButton
          icon="icon_item_money.png"
          iconAtlas="new_temp"
          label={String(Math.floor(playerStore.currency))}
          position={{ x: btnSize.width * 4.7 - 12.5, y: 25 }}
          scale={0.5}
          onClick={() => showStatusDialog(13, Math.floor(playerStore.currency), 'icon_item_money.png')}
        />
        
        {/* Fuel gauge button */}
        <StatusButton
          icon="icon_item_gas.png"
          iconAtlas="new"
          label="0"
          position={{ x: btnSize.width * 5.3 - 0.4, y: 25 }}
          scale={0.5}
          onClick={() => showStatusDialog(16, `0/${hasMotorcycle ? 99 : 0}`, 'icon_oil.png')}
        />
      </div>
      
      {/* Second Line - Attribute Bars */}
      {/* Cocos Y=134 from bottom, CSS top = 244 - 134 - 50 = 60px */}
      <div className="absolute" style={{ left: '6px', top: `${bgHeight - 134 - 50}px`, width: '584px', height: '50px' }} data-test-id="topbar-second-line" data-test-label="Second Line (Attributes)" data-test-position>
        <AttrButton
          attr="injury"
          position={{ x: 584 / 16 * 1, y: 25 }}
          warnRange={attributeWarningRanges.injury.range}
          reversePercentage={attributeWarningRanges.injury.reversePercentage}
          onClick={() => showAttrStatusDialog(10, 'injury')}
        />
        
        <AttrButton
          attr="infect"
          position={{ x: 584 / 16 * 3, y: 25 }}
          warnRange={attributeWarningRanges.infect.range}
          reversePercentage={attributeWarningRanges.infect.reversePercentage}
          onClick={() => showAttrStatusDialog(9, 'infect')}
        />
        
        <AttrButton
          attr="starve"
          position={{ x: 584 / 16 * 5, y: 25 }}
          warnRange={attributeWarningRanges.starve.range}
          reversePercentage={attributeWarningRanges.starve.reversePercentage}
          onClick={() => showAttrStatusDialog(6, 'starve')}
        />
        
        <AttrButton
          attr="vigour"
          position={{ x: 584 / 16 * 7, y: 25 }}
          warnRange={attributeWarningRanges.vigour.range}
          reversePercentage={attributeWarningRanges.vigour.reversePercentage}
          onClick={() => showAttrStatusDialog(7, 'vigour')}
        />
        
        <AttrButton
          attr="spirit"
          position={{ x: 584 / 16 * 9, y: 25 }}
          warnRange={attributeWarningRanges.spirit.range}
          reversePercentage={attributeWarningRanges.spirit.reversePercentage}
          onClick={() => showAttrStatusDialog(8, 'spirit')}
        />
        
        <AttrButton
          attr="water"
          position={{ x: 584 / 16 * 11, y: 25 }}
          warnRange={attributeWarningRanges.water.range}
          reversePercentage={attributeWarningRanges.water.reversePercentage}
          onClick={() => showAttrStatusDialog(14, 'water')}
        />
        
        <AttrButton
          attr="virus"
          position={{ x: 584 / 16 * 13, y: 25 }}
          warnRange={attributeWarningRanges.virus.range}
          reversePercentage={attributeWarningRanges.virus.reversePercentage}
          onClick={() => showAttrStatusDialog(15, 'virus')}
        />
        
        <AttrButton
          attr="hp"
          position={{ x: 584 / 16 * 15, y: 25 }}
          warnRange={attributeWarningRanges.hp.range}
          reversePercentage={attributeWarningRanges.hp.reversePercentage}
          onClick={() => showAttrStatusDialog(5, 'hp')}
        />
      </div>
      
      {/* Third Line - Log Bar */}
      {/* Cocos Y=6 from bottom, CSS top = 244 - 6 - 122 = 116px */}
      <div className="absolute" style={{ left: '6px', top: `${bgHeight - 6 - 122}px`, width: '584px', height: '122px' }} data-test-id="topbar-third-line" data-test-label="Third Line (Log)" data-test-position>
        {/* Log messages */}
        <LogBar logs={logs} />
        
        {/* Talent button - TODO: Implement TalentButton component */}
        {/* Position relative to third line: original says setPosition(width-20, height-20) = (564, 102) */}
        {/* In Cocos, this is from bottom-left, so CSS: left=564, bottom=122-102=20 */}
        <div
          className="absolute"
          style={{
            right: '20px',
            top: '20px',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('Talent button clicked')
            // TODO: Navigate to talent selection
          }}
        >
          <Sprite
            atlas="icon"
            frame="icon_upgrade.png"
            className="block"
            style={{ transform: 'scale(0.7)' }}
          />
        </div>
        
        {/* Dog button - TODO: Implement DogButton component */}
        {/* Position relative to third line: original says setPosition(width-18, height-100) = (566, 22) */}
        {/* In Cocos, this is from bottom-left, so CSS: left=566, bottom=122-22=100 */}
        <div
          className="absolute"
          style={{
            right: '18px',
            bottom: '22px',
            cursor: playerStore.dog.active ? 'pointer' : 'default',
            opacity: playerStore.dog.active ? 1 : 0.5
          }}
          onClick={() => {
            if (playerStore.dog.active) {
              console.log('Dog button clicked')
              // TODO: Navigate to dog panel
            }
          }}
        >
          <Sprite
            atlas="icon"
            frame="icon_npc.png"
            className="block"
            style={{ transform: 'scale(0.7)' }}
          />
        </div>
      </div>
    </div>
  )
}

