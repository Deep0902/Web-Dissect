//#region Types
// The two themes the side panel supports.
export type Theme = 'light' | 'dark'
//#endregion Types

//#region Constants
// localStorage key for the user's explicit theme choice.
const THEME_STORAGE_KEY = 'web-dissect-theme'
//#endregion Constants

//#region Helpers
/** Reads the user's persisted theme choice, if any. Falls back to `null` when unavailable. */
export const getStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

/** Persists the user's explicit theme choice so it takes priority on the next open. */
export const storeTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore storage failures (e.g. disabled storage) - the choice simply won't persist.
  }
}

/** Reads the current system (OS/browser) theme preference. */
export const resolveInitialTheme = (): Theme => getStoredTheme() ?? 'light'

/**
 * Applies a theme to the document root by toggling the `dark` class (used by Tailwind's
 * class-based dark mode) and setting `color-scheme` so native controls and scrollbars match.
 */
export const applyTheme = (theme: Theme): void => {
  try {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  } catch {
    // Ignore - worst case the theme simply doesn't visually apply.
  }
}
//#endregion Helpers
