# Autenticación OIDC (Estado Actual y Roadmap)

Este documento describe la arquitectura de autenticación actual basada en **Authorization Code + PKCE** manejada en el servidor Next.js y las tareas restantes para endurecer (hardening) el flujo.

## 1. Resumen del Flujo Actual

1. El usuario hace clic en "Login" en `/login`.
2. Se llama a `GET /api/oidc/start`.
   - Genera `code_verifier`, `code_challenge`, `state` y **nonce**.
   - Los guarda en la cookie HttpOnly `oidc_pkce` (SameSite=Lax, expira en 10 min).
   - Redirige al Authorization Server: `/authorize?...&code_challenge=...&state=...&nonce=...`.
3. El Authorization Server autentica al usuario y redirige a `NEXT_PUBLIC_OIDC_REDIRECT_URI` (callback).
4. El navegador llega a `GET /api/oidc/callback?code=...&state=...`.
   - Valida que `state` coincida.
   - Intercambia el código por `id_token` / `access_token` (y potencialmente otros) contra el endpoint `/token`.
   - **Verifica criptográficamente** el `id_token` (firma, issuer, audience, exp, iat, nonce) usando JWKS cacheado 15m.
   - Registra evento `token_exchange_success`.
   - Crea cookie de sesión `oidc_session` (HttpOnly, SameSite=Lax) con los tokens completos (TEMPORAL: se cambiará a opaca).
   - Elimina la cookie `oidc_pkce`.
5. El usuario es redirigido a `/dashboard`.

## 2. Componentes Clave

| Componente | Archivo | Rol |
|-----------|---------|-----|
| Inicio PKCE | `src/app/api/oidc/start/route.ts` | Genera challenge + state + nonce y redirige a `/authorize`. |
| Callback / Token Exchange | `src/app/api/oidc/callback/route.ts` | Intercambia código, verifica `id_token`, crea cookie de sesión. |
| Verificación JWT | `src/lib/jwt.ts` | Descarga JWKS, valida firma y claims (`iss`, `aud`, `exp`, `iat`, `nonce`). |
| Cookie PKCE | `oidc_pkce` | Almacena temporalmente `code_verifier`, `state`, `nonce` (10 min). |
| Cookie Sesión | `oidc_session` | Contiene tokens (FASE TRANSITORIA; se volverá opaca). |

## 3. Seguridad Implementada

- PKCE completo (S256) con verificación server-side.
- Protección contra CSRF/Replay con `state`.
- Protección contra token injection con `nonce` (ahora verificado).
- Verificación criptográfica de `id_token` (firma RS256 y claims críticos).
- Cookies HttpOnly + SameSite=Lax (evita CSRF cruzado básico en la mayoría de navegadores modernos).
- Eliminación del material sensible (code_verifier) tras intercambio.
- JWKS cacheado con TTL 15 minutos para reducir latencia.

## 4. Riesgos / Gaps Pendientes

| Gap | Impacto | Mitigación Planificada |
|-----|---------|------------------------|
| Tokens completos en cookie `oidc_session` | Exposición si cookie se filtra (aunque HttpOnly) | Cambiar a sesión opaca (`session_id`) + store servidor. |
| Cookie sin prefijo `__Host-` | Menor robustez contra confusión de cookies | Renombrar a `__Host-neo_session`. |
| Vida extensa de sesión (7 días) | Mayor ventana de abuso si roba cookie | Reducir a 8h + reautenticación / refresh controlado. |
| Scopes quizá excesivos (`email`) | Minimización de privilegios | Evaluar si `email` es necesario; si no, eliminar. |
| Sin endpoint de logout | Sesión prolongada / falta de revocación | Implementar `/api/oidc/logout` + llamada a `end_session_endpoint`. |
| No hay rotación/refresh gestionada | Riesgo de tokens caducados interrumpiendo UX | Añadir silent reauth o refresh token rotation (según AS). |
| Falta userinfo opcional | Claims no enriquecidos/actualizados | Consultar `/userinfo` tras validación y cache mínima. |
| Logging limitado (solo success) | Dificultad auditoría/forense | Añadir logs estructurados por evento + correlation id (state). |
| Amenazas sin documento formal | Menor claridad de modelo de amenazas | Crear documento de threat model (actores, superficies, controles). |

## 5. Roadmap (Prioridad)

1. (P1) Refactor sesión opaca:
   - Crear `SessionStore` (in-memory -> Redis futuro).
   - Generar `session_id` (uuid v4) y guardar tokens + metadatos (`exp`, `sub`, `iat`).
   - Cookie: `__Host-neo_session` sólo con `session_id`. No almacenar tokens en cliente.
2. (P1) Logout endpoint:
   - `DELETE /api/oidc/session` o `GET /api/oidc/logout`.
   - Elimina sesión en store + cookie; opcionalmente redirige a `end_session_endpoint`.
3. (P2) Scope review:
   - Confirmar necesidad de `email`. Si se usa solo para mostrar, considerar obtenerlo vía `/userinfo` y retirar del id_token si posible.
4. (P2) UserInfo integration:
   - Tras verificación `id_token`, fetch `/userinfo` y persistir claims mínimos en la sesión.
5. (P2) Logging & auditoría estructurada:
   - Definir formato JSON: `{ event, state, sub, session_id, ip, user_agent, ts }`.
   - Eventos: `auth.start`, `auth.callback.success`, `auth.callback.error`, `auth.logout`, `auth.session.expired`.
6. (P3) Refresh / silent renew estrategia:
   - Validar si AS entrega `refresh_token` al backend (confidential). Si sí: rotación + revocación on reuse; si no: re-lanzar flujo con prompt=none.
7. (P3) Métricas y alertas:
   - Contadores de fallos de verificación, latencia JWKS, ratio logins vs fallos.
8. (P4) Threat model documentado.

## 6. Ejemplo Futuro de Sesión Opaca (Esquema)

```ts
interface StoredSession {
  sub: string
  access_token: string
  id_token: string
  expires_at: number // epoch seconds
  created_at: number
  claims?: { email?: string; name?: string }
}
```

- Key: `sess:{session_id}`
- TTL: sincronizado con `access_token` o menor.

## 7. Posible Interfaz SessionStore (In-Memory)

```ts
class SessionStore {
  private map = new Map<string, { data: StoredSession; exp: number }>()
  set(id: string, data: StoredSession) { this.map.set(id, { data, exp: data.expires_at }); }
  get(id: string) { const e = this.map.get(id); if (!e) return undefined; if (e.exp * 1000 < Date.now()) { this.map.delete(id); return undefined; } return e.data; }
  delete(id: string) { this.map.delete(id); }
}
```

## 8. Operativa de Auditoría

Campo | Fuente | Notas
------|--------|------
`state` | `oidc_pkce` cookie | Útil para correlación flujo completo.
`session_id` | Generado en callback (refactor) | No derivable de tokens.
`sub` | `id_token` verificado | Identidad estable.
`ip` | Cabecera de la request | Considerar X-Forwarded-For en producción.
`user_agent` | Cabecera `User-Agent` | Normalizar para análisis.

## 9. Qué Cambiar en el Lado Servidor (Resumen Directo)

Cambiar | Motivo | Resultado Esperado
--------|--------|-------------------
`oidc_session` (tokens) -> `__Host-neo_session` (ID) | Reducir riesgo exfiltración | Cliente no ve tokens.
Añadir `SessionStore` | Gestionar tokens y expiración | Abstracción para Redis cluster.
Logout endpoint | Control de sesión explícito | UX y compliance.
UserInfo fetch | Claims completos y consistencia | Perfil normalizado.
Logging estructurado | Auditoría y monitoreo | Detección de anomalías.
Scope pruning | Principio menor privilegio | Menos exposición de datos.
Refresh strategy | Continuidad de sesión | Menos fricción usuario.
Threat model doc | Claridad riesgos/control | Base para revisiones de seguridad.

## 10. Preguntas Abiertas
- ¿Necesitas realmente el `email` para lógica crítica o sólo display?
- ¿El Authorization Server entrega `refresh_token` en este client type? (Configurable.)
- ¿Se requerirá Single Logout (SLO) multi-app? (Influye en logout endpoint.)

## 11. Próximos Commits Sugeridos
1. Crear `SessionStore` y refactor cookie.
2. Implementar `/api/oidc/logout`.
3. Añadir logging estructurado básico.
4. Scope audit y posible eliminación de `email`.
5. Integrar `/userinfo` y claims cache.

---
Última actualización: (mantener fecha manual) 2025-09-17.
