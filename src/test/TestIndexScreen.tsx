/**
 * Test Index Screen
 * Main entry point for all test screens - uses registry for easy extension
 */

import { useState, Suspense } from 'react'
import { testRegistry, TestEntry } from './testRegistry'

const colorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  teal: 'bg-teal-600 hover:bg-teal-700',
  red: 'bg-red-600 hover:bg-red-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  default: 'bg-gray-600 hover:bg-gray-700',
}

export function TestIndexScreen() {
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  // If a test is selected, render it
  if (currentTest) {
    const testEntry = testRegistry.find(t => t.id === currentTest)
    if (testEntry) {
      const TestComponent = testEntry.component
      return (
        <Suspense fallback={
          <div className="w-full h-full bg-gray-900 text-white flex items-center justify-center">
            <div className="text-xl">Loading test...</div>
          </div>
        }>
          <div className="relative w-full h-full">
            <TestComponent />
            {/* Back button */}
            <button
              onClick={() => setCurrentTest(null)}
              className="fixed top-4 left-4 bg-gray-900/95 text-white px-3 py-2 rounded z-[10002] hover:bg-gray-800 shadow-lg text-sm"
            >
              Back to Index
            </button>
          </div>
        </Suspense>
      )
    }
  }

  // Render test index
  return (
    <div className="w-full h-full bg-gray-900 text-white p-8 overflow-auto">
      <h1 className="text-3xl font-bold mb-2">Test Screens</h1>
      <p className="text-gray-400 mb-8">Select a test screen to begin testing</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testRegistry.map((test: TestEntry) => (
            <button
              key={test.id}
              onClick={() => setCurrentTest(test.id)}
              className={`p-4 rounded text-left transition-colors ${colorMap[test.color || 'default']}`}
            >
              <h3 className="font-bold text-lg">{test.name}</h3>
              <p className="text-sm text-gray-200 mt-1 opacity-80">
                {test.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Select a test screen from above</li>
            <li>Use draggable test panels to control tests</li>
            <li>Panels can be collapsed by clicking the [-] button</li>
            <li>Drag panels by their header to reposition</li>
            <li>Toggle position overlay to see element coordinates</li>
            <li>Click "Back to Index" to return here</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-gray-800/50 rounded border border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Adding New Tests</h2>
          <p className="text-gray-400 text-sm">
            To add a new test, create your test screen component in <code className="bg-gray-700 px-1 rounded">src/test/</code> and 
            add an entry to <code className="bg-gray-700 px-1 rounded">testRegistry.ts</code>
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  )
}

