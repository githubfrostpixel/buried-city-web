import { MenuScene } from './components/scenes/MenuScene'
import { TestUIScene } from './components/scenes/TestUIScene'
import { TestUIHome } from './components/scenes/TestUIHome'

function App() {
  // Toggle between scenes for testing
  // 0 = MenuScene, 1 = TestUIScene, 2 = TestUIHome
  const scene: number = 2 // Set to 0, 1, or 2
  
  return (
    <div className="game-container w-full h-full text-white" style={{ backgroundColor: '#000000' }}>
      {scene === 0 && <MenuScene />}
      {scene === 1 && <TestUIScene />}
      {scene === 2 && <TestUIHome />}
    </div>
  )
}

export default App

