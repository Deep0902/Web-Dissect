//#region Imports
import type { Theme } from '../lib/theme'
//#endregion Imports

//#region Types
interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}
//#endregion Types

/** Sun/moon toggle button that switches between the light and dark themes. */
export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition duration-150 ease-out hover:-translate-y-px hover:bg-slate-100 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:translate-y-0 motion-reduce:transition-none motion-reduce:transform-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {isDark ? (
        // Sun: shown while dark, clicking switches to light.
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0Z"
          />
        </svg>
      ) : (
        // Moon: shown while light, clicking switches to dark.
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          />
        </svg>
      )}
    </button>
  )
}
