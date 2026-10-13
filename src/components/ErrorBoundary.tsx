//#region Imports
import { Component, type ErrorInfo, type ReactNode } from 'react'
//#endregion Imports

//#region Types
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}
//#endregion Types

/**
 * Last-resort safety net: catches render-time errors anywhere below it in the tree so the side
 * panel never shows a blank screen, and offers a Reload button to recover.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[SidePanel] Unhandled error:', error, info.componentStack)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen w-full min-w-[320px] flex-col items-center justify-center gap-3 bg-slate-100 p-6 text-center text-slate-900 dark:bg-black dark:text-slate-100">
        <p className="text-sm font-semibold">Something went wrong</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Please reload the panel to continue.</p>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-px hover:bg-emerald-800 hover:shadow-md active:translate-y-0 motion-reduce:transition-none motion-reduce:transform-none"
        >
          Reload
        </button>
      </div>
    )
  }
}
