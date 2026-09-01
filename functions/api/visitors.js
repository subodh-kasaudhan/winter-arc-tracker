function parseCookie(header, name) {
  if (!header) return null
  const parts = header.split(';')
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return null
}

export async function onRequestGet(context) {
  const { request, env } = context
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })

  if (!env.VISITORS) {
    return new Response(JSON.stringify({ count: null, ready: false }), {
      headers,
      status: 503,
    })
  }

  const existing = parseCookie(request.headers.get('Cookie'), 'wa_vid')
  let count = Number(await env.VISITORS.get('unique_visitors')) || 0

  if (!existing) {
    count += 1
    await env.VISITORS.put('unique_visitors', String(count))
    headers.append(
      'Set-Cookie',
      `wa_vid=${crypto.randomUUID()}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`,
    )
  }

  return new Response(JSON.stringify({ count, ready: true }), { headers })
}
