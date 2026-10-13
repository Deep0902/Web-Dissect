//#region Imports
import type axe from 'axe-core'
//#endregion Imports

//#region Types
interface ResultsPanelProps {
  axeResults: axe.AxeResults | null
  axeError: string | null
  onSave: () => void
}
//#endregion Types

//#region Constants
// Tailwind classes per violation impact level.
const impactStyles: Record<string, string> = {
  critical: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
  serious:
    'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200',
  moderate:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
  minor: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200',
}

// Summary rows shown above the violations list.
const summaryRowStyles: Record<string, string> = {
  violations: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200',
  passes: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  incomplete: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  inapplicable: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}
//#endregion Constants

/**
 * Displays scan errors and, once available, the axe-core results summary, violations list, and
 * a button to save the full results as JSON.
 */
export const ResultsPanel = ({ axeResults, axeError, onSave }: ResultsPanelProps) => {
  if (!axeResults && !axeError) return null

  return (
    <div className="mt-4">
      {axeError && (
        <p role="alert" className="mb-2 text-xs text-red-600 dark:text-red-400">
          {axeError}
        </p>
      )}
      {axeResults && (
        <div className="mt-1">
          {/* Summary counts */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">
            Accessibility Results
          </p>
          <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-xs dark:border-slate-700">
            <thead className="bg-slate-800 text-white dark:bg-slate-700">
              <tr>
                <th className="px-3 py-2 font-semibold">Result</th>
                <th className="px-3 py-2 text-right font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'violations', label: 'Violations', count: axeResults.violations.length },
                { key: 'passes', label: 'Passes', count: axeResults.passes.length },
                { key: 'incomplete', label: 'Incomplete', count: axeResults.incomplete.length },
                { key: 'inapplicable', label: 'Inapplicable', count: axeResults.inapplicable.length },
              ].map((row) => (
                <tr
                  key={row.key}
                  className={`${summaryRowStyles[row.key]} border-t border-white font-semibold dark:border-slate-900`}
                >
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2 text-right">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Save results button */}
          <button
            type="button"
            onClick={onSave}
            className="my-2 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-px hover:bg-sky-800 hover:shadow-md active:translate-y-0 motion-reduce:transition-none motion-reduce:transform-none"
          >
            Save results.json
          </button>

          {/* Violations list */}
          {axeResults.violations.length === 0 ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">No violations found.</p>
          ) : (
            <ul className="space-y-2">
              {axeResults.violations.map((v) => (
                <li
                  key={v.id}
                  className={`rounded-lg border p-3 text-xs ${impactStyles[v.impact ?? 'minor'] ?? impactStyles.minor}`}
                >
                  <p className="font-semibold">
                    {v.id} <span className="font-normal opacity-80">({v.impact ?? 'n/a'})</span>
                  </p>
                  <p>{v.help}</p>
                  <p className="mt-1 opacity-80">{v.nodes.length} affected element(s)</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
