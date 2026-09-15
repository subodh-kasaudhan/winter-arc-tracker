import { useEffect, useMemo, useRef, useState } from 'react'
import { CreditsPage } from './components/CreditsPage'
import { DataCenter } from './components/DataCenter'
import { Drawer } from './components/Drawer'
import { HabitCard } from './components/HabitCard'
import { HabitForm } from './components/HabitForm'
import { HomePage } from './components/HomePage'
import { MadeBy } from './components/MadeBy'
import { ProgressPie } from './components/ProgressPie'
import { WinterBurst } from './components/WinterBurst'
import {
  hasClockedInToday,
  loadClock,
  markClockedIn,
  markClockSynced,
} from './lib/clock'
import { hasCelebratedTab, markCelebratedTab } from './lib/celebrate'
import {
  ARC_END,
  canToggleDate,
  currentArcMonth,
  monthDates,
  MONTHS,
  percent,
  periodProgress,
  todayLocal,
  visibleArcStart,
  weekDates,
} from './lib/dates'
import { downloadBackup, importStore, loadStore, resetStore, saveStore } from './lib/storage'
import { applyTheme, loadTheme, type Theme } from './lib/theme'
import type { Habit, Page, Store, Tab } from './lib/types'
import {
  bumpLocalCount,
  lastKnownVisitors,
  peekVisitors,
  syncClockIn,
  type VisitorSnapshot,
} from './lib/visitors'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Week' },
  { id: 'monthly', label: 'Month' },
  { id: 'arc', label: 'Arc' },
]

export default function App() {
  const [store, setStore] = useState<Store>(() => loadStore())
  const [page, setPage] = useState<Page>('home')
  const [tab, setTab] = useState<Tab>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState<Habit | null | 'new'>(null)
  const [month, setMonth] = useState(() => currentArcMonth(todayLocal()))
  const [hustlers, setHustlers] = useState<VisitorSnapshot>(lastKnownVisitors)
  const [clockedIn, setClockedIn] = useState(() => hasClockedInToday())
  const [celebrating, setCelebrating] = useState(() => hasClockedInToday())
  const [theme, setTheme] = useState<Theme>(() => loadTheme())
  const [winterBurst, setWinterBurst] = useState(false)
  const [completeBurst, setCompleteBurst] = useState(false)
  const seenProgress = useRef<Partial<Record<Tab, number>>>({})
  const today = todayLocal()
  const week = useMemo(() => weekDates(today), [today])

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    let cancelled = false

    async function refreshCount() {
      const next = await peekVisitors()
      if (!cancelled) setHustlers(next)
    }

    void refreshCount()

    const clock = loadClock()
    const known = lastKnownVisitors()
    if (clock.pendingSync && hasClockedInToday(clock) && !known.capped && !known.frozen) {
      void syncClockIn(known).then((next) => {
        if (cancelled) return
        setHustlers(next)
        if (next.ready) markClockSynced()
      })
    }

    return () => {
      cancelled = true
    }
  }, [])

  function update(next: Store) {
    setStore(next)
  }

  function go(next: Page) {
    setPage(next)
    setMenuOpen(false)
  }

  async function handleClockIn() {
    if (hasClockedInToday()) return
    const skipNetwork = hustlers.capped || hustlers.frozen === true
    markClockedIn(!skipNetwork)
    setClockedIn(true)
    setCelebrating(true)
    if (skipNetwork) {
      markClockSynced()
      return
    }
    const local = bumpLocalCount(hustlers)
    setHustlers(local)
    const synced = await syncClockIn(local)
    setHustlers(synced)
    if (synced.ready) markClockSynced()
  }

  function toggleCheckin(habitId: string, date: string) {
    const habit = store.habits.find((h) => h.id === habitId)
    const done = store.checkins.some((c) => c.habitId === habitId && c.date === date)
    if (!habit || !canToggleDate(habit, date, today, done)) return
    const exists = store.checkins.some(
      (c) => c.habitId === habitId && c.date === date,
    )
    update({
      ...store,
      checkins: exists
        ? store.checkins.filter((c) => !(c.habitId === habitId && c.date === date))
        : [...store.checkins, { habitId, date }],
    })
  }

  const range = useMemo(() => {
    if (tab === 'today') return { start: today, end: today, label: "Today's progress" }
    if (tab === 'weekly') {
      return { start: week[0], end: week[6], label: "This week's progress" }
    }
    if (tab === 'monthly') {
      const days = monthDates(month)
      return {
        start: days[0],
        end: days[days.length - 1],
        label: `${MONTHS.find((m) => m.key === month)?.label ?? 'Month'} progress`,
      }
    }
    return {
      start: visibleArcStart(store.hideSeptember),
      end: ARC_END,
      label: store.hideSeptember ? 'Winter Arc(Oct – Dec)' : 'Full Winter Arc',
    }
  }, [tab, today, week, month, store.hideSeptember])

  const progress = periodProgress(
    store.habits,
    store.checkins,
    range.start,
    range.end,
    today,
  )
  const progressPct = percent(progress)

  useEffect(() => {
    if (page !== 'progress') return
    const prev = seenProgress.current[tab] ?? 0
    seenProgress.current[tab] = progressPct
    if (progress.scheduled === 0 || progressPct < 100 || prev >= 100) return
    if (hasCelebratedTab(today, tab)) return
    markCelebratedTab(today, tab)
    setCompleteBurst(true)
    const id = window.setTimeout(() => setCompleteBurst(false), 5000)
    return () => window.clearTimeout(id)
  }, [page, tab, progressPct, progress.scheduled, today])

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper">
      <div className="mx-auto flex min-h-dvh w-full min-w-0 max-w-[480px] flex-col bg-paper shadow-[0_0_0_1px_rgba(28,25,23,0.04)] lg:max-w-none lg:shadow-none">
        <header className="sticky top-0 z-20 bg-paper/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between lg:max-w-none">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center text-leaf"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
              Winter Arc <span className="text-leaf">Tracker</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-card text-ink"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M16 3a8 8 0 1 0 5 13 7 7 0 0 1-5-13Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (winterBurst) return
                  setWinterBurst(true)
                  window.setTimeout(() => setWinterBurst(false), 5000)
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-medal text-white"
                aria-label="Winter burst"
                title="Let it snow"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <g
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v18" />
                    <path d="m5.4 7.1 13.2 9.8" />
                    <path d="m18.6 7.1-13.2 9.8" />
                    <path d="M9.2 5 12 7.4 14.8 5" />
                    <path d="M9.2 19 12 16.6 14.8 19" />
                    <path d="m5 10.8 2.8-.8.8 2.8" />
                    <path d="m19 13.2-2.8.8-.8-2.8" />
                    <path d="m19 10.8-2.8-.8-.8 2.8" />
                    <path d="m5 13.2 2.8.8.8-2.8" />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          {page === 'progress' ? (
            <div className="mt-3 flex rounded-full bg-card p-1 shadow-sm lg:max-w-md">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`min-w-0 flex-1 rounded-full py-2 text-xs font-extrabold transition ${
                    tab === t.id ? 'bg-leaf text-white' : 'text-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
        </header>

        <main className="flex min-w-0 flex-1 flex-col gap-3 px-4 pb-28 lg:px-8">
          {page === 'home' ? (
            <HomePage
              hustlers={hustlers}
              clockedIn={clockedIn}
              celebrating={celebrating}
              onClockIn={() => void handleClockIn()}
              onOpenProgress={() => go('progress')}
            />
          ) : null}

          {page === 'credits' ? <CreditsPage /> : null}

          {page === 'data' ? (
            <DataCenter
              onExport={() => downloadBackup(store)}
              onImport={(text) => {
                try {
                  update(importStore(text))
                  setClockedIn(hasClockedInToday())
                  setCelebrating(hasClockedInToday())
                } catch {
                  alert('That file is not a valid Winter Arc backup.')
                }
              }}
              onReset={() => {
                if (confirm('Reset all habits and check-ins on this device?')) {
                  update(resetStore())
                  setClockedIn(false)
                  setCelebrating(false)
                }
              }}
            />
          ) : null}

          {page === 'progress' ? (
            <>
              <section className="rounded-[28px] bg-card p-4 shadow-[0_8px_24px_rgba(28,25,23,0.06)] lg:px-6">
                <div className="mb-3 flex justify-end">
                  <MadeBy />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <ProgressPie progress={progress} label={range.label} />
                  </div>
                  {tab === 'arc' ? (
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-right text-sm font-bold text-ink">
                      <span>
                        <span className="block">Hide September</span>
                        <span className="block text-xs font-semibold text-muted">
                          Arc shows Oct–Dec
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 accent-leaf"
                        checked={store.hideSeptember}
                        onChange={(e) =>
                          update({ ...store, hideSeptember: e.target.checked })
                        }
                      />
                    </label>
                  ) : null}
                </div>
              </section>

              {tab === 'monthly' ? (
                <div className="flex gap-1 overflow-x-auto">
                  {MONTHS.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMonth(m.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap ${
                        month === m.key ? 'bg-leaf text-white' : 'bg-card text-muted'
                      }`}
                    >
                      {m.short}
                    </button>
                  ))}
                </div>
              ) : null}

              {store.habits.length === 0 ? (
                <p className="py-10 text-center text-sm font-semibold text-muted">
                  No habits yet. Tap + to add one.
                </p>
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {store.habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      checkins={store.checkins}
                      today={today}
                      tab={tab}
                      weekDates={week}
                      monthKey={month}
                      hideSeptember={store.hideSeptember}
                      onToggle={(date) => toggleCheckin(habit.id, date)}
                      onEdit={() => setForm(habit)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </main>

        {page === 'progress' ? (
          <button
            type="button"
            onClick={() => setForm('new')}
            className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 grid h-14 w-14 place-items-center rounded-full bg-leaf text-3xl font-medium text-ink shadow-lg lg:right-8 lg:bottom-8"
            aria-label="Add habit"
          >
            +
          </button>
        ) : null}
      </div>

      <Drawer
        open={menuOpen}
        page={page}
        onClose={() => setMenuOpen(false)}
        onGo={go}
        hustlers={hustlers}
      />

      {form ? (
        <HabitForm
          initial={form === 'new' ? undefined : form}
          onClose={() => setForm(null)}
          onSave={(draft) => {
            if (draft.id) {
              update({
                ...store,
                habits: store.habits.map((h) =>
                  h.id === draft.id
                    ? { ...h, name: draft.name, icon: draft.icon, color: draft.color, frequency: draft.frequency }
                    : h,
                ),
              })
            } else {
              update({
                ...store,
                habits: [
                  ...store.habits,
                  {
                    id: crypto.randomUUID(),
                    name: draft.name,
                    icon: draft.icon,
                    color: draft.color,
                    frequency: draft.frequency,
                    createdAt: today,
                  },
                ],
              })
            }
            setForm(null)
          }}
          onDelete={
            form !== 'new'
              ? () => {
                  const id = form.id
                  update({
                    ...store,
                    habits: store.habits.filter((h) => h.id !== id),
                    checkins: store.checkins.filter((c) => c.habitId !== id),
                  })
                  setForm(null)
                }
              : undefined
          }
        />
      ) : null}

      {completeBurst ? (
        <WinterBurst message="Congratulations! Come back tomorrow" />
      ) : winterBurst ? (
        <WinterBurst />
      ) : null}
    </div>
  )
}
