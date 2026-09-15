import {
  arcWeekColumns,
  canToggleDate,
  hasCheckin,
  isScheduled,
  monthGrid,
  visibleArcStart,
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
    return <span className="aspect-square w-full min-w-0" />
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
      className="heat-cell aspect-square w-full min-w-0 rounded-[5px] p-0 disabled:cursor-not-allowed"
      style={{
        background: done
          ? habit.color
          : scheduled
            ? `${habit.color}26`
            : '#efeae3',
        boxShadow: date === today ? `inset 0 0 0 1.5px ${habit.color}` : undefined,
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
    <div className="mt-3 w-full min-w-0">
      <div className="mb-1 grid grid-cols-7 gap-[3px] text-center text-[10px] font-bold text-muted">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[3px]">
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
  hideSeptember = false,
  onToggle,
}: {
  habit: Habit
  checkins: Checkin[]
  today: string
  hideSeptember?: boolean
  onToggle: (date: string) => void
}) {
  const weeks = arcWeekColumns(visibleArcStart(hideSeptember))
  return (
    <div className="mt-3 w-full min-w-0">
      <div
        className="grid w-full gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="grid min-w-0 grid-rows-7 gap-[2px]">
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
