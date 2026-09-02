import type { Habit, Store } from './types'
import { clearClock, loadClock, saveClock, type ClockState } from './clock'

export const STORAGE_KEY = 'winter-arc-2026'

export const PRESET_HABITS: Habit[] = [
  {
    id: 'wake-early',
    name: 'Wake early',
    icon: 'sun',
    color: '#f59e0b',
    frequency: 'everyday',
    createdAt: '2026-09-01',
  },
  {
    id: 'gym',
    name: 'Gym',
    icon: 'dumbbell',
    color: '#4f7cff',
    frequency: 'everyday',
    createdAt: '2026-09-01',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: 'lotus',
    color: '#3d9b4a',
    frequency: 'everyday',
    createdAt: '2026-09-01',
  },
  {
    id: 'study',
    name: 'Study',
    icon: 'book',
    color: '#c45c6a',
    frequency: 'everyday',
    createdAt: '2026-09-01',
  },
  {
    id: 'no-sugar',
    name: 'No sugar',
    icon: 'leaf',
    color: '#a855f7',
    frequency: 'everyday',
    createdAt: '2026-09-01',
  },
]

export const HABIT_COLORS = [
  '#4f7cff',
  '#3d9b4a',
  '#c45c6a',
  '#f59e0b',
  '#a855f7',
  '#0ea5e9',
  '#ef4444',
  '#14b8a6',
]

function emptyStore(): Store {
  return {
    habits: PRESET_HABITS.map((h) => ({ ...h })),
    checkins: [],
    seeded: true,
  }
}

function isStore(value: unknown): value is Store {
  if (!value || typeof value !== 'object') return false
  const s = value as Store
  return Array.isArray(s.habits) && Array.isArray(s.checkins)
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    const parsed: unknown = JSON.parse(raw)
    if (!isStore(parsed)) return emptyStore()
    if (!parsed.seeded && parsed.habits.length === 0) return emptyStore()
    return parsed
  } catch {
    return emptyStore()
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function resetStore(): Store {
  const next = emptyStore()
  saveStore(next)
  clearClock()
  return next
}

function readClock(value: unknown): ClockState | null {
  if (!value || typeof value !== 'object') return null
  const c = value as ClockState
  if (c.utcDate !== null && typeof c.utcDate !== 'string') return null
  return {
    utcDate: typeof c.utcDate === 'string' ? c.utcDate : null,
    pendingSync: false,
  }
}

export function exportStore(store: Store): string {
  return JSON.stringify({ ...store, clock: loadClock() }, null, 2)
}

export function importStore(raw: string): Store {
  const parsed: unknown = JSON.parse(raw)
  if (!isStore(parsed)) throw new Error('Invalid backup file')
  const next: Store = {
    habits: parsed.habits,
    checkins: parsed.checkins,
    seeded: true,
  }
  saveStore(next)
  const clock = readClock((parsed as { clock?: unknown }).clock)
  if (clock) saveClock(clock)
  return next
}

export function downloadBackup(store: Store): void {
  const blob = new Blob([exportStore(store)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'winter-arc-2026-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}
