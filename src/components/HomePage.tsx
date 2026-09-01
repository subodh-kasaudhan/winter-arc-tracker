import { formatHustlers, type VisitorSnapshot } from '../lib/visitors'
import { MadeBy } from './MadeBy'

function Snow() {
  const flakes = Array.from({ length: 28 }, (_, i) => i)
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {flakes.map((i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 9) * 0.35}s`,
            animationDuration: `${7 + (i % 5)}s`,
            fontSize: `${10 + (i % 8)}px`,
            opacity: 0.35 + (i % 5) * 0.1,
          }}
        >
          *
        </span>
      ))}
    </div>
  )
}

export function HomePage({
  hustlers,
  clockedIn,
  celebrating,
  onClockIn,
  onOpenProgress,
}: {
  hustlers: VisitorSnapshot
  clockedIn: boolean
  celebrating: boolean
  onClockIn: () => void
  onOpenProgress: () => void
}) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#1e3a4c] via-[#244a3a] to-[#1a2e24] px-5 py-10 text-center text-white shadow-[0_16px_40px_rgba(28,25,23,0.18)]">
      {celebrating ? <Snow /> : null}

      <div className="relative z-10 mb-4 flex justify-end">
        <MadeBy light />
      </div>

      <p className="text-xs font-extrabold tracking-[0.2em] text-emerald-200/80 uppercase">
        Winter Arc 2026
      </p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
        {clockedIn ? "You're on the ice." : 'Show up today.'}
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-emerald-50/80">
        {clockedIn
          ? 'Clocked in. The mountain does not care about yesterday — only that you came back.'
          : 'Clock In to join everyone else grinding this winter.'}
      </p>

      <div className="mx-auto mt-6 w-fit rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
        <p className="text-[11px] font-bold tracking-wide text-emerald-100/80 uppercase">
          Total hustlers today
        </p>
        <p className="text-4xl font-extrabold">
          {hustlers.ready && hustlers.count !== null
            ? formatHustlers(hustlers.count, hustlers.capped)
            : '—'}
        </p>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-center">
        <button
          type="button"
          disabled={clockedIn}
          onClick={onClockIn}
          className={`w-full rounded-full py-4 text-lg font-extrabold shadow-lg transition ${
            clockedIn
              ? 'cursor-not-allowed bg-white/20 text-white/80'
              : 'bg-white text-[#1a2e24] hover:scale-[1.02]'
          }`}
        >
          {clockedIn ? 'Clocked in. Come back tomorrow' : 'Clock In'}
        </button>
        <div className="mt-4 flex h-6 items-center justify-center">
          {clockedIn ? (
            <button
              type="button"
              onClick={onOpenProgress}
              className="text-sm font-bold text-emerald-100 underline-offset-4 hover:underline"
            >
              Open your progress →
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
