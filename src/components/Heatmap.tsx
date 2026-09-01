import {
  arcWeekColumns,
  canToggleDate,
  hasCheckin,
  isScheduled,
  monthGrid,
} from '../lib/dates'
import type { Checkin, Habit } from '../lib/types'

function Cell({
  date,
  habit,
  checkins,
  today,
  onToggle,
}: {
  date: string | null
  habit: Habit
  checkins: Checkin[]
  today: string
  onToggle: (date: string) => void
}) {
  if (!date) {
    return <span className="h-4 w-4 rounded-[5px] bg-transparent lg:h-5 lg:w-5" />
  }
  const scheduled = isScheduled(habit, date)
  const done = hasCheckin(checkins, habit.id, date)
  const locked = !canToggleDate(habit, date, today, done)
  return (
    <button
      type="button"
      disabled={locked}
      title={locked ? `${date} (off schedule)` : date}
      onClick={() => onToggle(date)}
      className="h-4 w-4 rounded-[5px] disabled:cursor-not-allowed lg:h-5 lg:w-5"
      style={{
        background: done
          ? habit.color
          : scheduled
            ? `${habit.color}26`
            : '#efeae3',
        outline: date === today ? `1.5px solid ${habit.color}` : undefined,
        opacity: locked && !done ? 0.35 : 1,
      }}
    />
  )
}

export function MonthHeatmap({
  habit,
  monthKey,
  checkins,
  today,
  onToggle,
}: {
  habit: Habit
  monthKey: string
  checkins: Checkin[]
  today: string
  onToggle: (date: string) => void
}) {
  const grid = monthGrid(monthKey)
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="mt-3">
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-1">
        {grid.map((date, i) => (
          <Cell
            key={date ?? `empty-${i}`}
            date={date}
            habit={habit}
            checkins={checkins}
            today={today}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

export function ArcHeatmap({
  habit,
  checkins,
  today,
  onToggle,
}: {
  habit: Habit
  checkins: Checkin[]
  today: string
  onToggle: (date: string) => void
}) {
  const weeks = arcWeekColumns()
  return (
    <div className="mt-3 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date, di) => (
              <Cell
                key={date ?? `e-${wi}-${di}`}
                date={date}
                habit={habit}
                checkins={checkins}
                today={today}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
