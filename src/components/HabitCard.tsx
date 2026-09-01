import { frequencyLabel, hasCheckin, streakFor } from '../lib/dates'
import { HabitGlyph } from '../lib/icons'
import type { Checkin, Habit, Tab } from '../lib/types'
import { ArcHeatmap, MonthHeatmap } from './Heatmap'
import { WeekDots } from './WeekDots'

function hexToSoft(hex: string): string {
  return `${hex}1a`
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M4 20h4l10-10-4-4L4 16v4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 6l4 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
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
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white"
          style={{ color: habit.color }}
        >
          <HabitGlyph name={habit.icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-extrabold text-ink">
                {habit.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-muted">
                <span aria-hidden>🔥</span>
                {streak} {streak === 1 ? 'Day' : 'Days'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="grid h-8 w-8 place-items-center rounded-full bg-white text-muted shadow-sm"
                aria-label={`Edit ${habit.name}`}
              >
                <PencilIcon />
              </button>
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
                <span className="max-w-[7.5rem] text-right text-[11px] font-bold leading-snug text-muted">
                  {frequencyLabel(habit)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {tab === 'today' || tab === 'weekly' ? (
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
