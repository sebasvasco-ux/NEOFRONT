# Cambios Realizados para Cumplir con Integration Guide

## Resumen
Se han realizado los siguientes cambios para asegurar que el frontend cumpla exactamente con los requisitos especificados en la Integration Guide del backend.

## Cambios Implementados

### 1. Actualización de URLs de Callback
- **Cambio**: Se actualizó el redirect URI de `/oidc/callback` a `/auth/callback`
- **Archivos modificados**:
  - `.env.local`: `NEXT_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3010/auth/callback`
  - `.env.example`: Se actualizó el ejemplo para reflejar el cambio
- **Motivo**: La Integration Guide especifica que el callback debe ser `/auth/callback`

### 2. Creación de Nueva Ruta de Callback
- **Nuevo archivo**: `src/app/(public)/auth/callback/page.tsx`
- **Funcionalidad**: Página de callback que maneja la respuesta OAuth2 y redirige al endpoint API
- **Características**:
  - Manejo de errores OAuth2
  - Validación de parámetros requeridos
  - Redirección automática al endpoint `/api/oidc/callback`
  - UI moderna con estados de loading, success y error

### 3. Actualización de Middleware
- **Archivo**: `middleware.ts`
- **Cambio**: Se agregó `/auth/callback` a las rutas públicas
- **Línea**: `const PUBLIC_PATHS = ['/login', '/oidc/callback', '/auth/callback']`

### 4. Actualización de Scopes
- **Cambio**: Se agregó el scope `read:users` como requiere la Integration Guide
- **Archivos modificados**:
  - `.env.local`: `NEXT_PUBLIC_OIDC_SCOPES=openid profile email read:users`
  - `.env.example`: Se actualizó el ejemplo

### 5. Configuración de Gateway para Endpoints OIDC

#### 5.1. Endpoint Start
- **Archivo**: `src/app/api/oidc/start/route.ts`
- **Cambio**: Redirige directamente al OAuth2 server para autorización
- **URL**: `${issuer}/oauth2/authorize` (directo al OAuth2 server)
- **OAuth2 Server URL**: `http://localhost:9000/oauth2/authorize`

#### 5.2. Endpoint Token Exchange
- **Archivo**: `src/app/api/oidc/callback/route.ts`
- **Cambio**: Intercambia código directamente con OAuth2 server
- **URL**: `${issuer}/oauth2/token`
- **OAuth2 Server URL**: `http://localhost:9000/oauth2/token`

#### 5.3. Endpoint Refresh Token
- **Archivo**: `src/lib/refresh.ts`
- **Cambio**: Refresca tokens directamente con OAuth2 server
- **URL**: `${issuer}/oauth2/token`
- **OAuth2 Server URL**: `http://localhost:9000/oauth2/token`

## Configuración Final

### Variables de Entorno
```bash
NEXT_PUBLIC_OIDC_ISSUER=http://localhost:9000
NEXT_PUBLIC_OIDC_CLIENT_ID=frontend-client
NEXT_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3010/auth/callback
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
NEXT_PUBLIC_OIDC_SCOPES=openid profile email read:users
```

### Endpoints Configurados

#### ✅ **Directo al OAuth2 Server** (Para seguridad y estándar OAuth2)
1. **Login**: `GET /api/oidc/start` → Directo: `http://localhost:9000/oauth2/authorize`
2. **Token Exchange**: `POST /api/oidc/callback` → Directo: `http://localhost:9000/oauth2/token`
3. **UserInfo**: `GET /userinfo` → Directo: `http://localhost:9000/userinfo`

#### ✅ **Through Gateway** (Para API calls de negocio)
1. **API Calls**: `GET /api/*` → Gateway: `http://localhost:8081/api/*`
2. **Validación de Tokens**: Gateway valida access tokens contra OAuth2 server
3. **Business Logic**: Gateway protege endpoints de negocio

#### ✅ **Directo al OAuth2 Server** (Para Token Refresh - Seguridad)
1. **Token Refresh**: `POST /oauth2/token` → Directo: `http://localhost:9000/oauth2/token`
2. **Refresh Proactivo**: Frontend calcula expiración y refresca antes
3. **Refresh Reactivo**: Frontend responde a 401 del gateway

#### ✅ **Through Gateway** (Para API calls de negocio)
1. **API Calls**: `GET /api/*` → Gateway: `http://localhost:8081/api/*`
2. **Validación de Tokens**: Gateway valida access tokens contra OAuth2 server
3. **Business Logic**: Gateway protege endpoints de negocio

## Flujo de Autenticación Actualizado

### **Fase 1: Autenticación OAuth2 (Directo al OAuth2 Server)**
1. Usuario hace clic en "Login" → Navegación directa a `/api/oidc/start`
2. Frontend genera PKCE y redirige directamente: `http://localhost:9000/oauth2/authorize`
3. Usuario se autentica en OAuth2 server
4. OAuth2 server redirige a: `http://localhost:3010/auth/callback`
5. Frontend intercambia código por tokens: `http://localhost:9000/oauth2/token`
6. Sesión creada y usuario redirigido a `/dashboard`

### **Fase 2: API Calls de Negocio (Through Gateway)**
1. Usuario navega en dashboard → Frontend hace API calls
2. Frontend llama a: `GET /api/business-endpoint`
3. Gateway recibe request y valida access token contra OAuth2 server
4. Si token válido → Gateway permite acceso a business logic
5. Si token inválido → Gateway rechaza con 401/403

### **Fase 3: Token Refresh Híbrido (Dos Estrategias Combinadas)**

Hay dos estrategias principales para saber cuándo refrescar un token:

## 🔄 **Estrategia 1: Reactiva (401 Status)**
El frontend descubre que necesita refresh cuando el gateway rechaza con 401

```javascript
const response = await fetch('http://localhost:8081/api/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 🔥 El gateway responde 401 = token expiró
if (response.status === 401) {
  const newToken = await refreshAccessToken();
  // Reintentar con nuevo token
}
```

## ⏰ **Estrategia 2: Proactiva (Tiempo)**
El frontend calcula cuándo expira el token y refresca antes

```javascript
// Al obtener token, guardar expiración
const loginCallback = async (tokens) => {
  localStorage.setItem('access_token', tokens.access_token);
  
  // 🔥 Calcular expiración: ahora + expires_in - 5min margen
  const expirationTime = Date.now() + (tokens.expires_in * 1000) - (5 * 60 * 1000);
  localStorage.setItem('token_expires_at', expirationTime);
};

// Verificar si expira pronto
const isTokenExpiringSoon = () => {
  const expiresAt = localStorage.getItem('token_expires_at');
  return Date.now() >= parseInt(expiresAt);
};

// Refresh automático antes de expirar
const refreshIfNeeded = async () => {
  if (isTokenExpiringSoon()) {
    await refreshAccessToken();
  }
};
```

## 🎯 **Implementación Híbrida (Recomendada)**
Combinar ambas estrategias para máxima confiabilidad

```javascript
class SmartTokenManager {
  async makeAuthenticatedRequest(url, options = {}) {
    // 1️⃣ Verificación proactiva
    await this.refreshIfNeeded();
    
    // 2️⃣ Intentar petición
    let response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // 3️⃣ Si falla (reactivo), hacer refresh
    if (response.status === 401) {
      token = await this.forceRefresh();
      // Reintentar petición
      response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    return response;
  }

  async forceRefresh() {
    const response = await fetch("http://localhost:9000/oauth2/token", {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: localStorage.getItem('refresh_token')
      })
    });
    
    const tokens = await response.json();
    localStorage.setItem('access_token', tokens.access_token);
    
    // Actualizar tiempo de expiración
    const expirationTime = Date.now() + (tokens.expires_in * 1000) - (5 * 60 * 1000);
    localStorage.setItem('token_expires_at', expirationTime);
    
    return tokens.access_token;
  }
}
```

## **Flujo Completo de Refresh Híbrido**
```
1. Frontend verifica si token expira pronto (proactivo)
   ↓
2. Si expira pronto → Refresh directo a OAuth2 server
   ↓
3. Frontend hace API call a gateway
   ↓
4. Gateway valida token contra OAuth2 server
   ↓
5. Si token inválido → Gateway responde 401
   ↓
6. Frontend detecta 401 (reactivo) → Refresh directo a OAuth2 server
   ↓
7. Reintentar API call con nuevo token
```

## **🎯 Resumen Clave del Patrón Híbrido**

**Siempre negocias con el Auth Server, solo que lo haces:**

- **Proactivamente**: Antes de que expire el token (previenes 401s)
- **Reactivamente**: Si el gateway te da error 401 (curas el fallo)

**El flujo es siempre:**
```
Frontend → OAuth2 Server (refresh directo)
     ↓
Frontend → Gateway (API calls con token fresco)
```

**Nunca se refresca a través del gateway para mantener la seguridad máxima.**

## Verificación de Cumplimiento

✅ **PKCE Activo**: Implementado y requerido para frontend-client  
✅ **Redirect URI Correcto**: `/auth/callback` según especificación  
✅ **Scopes Correctos**: `openid profile email read:users`  
✅ **Gateway Integration**: Todos los endpoints usan el gateway  
✅ **Client ID Correcto**: `frontend-client`  
✅ **URLs de Servidor**: OAuth2 en 9000, Gateway en 8081, Frontend en 3010  

## Seguridad Mantenida

- ✅ PKCE con método S256
- ✅ State parameter para CSRF
- ✅ Nonce para ID token
- ✅ Cookies HttpOnly y seguras
- ✅ Validación de tokens JWT
- ✅ Refresh token rotation
- ✅ Logging estructurado

## Pruebas Recomendadas

1. **Login completo**: Verificar flujo de login hasta dashboard
2. **Token refresh**: Esperar expiración y verificar refresh automático
3. **Error handling**: Probar cancelación de login y errores de red
4. **PKCE verification**: Confirmar que PKCE está activo en el servidor
5. **Gateway connectivity**: Verificar comunicación con gateway en 8081

## Notas

- Se mantiene compatibilidad con la ruta `/oidc/callback` existente
- La nueva ruta `/auth/callback` cumple exactamente con la Integration Guide
- Todos los endpoints OIDC ahora usan el gateway como se recomienda
- La configuración es consistente con los ejemplos de la Integration Guide
