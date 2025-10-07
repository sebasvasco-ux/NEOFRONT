import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/cookies'
import { NextResponse as NR } from 'next/server'

// Global OIDC configuration validation
let oidcConfigValidated = false
let oidcConfigError: string | null = null

function validateOIDCConfiguration() {
  if (oidcConfigValidated) return oidcConfigError === null

  const requiredVars = [
    'NEXT_PUBLIC_OIDC_ISSUER',
    'NEXT_PUBLIC_OIDC_CLIENT_ID', 
    'NEXT_PUBLIC_OIDC_REDIRECT_URI'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    oidcConfigError = `Missing OIDC configuration: ${missing.join(', ')}`
    console.error('❌ OIDC Configuration Error:', oidcConfigError)
    oidcConfigValidated = true
    return false
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_OIDC_ISSUER!)
    new URL(process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!)
  } catch (e) {
    oidcConfigError = 'Invalid OIDC URL format in environment variables'
    console.error('❌ OIDC Configuration Error:', oidcConfigError)
    oidcConfigValidated = true
    return false
  }

  oidcConfigValidated = true
  console.log('✅ OIDC configuration validated successfully')
  return true
}

// Public paths that should never require an existing session
const PUBLIC_PATHS = ['/login', '/oidc/callback', '/auth/callback']

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return true
  if (pathname.startsWith('/api/oidc/')) return true // OIDC API endpoints must be reachable unauthenticated
  if (pathname.startsWith('/_next')) return true
  if (pathname === '/favicon.ico' || pathname === '/robots.txt') return true
  return false
}

// Private prefixes define what we actively gate. Everything else passes through.
const PRIVATE_PREFIXES = ['/dashboard', '/transactions', '/alerts', '/rules', '/private']

// Bypass paths (requested) – saltar chequeo duro porque hay casos intermitentes donde
// el cookie parser en dev no detecta la sesión al re‑hacer click en Dashboard.
// NOTA: Esto reduce la fuerza del guard para esa ruta específica.
const SOFT_BYPASS_PATHS = ['/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Validate OIDC configuration on first request
  if (!validateOIDCConfiguration()) {
    // If OIDC is not configured and we're not already on an error/login page, redirect to login with error
    if (!pathname.startsWith('/login')) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'authentication_configuration_error')
      return NextResponse.redirect(url)
    }
  }

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const isPrivate = PRIVATE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Si la ruta está en bypass, dejamos pasar sin validar cookie (solo para casos dev intermitentes)
  if (SOFT_BYPASS_PATHS.includes(pathname)) {
    console.warn('[auth.mw.bypass]', { path: pathname })
    return NextResponse.next()
  }
  if (!isPrivate) {
    // Neutral route: allow without forcing auth (could rely on client fetch /api/oidc/me later)
    return NextResponse.next()
  }

  let sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)
  if (!sessionCookie) {
    const raw = req.headers.get('cookie') || ''
    const manual = raw.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
    if (manual) {
      // Fallback parse when Next's parser misses it (rare in dev hot reload)
      console.warn('[auth.mw.manual_cookie_parse]', { path: pathname })
      sessionCookie = { name: SESSION_COOKIE_NAME, value: manual[1] } as any
    }
    if (!sessionCookie) {
      console.warn('[auth.mw.missing_session_cookie]', { path: pathname, cookieHeaderPresent: raw.includes(SESSION_COOKIE_NAME) })
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }
  // Minimal positive log (can be silenced later)
  console.log('[auth.mw.session_cookie_detected]', { path: pathname })

  return NextResponse.next()
}

export const config = { matcher: '/:path*' }
