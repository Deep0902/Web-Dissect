const features = [
  {
    number: "01",
    title: "Popup",
    description: "A polished popup for quick actions right from the toolbar.",
    tag: "Interface",
  },
  {
    number: "02",
    title: "Side panel",
    description: "Give your extension a roomy home alongside any webpage.",
    tag: "Interface",
  },
  {
    number: "03",
    title: "Hotkey commands",
    description: "Trigger useful extension actions with keyboard shortcuts.",
    tag: "Shortcuts",
  },
  {
    number: "04",
    title: "Background service worker",
    description: "Run extension logic in the background when you need it.",
    tag: "Runtime",
  },
  {
    number: "05",
    title: "Content scripts",
    description: "Read and enhance page content directly in the DOM.",
    tag: "Web pages",
  },
  {
    number: "06",
    title: "Page context menu",
    description: "Add helpful actions to the browser's right-click menu.",
    tag: "Browser API",
  },
  {
    number: "07",
    title: "Selection context menu",
    description: "Make selected text actionable with a custom menu item.",
    tag: "Browser API",
  },
];

function App() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7f8f5] text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_50%_-10%,rgba(174,243,202,0.55),transparent_65%)]"
      />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-7 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3" aria-label="Handmade home">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-emerald-300 shadow-lg shadow-slate-900/10">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
              >
                <path
                  d="M5 19V5l14 14V5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight">handmade<span className="text-emerald-600">.</span></span>
          </a>
          <span className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Built for Chrome
          </span>
        </header>

        <section className="mx-auto max-w-3xl pb-14 pt-20 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm shadow-emerald-900/[0.03]">
            <span className="grid size-5 place-items-center rounded-full bg-emerald-100">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-3">
                <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Your next idea starts here
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl sm:leading-[1.08]">
            Make something
            <span className="block text-emerald-700">useful for the web.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            A thoughtfully assembled Chrome extension starter, powered by React,
            TypeScript, and Vite. Skip the setup and get straight to building.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["React 19", "TypeScript", "Vite"].map((technology) => (
              <span
                key={technology}
                className="rounded-md border border-slate-200/80 bg-white/70 px-2.5 py-1 font-mono text-xs text-slate-600"
              >
                {technology}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="features-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Ready out of the box
              </p>
              <h2 id="features-heading" className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Everything you need to get going
              </h2>
            </div>
            <span className="shrink-0 pb-1 text-sm text-slate-500">07 features</span>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li
                key={feature.number}
                className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm shadow-slate-900/[0.025] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:shadow-slate-900/[0.06]"
              >
                <div className="mb-7 flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
                    <span className="font-mono text-xs font-semibold">{feature.number}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium tracking-wide text-slate-500">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>Made for makers. Built to be yours.</p>
          <p className="font-mono">Chrome Extension Template</p>
        </footer>
      </div>
    </main>
  );
}

export default App;
