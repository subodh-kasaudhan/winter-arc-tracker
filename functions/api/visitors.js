const STATS_KEY = 'visitor_stats'
const CACHE_URL = 'https://winter-arc.internal/hustlers_today'
const COUNT_CAP = 1000
const LIVE_CACHE_SECONDS = 300

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
  const frozen = parsed.dayKey === today && parsed.frozen === true
  return { dayKey: today, today: count, frozen }
}

function atCap(stats) {
  return Boolean(stats && (stats.frozen || stats.today >= COUNT_CAP))
}

function payload(stats) {
  const capped = atCap(stats)
  return {
    count: capped ? COUNT_CAP : Math.max(0, stats?.today || 0),
    ready: true,
    capped,
    frozen: capped,
  }
}

function cacheControl(untilMidnight) {
  const maxAge = untilMidnight ? secondsUntilUtcMidnight() : LIVE_CACHE_SECONDS
  return `public, max-age=${maxAge}, s-maxage=${maxAge}`
}

function json(body, extraHeaders = {}) {
  const untilMidnight = body.capped === true || body.frozen === true
  const cc = extraHeaders['Cache-Control'] || cacheControl(untilMidnight)
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...extraHeaders,
  })
  headers.set('Cache-Control', cc)
  headers.set('CDN-Cache-Control', cc)
  return new Response(JSON.stringify(body), { headers })
}

function hasClockCookie(request) {
  const header = request.headers.get('Cookie') || ''
  return /(?:^|;\s*)wa_clock=/.test(header)
}

function expireClockCookie(headers) {
  headers.append(
    'Set-Cookie',
    'wa_clock=; Max-Age=0; Path=/; SameSite=Lax; Secure',
  )
}

function withCookieCleanup(request, response) {
  if (!hasClockCookie(request)) return response
  const headers = new Headers(response.headers)
  expireClockCookie(headers)
  headers.set('Cache-Control', 'private, max-age=0')
  headers.delete('CDN-Cache-Control')
  return new Response(response.body, { status: response.status, headers })
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
    await caches.default.put(
      CACHE_URL,
      new Response(JSON.stringify(stats), {
        headers: { 'Cache-Control': cacheControl(atCap(stats)) },
      }),
    )
  } catch {
    // Cache is optional.
  }
}

function capStats() {
  return { dayKey: utcDate(), today: COUNT_CAP, frozen: true }
}

async function replyCapped() {
  const next = capStats()
  await writeCachedStats(next)
  return json(payload(next))
}

function lastKnownOrZero(cached) {
  if (cached) return json(payload(cached))
  return json(
    { count: 0, ready: true, capped: false, frozen: false },
    { 'Cache-Control': cacheControl(false) },
  )
}

export async function onRequestGet(context) {
  const { request, env } = context
  try {
    const cached = await readCachedStats()
    if (atCap(cached)) {
      return withCookieCleanup(request, json(payload(cached)))
    }

    let stats = cached
    if (!stats && env.VISITORS) {
      stats = normalizeStats(await env.VISITORS.get(STATS_KEY))
      await writeCachedStats(stats)
    }
    stats = stats || { dayKey: utcDate(), today: 0, frozen: false }

    if (atCap(stats)) {
      return withCookieCleanup(request, await replyCapped())
    }
    return withCookieCleanup(
      request,
      json(payload(stats), { 'Cache-Control': cacheControl(false) }),
    )
  } catch {
    try {
      return withCookieCleanup(request, lastKnownOrZero(await readCachedStats()))
    } catch {
      return withCookieCleanup(request, lastKnownOrZero(null))
    }
  }
}

export async function onRequestPost(context) {
  const { env } = context
  try {
    const cached = await readCachedStats()
    if (atCap(cached)) return json(payload(capStats()))

    if (!env.VISITORS) return replyCapped()

    let stats
    try {
      stats = normalizeStats(await env.VISITORS.get(STATS_KEY))
    } catch {
      return replyCapped()
    }

    if (atCap(stats)) return replyCapped()

    stats.today = Math.min(stats.today + 1, COUNT_CAP)
    if (stats.today >= COUNT_CAP) stats.frozen = true
    try {
      await env.VISITORS.put(STATS_KEY, JSON.stringify(stats))
    } catch {
      return replyCapped()
    }

    await writeCachedStats(stats)
    const body = payload(stats)
    return json(body, {
      'Cache-Control': body.capped ? cacheControl(true) : 'no-store',
    })
  } catch {
    try {
      const cached = await readCachedStats()
      if (atCap(cached)) return json(payload(capStats()))
      if (cached) return json(payload(cached), { 'Cache-Control': 'no-store' })
    } catch {
      // Fall through.
    }
    return json(
      { count: 0, ready: true, capped: false, frozen: false },
      { 'Cache-Control': 'no-store' },
    )
  }
}
