// Centralized cookie name logic so dev (http) doesn't break __Host- prefix rules.
// __Host- cookies MUST have Secure+Path=/ and be set from a secure context (HTTPS). Over plain HTTP localhost they are dropped by browsers.
// In development we fall back to non-prefixed names to ensure the flow works.

export const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-neo_session' : 'neo_session'
export const PKCE_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-oidc_pkce' : 'oidc_pkce'

export function findCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const regex = new RegExp(`${name}=([^;]+)`) // simple match
  const m = cookieHeader.match(regex)
  return m ? decodeURIComponent(m[1]) : null
}
