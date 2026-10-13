import { useEffect, useState } from 'react'
import axe from 'axe-core'

// DEBUG ONLY: log in the side panel console and forward to the service worker console
const debugLog = (step: string, data?: unknown) => {
  console.log('[SidePanel]', step, data ?? '')
  if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: 'DEBUG_LOG', step, data }).catch(() => {})
  }
}

const App = () => {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [activeTabId, setActiveTabId] = useState<number | null>(null)
  const [axeResults, setAxeResults] = useState<axe.AxeResults | null>(null)
  const [axeError, setAxeError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Safely retrieve the active tab URL from Chrome or browser environment
  const fetchActiveTabUrl = async (isManual = false): Promise<boolean> => {
    setIsLoading(true)
    setStatusMessage(null)

    try {
      // 1. Check if Chrome extension tabs API is available
      if (typeof chrome !== 'undefined' && chrome?.tabs?.query) {
        // Query active tab in the current window first (standard for popups)
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        let activeTab = tabs[0]

        // Fallback to last focused window (helpful for side panels or detached devtools)
        if (!activeTab?.url) {
          const focusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
          activeTab = focusedTabs[0]
        }

        if (activeTab?.url) {
          setUrl(activeTab.url)
          setActiveTabId(activeTab.id ?? null)
          setStatusMessage(null)
          return true
        }

        throw new Error('No active URL found for this tab.')
      }

      // 2. Fallback for testing in a regular browser (Vite dev server)
      if (isManual && typeof window !== 'undefined' && window.location?.href) {
        setUrl(window.location.href)
        setActiveTabId(null)
        setStatusMessage('Loaded current browser preview URL')
        return true
      }

      throw new Error('Chrome tabs API unavailable in this environment.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tab URL'
      setStatusMessage(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Attempt to fetch URL on initial load
  useEffect(() => {
    void fetchActiveTabUrl(false)
  }, [])

  // Handle button click: fetch if empty, copy if URL is present
  const handleAction = async () => {
    if (!url) {
      await fetchActiveTabUrl(true)
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('copied')
      setStatusMessage('URL copied to clipboard!')
      setTimeout(() => {
        setCopyStatus('idle')
        setStatusMessage(null)
      }, 2500)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      setCopyStatus('error')
      setStatusMessage('Unable to copy URL.')
      setTimeout(() => setCopyStatus('idle'), 3000)
    }
  }

  // Inject axe-core into the live tab and run a full scan there (same approach the axe CLI uses
  // in headless Chrome), so the result includes passes/incomplete/inapplicable, not just violations.
  const handleScanPage = async () => {
    if (!url) return
    if (activeTabId == null || typeof chrome === 'undefined' || !chrome?.scripting?.executeScript) {
      setAxeError('Live page scanning requires the Chrome extension APIs (scripting on an active tab).')
      return
    }

    setIsChecking(true)
    setAxeError(null)
    setAxeResults(null)
    debugLog('Scan: started', url)
    try {
      // Load axe-core into the tab's page context (window.axe becomes available there)
      await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ['axe.min.js'],
      })

      // Run axe.run() inside the tab and bring the serializable results back
      const [injectionResult] = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: () => (window as unknown as { axe: typeof axe }).axe.run(),
      })

      const results = injectionResult?.result as axe.AxeResults | undefined
      if (!results) throw new Error('No results returned from the page.')

      // Log the analysis results (these show up in the service worker console)
      debugLog('Check: summary', {
        url: results.url,
        axeVersion: results.testEngine?.version,
        violations: results.violations.length,
        incomplete: results.incomplete.length,
        passes: results.passes.length,
        inapplicable: results.inapplicable.length,
      })
      debugLog(
        'Check: violations overview',
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          affectedElements: v.nodes.length,
        })),
      )
      debugLog(
        'Check: violations detail',
        results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })),
        })),
      )
      debugLog(
        'Check: incomplete (needs manual review)',
        results.incomplete.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })),
      )
      debugLog(
        'Check: passed rules',
        results.passes.map((r) => r.id),
      )
      setAxeResults(results)
    } catch (error) {
      setAxeError(error instanceof Error ? error.message : 'Accessibility scan failed')
      debugLog('Scan: failed', String(error))
    } finally {
      setIsChecking(false)
    }
  }

  // Save the scan results as a results.json file, matching the shape produced by `npx axe --save`
  const handleSaveResults = () => {
    if (!axeResults) return
    const blob = new Blob([JSON.stringify([axeResults], null, 2)], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = 'results.json'
    anchor.click()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f2] p-5 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.72m2.72 6.35a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.72-1.72"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Link Pocket</p>
            <p className="text-xs text-slate-500">Your current page</p>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="tab-url-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Page URL
          </label>
          <div className="flex min-h-14 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
            <input
              id="tab-url-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setCopyStatus('idle')
              }}
              placeholder="No active page URL available."
              className="w-full bg-transparent text-sm leading-6 text-slate-700 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          type="button"
          onClick={handleAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Fetching URL...</span>
            </>
          ) : !url ? (
            <>
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Fetch URL</span>
            </>
          ) : copyStatus === 'copied' ? (
            <>
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </svg>
              <span>Copy URL</span>
            </>
          )}
        </button>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          type="button"
          onClick={handleScanPage}
          disabled={!url || isChecking}
        >
          {isChecking ? 'Scanning...' : 'Scan Page'}
        </button>
        </div>

        {(axeResults || axeError) && (
          <div className="mt-4">
            {axeError && <p className="mb-2 text-xs text-red-600">{axeError}</p>}
            {axeResults && (
              <div className="mt-1">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Accessibility Results ({axeResults.violations.length} violations, {axeResults.passes.length} passes,{' '}
                    {axeResults.incomplete.length} incomplete, {axeResults.inapplicable.length} inapplicable)
                  </p>
                  <button
                    className="shrink-0 rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-800"
                    type="button"
                    onClick={handleSaveResults}
                  >
                    Save results.json
                  </button>
                </div>
                {axeResults.violations.length === 0 ? (
                  <p className="text-xs text-emerald-700">No violations found.</p>
                ) : (
                  <ul className="max-h-64 space-y-2 overflow-auto">
                    {axeResults.violations.map((v) => (
                      <li key={v.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        <p className="font-semibold">
                          {v.id} <span className="font-normal text-slate-500">({v.impact ?? 'n/a'})</span>
                        </p>
                        <p>{v.help}</p>
                        <p className="mt-1 text-slate-500">{v.nodes.length} affected element(s)</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-slate-500">
          {copyStatus === 'copied' && 'Link copied to your clipboard.'}
          {copyStatus === 'error' && 'Could not copy the link. Please try again.'}
          {!copyStatus.includes('cop') && statusMessage}
        </p>
      </section>
    </main>
  )
}

export default App