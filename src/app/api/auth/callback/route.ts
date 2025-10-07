import { NextResponse } from 'next/server'

// Deprecated legacy callback kept only to avoid 404s if some stale client hits it.
// Always returns 410 Gone with guidance.
export async function GET() {
  return new NextResponse(
    JSON.stringify({
      status: 410,
      message: 'Deprecated endpoint. Use /api/oidc/start -> /api/oidc/callback flow.',
      replacement: '/api/oidc/callback'
    }),
    {
      status: 410,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    }
  )
}
