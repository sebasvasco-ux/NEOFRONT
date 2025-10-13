import { NextResponse } from 'next/server'
import { verifyIdToken } from '../../../../lib/jwt'
import { sessionStore } from '../../../../lib/session-store'
import { logAuth } from '@/lib/logger'
import { randomUUID } from 'crypto'
import { getDiscovery } from '@/lib/oidc-discovery'
import { PKCE_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/cookies'

// Helper function to parse PKCE cookie with improved error handling
function parsePKCECookie(cookieHeader: string): { code_verifier: string; state: string; nonce: string; created_at?: number } | null {
  try {
    // Support dynamic cookie name (dev vs prod)
    const match = cookieHeader.match(new RegExp(`${PKCE_COOKIE_NAME}=([^;]+)`))
    if (!match) return null

    const raw = match[1]
    let jsonStr: string
    try {
      jsonStr = Buffer.from(raw, 'base64url').toString('utf8')
    } catch {
      // Fallback: maybe it was URI encoded JSON
      try {
        jsonStr = decodeURIComponent(raw)
      } catch {
        jsonStr = raw
      }
    }
    const parsed = JSON.parse(jsonStr)
    
    // Validate required fields
    if (!parsed.code_verifier || !parsed.state || !parsed.nonce) {
      return null
    }

    // Check if PKCE is too old (security measure)
    if (parsed.created_at && Date.now() - parsed.created_at > 10 * 60 * 1000) { // 10 minutes
      return null
    }

    return parsed
  } catch {
    return null
  }
}

// Validate OIDC configuration
function validateOIDCConfig() {
  const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER
  const client_id = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID
  const redirect_uri = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI

  if (!issuer || !client_id || !redirect_uri) {
    throw new Error('OIDC not configured')
  }

  return { issuer, client_id, redirect_uri }
}

export async function GET(req: Request) {
  const correlationId = randomUUID()
  
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    // Handle OAuth errors from IdP
    if (error) {
      logAuth('callback.oauth_error', { correlationId, error, errorDescription })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
    }

    // Validate required parameters
    if (!code || !state) {
      logAuth('callback.missing_params', { correlationId, hasCode: !!code, hasState: !!state })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_request`)
    }

    // PKCE retrieval: prefer explicit query param (future enhancement) else fallback to secure cookie
    const pkceParam = url.searchParams.get('pkce')
    let pkceData: { code_verifier: string; state: string; nonce: string; created_at?: number } | null = null

    if (pkceParam) {
      try {
        pkceData = JSON.parse(decodeURIComponent(pkceParam))
        logAuth('callback.pkce_param_used', { correlationId })
      } catch (e) {
        logAuth('callback.invalid_pkce_param', { correlationId })
      }
    }

    if (!pkceData) {
      // Fallback: cookie-based (original implementation)
      const cookieHeader = (req as any).headers?.get?.('cookie') || ''
      const fromCookie = parsePKCECookie(cookieHeader)
      if (fromCookie) {
        pkceData = fromCookie
        logAuth('callback.pkce_cookie_used', { correlationId })
      }
    }

    if (!pkceData) {
      logAuth('callback.missing_pkce', { correlationId })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_session`)
    }

    // Validate state to prevent CSRF
    if (state !== pkceData.state) {
      logAuth('callback.state_mismatch', { correlationId })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`)
    }

    // Validate OIDC configuration
    const { issuer, client_id, redirect_uri } = validateOIDCConfig()

    // Use discovery for endpoints (with fallbacks)
    const discovery = await getDiscovery(issuer)
    let tokenEndpoint = discovery?.token_endpoint
    let userinfoEndpoint = discovery?.userinfo_endpoint
    let endpointSource = 'discovery'
    if (!tokenEndpoint) {
      const base = issuer.replace(/\/$/, '')
      const candidates = [
        base + '/auth/token', // gateway mapping
        base + '/oauth2/token', // spring default
        base + '/token' // generic fallback
      ]
      tokenEndpoint = candidates[0]
      endpointSource = 'fallback'
      logAuth('callback.discovery.missing_token', { correlationId, candidates })
    }
    if (!userinfoEndpoint) {
      const base = issuer.replace(/\/$/, '')
      const candidates = [
        base + '/userinfo'
      ]
      userinfoEndpoint = candidates[0]
    }

    logAuth('callback.endpoints', { correlationId, tokenEndpoint, userinfoEndpoint, endpointSource })

    // Exchange authorization code for tokens via API Gateway / discovered endpoint
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier: pkceData.code_verifier
    })

    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody.toString()
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      logAuth('callback.token_failed', { correlationId, status: tokenRes.status })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`)
    }

    const tokenJson = await tokenRes.json()
    const id_token = tokenJson.id_token as string | undefined

    if (!id_token) {
      logAuth('callback.missing_id_token', { correlationId })
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=missing_id_token`)
    }

    // Verify ID token
    let verifiedPayload
    try {
      verifiedPayload = await verifyIdToken(id_token, {
        issuer,
        clientId: client_id,
        expectedNonce: pkceData.nonce
      })
    } catch (e: any) {
      logAuth('callback.id_token_invalid', { correlationId, error: e.message }, 'error')
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
      return NextResponse.redirect(`${baseUrl}/login?error=id_token_invalid`)
    }

    // Fetch userinfo (best-effort)
    let claims: Record<string, any> | undefined
    try {
      // userinfoEndpoint set above (may be discovery or fallback)
      const uiRes = await fetch(userinfoEndpoint, {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` }
      })

      if (uiRes.ok) {
        const data = await uiRes.json()
        const allowed = ['sub', 'email', 'email_verified', 'name', 'preferred_username', 'updated_at', 'role', 'roles']
        claims = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)))
        logAuth('callback.userinfo_success', { correlationId, hasEmail: !!claims?.email, hasRole: !!claims?.role })
      }
    } catch (e: any) {
      logAuth('callback.userinfo_failed', { correlationId, error: e.message })
      // Continue without userinfo - don't fail the auth flow
    }

    // Extract role from id_token payload if not in userinfo
    // This is a fallback when the /userinfo endpoint doesn't return role
    if (!claims?.role && verifiedPayload) {
      try {
        // Check for 'role' (string) or 'roles' (array) in the token
        if (verifiedPayload.role) {
          claims = claims || {}
          claims.role = verifiedPayload.role
          logAuth('callback.role_from_token', { correlationId, role: verifiedPayload.role, source: 'role_claim' })
        } else if (verifiedPayload.roles && Array.isArray(verifiedPayload.roles) && verifiedPayload.roles.length > 0) {
          claims = claims || {}
          // Map the first role, removing 'ROLE_' prefix if present
          const firstRole = verifiedPayload.roles[0]
          claims.role = firstRole.startsWith('ROLE_') ? firstRole.substring(5) : firstRole
          logAuth('callback.role_from_token', { correlationId, role: claims.role, source: 'roles_array', originalRoles: verifiedPayload.roles })
        }
      } catch (e: any) {
        logAuth('callback.role_extraction_failed', { correlationId, error: e.message }, 'warn')
      }
    }

    // Create session
    const expiresIn = typeof tokenJson.expires_in === 'number' ? tokenJson.expires_in : 3600
    const nowSec = Math.floor(Date.now() / 1000)
    const sessionId = randomUUID()

    sessionStore.set(sessionId, {
      sub: verifiedPayload.sub,
      access_token: tokenJson.access_token,
      id_token: tokenJson.id_token,
      refresh_token: tokenJson.refresh_token,
      expires_at: nowSec + expiresIn,
      created_at: Date.now(),
      claims,
      rotations: 0,
      absolute_expires_at: nowSec + 8 * 60 * 60 // 8 hours max
    })

    logAuth('callback.success', { correlationId, sub: verifiedPayload.sub })

    // Create response with session cookie. Optionally show a bridge page to ensure cookie commit.
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
    const useBridge = process.env.OIDC_SHOW_LOADING_PAGE === '1'
    const maxAge = Math.min(expiresIn, 60 * 60 * 8)

    if (useBridge) {
      const html = `<!doctype html><html lang="es"><head><meta charset=\"utf-8\" />
<title>Finalizando autenticación…</title><meta http-equiv=\"refresh\" content=\"1;url=${baseUrl}/dashboard\" />
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />
<style>html,body{height:100%;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center} .card{max-width:380px;width:100%;text-align:center;padding:32px;background:rgba(255,255,255,.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.08);border-radius:22px;box-shadow:0 8px 32px -8px #000} .spin{width:58px;height:58px;border:6px solid #1e3a8a;border-top-color:#60a5fa;border-radius:50%;animation:rot .9s linear infinite;margin:0 auto 26px}@keyframes rot{to{transform:rotate(360deg)}} a{color:#60a5fa;text-decoration:none;font-weight:500} a:hover{text-decoration:underline}</style></head><body><div class=card>
<div class=spin></div><h1 style=\"font-size:1.15rem;margin:0 0 6px\">Guardando tu sesión…</h1>
<p style=\"font-size:.85rem;line-height:1.4;margin:0 0 10px\">Redirigiendo al dashboard. Si no ocurre automáticamente haz clic abajo.</p>
<p style=\"font-size:.7rem;opacity:.65;margin:0 0 14px\">Sesión ${sessionId.slice(0,8)}…</p>
<a href=\"${baseUrl}/dashboard\">Ir ahora</a></div>
<script>setTimeout(()=>{location.replace('${baseUrl}/dashboard')},650)</script></body></html>`
      const bridge = new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
      bridge.cookies.set(SESSION_COOKIE_NAME, sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', sameSite: 'lax', maxAge })
      bridge.cookies.set(PKCE_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0, sameSite: 'lax' })
      logAuth('callback.bridge_page', { correlationId })
      logAuth('callback.session_cookie_set', { correlationId, name: SESSION_COOKIE_NAME, maxAge })
      return bridge
    }

    const res = NextResponse.redirect(`${baseUrl}/dashboard`, 302)
    res.cookies.set(SESSION_COOKIE_NAME, sessionId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', sameSite: 'lax', maxAge })
    res.cookies.set(PKCE_COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0, sameSite: 'lax' })
    logAuth('callback.session_cookie_set', { correlationId, name: SESSION_COOKIE_NAME, maxAge })
    return res

  } catch (error: any) {
    logAuth('callback.exception', { correlationId, error: error.message }, 'error')
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3010'
    return NextResponse.redirect(`${baseUrl}/login?error=internal_error`)
  }
}
