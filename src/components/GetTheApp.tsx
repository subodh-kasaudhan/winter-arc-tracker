export function GetTheApp() {
  return (
    <section className="rounded-[28px] bg-card p-5 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
      <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
        Get the app
      </p>
      <h2 className="mt-1 text-2xl font-extrabold">Use it like an app</h2>
      <p className="mt-2 text-sm text-muted">
        Habits still live on this phone. Android can install an APK. iPhone
        uses Add to Home Screen — Apple does not allow a public iOS file
        download.
      </p>
      <a
        href="/downloads/winter-arc-2026.apk"
        download
        className="mt-5 block rounded-2xl bg-leaf px-4 py-3 text-sm font-extrabold text-white hover:bg-leaf-dark"
      >
        Download Android APK
      </a>
      <p className="mt-2 text-xs font-semibold text-muted">
        Android may ask you to allow installing from this browser.
      </p>
      <p className="mt-4 text-sm font-bold text-ink">iPhone</p>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted">
        <li>Open this site in Safari</li>
        <li>Tap Share</li>
        <li>Tap Add to Home Screen</li>
      </ol>
      <p className="mt-3 text-xs font-semibold text-muted">
        If you already used the website in Chrome, export a backup on Data
        and import it in the app so your habits come along.
      </p>
    </section>
  )
}
