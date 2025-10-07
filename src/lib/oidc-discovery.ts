import { logAuth } from '@/lib/logger'

export interface OIDCMetadata {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint?: string
  jwks_uri: string
  revocation_endpoint?: string
  introspection_endpoint?: string
  scopes_supported?: string[]
}

let cache: { meta: OIDCMetadata; fetchedAt: number } | null = null
const MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes

export async function getDiscovery(gatewayBase: string): Promise<OIDCMetadata | null> {
  try {
    if (cache && Date.now() - cache.fetchedAt < MAX_AGE_MS) return cache.meta
    const base = gatewayBase.replace(/\/$/, '')
    const candidates = [
      base + '/.well-known/openid-configuration',
      base + '/.well-known/oauth-authorization-server'
    ]
    let lastStatus: number | undefined
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' })
        lastStatus = res.status
        if (!res.ok) continue
        const json = await res.json()
        if (json && json.issuer && json.authorization_endpoint && json.token_endpoint) {
          const meta: OIDCMetadata = json
          cache = { meta, fetchedAt: Date.now() }
          logAuth('discovery.success', { issuer: meta.issuer, source: url, hasRevocation: !!meta.revocation_endpoint, note: (json.note ? true : false) })
          return meta
        }
      } catch (inner) {
        continue
      }
    }
    logAuth('discovery.failed', { tried: candidates, lastStatus })
    return null
  } catch (e: any) {
    logAuth('discovery.exception', { error: e.message })
    return null
  }
}

export function clearDiscoveryCache() { cache = null }