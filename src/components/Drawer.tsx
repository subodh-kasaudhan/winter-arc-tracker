import { formatHustlers, type VisitorSnapshot } from '../lib/visitors'
import type { Page } from '../lib/types'

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'progress', label: 'Progress' },
  { id: 'data', label: 'Data' },
  { id: 'credits', label: 'Credits' },
]

export function Drawer({
  open,
  page,
  onClose,
  onGo,
  hustlers,
}: {
  open: boolean
  page: Page
  onClose: () => void
  onGo: (page: Page) => void
  hustlers: VisitorSnapshot
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col bg-card shadow-2xl">
        <div className="px-5 pt-8 pb-4">
          <p className="text-xs font-extrabold tracking-wide text-leaf uppercase">
            Winter Arc 2026
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Winter Arc Tracker
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            1 Sep – 31 Dec 2026.
          </p>
          <p className="mt-2 text-sm text-muted">
            Progress stays on this device only. Your data is safe with you.
          </p>
        </div>
        <nav className="flex flex-col gap-1 px-4">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onGo(link.id)}
              className={`rounded-2xl px-3 py-3 text-left text-sm font-bold ${
                page === link.id ? 'bg-paper text-leaf' : 'hover:bg-paper'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-line px-5 py-4">
          <p className="text-[11px] font-bold tracking-wide text-muted uppercase">
            Total hustlers today:
          </p>
          <p className="text-2xl font-extrabold text-ink">
            {hustlers.ready && hustlers.count !== null
              ? formatHustlers(hustlers.count, hustlers.capped)
              : '—'}
          </p>
        </div>
      </aside>
    </div>
  )
}
