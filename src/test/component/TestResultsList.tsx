/**
 * TestResultsList Component
 * Displays test results with pass/fail/pending status
 */

import { TestResult } from './useTestResults'

interface TestResultsListProps {
  results: TestResult[]
  onClear?: () => void
  maxHeight?: string
}

export function TestResultsList({
  results,
  onClear,
  maxHeight = '200px',
}: TestResultsListProps) {
  return (
    <div className="border-t border-gray-600 pt-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Test Results</h4>
        {onClear && results.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>
      
      <div
        className="text-xs space-y-1 overflow-y-auto"
        style={{ maxHeight }}
      >
        {results.length === 0 ? (
          <p className="text-gray-400">No tests run yet</p>
        ) : (
          results.map((result, idx) => (
            <div
              key={`${result.test}-${idx}`}
              className={`p-1 rounded ${
                result.status === 'pass'
                  ? 'bg-green-900/50'
                  : result.status === 'fail'
                  ? 'bg-red-900/50'
                  : 'bg-gray-700/50'
              }`}
            >
              <div className="font-semibold">{result.test}</div>
              <div className="text-gray-300">Expected: {result.expected}</div>
              <div className="text-gray-300">Actual: {result.actual}</div>
              <div
                className={`text-xs ${
                  result.status === 'pass'
                    ? 'text-green-400'
                    : result.status === 'fail'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {result.status === 'pass'
                  ? 'PASS'
                  : result.status === 'fail'
                  ? 'FAIL'
                  : 'PENDING'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


