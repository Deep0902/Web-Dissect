//#region Helpers
/**
 * Debug-only logger: prints to the side panel console and forwards the same message to the
 * background service worker console via `chrome.runtime.sendMessage`. Never throws, so a
 * logging failure can never break the rest of the app.
 */
export const debugLog = (step: string, data?: unknown): void => {
  try {
    console.log('[SidePanel]', step, data ?? '')
    if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'DEBUG_LOG', step, data }).catch(() => {})
    }
  } catch {
    // Swallow - debugLog must never throw.
  }
}
//#endregion Helpers
