import { frequencyLabel, hasCheckin, streakFor } from '../lib/dates'
import { HabitGlyph } from '../lib/icons'
import type { Checkin, Habit, Tab } from '../lib/types'
import { ArcHeatmap, MonthHeatmap } from './Heatmap'
import { WeekDots } from './WeekDots'

function hexToSoft(hex: string): string {
  return `${hex}1a`
}

export function HabitCard({
  habit,
  checkins,
  today,
  tab,
  weekDates,
  monthKey,
  onToggle,
  onEdit,
}: {
  habit: Habit
  checkins: Checkin[]
  today: string
  tab: Tab
  weekDates: string[]
  monthKey: string
  onToggle: (date: string) => void
  onEdit: () => void
}) {
  const streak = streakFor(habit, checkins, today)
  const todayDone = hasCheckin(checkins, habit.id, today)
  const pastel = tab === 'weekly' || tab === 'today'

  return (
    <article
      className="rounded-[28px] p-4 shadow-[0_8px_24px_rgba(28,25,23,0.06)]"
      style={{ background: pastel ? hexToSoft(habit.color) : '#fff' }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white"
          style={{ color: habit.color }}
          aria-label={`Edit ${habit.name}`}
        >
          <HabitGlyph name={habit.icon} className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate text-[17px] font-extrabold text-ink">
                {habit.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-muted">
                <span aria-hidden>🔥</span>
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </p>
            </div>
            {tab === 'today' ? (
              <button
                type="button"
                onClick={() => onToggle(today)}
                className="grid h-10 w-10 place-items-center rounded-full"
                style={{
                  background: todayDone ? habit.color : `${habit.color}33`,
                }}
                aria-label={todayDone ? 'Mark incomplete' : 'Mark complete'}
              >
                {todayDone ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path
                      d="M5 12.5 9.5 17 19 7"
                      stroke="white"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </button>
            ) : (
              <span className="max-w-[42%] text-right text-[11px] font-bold leading-snug text-muted">
                {frequencyLabel(habit)}
              </span>
            )}
          </div>
        </div>
      </div>

      {tab === 'weekly' ? (
        <WeekDots
          habit={habit}
          dates={weekDates}
          checkins={checkins}
          today={today}
          onToggle={onToggle}
        />
      ) : null}
      {tab === 'monthly' ? (
        <MonthHeatmap
          habit={habit}
          monthKey={monthKey}
          checkins={checkins}
          today={today}
          onToggle={onToggle}
        />
      ) : null}
      {tab === 'arc' ? (
        <ArcHeatmap
          habit={habit}
          checkins={checkins}
          today={today}
          onToggle={onToggle}
        />
      ) : null}
    </article>
  )
}
