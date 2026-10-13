//#region Imports
import { useEffect, useRef, useState } from 'react'
import axe from 'axe-core'
import { debugLog } from './lib/debugLog'
import { isRestrictedUrl } from './lib/restrictedPages'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { UrlField } from './components/UrlField'
import { ActionButtons } from './components/ActionButtons'
import { ResultsPanel } from './components/ResultsPanel'
//#endregion Imports

//#region Types
// Scan results are kept per-tab in chrome.storage.session so they survive the popup/side panel
// being closed and reopened (its React tree is torn down and remounted each time), while still
// being cleared automatically when the browser closes.
type StoredScanState = {
  url: string
  axeResults: axe.AxeResults | null
  axeError: string | null
}
//#endregion Types

//#region Helpers
const scanStateStorageKey = (tabId: number) => `scanState_${tabId}`

const hasSessionStorage = (): boolean => typeof chrome !== 'undefined' && !!chrome?.storage?.session
//#endregion Helpers

const App = () => {
  //#region State
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [activeTabId, setActiveTabId] = useState<number | null>(null)
  const [axeResults, setAxeResults] = useState<axe.AxeResults | null>(null)
  const [axeError, setAxeError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  // Current light/dark theme, synced to the document root and persisted on user choice.
  const { theme, toggleTheme } = useTheme()

  // Tracks the tab whose stored scan state has already been loaded, so the save effect below
  // doesn't wipe out persisted results with the initial null/null state before restore finishes.
  const hydratedTabIdRef = useRef<number | null>(null)
  // Holds the real URL of the active tab (as last fetched from chrome.tabs), independent of the
  // editable "url" input above, so storage matching isn't affected by manual edits to the field.
  const fetchedTabUrlRef = useRef('')
  // Pending setTimeout ids (copy status resets) so they can be cleared on unmount.
  const timeoutIdsRef = useRef<number[]>([])
  //#endregion State

  //#region Effects
  // Restore any previously saved scan results for the active tab (e.g. after the panel was
  // closed and reopened, or after switching back to a tab that was already scanned).
  useEffect(() => {
    if (activeTabId == null || !hasSessionStorage()) return

    let cancelled = false
    const key = scanStateStorageKey(activeTabId)

    chrome.storage.session
      .get(key)
      .then((result) => {
        if (cancelled) return
        const saved = result[key] as StoredScanState | undefined
        // Only restore results if they match the tab's current URL, so a stale scan from a
        // previous page isn't shown after the tab has navigated elsewhere.
        if (saved && saved.url === fetchedTabUrlRef.current) {
          setAxeResults(saved.axeResults)
          setAxeError(saved.axeError)
        }
      })
      .catch((error) => debugLog('Restore: failed', String(error)))
      .finally(() => {
        if (!cancelled) hydratedTabIdRef.current = activeTabId
      })

    return () => {
      cancelled = true
    }
  }, [activeTabId])

  // Persist scan results for the active tab whenever they change, so they can be restored later.
  useEffect(() => {
    if (activeTabId == null || !hasSessionStorage()) return
    if (hydratedTabIdRef.current !== activeTabId) return

    const key = scanStateStorageKey(activeTabId)
    if (axeResults || axeError) {
      const toStore: StoredScanState = { url: fetchedTabUrlRef.current, axeResults, axeError }
      chrome.storage.session.set({ [key]: toStore }).catch((error) => debugLog('Persist: failed', String(error)))
    } else {
      chrome.storage.session.remove(key).catch((error) => debugLog('Persist: remove failed', String(error)))
    }
  }, [activeTabId, axeResults, axeError])

  // Attempt to fetch URL on initial load.
  useEffect(() => {
    void fetchActiveTabUrl(false)
  }, [])

  // Clear any pending copy-status timers on unmount so they can't update state afterwards.
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
      timeoutIdsRef.current = []
    }
  }, [])
  //#endregion Effects

  //#region Handlers
  // Safely retrieve the active tab URL from Chrome or browser environment.
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
          fetchedTabUrlRef.current = activeTab.url
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

  // Handle button click: fetch if empty, copy if URL is present.
  const handleAction = async () => {
    if (!url) {
      await fetchActiveTabUrl(true)
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopyStatus('copied')
      setStatusMessage('URL copied to clipboard!')
      timeoutIdsRef.current.push(
        window.setTimeout(() => {
          setCopyStatus('idle')
          setStatusMessage(null)
        }, 2500),
      )
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      setCopyStatus('error')
      setStatusMessage('Unable to copy URL.')
      timeoutIdsRef.current.push(window.setTimeout(() => setCopyStatus('idle'), 3000))
    }
  }

  // Inject axe-core into the live tab and run a full scan there (same approach the axe CLI uses
  // in headless Chrome), so the result includes passes/incomplete/inapplicable, not just violations.
  const handleScanPage = async () => {
    if (!url) return
    if (typeof chrome === 'undefined' || !chrome?.scripting?.executeScript || !chrome?.tabs?.get) {
      setAxeError('Live page scanning requires the Chrome extension APIs (scripting on an active tab).')
      return
    }
    if (activeTabId == null) {
      setAxeError('No active tab is available to scan. Try fetching the URL again.')
      return
    }

    setIsChecking(true)
    setAxeError(null)
    setAxeResults(null)
    debugLog('Scan: started', url)
    try {
      // Re-check the tab right before scanning: the stored activeTabId can go stale if the tab
      // was closed or navigated to a different (possibly restricted) page since it was fetched.
      let tab: chrome.tabs.Tab
      try {
        tab = await chrome.tabs.get(activeTabId)
      } catch {
        throw new Error('The tab being scanned was closed. Fetch the URL again and retry.')
      }
      if (!tab.url) throw new Error('The tab navigated away before the scan could run.')
      if (isRestrictedUrl(tab.url)) {
        throw new Error('This page cannot be scanned (browser, extension, store, or PDF pages are restricted).')
      }

      // Load axe-core into the tab's page context (window.axe becomes available there)
      await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ['axe.min.js'],
      })

      // Run axe.run() inside the tab and bring the serializable results back
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        func: () => {
          const win = window as unknown as { axe?: { run: () => unknown } }
          if (!win.axe) throw new Error('axe-core did not load on this page.')
          return win.axe.run()
        },
      })

      const results = injectionResults?.[0]?.result as axe.AxeResults | undefined
      if (!results || !Array.isArray(results.violations) || !Array.isArray(results.passes)) {
        throw new Error('No results returned from the page.')
      }

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

  // Save the scan results as a results.json file, matching the shape produced by `npx axe --save`.
  const handleSaveResults = () => {
    if (!axeResults) return
    let downloadUrl: string | null = null
    try {
      const blob = new Blob([JSON.stringify([axeResults], null, 2)], { type: 'application/json' })
      downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = 'results.json'
      anchor.click()
    } catch (error) {
      setStatusMessage('Unable to save results.json.')
      debugLog('Save: failed', String(error))
    } finally {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }
  //#endregion Handlers

  //#region Render
  return (
    <div className="flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 text-slate-900 dark:bg-black dark:text-slate-100">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* URL field */}
        <UrlField
          url={url}
          onChange={(value) => {
            setUrl(value)
            setCopyStatus('idle')
          }}
        />

        {/* Action buttons */}
        <div className="mt-4">
          <ActionButtons
            url={url}
            isLoading={isLoading}
            copyStatus={copyStatus}
            isChecking={isChecking}
            onAction={handleAction}
            onScan={handleScanPage}
          />
        </div>

        {/* Scan results */}
        <ResultsPanel axeResults={axeResults} axeError={axeError} onSave={handleSaveResults} />

        {/* Status announcements */}
        <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-slate-500 dark:text-slate-400">
          {copyStatus === 'copied' && 'Link copied to your clipboard.'}
          {copyStatus === 'error' && 'Could not copy the link. Please try again.'}
          {!copyStatus.includes('cop') && statusMessage}
        </p>
      </main>
    </div>
  )
  //#endregion Render
}

export default App
