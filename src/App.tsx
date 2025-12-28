import { useUIStore } from './store/uiStore'
import { MenuScene } from './components/scenes/MenuScene'
import { MainScene } from './components/scenes/MainScene'
// Future scenes (to be implemented):
// import { SaveFileScene } from './components/scenes/SaveFileScene'
// import { ChooseScene } from './components/scenes/ChooseScene'
// import { StoryScene } from './components/scenes/StoryScene'
// import { BattleScene } from './components/scenes/BattleScene'
// import { MapScene } from './components/scenes/MapScene'
// import { EndScene } from './components/scenes/EndScene'

function App() {
  const uiStore = useUIStore()
  const currentScene = uiStore.currentScene
  
  return (
    <div className="game-container w-full h-full text-white" style={{ backgroundColor: '#000000' }}>
      {currentScene === 'menu' && <MenuScene />}
      {currentScene === 'main' && <MainScene />}
      {/* Future scenes */}
      {/* {currentScene === 'saveFile' && <SaveFileScene />} */}
      {/* {currentScene === 'choose' && <ChooseScene />} */}
      {/* {currentScene === 'story' && <StoryScene />} */}
      {/* {currentScene === 'battle' && <BattleScene />} */}
      {/* {currentScene === 'map' && <MapScene />} */}
      {/* {currentScene === 'end' && <EndScene />} */}
    </div>
  )
}

export default App

