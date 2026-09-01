import { useEffect, useMemo, useState } from 'react'
import { Drawer } from './components/Drawer'
import { HabitCard } from './components/HabitCard'
import { HabitForm } from './components/HabitForm'
import { ProgressPie } from './components/ProgressPie'
import {
  ARC_END,
  ARC_START,
  addDays,
  currentArcMonth,
  monthDates,
  MONTHS,
  periodProgress,
  todayLocal,
  weekDates,
} from './lib/dates'
import { downloadBackup, importStore, loadStore, resetStore, saveStore } from './lib/storage'
import type { Habit, Store, Tab } from './lib/types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Week' },
  { id: 'monthly', label: 'Month' },
  { id: 'arc', label: 'Arc' },
]

export default function App() {
  const [store, setStore] = useState<Store>(() => loadStore())
  const [tab, setTab] = useState<Tab>('today')
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState<Habit | null | 'new'>(null)
  const [month, setMonth] = useState(() => currentArcMonth(todayLocal()))
  const [visitorCount, setVisitorCount] = useState<number | null>(null)
  const [visitorsReady, setVisitorsReady] = useState(false)
  const today = todayLocal()
  const week = useMemo(() => weekDates(today), [today])

  useEffect(() => {
    saveStore(store)
  }, [store])

  useEffect(() => {
    void fetch('/api/visitors')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { count?: number }) => {
        if (typeof data.count === 'number') {
          setVisitorCount(data.count)
          setVisitorsReady(true)
        }
      })
      .catch(() => {
        setVisitorsReady(false)
      })
  }, [])

  function update(next: Store) {
    setStore(next)
  }

  function toggleCheckin(habitId: string, date: string) {
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
    return { start: ARC_START, end: ARC_END, label: 'Full Winter Arc' }
  }, [tab, today, week, month])

  const progress = periodProgress(
    store.habits,
    store.checkins,
    range.start,
    range.end,
    today,
  )

  const showPrep = today >= ARC_START && today <= addDays(ARC_START, 29)

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-paper shadow-[0_0_0_1px_rgba(28,25,23,0.04)] md:min-h-[100dvh] md:shadow-xl">
        <header className="sticky top-0 z-20 bg-paper/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
          <div className="flex items-center justify-between">
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
            <h1 className="text-xl font-extrabold tracking-tight">
              Winter <span className="text-leaf">Arc</span>
            </h1>
            <div
              className="grid h-9 w-9 place-items-center rounded-full bg-medal text-sm font-extrabold text-white"
              title="Winter Arc 2026"
            >
              26
            </div>
          </div>

          <div className="mt-3 flex rounded-full bg-white p-1 shadow-sm">
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
        </header>

        <main className="flex flex-1 flex-col gap-3 px-4 pb-28">
          {showPrep && tab === 'today' ? (
            <p className="rounded-2xl bg-medal/15 px-3 py-2 text-xs font-bold text-amber-800">
              September is prep month — build the rhythm first.
            </p>
          ) : null}

          <section className="rounded-[28px] bg-white p-4 shadow-[0_8px_24px_rgba(28,25,23,0.06)]">
            <ProgressPie progress={progress} label={range.label} />
          </section>

          {tab === 'monthly' ? (
            <div className="flex gap-1 overflow-x-auto">
              {MONTHS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMonth(m.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold whitespace-nowrap ${
                    month === m.key ? 'bg-leaf text-white' : 'bg-white text-muted'
                  }`}
                >
                  {m.short}
                  {m.prep ? ' · Prep' : ''}
                </button>
              ))}
            </div>
          ) : null}

          {store.habits.length === 0 ? (
            <p className="py-10 text-center text-sm font-semibold text-muted">
              No habits yet. Tap + to add one.
            </p>
          ) : (
            store.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkins={store.checkins}
                today={today}
                tab={tab}
                weekDates={week}
                monthKey={month}
                onToggle={(date) => toggleCheckin(habit.id, date)}
                onEdit={() => setForm(habit)}
              />
            ))
          )}
        </main>

        <button
          type="button"
          onClick={() => setForm('new')}
          className="fixed right-[max(1.25rem,calc(50%-240px+1.25rem))] bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 grid h-14 w-14 place-items-center rounded-full bg-leaf text-3xl font-medium text-ink shadow-lg"
          aria-label="Add habit"
        >
          +
        </button>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        visitorCount={visitorCount}
        visitorsReady={visitorsReady}
        onExport={() => downloadBackup(store)}
        onImport={(text) => {
          try {
            update(importStore(text))
            setMenuOpen(false)
          } catch {
            alert('That file is not a valid Winter Arc backup.')
          }
        }}
        onReset={() => {
          if (confirm('Reset all habits and check-ins on this device?')) {
            update(resetStore())
            setMenuOpen(false)
          }
        }}
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
    </div>
  )
}
