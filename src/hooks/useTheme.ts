//#region Imports
import { useCallback, useEffect, useState } from 'react'
import { applyTheme, resolveInitialTheme, storeTheme, type Theme } from '../lib/theme'
//#endregion Imports

//#region Hooks
/**
 * Manages the side panel's light/dark theme: defaults to light and persists the user's choice.
 */
export const useTheme = () => {
  // Current theme applied to the document.
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme)

  // Keep the document in sync whenever the theme state changes.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Toggles between light and dark and persists the user's explicit choice.
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      storeTheme(next)
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
//#endregion Hooks
