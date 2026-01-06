import { useUIStore } from './core/store/uiStore'
import { MenuScene } from './scene/MenuScene'
import { MainScene } from './scene/MainScene'
import { SaveFileScene } from './scene/SaveFileScene'
import { TestIndexScreen } from './test/TestIndexScreen'
import { DeathOverlay } from './module/overlay/DeathOverlay'
import { ItemDialog } from './module/overlay/ItemDialog'
import { AttributeStatusDialog } from './module/overlay/AttributeDialog'
import { StatusDialog } from './module/overlay/StatusDialog'
import { BuildDialog } from './module/overlay/BuildDialog'
import { RecipeDialog } from './module/overlay/RecipeDialog'
import { SiteDialog } from './module/overlay/LocationDialog'
import { NpcDialog } from './module/overlay/NpcDialog'
import { NpcGiftDialog } from './module/overlay/NpcGiftDialog'
import { NpcHelpDialog } from './module/overlay/NpcHelpDialog'
import { ConfirmationDialog } from './module/overlay/ConfirmationDialog'
import { getImagePath } from './common/utils/assets'
import { ImageSprite } from './common/ui/sprite/ImageSprite'
import { useViewportScale } from './common/hooks/useViewportScale'
// Future scenes (to be implemented):
// import { ChooseScene } from './components/scenes/ChooseScene'
// import { StoryScene } from './components/scenes/StoryScene'
// import { BattleScene } from './components/scenes/BattleScene'
// import { EndScene } from './components/scenes/EndScene'

function App() {
  // Use selectors to ensure proper re-renders
  const currentScene = useUIStore((state) => state.currentScene)
  const activeOverlay = useUIStore((state) => state.activeOverlay)
  const deathReason = useUIStore((state) => state.deathReason)
  
  // Calculate viewport scale to maximize visible area while fitting screen
  // Using 'fit-both' policy to calculate scale from both width and height
  // This ensures the game uses the largest possible scale that fits the viewport
  const { scale } = useViewportScale(640, 1136, 'fit-both', 0.3, 1.0)
  
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
      
      {/* Game container wrapper - centers and scales the game */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '640px',
          height: '1136px',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: 'transparent',
          zIndex: 0
        }}
      >
        <div 
          className="game-container text-white relative" 
          style={{ 
            backgroundColor: 'transparent',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 0, 0, 0.3)',
            border: '2px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            width: '640px',
            height: '1136px'
          }}
        >
        {isTestMode ? (
          <TestIndexScreen />
        ) : (
          <>
            {currentScene === 'menu' && <MenuScene />}
            {currentScene === 'saveFile' && <SaveFileScene />}
            {currentScene === 'main' && <MainScene />}
            {/* Future scenes */}
            {/* {currentScene === 'choose' && <ChooseScene />} */}
            {/* {currentScene === 'story' && <StoryScene />} */}
            {/* {currentScene === 'battle' && <BattleScene />} */}
            {/* {currentScene === 'end' && <EndScene />} */}
          </>
        )}
        </div>
      </div>
      
      {/* Global overlays - rendered at App level to span full viewport */}
      {activeOverlay === 'death' && deathReason && (
        <DeathOverlay reason={deathReason} />
      )}
      {/* Prevent other overlays from rendering when death overlay is active (hardlock) */}
      {activeOverlay !== 'death' && activeOverlay === 'itemDialog' && (
        <ItemDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'attributeDialog' && (
        <AttributeStatusDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'statusDialog' && (
        <StatusDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'buildDialog' && (
        <BuildDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'recipeDialog' && (
        <RecipeDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'siteDialog' && (
        <SiteDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'npcDialog' && (
        <NpcDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'npcGiftDialog' && (
        <NpcGiftDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'npcHelpDialog' && (
        <NpcHelpDialog />
      )}
      {activeOverlay !== 'death' && activeOverlay === 'confirmationDialog' && (
        <ConfirmationDialog />
      )}
    </>
  )
}

export default App

