/**
 * Battle System Test Screen
 * Test screen for Battle System functionality
 */

import { useState } from 'react'
import { TestScreen } from './TestScreen'
import { BattlePanelContent } from '@/module/BattlePanelContent'
import { BottomSection } from '@/layout/BottomSection'
import { BattleInfo } from '@/core/game/combat/Battle'
import { BattleConfig } from '@/core/game/combat/BattleConfig'
import { monsterList } from '@/core/data/monsters'
import { usePlayerStore } from '@/core/store/playerStore'
import { useGameStore } from '@/core/store/gameStore'
import { TestPanel, TestSection, TestButton, TestResultsList, useTestResults } from './component'

export function BattleSystemTestScreen() {
  const { results, runTest, clearResults } = useTestResults()
  const [currentBattle, setCurrentBattle] = useState<{ info: BattleInfo; difficulty: number; isBandit: boolean } | null>(null)
  const [battleResult, setBattleResult] = useState<any>(null)

  const playerStore = usePlayerStore.getState()

  // Test Battle Creation
  const testBattleCreation = () => {
    try {
      // Get a monster list entry
      const listEntry = monsterList["10"] // Difficulty 1, 2 monsters
      if (!listEntry) {
        runTest('Battle Creation', 'Failed', () => 'Monster list entry not found')
        return
      }

      const battleInfo: BattleInfo = {
        id: "test",
        monsterList: listEntry.list
      }

      runTest(
        'Battle Creation',
        'Battle created successfully',
        () => `Battle ID: ${battleInfo.id}, Monsters: ${battleInfo.monsterList.length}, Difficulty: ${listEntry.difficulty}`
      )

      setCurrentBattle({
        info: battleInfo,
        difficulty: listEntry.difficulty,
        isBandit: false
      })
    } catch (error) {
      runTest(
        'Battle Creation',
        'Failed',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Different Difficulties
  const testDifficulty = (difficulty: number) => {
    try {
      // Find a monster list entry with the specified difficulty
      const listEntry = Object.values(monsterList).find(entry => entry.difficulty === difficulty)
      if (!listEntry) {
        runTest(`Difficulty ${difficulty}`, 'Failed', () => `No monster list found for difficulty ${difficulty}`)
        return
      }

      const battleInfo: BattleInfo = {
        id: `test-${difficulty}`,
        monsterList: listEntry.list
      }

      setCurrentBattle({
        info: battleInfo,
        difficulty: listEntry.difficulty,
        isBandit: false
      })

      runTest(
        `Difficulty ${difficulty}`,
        'Battle created',
        () => `Monsters: ${battleInfo.monsterList.length}, List ID: ${listEntry.id}`
      )
    } catch (error) {
      runTest(
        `Difficulty ${difficulty}`,
        'Failed',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Bandit Battle
  const testBanditBattle = () => {
    try {
      const listEntry = monsterList["10"]
      if (!listEntry) {
        runTest('Bandit Battle', 'Failed', () => 'Monster list entry not found')
        return
      }

      const battleInfo: BattleInfo = {
        id: "bandit-test",
        monsterList: listEntry.list
      }

      setCurrentBattle({
        info: battleInfo,
        difficulty: listEntry.difficulty,
        isBandit: true
      })

      runTest(
        'Bandit Battle',
        'Bandit battle created',
        () => `Monsters: ${battleInfo.monsterList.length}`
      )
    } catch (error) {
      runTest(
        'Bandit Battle',
        'Failed',
        () => `Error: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Test Player Equipment
  const testPlayerEquipment = () => {
    const gun = playerStore.equipment.gun
    const weapon = playerStore.equipment.weapon
    const tool = playerStore.equipment.tool
    const equip = playerStore.equipment.equip

    runTest(
      'Player Equipment',
      'Equipment check',
      () => `Gun: ${gun || 'None'}, Weapon: ${weapon || 'None'}, Tool: ${tool || 'None'}, Equip: ${equip || 'None'}`
    )
  }

  // Test Player Attributes
  const testPlayerAttributes = () => {
    runTest(
      'Player Attributes',
      'Attributes check',
      () => `HP: ${playerStore.hp}/${playerStore.hpMax}, Spirit: ${playerStore.spirit}, Vigour: ${playerStore.vigour}`
    )
  }

  // Add Gun Ammo
  const addGunAmmo = () => {
    playerStore.addItemToBag(BattleConfig.BULLET_ID, 50)
    runTest(
      'Add Gun Ammo',
      'Added 50 bullets',
      () => `Current bullets: ${playerStore.getBagItemCount(BattleConfig.BULLET_ID)}`
    )
  }

  // Add Homemade Bullets
  const addHomemadeBullets = () => {
    playerStore.addItemToBag(BattleConfig.HOMEMADE_ID, 50)
    runTest(
      'Add Homemade Bullets',
      'Added 50 homemade bullets',
      () => `Current homemade: ${playerStore.getBagItemCount(BattleConfig.HOMEMADE_ID)}`
    )
  }

  // Add Bomb (equip it)
  const addBomb = () => {
    const bombId = "item_weapon_explosive_explosive" // Bomb item ID
    // First add bomb to bag (required for equipping)
    playerStore.addItemToBag(bombId, 10)
    // Then equip it in tool slot
    const success = playerStore.equipItem('tool', bombId)
    if (success) {
      runTest(
        'Add Bomb',
        'Equipped bomb',
        () => `Current tool: ${playerStore.equipment.tool || 'None'}, Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
      )
    } else {
      runTest(
        'Add Bomb',
        'Failed to equip bomb',
        () => `Bombs in bag: ${playerStore.getBagItemCount(bombId)}`
      )
    }
  }

  // Add Gun (equip it)
  const addGun = () => {
    const gunId = "item_weapon_gun_pistol" // Basic gun item ID
    // First add gun to bag (required for equipping)
    playerStore.addItemToBag(gunId, 1)
    // Then equip it
    const success = playerStore.equipItem('gun', gunId)
    if (success) {
      runTest(
        'Add Gun',
        'Equipped gun',
        () => `Current gun: ${playerStore.equipment.gun || 'None'}`
      )
    } else {
      runTest(
        'Add Gun',
        'Failed to equip gun',
        () => `Gun in bag: ${playerStore.getBagItemCount(gunId)}`
      )
    }
  }

  // Add Melee Weapon (equip it)
  const addMeleeWeapon = () => {
    const weaponId = "item_weapon_melee_crowbar" // Basic melee weapon item ID
    // First add weapon to bag (required for equipping)
    playerStore.addItemToBag(weaponId, 1)
    // Then equip it
    const success = playerStore.equipItem('weapon', weaponId)
    if (success) {
      runTest(
        'Add Melee Weapon',
        'Equipped melee weapon',
        () => `Current weapon: ${playerStore.equipment.weapon || 'None'}`
      )
    } else {
      runTest(
        'Add Melee Weapon',
        'Failed to equip melee weapon',
        () => `Weapon in bag: ${playerStore.getBagItemCount(weaponId)}`
      )
    }
  }

  // Set Game Day to 3 (for weapon breaking test)
  const setGameDayTo3 = () => {
    const gameStore = useGameStore.getState()
    // Set time to day 3, 6:00 AM (3 * 24 * 60 * 60 + 6 * 60 * 60 = 259200 + 21600 = 280800 seconds)
    const timeForDay3 = 3 * 24 * 60 * 60 + 6 * 60 * 60
    gameStore.setTime(timeForDay3)
    const currentDay = gameStore.day
    runTest(
      'Set Game Day',
      `Set day to ${currentDay}`,
      () => `Current day: ${currentDay}, Time: ${gameStore.hour}:${String(gameStore.minute).padStart(2, '0')}`
    )
  }

  // Heal Player (restore HP to max)
  const healPlayer = () => {
    const playerStore = usePlayerStore.getState()
    const maxHp = playerStore.hpMax
    playerStore.updateAttribute('hp', maxHp)
    runTest(
      'Heal Player',
      `Healed to ${maxHp} HP`,
      () => `HP: ${playerStore.hp}/${maxHp}`
    )
  }

  // Test Battle End Handler
  const handleBattleEnd = (result: any) => {
    setBattleResult(result)
    runTest(
      'Battle End',
      result.win ? 'Victory' : 'Defeat',
      () => `Win: ${result.win}, Monsters Killed: ${result.monsterKilledNum}, Damage Taken: ${result.totalHarm}`
    )
  }

  return (
    <TestScreen title="Battle System Test">
      <div className="relative w-full h-full" style={{ backgroundColor: '#000000' }}>
        {/* Main Battle Panel */}
        {currentBattle ? (
          <div className="absolute inset-0">
            <BottomSection
              title="Battle Test"
              leftBtn={true}
              rightBtn={false}
              onLeftClick={() => setCurrentBattle(null)}
            >
              <BattlePanelContent
                battleInfo={currentBattle.info}
                difficulty={currentBattle.difficulty}
                isBandit={currentBattle.isBandit}
                onBattleEnd={handleBattleEnd}
                onBack={() => setCurrentBattle(null)}
              />
            </BottomSection>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-900 text-white p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              <h1 className="text-2xl font-bold">Battle System Test</h1>
              <p className="text-gray-400">Create a battle to see the UI panel</p>
            </div>
          </div>
        )}

        {/* Test Controls Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="pointer-events-auto">
            <TestPanel title="Test Controls" defaultPosition={{ x: 16, y: 16 }} width={300}>
              <TestSection title="Battle Creation">
                <TestButton variant="state" onClick={testBattleCreation}>
                  Create Test Battle
                </TestButton>
                <TestButton variant="state" onClick={testBanditBattle}>
                  Create Bandit Battle
                </TestButton>
              </TestSection>

              <TestSection title="Difficulty Tests">
                <TestButton variant="state" onClick={() => testDifficulty(1)}>
                  Difficulty 1
                </TestButton>
                <TestButton variant="state" onClick={() => testDifficulty(2)}>
                  Difficulty 2
                </TestButton>
                <TestButton variant="state" onClick={() => testDifficulty(3)}>
                  Difficulty 3
                </TestButton>
                <TestButton variant="state" onClick={() => testDifficulty(4)}>
                  Difficulty 4
                </TestButton>
              </TestSection>

              <TestSection title="Player State">
                <TestButton variant="state" onClick={testPlayerEquipment}>
                  Check Equipment
                </TestButton>
                <TestButton variant="state" onClick={testPlayerAttributes}>
                  Check Attributes
                </TestButton>
              </TestSection>

              <TestSection title="Add Items">
                <TestButton variant="state" onClick={addGun}>
                  Add Gun
                </TestButton>
                <TestButton variant="state" onClick={addMeleeWeapon}>
                  Add Melee Weapon
                </TestButton>
                <TestButton variant="state" onClick={addGunAmmo}>
                  Add Gun Ammo (50)
                </TestButton>
                <TestButton variant="state" onClick={addHomemadeBullets}>
                  Add Homemade (50)
                </TestButton>
                <TestButton variant="state" onClick={addBomb}>
                  Add Bomb (10)
                </TestButton>
              </TestSection>

              <TestSection title="Game Settings">
                <TestButton variant="state" onClick={setGameDayTo3}>
                  Set Day to 3 (Weapon Breaking)
                </TestButton>
                <TestButton variant="state" onClick={healPlayer}>
                  Heal Player
                </TestButton>
              </TestSection>

              <TestSection title="Test Results">
                <TestButton variant="default" onClick={clearResults}>
                  Clear Results
                </TestButton>
              </TestSection>

              <TestResultsList results={results} />
            </TestPanel>
          </div>
        </div>

        {/* Battle Result Display */}
        {battleResult && (
          <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded pointer-events-auto">
            <div className="text-lg font-bold mb-2">Battle Result</div>
            <div className="text-sm space-y-1">
              <div>Win: {battleResult.win ? 'Yes' : 'No'}</div>
              <div>Monsters Killed: {battleResult.monsterKilledNum}</div>
              <div>Damage Taken: {battleResult.totalHarm}</div>
              <div>Virus Gained: {battleResult.totalVirus}</div>
              <div>Bullets Used: {battleResult.bulletNum}</div>
              <div>Homemade Used: {battleResult.homemadeNum}</div>
            </div>
            <button
              onClick={() => setBattleResult(null)}
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </TestScreen>
  )
}


