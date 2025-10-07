# Implementation Guide - Sistema de Autenticación OIDC

## Overview
Esta guía explica cómo está implementado el sistema de autenticación OAuth 2.0 + OIDC con PKCE en el frontend de NEO-FrontEnd, siguiendo las mejores prácticas de seguridad y los requisitos del backend.

## Arquitectura del Sistema

### Componentes Principales
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Gateway      │    │  OAuth2 Server  │
│  (Next.js)      │    │  (Port 8081)    │    │  (Port 9000)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. /api/oidc/start    │                       │
         ├─────────────────────→│                       │
         │                       │ 2. /oauth2/authorize │
         │                       ├─────────────────────→│
         │                       │                       │
         │                       │ 3. Authorization     │
         │                       │    Response          │
         │                       │←─────────────────────│
         │ 4. /auth/callback     │                       │
         │←─────────────────────│                       │
         │                       │                       │
         │ 5. /api/oidc/callback │                       │
         ├─────────────────────→│                       │
         │                       │ 6. /oauth2/token     │
         │                       ├─────────────────────→│
         │                       │                       │
         │                       │ 7. Token Response    │
         │                       │←─────────────────────│
         │ 8. Session Created    │                       │
         │←─────────────────────│                       │
```

## Flujo de Autenticación Detallado

### 1. Inicio del Flujo (Login)
```typescript
// Archivo: src/app/api/oidc/start/route.ts
export async function GET(req: Request) {
  // 1. Validar configuración OIDC
  const { issuer, client_id, redirect_uri } = validateOIDCConfig()
  
  // 2. Generar PKCE
  const code_verifier = base64URLEncode(crypto.randomBytes(32))
  const code_challenge = base64URLEncode(sha256(code_verifier))
  const state = base64URLEncode(crypto.randomBytes(16))
  const nonce = base64URLEncode(crypto.randomBytes(16))
  
  // 3. Almacenar PKCE en cookie segura
  res.cookies.set('__Host-oidc_pkce', pkcePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300 // 5 minutos
  })
  
  // 4. Redirigir a gateway
  const gatewayUrl = `${gatewayUrl}/api/oidc/start?${params.toString()}`
  return NextResponse.redirect(gatewayUrl)
}
```

### 2. Manejo del Callback
```typescript
// Archivo: src/app/(public)/auth/callback/page.tsx
export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // 1. Extraer parámetros de la URL
      const code = searchParams?.get('code')
      const state = searchParams?.get('state')
      
      // 2. Validar parámetros
      if (!code || !state) {
        setError('invalid_request')
        return
      }
      
      // 3. Redirigir a endpoint API para intercambio de tokens
      const callbackUrl = `/api/oidc/callback?code=${code}&state=${state}`
      window.location.href = callbackUrl
    }
    handleCallback()
  }, [])
}
```

### 3. Intercambio de Tokens
```typescript
// Archivo: src/app/api/oidc/callback/route.ts
export async function GET(req: Request) {
  // 1. Validar PKCE desde cookie
  const pkceData = parsePKCECookie(cookieHeader)
  
  // 2. Validar state CSRF
  if (state !== pkceData.state) {
    return NextResponse.redirect('/login?error=invalid_state')
  }
  
  // 3. Intercambiar código por tokens via gateway
  const tokenRes = await fetch(`${gatewayUrl}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier: pkceData.code_verifier // ✅ PKCE requerido
    })
  })
  
  // 4. Verificar ID token
  const verifiedPayload = await verifyIdToken(id_token, {
    issuer,
    clientId: client_id,
    expectedNonce: pkceData.nonce
  })
  
  // 5. Crear sesión opaca
  sessionStore.set(sessionId, {
    sub: verifiedPayload.sub,
    access_token: tokenJson.access_token,
    id_token: tokenJson.id_token,
    refresh_token: tokenJson.refresh_token,
    expires_at: nowSec + expiresIn,
    claims: userinfoClaims
  })
  
  // 6. Establecer cookie de sesión
  res.cookies.set('__Host-neo_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn
  })
  
  return NextResponse.redirect('/dashboard')
}
```

### 4. Refresh Automático de Tokens
```typescript
// Archivo: src/lib/refresh.ts
export async function ensureFreshSession(sessionId: string) {
  const session = sessionStore.get(sessionId)
  const nowSec = Math.floor(Date.now() / 1000)
  
  // 1. Verificar si necesita refresh (60 segundos antes de expirar)
  const remaining = session.expires_at - nowSec
  if (remaining > EXP_LEEWAY) return session
  
  // 2. Prevenir refresh concurrente
  const existingLock = sessionStore.getRefreshLock(sessionId)
  if (existingLock) {
    await existingLock
    return sessionStore.get(sessionId)
  }
  
  // 3. Ejecutar refresh via gateway
  const refreshPromise = performRefresh(sessionId, session)
  sessionStore.setRefreshLock(sessionId, refreshPromise)
  await refreshPromise
  
  return sessionStore.get(sessionId)
}

async function performRefresh(sessionId: string, session: StoredSession) {
  // 1. Llamar a gateway para refresh
  const res = await fetch(`${gatewayUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refresh_token,
      client_id
    })
  })
  
  // 2. Actualizar sesión con nuevos tokens
  sessionStore.set(sessionId, {
    ...session,
    access_token: newAccess,
    expires_at: nowSec + expiresIn,
    refresh_token: newRefresh || session.refresh_token,
    rotations: session.rotations + 1
  })
}
```

### 5. Protección de Rutas
```typescript
// Archivo: middleware.ts
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // 1. Rutas públicas (no requieren autenticación)
  if (isPublic(pathname)) {
    return NextResponse.next()
  }
  
  // 2. Rutas privadas (requieren autenticación)
  const isPrivate = PRIVATE_PREFIXES.some(p => 
    pathname === p || pathname.startsWith(p + '/')
  )
  
  if (isPrivate) {
    const sessionCookie = req.cookies.get('__Host-neo_session')
    if (!sessionCookie) {
      // Redirigir a login preservando destino
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}
```

### 6. Verificación de Sesión en Layout Privado
```typescript
// Archivo: src/app/(private)/layout.tsx
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // 1. Verificar cookie de sesión
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__Host-neo_session')
  if (!sessionCookie) redirect('/login')
  
  // 2. Cargar sesión y hacer refresh si es necesario
  let session = sessionStore.get(sessionCookie.value)
  session = await ensureFreshSession(sessionCookie.value) || session
  if (!session) redirect('/login')
  
  // 3. Extraer información de usuario
  const user = { sub: session.sub, email: session.claims?.email }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  )
}
```

## Gestión de Sesiones

### Session Store (In-Memory con Persistencia)
```typescript
// Archivo: src/lib/session-store.ts
class SessionStore {
  private sessions = new Map<string, StoredSession>()
  private refreshLocks = new Map<string, Promise<void>>()
  
  // Crear sesión
  set(sessionId: string, session: StoredSession) {
    this.sessions.set(sessionId, session)
    this.persistToDisk() // Persistencia automática
  }
  
  // Obtener sesión
  get(sessionId: string): StoredSession | undefined {
    return this.sessions.get(sessionId)
  }
  
  // Eliminar sesión
  delete(sessionId: string) {
    this.sessions.delete(sessionId)
    this.persistToDisk()
  }
  
  // Lock para refresh concurrente
  setRefreshLock(sessionId: string, promise: Promise<void>) {
    this.refreshLocks.set(sessionId, promise)
  }
  
  // Persistencia en disco
  private async persistToDisk() {
    // Implementación para sobrevivir a reinicios
  }
}
```

### Estructura de Sesión
```typescript
interface StoredSession {
  sub: string                    // Subject del usuario
  access_token: string          // Token de acceso
  id_token: string             // ID token JWT
  refresh_token?: string       // Token de refresh
  expires_at: number           // Expiración access token
  created_at: number           // Timestamp creación
  absolute_expires_at: number  // Expiración absoluta (8h)
  rotations: number            // Contador de refresh
  claims?: {                   // Claims del userinfo
    email?: string
    email_verified?: boolean
    name?: string
    preferred_username?: string
  }
}
```

## Seguridad Implementada

### 1. PKCE (Proof Key for Code Exchange)
- **Método**: S256 (SHA256 + base64url)
- **Code Verifier**: 32 bytes random
- **Code Challenge**: SHA256(code_verifier)
- **Almacenamiento**: Cookie HttpOnly, 5 minutos TTL

### 2. Protección CSRF
- **State Parameter**: 16 bytes random
- **Validación**: Comparación estricta en callback
- **Almacenamiento**: Cookie PKCE junto con state

### 3. Validación JWT
- **Firma**: Verificación con JWKS del issuer
- **Claims**: iss, aud, exp, iat, nonce
- **Algoritmo**: RS256 requerido

### 4. Cookies Seguras
- **Prefijo**: `__Host-` (requiere Secure, Path=/)
- **HttpOnly**: No accesible desde JavaScript
- **SameSite**: Lax (protección CSRF)
- **Secure**: Solo en HTTPS (producción)

### 5. Refresh Token Rotation
- **Contador**: `rotations` por cada refresh exitoso
- **Lock**: Prevenir refresh concurrente
- **Revocación**: Eliminar sesión si refresh falla

## Manejo de Errores

### Tipos de Error y Manejo
```typescript
const errorMessages = {
  'invalid_request': {
    title: 'Solicitud Inválida',
    message: 'La solicitud de autenticación no es válida.',
    action: 'Reiniciar el proceso'
  },
  'access_denied': {
    title: 'Acceso Denegado',
    message: 'Cancelaste el proceso de autenticación.',
    action: 'Intentar nuevamente'
  },
  'invalid_session': {
    title: 'Sesión Inválida',
    message: 'Tu sesión de autenticación ha expirado.',
    action: 'Iniciar nueva sesión'
  },
  'token_exchange_failed': {
    title: 'Error de Comunicación',
    message: 'No pudimos completar la autenticación.',
    action: 'Reintentar'
  }
}
```

### Logging Estructurado
```typescript
// Archivo: src/lib/logger.ts
export function logAuth(event: string, context: any, level: 'info' | 'warn' | 'error' = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    context,
    level,
    service: 'frontend-auth'
  }
  
  console.log(JSON.stringify(logEntry))
}

// Ejemplos de uso:
logAuth('start.success', { scope, state })
logAuth('callback.success', { sub: verifiedPayload.sub })
logAuth('refresh.failed', { sessionId, status: 400 }, 'warn')
```

## Configuración y Variables de Entorno

### Variables Requeridas
```bash
# Configuración OIDC
NEXT_PUBLIC_OIDC_ISSUER=http://localhost:9000
NEXT_PUBLIC_OIDC_CLIENT_ID=frontend-client
NEXT_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3010/auth/callback

# Gateway
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081

# Scopes
NEXT_PUBLIC_OIDC_SCOPES=openid profile email read:users

# Entorno
NODE_ENV=development
PORT=3010
```

### Validación de Configuración
```typescript
function validateOIDCConfig() {
  const required = [
    'NEXT_PUBLIC_OIDC_ISSUER',
    'NEXT_PUBLIC_OIDC_CLIENT_ID',
    'NEXT_PUBLIC_OIDC_REDIRECT_URI'
  ]
  
  const missing = required.filter(varName => !process.env[varName])
  if (missing.length > 0) {
    throw new Error(`Missing OIDC configuration: ${missing.join(', ')}`)
  }
  
  // Validar formato de URLs
  try {
    new URL(process.env.NEXT_PUBLIC_OIDC_ISSUER!)
    new URL(process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!)
  } catch (e) {
    throw new Error('Invalid OIDC URL format')
  }
  
  return {
    issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER!,
    client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI!
  }
}
```

## Testing y Verificación

### Tests de Integración Recomendados
```typescript
// 1. Test de flujo completo
describe('OAuth2 Flow', () => {
  it('should complete full authentication flow', async () => {
    // 1. Iniciar login
    const startResponse = await fetch('/api/oidc/start')
    expect(startResponse.status).toBe(302)
    
    // 2. Simular callback
    const callbackResponse = await fetch('/api/oidc/callback?code=xxx&state=yyy')
    expect(callbackResponse.status).toBe(302)
    expect(callbackResponse.headers.get('location')).toBe('/dashboard')
    
    // 3. Verificar sesión
    const meResponse = await fetch('/api/oidc/me')
    const meData = await meResponse.json()
    expect(meData.authenticated).toBe(true)
  })
})

// 2. Test de refresh token
describe('Token Refresh', () => {
  it('should refresh token automatically', async () => {
    // Simular token expirado
    const expiredSession = createExpiredSession()
    sessionStore.set('test-session', expiredSession)
    
    // Verificar refresh automático
    const freshSession = await ensureFreshSession('test-session')
    expect(freshSession.expires_at).toBeGreaterThan(Date.now() / 1000)
  })
})
```

### Verificación Manual
```bash
# 1. Verificar configuración PKCE
curl -X GET "http://localhost:9000/.well-known/openid-configuration" | jq '.code_challenge_methods_supported'

# 2. Test endpoint start
curl -X GET "http://localhost:3010/api/oidc/start" -v

# 3. Verificar sesión activa
curl -X GET "http://localhost:3010/api/oidc/me" -H "Cookie: __Host-neo_session=xxx"

# 4. Test logout
curl -X POST "http://localhost:3010/api/oidc/logout" -H "Cookie: __Host-neo_session=xxx"
```

## Mejores Prácticas

### 1. Seguridad
- ✅ Usar siempre PKCE para SPAs
- ✅ Validar todos los parámetros de entrada
- ✅ Implementar manejo seguro de errores
- ✅ Usar cookies HttpOnly con prefijo `__Host-`
- ✅ Implementar refresh token rotation

### 2. Performance
- ✅ Implementar cache de JWKS
- ✅ Usar locks para refresh concurrente
- ✅ Persistencia eficiente de sesiones
- ✅ Logging asíncrono

### 3. UX/UI
- ✅ Estados de loading claros
- ✅ Mensajes de error amigables
- ✅ Redirecciones transparentes
- ✅ Preservación de destino original

### 4. Mantenimiento
- ✅ Logging estructurado
- ✅ Configuración validada
- ✅ Documentación actualizada
- ✅ Tests automatizados

## Troubleshooting

### Problemas Comunes
1. **CORS Errors**: Verificar configuración CORS en gateway
2. **Redirect URI Mismatch**: Confirmar URI registrada en OAuth2 server
3. **PKCE Required**: Asegurar que code_verifier está incluido
4. **Invalid State**: Verificar generación y validación de state
5. **Token Expired**: Implementar refresh automático

### Debug Tips
```typescript
// Habilitar logging detallado
DEBUG_OIDC=true npm run dev

// Verificar cookies en browser
document.cookie

// Monitorear sesión
sessionStore.getAllSessions()

// Validar PKCE
console.log('PKCE Data:', pkceData)
console.log('State Validation:', state === pkceData.state)
```

Esta guía proporciona una implementación completa y segura del sistema de autenticación OIDC, siguiendo las mejores prácticas y los requisitos específicos del backend.
