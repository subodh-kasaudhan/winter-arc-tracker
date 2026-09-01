import { useRef } from 'react'
import { formatHustlers } from '../lib/visitors'

export function Drawer({
  open,
  onClose,
  visitorCount,
  visitorsReady,
  visitorsCapped,
  onExport,
  onImport,
  onReset,
}: {
  open: boolean
  onClose: () => void
  visitorCount: number | null
  visitorsReady: boolean
  visitorsCapped: boolean
  onExport: () => void
  onImport: (text: string) => void
  onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-white shadow-2xl">
        <div className="px-5 pt-8 pb-4">
          <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
            Winter Arc 2026
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">Your season</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            1 Sep – 31 Dec 2026.
          </p>
          <p className="mt-2 text-sm text-muted">
            Progress stays on this device only. Your data is safe with you.
          </p>
        </div>
        <nav className="flex flex-col gap-1 px-4">
          <button
            type="button"
            onClick={onExport}
            className="rounded-2xl px-3 py-3 text-left text-sm font-bold hover:bg-paper"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl px-3 py-3 text-left text-sm font-bold hover:bg-paper"
          >
            Import backup
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl px-3 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
          >
            Reset all data
          </button>
        </nav>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            void file.text().then(onImport)
            e.target.value = ''
          }}
        />
        <div className="mt-auto border-t border-line px-5 py-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
            Total hustlers today:
          </p>
          <p className="text-2xl font-extrabold text-ink">
            {visitorsReady && visitorCount !== null
              ? formatHustlers(visitorCount, visitorsCapped)
              : '—'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {visitorsReady
              ? 'Unique visitors today'
              : 'Goes live after Cloudflare setup'}
          </p>
        </div>
      </aside>
    </div>
  )
}
