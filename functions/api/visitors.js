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
const HITS_URL = 'https://winter-arc.internal/origin_hits/'
const COUNT_CAP = 1000
const COOKIE_MAX_AGE = 86400
const LIVE_CACHE_SECONDS = 300
const WORKERS_DAILY_LIMIT = 100_000
const ORIGIN_STOP_AT = Math.floor(WORKERS_DAILY_LIMIT * 0.5)

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

function cacheControl(untilMidnight) {
  const maxAge = untilMidnight ? secondsUntilUtcMidnight() : LIVE_CACHE_SECONDS
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

async function writeCachedStats(stats, untilMidnight = false) {
  try {
    const freeze = untilMidnight || stats.today >= COUNT_CAP
    await caches.default.put(
      CACHE_URL,
      new Response(JSON.stringify(stats), {
        headers: { 'Cache-Control': cacheControl(freeze) },
      }),
    )
  } catch {
    // Cache is optional.
  }
}

async function originHitsToday() {
  try {
    const hit = await caches.default.match(HITS_URL + utcDate())
    if (!hit) return 0
    const n = Number(await hit.text())
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

async function recordOriginHit(current) {
  try {
    await caches.default.put(
      HITS_URL + utcDate(),
      new Response(String(current + 1), {
        headers: { 'Cache-Control': `max-age=${secondsUntilUtcMidnight()}` },
      }),
    )
  } catch {
    // Cache is optional.
  }
}

function markClocked(headers) {
  headers.append(
    'Set-Cookie',
    `wa_clock=${crypto.randomUUID()}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; Secure`,
  )
}

async function loadStats(env) {
  const cached = await readCachedStats()
  if (cached) return { stats: cached, fromCache: true }
  const stats = normalizeStats(await env.VISITORS.get(STATS_KEY))
  await writeCachedStats(stats)
  return { stats, fromCache: false }
}

async function serveCount(env, untilMidnight) {
  const { stats } = await loadStats(env)
  const body = payload(stats)
  const freeze = untilMidnight || body.capped
  if (freeze) await writeCachedStats(stats, true)
  return json(body, { 'Cache-Control': cacheControl(freeze) })
}

export async function onRequestGet(context) {
  const { env } = context
  if (!env.VISITORS) {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }

  try {
    const hits = await originHitsToday()
    if (hits >= ORIGIN_STOP_AT) {
      return serveCount(env, true)
    }
    await recordOriginHit(hits)
    return serveCount(env, false)
  } catch {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.VISITORS) {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }

  try {
    const hits = await originHitsToday()
    if (hits >= ORIGIN_STOP_AT) {
      return serveCount(env, true)
    }
    await recordOriginHit(hits)

    const already = parseCookie(request.headers.get('Cookie'), 'wa_clock')
    const stats = normalizeStats(await env.VISITORS.get(STATS_KEY))

    if (stats.today >= COUNT_CAP) {
      await writeCachedStats(stats, true)
      return json(payload(stats), { 'Cache-Control': cacheControl(true) })
    }

    if (already) {
      return json(payload(stats), { 'Cache-Control': 'private, max-age=60' })
    }

    stats.today += 1
    try {
      await env.VISITORS.put(STATS_KEY, JSON.stringify(stats))
    } catch {
      await writeCachedStats({ ...stats, today: COUNT_CAP }, true)
      return json(
        { count: COUNT_CAP, ready: true, capped: true },
        { 'Cache-Control': cacheControl(true) },
      )
    }

    await writeCachedStats(stats)
    const body = payload(stats)
    const res = json(body, {
      'Cache-Control': body.capped ? cacheControl(true) : 'no-store',
    })
    if (!body.capped) markClocked(res.headers)
    return res
  } catch {
    return json(
      { count: null, ready: false, capped: false },
      { 'Cache-Control': 'no-store' },
      503,
    )
  }
}
