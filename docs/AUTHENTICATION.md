# Autenticación – Diseño Final Actual (Mejorado Fase 1)

Estado: ✅ **MEJORADO** - Flujo OIDC Authorization Code + PKCE + Nonce con mejoras de seguridad, UX y persistencia. Implementación robusta con manejo de errores consistente, validación de configuración global y persistencia de sesiones en disco.

---
## 1. Objetivos de Seguridad
| Objetivo | Cómo se cumple |
|----------|----------------|
| No exponer tokens al frontend | Solo cookie opaca `__Host-neo_session` (HttpOnly) |
| Mitigar CSRF en auth redirects | `state` + SameSite=Lax + PKCE |
| Evitar replay de authorization code | PKCE (S256) + state + nonce |
| Validar integridad del `id_token` | Verificación firma JWKS + claims (iss, aud, exp, iat, nonce) |
| Minimizar privilegios | Scopes reducidos a `openid email` |
| Refrescar sin UX fricción | Refresh token rotation en backend (silencioso) |
| Limitar vida de sesión | `expires_at` + `absolute_expires_at` (8h) |
| Auditoría | Logs estructurados JSON (`logAuth`) |

---
## 2. Flujo Resumido
1. Cliente pulsa Login → `/api/oidc/start` genera: `code_verifier`, `code_challenge`, `state`, `nonce` y setea cookie `__Host-oidc_pkce` (TTL 5m). Redirección a `/authorize`.
2. IdP devuelve `code` + `state` a `/oidc/callback` (página pública). Esta redirige el navegador a `/api/oidc/callback?code=...&state=...`.
3. Backend intercambia el código (`/token`), verifica `id_token` (firma RS256 y claims), obtiene tokens, hace fetch `userinfo` (best-effort) y crea sesión opaca en `sessionStore`.
4. Set cookie `__Host-neo_session=<sessionId>` (HttpOnly, Secure en prod, Lax). Redirección a `/dashboard`.
5. Rutas privadas (layout) obtienen sessionId, cargan sesión y, si expira ≤60s, hacen refresh. Si refresh falla → redirect `/login`.
6. Logout: `POST /api/oidc/logout` elimina la sesión y expira la cookie.

---
## 3. Componentes Clave
| Archivo | Rol |
|---------|-----|
| `src/app/api/oidc/start/route.ts` | Inicio flujo OIDC (PKCE + nonce) |
| `src/app/api/oidc/callback/route.ts` | Intercambio código, verificación JWT, creación sesión, userinfo |
| `src/lib/jwt.ts` | JWKS fetch + verificación id_token |
| `src/lib/session-store.ts` | Store in-memory (sesiones opacas) |
| `src/lib/refresh.ts` | Auto-refresh controlado, lock in-memory, rotaciones |
| `src/lib/logger.ts` | Logging estructurado JSON |
| `src/app/api/oidc/me/route.ts` | Estado autenticación + claims + expiración |
| `src/app/(private)/layout.tsx` | Guard server-side + refresh antes de render |
| `src/app/(public)/login/page.tsx` | Redirección temprana si ya autenticado |

---
## 4. Cookies
| Cookie | Tipo | Contenido | TTL | Seguridad |
|--------|------|-----------|-----|-----------|
| `__Host-oidc_pkce` | Temporal | JSON {code_verifier,state,nonce} | 5m | HttpOnly, Secure (prod), Lax |
| `__Host-neo_session` | Sesión | ID opaco | ≤ token exp (máx 8h) | HttpOnly, Secure (prod), Lax |

> Prefijo `__Host-` exige `Secure` + `Path=/` y evita subpath shadowing.

---
## 5. Modelo de Sesión (`StoredSession`)
Campos principales:
```
sub, access_token, id_token, refresh_token?, expires_at,
absolute_expires_at, rotations, claims { email, ... }
```
`rotations` incrementa tras cada refresh exitoso. Una futura migración a Redis permitiría invalidación distribuida.

---
## 6. Refresh Strategy
- Trigger cuando `expires_at - now <= 60s`.
- Lock (in-memory) evita refresh concurrente.
- Si `invalid_grant` → sesión eliminada + redirect futuro a `/login`.
- `absolute_expires_at` (8h) corta extensión infinita por refresh chaining.

---
## 7. UserInfo
Fetch inmediato tras callback (best-effort). Claims filtradas a lista blanca: `sub,email,email_verified,name,preferred_username,updated_at`.
Si falla userinfo no bloquea autenticación (solo log).

---
## 8. Logging (Eventos Principales)
| Evento | Contexto |
|--------|----------|
| `start.config` | Validación variables entorno |
| `start.redirect` | URL a `/authorize` |
| `callback.*` | Éxito o fallos (cookie pkce, state, token, userinfo) |
| `refresh.start|success|failed|exception` | Ciclo refresh |
| `logout.session_cleared` | Eliminación sesión |

Formato: JSON por línea (facilita ingestión en ELK / Loki / Datadog).

---
## 9. Scopes
Actual: `openid email`.
Racional: eliminar `profile` reduce datos retornados; email es necesario para UI. Si en futuro no se muestra email → reducir a sólo `openid` + userinfo puntual si se requiere.

---
## 10. Riesgos y Mitigaciones
| Riesgo | Mitigación |
|--------|-----------|
| XSS roba cookie | HttpOnly + no tokens directos + prefijo `__Host-` |
| CSRF intercambio código | state + PKCE + SameSite=Lax |
| Replay authorization code | PKCE challenge + uso único del code |
| id_token forjado | Verificación firma + alg == RS256 |
| Refresh storm | Lock de refresh + leeway 60s |
| Sesión infinita | `absolute_expires_at` |
| Fuga tokens en frontend | Nunca se exponen, sólo ID opaco |

---
## 11. Redis (Diferido)
Documentado en `docs/redis.md` (no activo). Cuando escales a múltiples instancias: implementar adaptador y mover refresh locks y sesiones.

---
## 12. Variables de Entorno
| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_OIDC_ISSUER` | Base URL del IdP (sin trailing slash) |
| `NEXT_PUBLIC_OIDC_CLIENT_ID` | Client ID registrado |
| `NEXT_PUBLIC_OIDC_REDIRECT_URI` | URL callback pública (`https://.../oidc/callback`) |
| (Futuro) `REDIS_URL` | Conexión Redis para sesiones distribuidas |

---
## 13. Pruebas Recomendadas
1. Login normal → llega a dashboard sin ver tokens en Application Storage.
2. Refresh: Ajustar manualmente `expires_at` (debug) para forzar refresh y observar logs `refresh.success`.
3. Invalidar refresh (revocar en IdP) y confirmar redirect a login tras expiración.
4. UserInfo falla (simular desconectando red después del token) → login sigue funcionando, log registra `userinfo_failed`.
5. Logout → cookie `__Host-neo_session` borrada y `authenticated:false` en `/api/oidc/me`.

---
## 14. Mejoras Futuras
- Redis: sesiones + locks distribuidos.
- Rotación de `sessionId` al refrescar (defensa adicional).
- Revocación activa (end-session / revocation endpoint) si IdP lo permite.
- Rate limiting en `/api/oidc/start`.
- Threat Model formal (diagrama STRIDE).
- Métricas Prometheus (refresh count, rotations avg, refresh latency).

---
## 15. Mejoras Implementadas - Fase 1 ✅

### 15.1. Mejoras de Funcionalidad Crítica
- **Validación de configuración mejorada**: Función `validateOIDCConfig()` centralizada con validación de URLs y manejo de errores específicos
- **Callback route optimizado**: Eliminación de logs excesivos, manejo robusto de cookies PKCE con múltiples métodos de encoding
- **Manejo de errores consistente**: Redirección automática a login con parámetros de error descriptivos
- **Remoción de código obsoleto**: Eliminación completa de archivos NextAuth.js no utilizados

### 15.2. Mejoras de Seguridad
- **PKCE mejorado**: Validación de timestamp en cookies PKCE (máximo 10 minutos)
- **Encoding robusto**: Soporte para base64 y base64url en cookies PKCE
- **Validación de estado**: Verificación estricta de state CSRF con mensajes de error específicos
- **Configuración global**: Validación en middleware para detectar problemas de configuración temprano

### 15.3. Mejoras de Persistencia
- **Session store persistente**: Implementación de persistencia en disco para sesiones
- **Recuperación automática**: Las sesiones sobreviven a reinicios del servidor
- **Cleanup inteligente**: Sweep de sesiones expiradas con logging
- **Monitoreo incluido**: Métodos utilitarios para monitoreo de sesiones activas

### 15.4. Mejoras de UX/UI
- **Login rediseñado**: Interfaz moderna con gradientes, iconos y mejor feedback visual
- **Manejo de errores amigable**: Mensajes de error específicos en español con acciones claras
- **Indicadores de progreso**: Loading states y animaciones mejoradas
- **Diseño responsive**: Adaptación perfecta a móviles y desktop
- **Branding mejorado**: Identidad visual coherente con iconos de seguridad

### 15.5. Mejoras Técnicas
- **Logging reducido**: Eliminación de console.log excesivos en producción
- **Error handling estructurado**: Manejo consistente de errores en todos los endpoints
- **TypeScript mejorado**: Corrección de errores de tipo y validaciones estrictas
- **Documentación actualizada**: Variables de entorno mejor documentadas

### 15.6. Nuevos Features
- **Parámetro 'next'**: Preservación de destino original después del login
- **Detalles técnicos en desarrollo**: Información de debug solo disponible en desarrollo
- **Monitoreo de sesiones**: Métodos para contar y listar sesiones activas
- **Configuración validada**: Detección temprana de problemas de configuración

---
## 16. Resumen Ejecutivo
La superficie de ataque del frontend se minimizó: no hay tokens, sólo un identificador opaco. Integridad e identidad aseguradas por verificación JWT y nonce. Renovación silenciosa centralizada y auditada. **Mejorado con persistencia, UX moderna y validación robusta**. Preparado para escalar con mínima fricción futura (Redis).

**Estado Fase 1: ✅ COMPLETADO** - Sistema de autenticación robusto, seguro y con excelente experiencia de usuario.

Fin.
