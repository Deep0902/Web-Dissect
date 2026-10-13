//#region Types
interface UrlFieldProps {
  url: string
  onChange: (value: string) => void
}
//#endregion Types

/** Editable field showing the active tab's URL. */
export const UrlField = ({ url, onChange }: UrlFieldProps) => (
  <div>
    <label
      htmlFor="tab-url-input"
      className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
    >
      Page URL
    </label>
    <div className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
      <input
        id="tab-url-input"
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="No active page URL available."
        className="w-full bg-transparent text-sm leading-6 text-slate-700 placeholder-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder-slate-500"
      />
    </div>
  </div>
)
