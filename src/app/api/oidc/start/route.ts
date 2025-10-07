import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { logAuth } from '@/lib/logger'
import { getDiscovery } from '@/lib/oidc-discovery'
import { PKCE_COOKIE_NAME } from '@/lib/cookies'

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sha256(buffer: string) {
  return crypto.createHash('sha256').update(buffer).digest()
}

// Validate OIDC configuration
function validateOIDCConfig() {
  const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER
  const client_id = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID
  const redirect_uri = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI

  const errors: string[] = []
  if (!issuer) errors.push('NEXT_PUBLIC_OIDC_ISSUER')
  if (!client_id) errors.push('NEXT_PUBLIC_OIDC_CLIENT_ID')
  if (!redirect_uri) errors.push('NEXT_PUBLIC_OIDC_REDIRECT_URI')

  if (errors.length > 0) {
    logAuth('start.config_error', { missing_vars: errors })
    throw new Error(`Missing required OIDC configuration: ${errors.join(', ')}`)
  }

  // Validate URL format
  try {
    new URL(issuer!)
    new URL(redirect_uri!)
  } catch (e) {
    logAuth('start.invalid_url', { issuer, redirect_uri })
    throw new Error('Invalid OIDC URL format')
  }

  return { issuer: issuer!, client_id: client_id!, redirect_uri: redirect_uri! }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}

export async function GET(req: Request) {
  try {
    // Validate configuration upfront
    const { issuer, client_id, redirect_uri } = validateOIDCConfig()

    // Generate PKCE parameters
    const code_verifier = base64URLEncode(crypto.randomBytes(32))
    const code_challenge = base64URLEncode(sha256(code_verifier))
    const state = base64URLEncode(crypto.randomBytes(16))
    const nonce = base64URLEncode(crypto.randomBytes(16))

    // Resolve requested scopes
    const requestedScopes = (process.env.NEXT_PUBLIC_OIDC_SCOPES || 'openid email')
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(s => s.trim())

    if (!requestedScopes.includes('openid')) requestedScopes.unshift('openid')

    // Try discovery for dynamic endpoints & scope negotiation
    const discovery = await getDiscovery(issuer)
    let filteredScopes = requestedScopes
    if (discovery?.scopes_supported && discovery.scopes_supported.length > 0) {
      filteredScopes = requestedScopes.filter(s => discovery.scopes_supported!.includes(s))
      const dropped = requestedScopes.filter(s => !filteredScopes.includes(s))
      if (dropped.length > 0) {
        logAuth('start.scopes.filtered', { requested: requestedScopes, allowed: filteredScopes, dropped })
      }
      if (!filteredScopes.includes('openid')) filteredScopes.unshift('openid')
    }
    // Remove obviously unsupported custom scopes if discovery failed (e.g., read:users)
    if (!discovery) {
      filteredScopes = filteredScopes.filter(s => !s.startsWith('read:'))
    }
    const scope = Array.from(new Set(filteredScopes)).join(' ')

    // Determine authorization endpoint
    let authorizationEndpoint: string | null = discovery?.authorization_endpoint || null
    let endpointSource = 'discovery'
    if (!authorizationEndpoint) {
      // Fallback heuristics for API Gateway paths
      const base = issuer.replace(/\/$/, '')
      const candidates = [
        base + '/auth/authorize', // preferred gateway mapping
        base + '/oauth2/authorize', // spring default
        base + '/authorize' // generic fallback
      ]
      authorizationEndpoint = candidates[0]
      endpointSource = 'fallback'
      logAuth('start.discovery.missing_authorize', { tried: candidates })
    }

    // Build authorize URL - redirect directly to Authorization Server (via gateway)
    const params = new URLSearchParams({
      response_type: 'code',
      client_id,
      redirect_uri,
      scope,
      code_challenge_method: 'S256',
      code_challenge,
      state,
      nonce
    })
    const authorizeUrl = `${authorizationEndpoint}?${params.toString()}`

    // Log the redirect URL for debugging
    logAuth('start.redirect_url', { authorizeUrl, issuer, client_id, redirect_uri, endpointSource })

    // Check if OAuth2 server is available before redirecting
    let oauth2ServerAvailable = false
    let testUrls = [
      authorizationEndpoint,
      `${issuer.replace(/\/$/, '')}/auth/authorize`,
      `${issuer.replace(/\/$/, '')}/oauth2/authorize`,
      `${issuer.replace(/\/$/, '')}/authorize`,
      `${issuer.replace(/\/$/, '')}/login`,
      // Try IPv6 if IPv4 fails
      authorizationEndpoint.replace('localhost', '[::1]'),
      issuer.replace('localhost', '[::1]') + '/auth/authorize',
      issuer.replace('localhost', '[::1]') + '/oauth2/authorize'
    ]
    
    // Skip availability check in development to avoid timeouts
    if (process.env.NODE_ENV === 'development') {
      oauth2ServerAvailable = true
      logAuth('start.development_mode', { skip_availability_check: true })
    } else {
      for (const testUrl of testUrls) {
        try {
          const testResponse = await fetch(testUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000) // 3 second timeout
          })
          if (testResponse.ok || testResponse.status === 302) {
            oauth2ServerAvailable = true
            logAuth('start.oauth2_server_check', { available: true, url: testUrl, status: testResponse.status })
            break
          }
        } catch (checkError: any) {
          logAuth('start.oauth2_server_check_failed', { url: testUrl, error: checkError.message })
          continue
        }
      }
      
      if (!oauth2ServerAvailable) {
        logAuth('start.oauth2_server_unavailable', { issuer, testUrls }, 'warn')
      }
    }

    // Return PKCE data as JSON instead of cookie for client-side storage
    // Client will store in sessionStorage and redirect
    logAuth('start.success', { scope, state: state.substring(0, 8) + '...' })

    const pkcePayload = {
      code_verifier,
      state,
      nonce,
      created_at: Date.now()
    }
    const res = NextResponse.json({
      authorizeUrl,
      pkce: pkcePayload
    }, { status: 200 })

    // Also set secure HttpOnly cookie so the callback (server-side) can recover PKCE even if
    // the frontend fails to append it as a query param.
    try {
      // Encode as base64url to avoid double URL-encoding issues in browsers
      const pkceCookieValue = Buffer.from(JSON.stringify(pkcePayload), 'utf8').toString('base64url')
      res.cookies.set(PKCE_COOKIE_NAME, pkceCookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 10 * 60 // 10 minutes
      })
      logAuth('start.pkce_cookie_set', { state: state.substring(0,8) + '...' })
    } catch (e: any) {
      logAuth('start.pkce_cookie_error', { error: e.message })
    }

    return res

  } catch (error: any) {
    logAuth('start.error', { error: error.message }, 'error')
    return NextResponse.json(
      { 
        error: 'Authentication configuration error', 
        message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication service unavailable'
      }, 
      { status: 500 }
    )
  }
}
