import { NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';
import { logAuth } from '@/lib/logger';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';

// POST /api/oidc/logout
// Clears local session. If you need RP-initiated logout at the IdP, extend with end_session_endpoint redirect.
export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  const res = NextResponse.json({ ok: true });
  if (match) {
    const sessionId = decodeURIComponent(match[1]);
    sessionStore.delete(sessionId);
    logAuth('logout.session_cleared', { sessionId });
  } else {
    logAuth('logout.no_session_cookie', {});
  }
  // Expire the session cookie
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 0
  });
  return res;
}
