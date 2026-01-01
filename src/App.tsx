import { useUIStore } from './store/uiStore'
import { MenuScene } from './components/scenes/MenuScene'
import { MainScene } from './components/scenes/MainScene'
import { TestIndexScreen } from './components/test/TestIndexScreen'
import { DeathOverlay } from './components/overlays/DeathOverlay'
import { ItemDialog } from './components/overlays/ItemDialog'
// Future scenes (to be implemented):
// import { SaveFileScene } from './components/scenes/SaveFileScene'
// import { ChooseScene } from './components/scenes/ChooseScene'
// import { StoryScene } from './components/scenes/StoryScene'
// import { BattleScene } from './components/scenes/BattleScene'
// import { MapScene } from './components/scenes/MapScene'
// import { EndScene } from './components/scenes/EndScene'

function App() {
  // Use selectors to ensure proper re-renders
  const currentScene = useUIStore((state) => state.currentScene)
  const activeOverlay = useUIStore((state) => state.activeOverlay)
  const deathReason = useUIStore((state) => state.deathReason)
  
  
  // Check for test mode (via URL parameter or localStorage)
  const isTestMode = window.location.search.includes('test=true') || 
                     localStorage.getItem('testMode') === 'true'
  
  return (
    <>
      <div className="game-container w-full h-full text-white" style={{ backgroundColor: '#000000' }}>
        {isTestMode ? (
          <TestIndexScreen />
        ) : (
          <>
            {currentScene === 'menu' && <MenuScene />}
            {currentScene === 'main' && <MainScene />}
            {/* Future scenes */}
            {/* {currentScene === 'saveFile' && <SaveFileScene />} */}
            {/* {currentScene === 'choose' && <ChooseScene />} */}
            {/* {currentScene === 'story' && <StoryScene />} */}
            {/* {currentScene === 'battle' && <BattleScene />} */}
            {/* {currentScene === 'map' && <MapScene />} */}
            {/* {currentScene === 'end' && <EndScene />} */}
          </>
        )}
      </div>
      
      {/* Global overlays - rendered at App level to span full viewport */}
      {activeOverlay === 'death' && deathReason && (
        <DeathOverlay reason={deathReason} />
      )}
      {activeOverlay === 'itemDialog' && (
        <ItemDialog />
      )}
    </>
  )
}

export default App

