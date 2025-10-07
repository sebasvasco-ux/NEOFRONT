import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import '../globals.css';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';
import { sessionStore } from '@/lib/session-store';
import { ensureFreshSession } from '@/lib/refresh';

export const metadata = {
  title: 'SPECTRA DC - Private',
};

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Guard híbrido: 1) fetch interno a /api/oidc/me 2) fallback directo a cookie+sessionStore
  let user: { sub?: string; email?: string } | null = null;

  // Paso 1: intento normal vía API interna (debe funcionar la mayoría de veces)
  try {
    const res = await fetch('/api/oidc/me', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json?.authenticated) {
        user = { sub: json.profile?.sub, email: json.profile?.email };
      }
    }
  } catch (e) {
    // Silenciamos: si falla seguimos a fallback
  }

  // Paso 2 (fallback): si user sigue null, leemos cookie directamente y validamos en memoria.
  if (!user) {
    try {
      const cookieStore = await cookies();
      const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (raw) {
        // Refrescamos si está cerca de expirar
        let session = await ensureFreshSession(raw) || sessionStore.get(raw);
        if (session) {
          user = { sub: session.sub, email: session.claims?.email };
          // Log menor para diagnosticar el caso puntual del click repetido
          console.warn('[private.layout.fallback_session_used]', { sessionId: raw.slice(0, 8) });
        }
      }
    } catch {
      // ignorar
    }
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-background dark:bg-background">
      <Sidebar user={user} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
