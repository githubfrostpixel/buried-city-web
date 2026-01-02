/**
 * useTestResults Hook
 * Manages test results state and provides helper functions
 */

import { useState, useCallback } from 'react'

export interface TestResult {
  test: string
  expected: string
  actual: string
  status: 'pass' | 'fail' | 'pending'
}

export function useTestResults() {
  const [results, setResults] = useState<TestResult[]>([])

  const runTest = useCallback((
    testName: string,
    expected: string,
    getActual: () => string
  ) => {
    const actual = getActual()
    const status: TestResult['status'] = actual === expected ? 'pass' : 'fail'
    
    setResults((prev) => [
      ...prev.filter((r) => r.test !== testName),
      { test: testName, expected, actual, status },
    ])
  }, [])

  const addPendingTests = useCallback((
    tests: Array<{ test: string; expected: string; actual?: string }>
  ) => {
    const pendingResults: TestResult[] = tests.map((t) => ({
      test: t.test,
      expected: t.expected,
      actual: t.actual ?? 'Check visually',
      status: 'pending' as const,
    }))

    setResults((prev) => {
      const testNames = new Set(tests.map((t) => t.test))
      return [
        ...prev.filter((r) => !testNames.has(r.test)),
        ...pendingResults,
      ]
    })
  }, [])

  const updateTestResult = useCallback((
    testName: string,
    actual: string,
    status: TestResult['status']
  ) => {
    setResults((prev) =>
      prev.map((r) =>
        r.test === testName ? { ...r, actual, status } : r
      )
    )
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return {
    results,
    runTest,
    addPendingTests,
    updateTestResult,
    clearResults,
    setResults,
  }
}



