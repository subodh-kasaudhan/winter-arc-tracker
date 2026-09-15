import type { Checkin, Habit, Progress } from './types'

export const ARC_START = '2026-09-01'
export const ARC_END = '2026-12-31'
export const OCT_START = '2026-10-01'

export function visibleArcStart(hideSeptember: boolean): string {
  return hideSeptember ? OCT_START : ARC_START
}

export const MONTHS = [
  { key: '2026-09', label: 'September', short: 'Sep' },
  { key: '2026-10', label: 'October', short: 'Oct' },
  { key: '2026-11', label: 'November', short: 'Nov' },
  { key: '2026-12', label: 'December', short: 'Dec' },
] as const

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function todayLocal(): string {
  return formatDate(new Date())
}

export function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

export function compareDates(a: string, b: string): number {
  return a.localeCompare(b)
}

export function isInArc(iso: string): boolean {
  return iso >= ARC_START && iso <= ARC_END
}

export function isFuture(iso: string, today: string): boolean {
  return iso > today
}

/** Past and today, in the arc, and on a scheduled weekday. Done days can be cleared. */
export function canToggleDate(
  habit: Habit,
  iso: string,
  today: string,
  done = false,
): boolean {
  if (isFuture(iso, today) || !isInArc(iso)) return false
  return isScheduled(habit, iso) || done
}

export function dow(iso: string): number {
  return parseDate(iso).getDay()
}

export function dayShort(iso: string): string {
  return DAY_SHORT[dow(iso)]
}

export function isScheduled(habit: Habit, iso: string): boolean {
  if (habit.frequency === 'everyday') return true
  return habit.frequency.includes(dow(iso))
}

export function frequencyLabel(habit: Habit): string {
  if (habit.frequency === 'everyday') return 'Everyday'
  const order = [1, 2, 3, 4, 5, 6, 0]
  return order
    .filter((d) => habit.frequency !== 'everyday' && habit.frequency.includes(d))
    .map((d) => DAY_SHORT[d])
    .join(', ')
}

export function mondayOfWeek(iso: string): string {
  const d = parseDate(iso)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return formatDate(d)
}

export function weekDates(today: string): string[] {
  const monday = mondayOfWeek(today)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function currentArcMonth(today: string): string {
  if (today < ARC_START) return MONTHS[0].key
  if (today > ARC_END) return MONTHS[MONTHS.length - 1].key
  return monthKey(today)
}

export function monthDates(key: string): string[] {
  const [y, m] = key.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return Array.from({ length: last }, (_, i) =>
    formatDate(new Date(y, m - 1, i + 1)),
  )
}

export function monthGrid(key: string): (string | null)[] {
  const dates = monthDates(key)
  const startDow = parseDate(dates[0]).getDay()
  const mondayIndex = startDow === 0 ? 6 : startDow - 1
  return [...Array<string | null>(mondayIndex).fill(null), ...dates]
}

export function arcDates(start = ARC_START): string[] {
  const out: string[] = []
  let cursor = start
  while (cursor <= ARC_END) {
    out.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return out
}

export function arcWeekColumns(start = ARC_START): (string | null)[][] {
  const dates = arcDates(start)
  const firstMondayPad = (() => {
    const startDow = parseDate(start).getDay()
    return startDow === 0 ? 6 : startDow - 1
  })()
  const cells: (string | null)[] = [
    ...Array<string | null>(firstMondayPad).fill(null),
    ...dates,
  ]
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7)
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

export function streakFor(
  habit: Habit,
  checkins: Checkin[],
  today: string,
): number {
  const done = new Set(
    checkins.filter((c) => c.habitId === habit.id).map((c) => c.date),
  )
  let cursor = today
  if (!done.has(today) || !isScheduled(habit, today)) {
    cursor = addDays(today, -1)
  }
  let count = 0
  while (cursor >= ARC_START) {
    if (!isScheduled(habit, cursor)) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (!done.has(cursor)) break
    count += 1
    cursor = addDays(cursor, -1)
  }
  return count
}

export function periodProgress(
  habits: Habit[],
  checkins: Checkin[],
  start: string,
  end: string,
  today: string,
): Progress {
  const doneSet = new Set(checkins.map((c) => `${c.habitId}|${c.date}`))
  let scheduled = 0
  let done = 0
  for (const habit of habits) {
    let cursor = start
    while (cursor <= end) {
      if (cursor <= today && isInArc(cursor) && isScheduled(habit, cursor)) {
        scheduled += 1
        if (doneSet.has(`${habit.id}|${cursor}`)) done += 1
      }
      cursor = addDays(cursor, 1)
    }
  }
  return { done, scheduled }
}

export function percent(progress: Progress): number {
  if (progress.scheduled === 0) return 0
  return Math.round((progress.done / progress.scheduled) * 100)
}

export function hasCheckin(
  checkins: Checkin[],
  habitId: string,
  date: string,
): boolean {
  return checkins.some((c) => c.habitId === habitId && c.date === date)
}
