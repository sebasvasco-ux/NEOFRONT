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
    const idParts = session.id_token.split('.')
    if (idParts.length === 3) {
      const idPayload = JSON.parse(Buffer.from(idParts[1], 'base64url').toString('utf8'))

      // Build profile with role fallback from token if not in session claims
      const profile: any = {
        sub: idPayload.sub,
        email: idPayload.email,
        ...session.claims
      }

      // Extract role from access_token if not already in claims
      // (Some IdPs put roles in access_token, not id_token)
      if (!profile.role && session.access_token) {
        try {
          const accessParts = session.access_token.split('.')
          if (accessParts.length === 3) {
            const accessPayload = JSON.parse(Buffer.from(accessParts[1], 'base64url').toString('utf8'))
            console.log('[/api/oidc/me] Access token payload:', accessPayload)

            if (accessPayload.role) {
              profile.role = accessPayload.role
              console.log('[/api/oidc/me] Found role field:', profile.role)
            } else if (accessPayload.roles && Array.isArray(accessPayload.roles) && accessPayload.roles.length > 0) {
              console.log('[/api/oidc/me] Found roles array:', accessPayload.roles)

              // Role hierarchy (highest to lowest privilege)
              const roleHierarchy = ['ADMIN', 'SUPERVISOR', 'ANALYST', 'OPERATOR', 'USER']

              // Remove 'ROLE_' prefix from all roles
              const cleanRoles = accessPayload.roles.map((r: string) =>
                r.startsWith('ROLE_') ? r.substring(5) : r
              )
              console.log('[/api/oidc/me] Clean roles:', cleanRoles)

              // Select the highest privilege role
              for (const role of roleHierarchy) {
                if (cleanRoles.includes(role)) {
                  profile.role = role
                  console.log('[/api/oidc/me] Selected role from hierarchy:', profile.role)
                  break
                }
              }

              // Fallback to first role if no match in hierarchy
              if (!profile.role) {
                profile.role = cleanRoles[0]
                console.log('[/api/oidc/me] Fallback to first role:', profile.role)
              }
            } else {
              console.log('[/api/oidc/me] No role or roles found in access_token')
            }
          }
        } catch (err) {
          console.error('[/api/oidc/me] Error parsing access_token:', err)
        }
      }

      console.log('[/api/oidc/me] Final profile:', profile)

      return NextResponse.json({
        authenticated: true,
        profile,
        expires_at: session.expires_at,
        rotations: session.rotations,
        access_token: session.access_token // Agregar access_token para el API client
      })
    }
  } catch { /* ignore */ }
  return NextResponse.json({
    authenticated: true,
    expires_at: session.expires_at,
    rotations: session.rotations,
    access_token: session.access_token
  })
}
