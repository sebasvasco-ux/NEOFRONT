import { sessionStore, StoredSession } from './session-store';
import { logAuth } from './logger';
import { getDiscovery } from './oidc-discovery';
import crypto from 'crypto';
import { verifyIdToken } from './jwt';

const EXP_LEEWAY = 60; // seconds before expiry to refresh

export async function ensureFreshSession(sessionId: string): Promise<StoredSession | undefined> {
  const session = sessionStore.get(sessionId);
  if (!session) return undefined;

  const nowSec = Math.floor(Date.now() / 1000);
  if (session.absolute_expires_at && session.absolute_expires_at < nowSec) {
    logAuth('refresh.absolute_expired', { sessionId });
    sessionStore.delete(sessionId);
    return undefined;
  }

  const remaining = session.expires_at - nowSec;
  if (remaining > EXP_LEEWAY) return session; // still valid

  // If no refresh token, force reauth
  if (!session.refresh_token) {
    logAuth('refresh.missing_refresh_token', { sessionId });
    return session; // Return existing; caller may decide to redirect if actually expired
  }

  // Check if refresh already in progress
  const existingLock = sessionStore.getRefreshLock(sessionId);
  if (existingLock) {
    try {
      await existingLock; // wait for other refresh
      return sessionStore.get(sessionId);
    } catch {
      return sessionStore.get(sessionId);
    }
  }

  const refreshPromise = performRefresh(sessionId, session).finally(() => {
    sessionStore.clearRefreshLock(sessionId);
  });
  sessionStore.setRefreshLock(sessionId, refreshPromise);
  await refreshPromise;
  return sessionStore.get(sessionId);
}

async function performRefresh(sessionId: string, session: StoredSession) {
  const correlationId = crypto.randomUUID();
  logAuth('refresh.start', { sessionId, correlationId, rotations: session.rotations, exp_in: session.expires_at - Math.floor(Date.now()/1000) });
  const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER;
  const client_id = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
  if (!issuer || !client_id) {
    logAuth('refresh.misconfiguration', { sessionId, correlationId }, 'error');
    return;
  }
  // Resolve token endpoint via discovery first
  let tokenEndpoint: string
  const discovery = await getDiscovery(issuer)
  if (discovery?.token_endpoint) {
    tokenEndpoint = discovery.token_endpoint
  } else {
    const base = issuer.replace(/\/$/, '')
    tokenEndpoint = base + '/auth/token'
  }
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token || '',
      client_id
    });
    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!res.ok) {
      const text = await res.text();
      logAuth('refresh.failed', { sessionId, correlationId, status: res.status, body: text.slice(0,400) }, 'warn');
      if (res.status === 400 || res.status === 401) {
        sessionStore.delete(sessionId);
        logAuth('refresh.session_deleted', { sessionId, correlationId });
      }
      return;
    }
    const json = await res.json();
    const newAccess = json.access_token as string | undefined;
    if (!newAccess) {
      logAuth('refresh.no_access_token', { sessionId, correlationId }, 'warn');
      return;
    }
    // Optional: verify new id_token if provided
    let newIdToken = session.id_token;
    if (json.id_token) {
      try {
        const issuer = process.env.NEXT_PUBLIC_OIDC_ISSUER;
        if (issuer) {
          await verifyIdToken(json.id_token, {
            issuer: issuer,
            clientId: client_id,
            expectedNonce: undefined
          });
          newIdToken = json.id_token;
        }
      } catch (e: any) {
        logAuth('refresh.id_token_verification_failed', { sessionId, correlationId, error: e.message }, 'warn');
      }
    }
    const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600;
    const nowSec = Math.floor(Date.now()/1000);
    const rotations = (session.rotations || 0) + 1;
    sessionStore.set(sessionId, {
      ...session,
      access_token: newAccess,
      id_token: newIdToken,
      expires_at: nowSec + expiresIn,
      refresh_token: json.refresh_token || session.refresh_token,
      rotations
    });
    logAuth('refresh.success', { sessionId, correlationId, rotations, new_exp: nowSec + expiresIn });
  } catch (e: any) {
    logAuth('refresh.exception', { sessionId, correlationId, error: e.message }, 'error');
  }
}
