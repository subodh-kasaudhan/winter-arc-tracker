const CLOCK_KEY = 'wa_clock_in_v1'

export type ClockState = {
  utcDate: string | null
  pendingSync: boolean
}

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadClock(): ClockState {
  try {
    const raw = localStorage.getItem(CLOCK_KEY)
    if (!raw) return { utcDate: null, pendingSync: false }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { utcDate: null, pendingSync: false }
    const s = parsed as ClockState
    return {
      utcDate: typeof s.utcDate === 'string' ? s.utcDate : null,
      pendingSync: s.pendingSync === true,
    }
  } catch {
    return { utcDate: null, pendingSync: false }
  }
}

export function saveClock(state: ClockState): void {
  localStorage.setItem(CLOCK_KEY, JSON.stringify(state))
}

export function hasClockedInToday(state: ClockState = loadClock()): boolean {
  return state.utcDate === utcToday()
}

export function markClockedIn(pendingSync: boolean): ClockState {
  const next = { utcDate: utcToday(), pendingSync }
  saveClock(next)
  return next
}

export function markClockSynced(): ClockState {
  const next = { utcDate: utcToday(), pendingSync: false }
  saveClock(next)
  return next
}
