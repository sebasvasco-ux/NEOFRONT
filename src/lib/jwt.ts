import crypto from 'crypto'

// Simple in-memory JWKS cache. For production consider TTL invalidation or ETag handling.
interface JWK { kty: string; kid: string; use?: string; n?: string; e?: string; crv?: string; x?: string; y?: string; alg?: string }

let jwksCache: { issuer: string; keys: JWK[]; fetchedAt: number } | null = null
const JWKS_TTL_MS = 15 * 60 * 1000

function base64urlDecode(input: string): Buffer {
  // atob polyfill not needed; use Buffer
  input = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = input.length % 4
  if (pad) input += '='.repeat(4 - pad)
  return Buffer.from(input, 'base64')
}

async function fetchJWKS(issuer: string): Promise<JWK[]> {
  const now = Date.now()
  if (jwksCache && jwksCache.issuer === issuer && now - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys
  }
  // Try discovery first
  const base = issuer.replace(/\/$/, '')
  const tried: string[] = []
  let lastStatus: number | undefined
  let jwksCandidates = [
    base + '/.well-known/openid-configuration', // discovery document
  ]
  let jwksUri: string | null = null
  try {
    const discoRes = await fetch(jwksCandidates[0])
    tried.push(jwksCandidates[0])
    if (discoRes.ok) {
      const discoJson: any = await discoRes.json()
      if (discoJson.jwks_uri) {
        jwksUri = discoJson.jwks_uri
      }
    } else {
      lastStatus = discoRes.status
    }
  } catch { /* ignore */ }

  // If discovery didn't yield, fallback to known patterns
  if (!jwksUri) {
    jwksCandidates = [
      base + '/oauth2/jwks',      // Spring default
      base + '/auth/jwks',        // Possible gateway mapping
      base + '/jwks',             // Generic
      base + '/.well-known/jwks.json'
    ]
    for (const c of jwksCandidates) {
      tried.push(c)
      try {
        const r = await fetch(c)
        lastStatus = r.status
        if (r.ok) {
          const json = await r.json()
          if (json.keys && Array.isArray(json.keys)) {
            jwksCache = { issuer, keys: json.keys, fetchedAt: now }
            return jwksCache.keys
          }
        }
      } catch { /* continue */ }
    }
    throw new Error('Failed to fetch JWKS: ' + (lastStatus || 'unknown') + ' tried=' + tried.join(','))
  }

  // Fetch JWKS from discovered URI
  tried.push(jwksUri)
  const res = await fetch(jwksUri)
  lastStatus = res.status
  if (!res.ok) throw new Error('Failed to fetch JWKS: ' + res.status + ' tried=' + tried.join(','))
  const json = await res.json()
  if (!json.keys || !Array.isArray(json.keys)) throw new Error('Invalid JWKS format')
  jwksCache = { issuer, keys: json.keys, fetchedAt: now }
  return jwksCache.keys
}

function importRsaPublicKey(nB64?: string, eB64?: string): crypto.KeyObject {
  if (!nB64 || !eB64) throw new Error('Missing modulus or exponent for RSA key')
  const n = base64urlDecode(nB64)
  const e = base64urlDecode(eB64)
  // Build ASN.1 DER for RSA public key (PKCS#1)
  // Simpler: use Node's createPublicKey with JWK structure if available (Node 18+ supports jwk param)
  return crypto.createPublicKey({ key: { kty: 'RSA', n: nB64, e: eB64 }, format: 'jwk' as any })
}

export interface VerifiedIdTokenPayload {
  iss: string; sub: string; aud: string | string[]; exp: number; iat: number; nonce?: string; [claim: string]: any
}

export async function verifyIdToken(idToken: string, options: {
  issuer: string
  clientId: string
  expectedNonce?: string
  maxSkewSec?: number
  acceptedAlgs?: string[]
}): Promise<VerifiedIdTokenPayload> {
  const { issuer, clientId, expectedNonce, maxSkewSec = 300, acceptedAlgs = ['RS256'] } = options
  const parts = idToken.split('.')
  if (parts.length !== 3) throw new Error('Malformed id_token')
  const [headerB64, payloadB64, signatureB64] = parts
  const headerJson = base64urlDecode(headerB64).toString('utf8')
  const payloadJson = base64urlDecode(payloadB64).toString('utf8')
  let header: any; let payload: VerifiedIdTokenPayload
  try {
    header = JSON.parse(headerJson)
    payload = JSON.parse(payloadJson)
  } catch {
    throw new Error('Invalid JSON in id_token')
  }
  if (!acceptedAlgs.includes(header.alg)) throw new Error('Unsupported alg: ' + header.alg)
  if (payload.iss !== issuer) throw new Error('Issuer mismatch')
  const audOk = Array.isArray(payload.aud) ? payload.aud.includes(clientId) : payload.aud === clientId
  if (!audOk) throw new Error('Audience mismatch')
  const nowSec = Math.floor(Date.now() / 1000)
  if (payload.exp + maxSkewSec < nowSec) throw new Error('Token expired')
  if (payload.iat - maxSkewSec > nowSec) throw new Error('Token issued in future')
  if (expectedNonce && payload.nonce !== expectedNonce) throw new Error('Nonce mismatch')

  const keys = await fetchJWKS(issuer)
  const jwk = keys.find(k => k.kid === header.kid && k.kty === 'RSA')
  if (!jwk) throw new Error('Matching JWK not found')
  const publicKey = importRsaPublicKey(jwk.n, jwk.e)

  // Verify signature
  const verify = crypto.createVerify('RSA-SHA256')
  verify.update(headerB64 + '.' + payloadB64)
  verify.end()
  const signature = base64urlDecode(signatureB64)
  const ok = verify.verify(publicKey, signature)
  if (!ok) throw new Error('Invalid signature')
  return payload
}
