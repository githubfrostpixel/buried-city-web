import { useUIStore } from './store/uiStore'
import { MenuScene } from './components/scenes/MenuScene'
import { MainScene } from './components/scenes/MainScene'
import { TestIndexScreen } from './components/test/TestIndexScreen'
import { DeathOverlay } from './components/overlays/DeathOverlay'
import { ItemDialog } from './components/overlays/ItemDialog'
import { AttributeStatusDialog } from './components/overlays/AttributeStatusDialog'
import { StatusDialog } from './components/overlays/StatusDialog'
import { BuildDialog } from './components/overlays/BuildDialog'
import { RecipeDialog } from './components/overlays/RecipeDialog'
import { SiteDialog } from './components/overlays/SiteDialog'
import { getImagePath } from './utils/assets'
import { ImageSprite } from './components/sprites/ImageSprite'
// Future scenes (to be implemented):
// import { SaveFileScene } from './components/scenes/SaveFileScene'
// import { ChooseScene } from './components/scenes/ChooseScene'
// import { StoryScene } from './components/scenes/StoryScene'
// import { BattleScene } from './components/scenes/BattleScene'
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
      {/* Global background - spans full viewport */}
      <div 
        className="fixed inset-0"
        style={{
          zIndex: -1,
          width: '100%',
          height: '100%'
        }}
      >
        <ImageSprite
          src={getImagePath('image/global_bg.jpg')}
          alt="Global Background"
          className="w-full h-full"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
        {/* Gradient overlay - dark at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 1) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      <div 
        className="game-container w-full h-full text-white relative" 
        style={{ 
          backgroundColor: 'transparent',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(0, 0, 0, 0.2)',
          borderRadius: '4px'
        }}
      >
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
      {activeOverlay === 'attributeDialog' && (
        <AttributeStatusDialog />
      )}
      {activeOverlay === 'statusDialog' && (
        <StatusDialog />
      )}
      {activeOverlay === 'buildDialog' && (
        <BuildDialog />
      )}
      {activeOverlay === 'recipeDialog' && (
        <RecipeDialog />
      )}
      {activeOverlay === 'siteDialog' && (
        <SiteDialog />
      )}
    </>
  )
}

export default App

