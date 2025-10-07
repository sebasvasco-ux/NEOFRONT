import { NextResponse } from 'next/server'
import { sessionStore } from '../../../../lib/session-store'
import { SESSION_COOKIE_NAME } from '@/lib/cookies'
import { ensureFreshSession } from '@/lib/refresh'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
  if (!match) return NextResponse.json({ authenticated: false })
  const sessionId = decodeURIComponent(match[1])
  let session = sessionStore.get(sessionId)
  session = await ensureFreshSession(sessionId) || session
  if (!session) return NextResponse.json({ authenticated: false })

  // Decode id_token payload (non-sensitive claims) for profile convenience
  try {
    const parts = session.id_token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
      return NextResponse.json({
        authenticated: true,
        profile: { sub: payload.sub, email: payload.email, ...session.claims },
        expires_at: session.expires_at,
        rotations: session.rotations
      })
    }
  } catch { /* ignore */ }
  return NextResponse.json({ authenticated: true, expires_at: session.expires_at, rotations: session.rotations })
}
