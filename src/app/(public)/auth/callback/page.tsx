"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Procesando autenticación...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const code = searchParams?.get('code');
      const state = searchParams?.get('state');
      const errorParam = searchParams?.get('error');
      const errorDescription = searchParams?.get('error_description');

      // Handle OAuth errors
      if (errorParam) {
        throw new Error(errorDescription || `OAuth Error: ${errorParam}`);
      }

      // Validate required parameters
      if (!code || !state) {
        throw new Error('Missing required OAuth2 parameters');
      }

      setMessage('Intercambiando código por tokens...');

      // Retrieve PKCE data from sessionStorage
      const pkceDataStr = sessionStorage.getItem('oidc_pkce');
      if (!pkceDataStr) {
        throw new Error('PKCE data not found. Please try logging in again.');
      }

      const pkceData = JSON.parse(pkceDataStr);

      // Build the callback URL with code, state, and PKCE data
      const callbackUrl = `/api/oidc/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&pkce=${encodeURIComponent(JSON.stringify(pkceData))}`;

      // Clean up sessionStorage
      sessionStorage.removeItem('oidc_pkce');

      // Redirect to the API route - it will handle token exchange and redirect to dashboard
      window.location.href = callbackUrl;
      // Note: Code below won't execute as browser is redirecting

    } catch (error: any) {
      console.error('Auth callback error:', error);
      setError(error.message || 'Error durante la autenticación');
      setStatus('error');
      setMessage('Error en la autenticación');

      // Redirect to login after showing error
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="text-center">
            {/* Status icon */}
            <div className="mb-6 flex justify-center">
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 text-green-400" />
              )}
              {status === 'error' && (
                <AlertCircle className="h-16 w-16 text-red-400" />
              )}
            </div>

            {/* Status message */}
            <h1 className="text-2xl font-semibold text-white mb-2">
              {status === 'loading' && 'Procesando Autenticación'}
              {status === 'success' && '¡Autenticación Exitosa!'}
              {status === 'error' && 'Error de Autenticación'}
            </h1>

            <p className="text-blue-300 mb-6">
              {message}
            </p>

            {/* Error details */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Loading progress */}
            {status === 'loading' && (
              <div className="w-full bg-blue-900/50 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}

            {/* Action buttons */}
            {status === 'error' && (
              <button
                onClick={() => router.push('/login')}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Volver al Login
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by Spectra DC™
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function AuthCallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white">Cargando...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
