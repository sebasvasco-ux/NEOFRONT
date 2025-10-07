"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Shield, Zap, Lock } from 'lucide-react';
import { generatePKCE, generateRandomString } from '@/lib/pkce-utils';

// Simplified error mapping for better UX
const errorMessages: Record<string, { title: string; message: string; action?: string }> = {
  'invalid_request': {
    title: 'Solicitud Inválida',
    message: 'La solicitud de autenticación no es válida. Por favor intenta nuevamente.',
    action: 'Reiniciar el proceso'
  },
  'invalid_session': {
    title: 'Sesión Inválida',
    message: 'Tu sesión de autenticación ha expirado o es inválida.',
    action: 'Iniciar nueva sesión'
  },
  'invalid_state': {
    title: 'Error de Seguridad',
    message: 'Detectamos una inconsistencia en la solicitud. Por tu seguridad, reinicia el proceso.',
    action: 'Intentar de nuevo'
  },
  'token_exchange_failed': {
    title: 'Error de Comunicación',
    message: 'No pudimos completar la autenticación con el servidor de identidad.',
    action: 'Reintentar'
  },
  'missing_id_token': {
    title: 'Respuesta Incompleta',
    message: 'El servidor de identidad no proporcionó toda la información necesaria.',
    action: 'Reintentar autenticación'
  },
  'id_token_invalid': {
    title: 'Token Inválido',
    message: 'La respuesta del servidor de identidad no es válida.',
    action: 'Reiniciar proceso'
  },
  'internal_error': {
    title: 'Error Interno',
    message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    action: 'Reintentar'
  },
  'access_denied': {
    title: 'Acceso Denegado',
    message: 'Cancelaste el proceso de autenticación o no tienes los permisos necesarios.',
    action: 'Intentar nuevamente'
  },
  'authentication_configuration_error': {
    title: 'Servicio No Disponible',
    message: 'El servicio de autenticación no está configurado correctamente.',
    action: 'Contactar soporte'
  },
  'oauth2_server_unavailable': {
    title: 'Servidor OAuth2 No Disponible',
    message: 'El servidor de autenticación OAuth2 no está disponible. Por favor, asegúrate de que el servidor esté corriendo en el puerto 9000.',
    action: 'Reintentar más tarde'
  }
};

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDescription, setErrorDescription] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for OAuth errors in URL parameters
    if (searchParams) {
      const urlError = searchParams.get('error');
      const urlDescription = searchParams.get('description');
      
      if (urlError) {
        setError(urlError);
        if (urlDescription) {
          setErrorDescription(decodeURIComponent(urlDescription));
        }
      }
    }
  }, [searchParams]);

  const login = async () => {
    setIsLoading(true);
    setError(null);
    setErrorDescription(null);

    try {
      // Call OIDC start to get authorization URL and PKCE data
      const response = await fetch('/api/oidc/start');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();

      // Store PKCE data in sessionStorage for callback
      sessionStorage.setItem('oidc_pkce', JSON.stringify(data.pkce));

      // Redirect to OAuth2 server
      window.location.href = data.authorizeUrl;

    } catch (e: any) {
      console.error('Login error:', e);
      setError('authentication_failed');
      setErrorDescription(e.message || 'No se pudo iniciar el proceso de autenticación');
      setIsLoading(false);
    }
  };

  const getErrorInfo = () => {
    if (!error) return null;
    return errorMessages[error] || {
      title: 'Error Desconocido',
      message: errorDescription || 'Ocurrió un error durante la autenticación.',
      action: 'Reintentar'
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main login container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center mb-2 animate-spin-slow">
            <img src="/CuboSpectra.png" alt="Spectra DC" className="w-80 h-80" />
          </div>
          <h1 className="text-6xl font-thin text-white mb-2 tracking-wide">
            <span className="text-blue-400">Spectra</span><span className="text-cyan-300 font-light">DC</span>
          </h1>
          <p className="text-blue-300 text-sm">
            Plataforma de Acceso Seguro
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Error display */}
          {errorInfo && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-red-300 text-sm">
                    {errorInfo.title}
                  </h3>
                  <p className="text-red-400 text-sm mt-1">
                    {errorInfo.message}
                  </p>
                  {errorDescription && process.env.NODE_ENV === 'development' && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer hover:text-red-400">
                        Detalles técnicos
                      </summary>
                      <p className="text-xs font-mono mt-1 text-red-500">
                        {errorDescription}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Login button */}
          <Button 
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-lg rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-0" 
            size="lg" 
            onClick={login} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <Lock className="mr-3 h-5 w-5" />
                <span>{errorInfo?.action || 'Iniciar Sesión Segura'}</span>
              </>
            )}
          </Button>

          {/* Security features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
              <Zap className="w-3 h-3" />
              <span>Autenticación Cuántica</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>OAuth 2.0</span>
              <span>•</span>
              <span>PKCE</span>
              <span>•</span>
              <span>256-bit</span>
            </div>
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
