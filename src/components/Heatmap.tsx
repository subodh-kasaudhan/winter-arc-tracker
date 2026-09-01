import {
  arcWeekColumns,
  hasCheckin,
  isInArc,
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
  dimPrep,
}: {
  date: string | null
  habit: Habit
  checkins: Checkin[]
  today: string
  onToggle: (date: string) => void
  dimPrep?: boolean
}) {
  if (!date) {
    return <span className="h-3 w-3 rounded-[4px] bg-transparent" />
  }
  const scheduled = isScheduled(habit, date)
  const done = hasCheckin(checkins, habit.id, date)
  const locked = date > today || !isInArc(date) || !scheduled
  const prep = dimPrep && date.startsWith('2026-09')
  return (
    <button
      type="button"
      disabled={locked}
      title={date}
      onClick={() => onToggle(date)}
      className="h-3 w-3 rounded-[4px] disabled:cursor-default"
      style={{
        background: done
          ? habit.color
          : scheduled
            ? `${habit.color}26`
            : '#efeae3',
        outline: date === today ? `1.5px solid ${habit.color}` : undefined,
        opacity: prep && !done ? 0.7 : 1,
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
            dimPrep={monthKey === '2026-09'}
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
                dimPrep
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
