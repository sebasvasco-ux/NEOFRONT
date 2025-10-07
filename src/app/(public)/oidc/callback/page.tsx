"use client";

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

function CallbackInner() {
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const errorHelp = useMemo(() => {
    if (!rawError) return null;
    const map: Record<string, { title: string; cause: string; action: string; docs?: string }> = {
      access_denied: {
        title: 'Acceso Denegado',
        cause: 'El usuario canceló o el servidor rechazó los permisos solicitados.',
        action: 'Intenta de nuevo. Si persiste, revisa políticas de consentimiento o scopes requeridos.'
      },
      invalid_scope: {
        title: 'Scope Inválido',
        cause: 'Se solicitó un scope que el Authorization Server no tiene registrado para este cliente.',
        action: 'Verifica scopes soportados en /.well-known/openid-configuration y RegisteredClient.'
      },
      invalid_request: {
        title: 'Solicitud Inválida',
        cause: 'Falta un parámetro requerido, está duplicado o mal formado.',
        action: 'Confirma parámetros: response_type, client_id, redirect_uri, scope, state y code_challenge.'
      },
      unauthorized_client: {
        title: 'Cliente No Autorizado',
        cause: 'El cliente no tiene permitido usar este flujo o recurso.',
        action: 'Revisa configuración del cliente (grant types y redirect URI exacta).' 
      },
      unsupported_response_type: {
        title: 'response_type No Soportado',
        cause: 'El Authorization Server no soporta el response_type enviado.',
        action: 'Asegúrate de usar response_type=code.'
      },
      server_error: {
        title: 'Error Interno del Servidor',
        cause: 'El Authorization Server tuvo una excepción inesperada.',
        action: 'Revisa logs del servidor para la correlación temporal.'
      },
      temporarily_unavailable: {
        title: 'Servicio Temporalmente No Disponible',
        cause: 'El servidor está sobrecargado o en mantenimiento.',
        action: 'Intenta nuevamente más tarde.'
      }
    };
    return map[rawError] || {
      title: 'Error OAuth Desconocido',
      cause: 'El Authorization Server devolvió un error no clasificado.',
      action: 'Revisa logs y parámetros enviados.'
    };
  }, [rawError]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 OIDC Callback iniciado');
        console.log('📍 Current URL:', window.location.href);
        console.log('📍 Current pathname:', window.location.pathname);
        console.log('📍 Current search:', window.location.search);

        if (!searchParams) {
          console.error('❌ Missing URL parameters context');
          setError('Missing URL parameters context');
          return;
        }

        const code = searchParams.get('code') || undefined;
        const state = searchParams.get('state') || undefined;
        const oauthError = searchParams.get('error') || undefined;
        const oauthErrorDesc = searchParams.get('error_description') || undefined;

        console.log('📋 URL Parameters:');
        console.log('  - code:', code ? `${code.substring(0, 10)}...` : 'undefined');
        console.log('  - state:', state ? `${state.substring(0, 10)}...` : 'undefined');
        console.log('  - error:', oauthError);
        console.log('  - error_description:', oauthErrorDesc);

        if (oauthError) {
          console.error('❌ OAuth Error detected:', oauthError);
          console.error('❌ OAuth Error Description:', oauthErrorDesc);
          setRawError(oauthError);
          if (oauthErrorDesc) setErrorDescription(oauthErrorDesc);
          setError(`OAuth error: ${oauthError}`);
          return;
        }

        if (!code || !state) {
          console.error('❌ Missing required parameters');
          console.error('  - code present:', !!code);
          console.error('  - state present:', !!state);
          setError('Missing authorization code or state parameter');
          return;
        }

        const callbackUrl = `/api/oidc/callback?code=${code}&state=${state}`;
        console.log('🔄 Redirecting to server callback:', callbackUrl);
        console.log('⏰ Timestamp:', new Date().toISOString());

        // Redirect browser to server callback to complete auth and set httpOnly cookies.
        window.location.href = callbackUrl;
      } catch (error) {
        console.error('❌ Exception in callback handler:', error);
        console.error('❌ Error details:', {
          name: (error as any)?.name,
          message: (error as any)?.message,
          stack: (error as any)?.stack
        });
        setError('Failed to complete authentication');
      }
    };
    handleCallback();
  }, [searchParams]);

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50 w-fit mx-auto">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Autenticación Falló</h1>
          <p className="text-slate-600 dark:text-slate-400 font-mono text-sm break-all">{error}</p>
          {errorDescription && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">{decodeURIComponent(errorDescription)}</p>
          )}
          {errorHelp && (
            <div className="text-left bg-red-950/30 dark:bg-red-900/20 border border-red-500/30 rounded-md p-4 space-y-2">
              <div>
                <span className="font-semibold text-red-300">Tipo:</span> {errorHelp.title}
              </div>
              <div className="text-slate-400 text-sm">
                <span className="font-semibold text-slate-300">Causa probable:</span> {errorHelp.cause}
              </div>
              <div className="text-slate-400 text-sm">
                <span className="font-semibold text-slate-300">Acción sugerida:</span> {errorHelp.action}
              </div>
              <details className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                <summary className="cursor-pointer select-none">Debug técnico</summary>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>Verifica URL exacta de redirect en el RegisteredClient.</li>
                  <li>Confirma que el scope solicitado está en la metadata discovery.</li>
                  <li>Reinicia el Authorization Server si cambiaste scopes en memoria.</li>
                  <li>Revisa logs correlacionando timestamp.</li>
                  <li>Si se usa DB para RegisteredClient, revisa columna scopes.</li>
                </ul>
              </details>
            </div>
          )}
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Intentar de Nuevo
          </a>
          <a
            href="/"
            className="block text-xs text-slate-500 dark:text-slate-400 hover:text-slate-300 mt-2"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="p-4 rounded-full bg-blue-500/20 border border-blue-500/50 w-fit mx-auto">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Completando Autenticación</h1>
        <p className="text-slate-600 dark:text-slate-400">Por favor espera mientras procesamos tu login...</p>
      </div>
    </div>
  );
}

export default function OidcCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="p-4 rounded-full bg-blue-500/20 border border-blue-500/50 w-fit mx-auto">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Preparando Callback</h1>
            <p className="text-slate-600 dark:text-slate-400">Cargando parámetros de autenticación...</p>
          </div>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
