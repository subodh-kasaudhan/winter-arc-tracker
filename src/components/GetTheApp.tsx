import { useState } from 'react'

type AppTab = 'android' | 'iphone'

export function GetTheApp({ onExportBackup }: { onExportBackup: () => void }) {
  const [tab, setTab] = useState<AppTab>('android')

  return (
    <section className="rounded-[28px] bg-card p-5 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
      <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
        Get the app
      </p>
      <h2 className="mt-1 text-2xl font-extrabold">Use it like an app</h2>
      <p className="mt-2 text-sm text-muted">
        Habits still live on this phone. Pick your system below.
      </p>

      <div className="mt-4 flex rounded-full bg-paper p-1">
        <button
          type="button"
          onClick={() => setTab('android')}
          className={`min-w-0 flex-1 rounded-full py-2 text-xs font-extrabold ${
            tab === 'android' ? 'bg-leaf text-white' : 'text-muted'
          }`}
        >
          Android
        </button>
        <button
          type="button"
          onClick={() => setTab('iphone')}
          className={`min-w-0 flex-1 rounded-full py-2 text-xs font-extrabold ${
            tab === 'iphone' ? 'bg-leaf text-white' : 'text-muted'
          }`}
        >
          iPhone
        </button>
      </div>

      {tab === 'android' ? (
        <div className="mt-5">
          <a
            href="/downloads/winter-arc-2026.apk"
            download
            onClick={onExportBackup}
            className="block rounded-2xl bg-leaf px-4 py-3 text-center text-sm font-extrabold text-white hover:bg-leaf-dark"
          >
            Download Android APK
          </a>
          <p className="mt-2 text-xs font-semibold text-muted">
            The APK cannot hold this browser&apos;s ticks, so we also save a
            backup JSON. After install, open Data → Import backup if the app
            looks empty.
          </p>
          <p className="mt-2 text-xs font-semibold text-muted">
            Android may ask you to allow installing from this browser.
          </p>
          <button
            type="button"
            onClick={onExportBackup}
            className="mt-3 w-full rounded-2xl bg-paper px-4 py-3 text-left text-sm font-bold hover:bg-line"
          >
            Export backup only
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-muted">
            Apple does not allow a public iOS file download. Add this site to
            your Home Screen instead.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>If you are in Safari, your ticks stay when you add the icon</li>
            <li>If you used another browser, export a backup first (Data)</li>
            <li>In Safari, tap Share → Add to Home Screen</li>
            <li>If the icon opens empty, Data → Import backup</li>
          </ol>
          <button
            type="button"
            onClick={onExportBackup}
            className="mt-4 w-full rounded-2xl bg-paper px-4 py-3 text-left text-sm font-bold hover:bg-line"
          >
            Export backup
          </button>
        </div>
      )}
    </section>
  )
}
