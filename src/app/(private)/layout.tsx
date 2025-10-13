import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import '../globals.css';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';
import { sessionStore } from '@/lib/session-store';
import { ensureFreshSession } from '@/lib/refresh';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="animated-bg"></div>
      
      {/* Modern Navigation Header */}
      <header className="modern-nav">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="/SpectraTRansparente.svg" 
                alt="Spectra DC" 
                className="w-12 h-12 animate-pulse-slow"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                SPECTRA DC
              </h1>
              <p className="text-xs text-muted-foreground">Monitor Transaccional</p>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar transacciones, alertas, reportes..."
                className="search-bar pl-12 pr-4"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.email || user?.sub || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Enhanced Sidebar */}
        <Sidebar user={user} />
        
        {/* Main Content with Modern Styling */}
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
          <div className="relative p-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
        <button className="gradient-btn p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Global Search Modal (Hidden by default) */}
      <div id="search-modal" className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
        <div className="premium-card w-full max-w-2xl mx-4">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar global..."
                className="modern-input flex-1 text-lg"
                autoFocus
              />
              <kbd className="px-3 py-1 text-sm bg-muted border border-border rounded">ESC</kbd>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Resultados sugeridos:</p>
              <div className="space-y-1">
                <div className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <p className="font-medium">Transacción #12345</p>
                  <p className="text-sm text-muted-foreground">Pago de cliente - $2,500</p>
                </div>
                <div className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <p className="font-medium">Alerta de seguridad</p>
                  <p className="text-sm text-muted-foreground">Transacción sospechosa detectada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Global search shortcut
          document.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              const modal = document.getElementById('search-modal');
              modal.classList.toggle('hidden');
              if (!modal.classList.contains('hidden')) {
                modal.querySelector('input').focus();
              }
            }
            if (e.key === 'Escape') {
              const modal = document.getElementById('search-modal');
              if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
              }
            }
          });
        `
      }} />
    </div>
  );
}
