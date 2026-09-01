import { useRef } from 'react'
import { MadeBy } from './MadeBy'

export function DataCenter({
  onExport,
  onImport,
  onReset,
}: {
  onExport: () => void
  onImport: (text: string) => void
  onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section className="rounded-[28px] bg-card p-5 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
          Data
        </p>
        <MadeBy />
      </div>
      <h2 className="mt-1 text-2xl font-extrabold">Your backups</h2>
      <p className="mt-2 text-sm text-muted">
        Progress stays on this device. Export before you clear browser data.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onExport}
          className="rounded-2xl bg-paper px-4 py-3 text-left text-sm font-bold hover:bg-line"
        >
          Export backup
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-2xl bg-paper px-4 py-3 text-left text-sm font-bold hover:bg-line"
        >
          Import backup
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-500/10"
        >
          Reset all data
        </button>
      </div>
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
    </section>
  )
}
