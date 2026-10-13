//#region Types
interface ActionButtonsProps {
  url: string
  isLoading: boolean
  copyStatus: 'idle' | 'copied' | 'error'
  isChecking: boolean
  onAction: () => void
  onScan: () => void
}
//#endregion Types

/** Primary action buttons: fetch/copy the URL, and run an accessibility scan. */
export const ActionButtons = ({ url, isLoading, copyStatus, isChecking, onAction, onScan }: ActionButtonsProps) => (
  <div className="flex flex-col-reverse gap-2">
    <button
      type="button"
      onClick={onAction}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-px hover:bg-emerald-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:translate-y-0 motion-reduce:transition-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0 dark:disabled:bg-slate-700"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
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
      type="button"
      onClick={onScan}
      disabled={!url || isChecking}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-px hover:bg-slate-900 hover:shadow-md active:translate-y-0 motion-reduce:transition-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-700/50"
    >
      {isChecking ? 'Scanning...' : 'Scan Page'}
    </button>
  </div>
)
