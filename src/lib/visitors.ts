const SESSION_KEY = 'wa_hustlers_session_v1'
const LAST_KEY = 'wa_hustlers_last_v1'

export type VisitorSnapshot = {
  count: number | null
  ready: boolean
  capped: boolean
}

export const CAPPED_HUSTLERS_LABEL = '1k+'

export function formatHustlers(count: number, capped = false): string {
  if (capped || count >= 1000) return CAPPED_HUSTLERS_LABEL
  return String(Math.max(0, Math.round(count)))
}

function isSnapshot(value: unknown): value is VisitorSnapshot {
  if (!value || typeof value !== 'object') return false
  const s = value as VisitorSnapshot
  if (typeof s.ready !== 'boolean' || typeof s.capped !== 'boolean') return false
  return s.count === null || typeof s.count === 'number'
}

function readJson(storage: Storage, key: string): VisitorSnapshot | null {
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isSnapshot(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeJson(storage: Storage, key: string, snapshot: VisitorSnapshot): void {
  try {
    storage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function remember(snapshot: VisitorSnapshot): void {
  writeJson(sessionStorage, SESSION_KEY, snapshot)
  if (snapshot.ready) writeJson(localStorage, LAST_KEY, snapshot)
}

export async function loadVisitors(): Promise<VisitorSnapshot> {
  const session = readJson(sessionStorage, SESSION_KEY)
  if (session) return session

  const last = readJson(localStorage, LAST_KEY)
  if (last?.capped) {
    writeJson(sessionStorage, SESSION_KEY, last)
    return last
  }

  const fallback: VisitorSnapshot = last ?? { count: null, ready: false, capped: false }

  try {
    const res = await fetch('/api/visitors')
    if (!res.ok) {
      remember(fallback)
      return fallback
    }
    const data: unknown = await res.json()
    if (!data || typeof data !== 'object') {
      remember(fallback)
      return fallback
    }
    const body = data as { count?: number; ready?: boolean; capped?: boolean }
    if (typeof body.count !== 'number') {
      remember(fallback)
      return fallback
    }
    const snapshot: VisitorSnapshot = {
      count: body.count,
      ready: true,
      capped: body.capped === true || body.count >= 1000,
    }
    remember(snapshot)
    return snapshot
  } catch {
    remember(fallback)
    return fallback
  }
}

export function formatGrinding(count: number, capped = false): string {
  return formatHustlers(count, capped)
}
