const SESSION_KEY = 'wa_hustlers_session_v2'
const LAST_KEY = 'wa_hustlers_last_v2'
const FRESH_MS = 5 * 60 * 1000

export type VisitorSnapshot = {
  count: number | null
  ready: boolean
  capped: boolean
  frozen?: boolean
  fetchedAt?: number
  utcDate?: string
}

export const CAPPED_HUSTLERS_LABEL = '1k+'

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

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

function parseBody(data: unknown): VisitorSnapshot | null {
  if (!data || typeof data !== 'object') return null
  const body = data as {
    count?: number
    ready?: boolean
    capped?: boolean
    frozen?: boolean
  }
  if (typeof body.count !== 'number') return null
  const capped = body.capped === true || body.count >= 1000
  return {
    count: capped ? 1000 : body.count,
    ready: true,
    capped,
    frozen: body.frozen === true || capped,
    fetchedAt: Date.now(),
    utcDate: utcToday(),
  }
}

function sameUtcDay(snapshot: VisitorSnapshot): boolean {
  if (snapshot.utcDate) return snapshot.utcDate === utcToday()
  if (typeof snapshot.fetchedAt !== 'number') return false
  return new Date(snapshot.fetchedAt).toISOString().slice(0, 10) === utcToday()
}

function emptySnapshot(): VisitorSnapshot {
  return { count: null, ready: false, capped: false }
}

function isPaused(snapshot: VisitorSnapshot): boolean {
  return snapshot.capped || snapshot.frozen === true
}

function isFresh(snapshot: VisitorSnapshot): boolean {
  if (!snapshot.ready || snapshot.count === null) return false
  if (!sameUtcDay(snapshot)) return false
  if (isPaused(snapshot)) return true
  return typeof snapshot.fetchedAt === 'number' && Date.now() - snapshot.fetchedAt < FRESH_MS
}

/** Last count this browser already showed. Used for instant paint, then we refresh. */
export function lastKnownVisitors(): VisitorSnapshot {
  const last =
    readJson(sessionStorage, SESSION_KEY) ??
    readJson(localStorage, LAST_KEY) ??
    emptySnapshot()
  if (isPaused(last) && !sameUtcDay(last)) return emptySnapshot()
  if ((last.utcDate || last.fetchedAt) && !sameUtcDay(last)) return emptySnapshot()
  return last
}

function fetchCount(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer)
  })
}

/** Read today's hustler count. Does not add +1. Skips the network when frozen or still fresh. */
export async function peekVisitors(): Promise<VisitorSnapshot> {
  const last = lastKnownVisitors()
  if (isFresh(last)) return last

  try {
    const res = await fetchCount('/api/visitors')
    if (!res.ok) return last
    const snapshot = parseBody(await res.json())
    if (!snapshot) return last
    remember(snapshot)
    return snapshot
  } catch {
    return last
  }
}

/** Clock-in sync: asks Cloudflare to add +1 for this UTC day. No-ops after 1k+. */
export async function syncClockIn(
  previous: VisitorSnapshot,
): Promise<VisitorSnapshot> {
  if (isPaused(previous) && sameUtcDay(previous)) return previous
  try {
    const res = await fetchCount('/api/visitors', { method: 'POST' })
    if (!res.ok) return previous
    const snapshot = parseBody(await res.json())
    if (!snapshot) return previous
    if (
      previous.count !== null &&
      snapshot.count !== null &&
      snapshot.count < previous.count &&
      !snapshot.capped
    ) {
      return previous
    }
    remember(snapshot)
    return snapshot
  } catch {
    return previous
  }
}

export function bumpLocalCount(current: VisitorSnapshot): VisitorSnapshot {
  if (isPaused(current) && sameUtcDay(current)) return current
  const nextCount = Math.min((current.count ?? 0) + 1, 1000)
  const next: VisitorSnapshot = {
    count: nextCount,
    ready: true,
    capped: nextCount >= 1000,
    frozen: nextCount >= 1000,
    fetchedAt: Date.now(),
    utcDate: utcToday(),
  }
  remember(next)
  return next
}

export function formatGrinding(count: number, capped = false): string {
  return formatHustlers(count, capped)
}
