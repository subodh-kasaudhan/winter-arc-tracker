import type { Tab } from './types'

const KEY = 'wa_tab_complete_v1'

type DayRecord = {
  day: string
  tabs: Partial<Record<Tab, true>>
}

function load(day: string): DayRecord {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { day, tabs: {} }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { day, tabs: {} }
    const rec = parsed as DayRecord
    if (rec.day !== day) return { day, tabs: {} }
    return { day, tabs: rec.tabs ?? {} }
  } catch {
    return { day, tabs: {} }
  }
}

export function hasCelebratedTab(day: string, tab: Tab): boolean {
  return load(day).tabs[tab] === true
}

export function markCelebratedTab(day: string, tab: Tab): void {
  const rec = load(day)
  rec.tabs[tab] = true
  localStorage.setItem(KEY, JSON.stringify(rec))
}
