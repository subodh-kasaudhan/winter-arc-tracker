import { canToggleDate, dayShort, hasCheckin, isScheduled } from '../lib/dates'
import type { Checkin, Habit } from '../lib/types'

export function WeekDots({
  habit,
  dates,
  checkins,
  today,
  onToggle,
}: {
  habit: Habit
  dates: string[]
  checkins: Checkin[]
  today: string
  onToggle: (date: string) => void
}) {
  return (
    <div className="mt-4 grid grid-cols-7 gap-1">
      {dates.map((date) => {
        const scheduled = isScheduled(habit, date)
        const done = hasCheckin(checkins, habit.id, date)
        const locked = !canToggleDate(habit, date, today, done)
        return (
          <div key={date} className="flex min-w-0 flex-col items-center">
            <span className="text-[10px] font-semibold text-muted">
              {dayShort(date)}
            </span>
            <button
              type="button"
              disabled={locked}
              onClick={() => onToggle(date)}
              className="mt-0.5 flex w-full min-w-0 items-center justify-center p-0 disabled:cursor-not-allowed"
              aria-label={`${habit.name} ${date}`}
            >
              <span
                className="grid aspect-square w-full max-w-9 place-items-center rounded-full text-white"
                style={{
                  background: done
                    ? habit.color
                    : scheduled
                      ? `${habit.color}33`
                      : '#ece8e1',
                  opacity: locked && !done ? 0.45 : 1,
                }}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                    <path
                      d="M5 12.5 9.5 17 19 7"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
