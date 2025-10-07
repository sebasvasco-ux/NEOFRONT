# OIDC Auth Flow (Custom Implementation)

This project implements a manual Authorization Code + PKCE flow against the gateway-exposed Authorization Server.

## Overview
1. Client calls `/api/oidc/start` → returns `authorizeUrl` + PKCE JSON and sets `neo_session` (dev) PKCE cookie.
2. Browser redirects to IdP authorize endpoint (`/auth/authorize`).
3. IdP redirects back to `/api/oidc/callback?code&state`.
4. Callback exchanges code at discovered (or fallback) `/auth/token`, validates `id_token` via JWKS, stores opaque session in `sessionStore` and sets `neo_session` cookie.
5. Private React Server Components are guarded in `(private)/layout.tsx` by fetching `/api/oidc/me`.

## Key Files
- `src/app/api/oidc/start/route.ts` – PKCE generation, scope negotiation, discovery usage.
- `src/app/api/oidc/callback/route.ts` – Code exchange, ID token verify, session creation (optional bridge page via `OIDC_SHOW_LOADING_PAGE=1`).
- `src/lib/oidc-discovery.ts` – Metadata discovery + caching.
- `src/lib/jwt.ts` – JWKS fetch with multiple fallback paths.
- `src/lib/session-store.ts` – Persistent in-memory + disk-backed opaque sessions.
- `src/app/(private)/layout.tsx` – Server-side guard using `/api/oidc/me` instead of direct store reference.
- `middleware.ts` – Fast cookie presence check for private routes.

## Cookies
- `neo_session` (dev) / `__Host-neo_session` (prod) – Opaque session ID.
- `oidc_pkce` – Temporary PKCE data (HttpOnly, cleared after callback).

## Environment Variables
- `NEXT_PUBLIC_OIDC_ISSUER`
- `NEXT_PUBLIC_OIDC_CLIENT_ID`
- `NEXT_PUBLIC_OIDC_REDIRECT_URI`
- `NEXT_PUBLIC_OIDC_SCOPES` (space or comma separated)
- `OIDC_SHOW_LOADING_PAGE=1` (optional bridge HTML during callback)

## Scope Negotiation
If discovery succeeds, scopes are intersected with `scopes_supported`. If discovery fails, obvious unsupported custom scopes (prefixed `read:`) are stripped to prevent `invalid_scope` errors.

## Refresh Logic
`refresh.ts` attempts silent refresh when near expiry using discovery `token_endpoint` or fallback to `/auth/token`. Sessions have both relative and absolute expiry.

## Logout
`POST /api/oidc/logout` clears the session in the store and expires the cookie. RP-Initiated IdP logout can be added by redirecting to an `end_session_endpoint` if provided.

## Security Notes
- Nonce & state provided per auth request (nonce validated in ID token).
- ID token signature verified (RS256) with JWKS fallback paths.
- Opaque session prevents token exposure client-side (access & id tokens remain server-only).
- Bridge page is optional; disable in production if not needed.

## Future Enhancements
- Add revocation endpoint integration if available in discovery.
- Implement rotating refresh token logic with reuse detection.
- Add CSRF protection for logout / refresh POST endpoints.
- Integrate structured audit logging sink.

---
Generated automatically to document the current custom auth implementation.
