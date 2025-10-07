import { NextResponse } from 'next/server'
import { sessionStore } from '@/lib/session-store'
import { SESSION_COOKIE_NAME } from '@/lib/cookies'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
  const id = match ? decodeURIComponent(match[1]) : null
  const session = id ? sessionStore.get(id) : undefined
  return NextResponse.json({
    cookiePresent: !!id,
    sessionFound: !!session,
    sessionId: id,
    keys: session ? Object.keys(session) : [],
    expires_at: session?.expires_at,
    now: Math.floor(Date.now()/1000)
  })
}