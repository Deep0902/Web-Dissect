//#region Imports
import type { Theme } from '../lib/theme'
import { ThemeToggle } from './ThemeToggle'
//#endregion Imports

//#region Types
interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}
//#endregion Types

/** Fixed header bar: icon, title, short description, and the theme toggle. */
export const Header = ({ theme, onToggleTheme }: HeaderProps) => (
  <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-black">
    <img src="/icon.png" alt="" width={32} height={32} className="size-8 shrink-0 rounded-lg" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">Web Dissect</p>
      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
        Scan the page for accessibility issues!
      </p>
    </div>
    <ThemeToggle theme={theme} onToggle={onToggleTheme} />
  </header>
)
