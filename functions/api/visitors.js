function parseCookie(header, name) {
  if (!header) return null
  const parts = header.split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return null
}

const STATS_KEY = 'visitor_stats'
const CACHE_URL = 'https://winter-arc.internal/hustlers_today'
const COUNT_CAP = 1000
const COOKIE_MAX_AGE = 86400
const LIVE_CACHE_SECONDS = 1800

function utcDate(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

function secondsUntilUtcMidnight(now = new Date()) {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  )
  return Math.max(60, Math.floor((next - now.getTime()) / 1000))
}

function normalizeStats(raw) {
  let parsed = {}
  if (raw) {
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch {
      const n = Number(raw)
      if (Number.isFinite(n)) parsed = { today: n }
    }
  }
  const today = utcDate()
  const count = parsed.dayKey === today ? Number(parsed.today) || 0 : 0
  return { dayKey: today, today: count }
}

function payload(stats) {
  const count = Math.min(stats.today, COUNT_CAP)
  return { count, ready: true, capped: count >= COUNT_CAP }
}

function json(body, extraHeaders = {}, status = 200) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...extraHeaders,
  })
  return new Response(JSON.stringify(body), { headers, status })
}

function cacheControl(capped) {
  const maxAge = capped ? secondsUntilUtcMidnight() : LIVE_CACHE_SECONDS
  return `public, max-age=${maxAge}, s-maxage=${maxAge}`
}

async function readCachedStats() {
  try {
    const hit = await caches.default.match(CACHE_URL)
    if (!hit) return null
    const stats = normalizeStats(await hit.text())
    if (stats.dayKey !== utcDate()) return null
    return stats
  } catch {
    return null
  }
}

async function writeCachedStats(stats) {
  try {
    const capped = stats.today >= COUNT_CAP
    await caches.default.put(
      CACHE_URL,
      new Response(JSON.stringify(stats), {
        headers: { 'Cache-Control': cacheControl(capped) },
      }),
    )
  } catch {
    // Cache is optional.
  }
}

function markSeen(headers) {
  headers.append(
    'Set-Cookie',
    `wa_vid=${crypto.randomUUID()}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`,
  )
}

export async function onRequestGet(context) {
  const { request, env } = context

  if (!env.VISITORS) {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }

  const existing = parseCookie(request.headers.get('Cookie'), 'wa_vid')
  const cached = await readCachedStats()

  // After 1k+, bots and spikes get 1k+ from cache. No KV read or write.
  if (cached && cached.today >= COUNT_CAP) {
    return json(payload(cached), { 'Cache-Control': cacheControl(true) })
  }

  // Returning browser: reuse today's cached count. No KV.
  if (existing && cached) {
    return json(payload(cached), { 'Cache-Control': 'private, max-age=60' })
  }

  let stats
  try {
    stats = cached ?? normalizeStats(await env.VISITORS.get(STATS_KEY))
  } catch {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }

  if (stats.today >= COUNT_CAP) {
    await writeCachedStats(stats)
    return json(payload(stats), { 'Cache-Control': cacheControl(true) })
  }

  if (!existing) {
    stats.today += 1
    try {
      await env.VISITORS.put(STATS_KEY, JSON.stringify(stats))
    } catch {
      await writeCachedStats({ ...stats, today: COUNT_CAP })
      return json(
        { count: COUNT_CAP, ready: true, capped: true },
        { 'Cache-Control': cacheControl(true) },
      )
    }
  }

  await writeCachedStats(stats)

  const body = payload(stats)
  const headers = {
    'Cache-Control': body.capped ? cacheControl(true) : 'no-store',
  }
  const res = json(body, headers)
  // Only stamp a cookie while we are still counting. After the cap,
  // skip Set-Cookie so the 1k+ response can stay in the edge cache.
  if (!existing && !body.capped) {
    markSeen(res.headers)
  }
  return res
}
