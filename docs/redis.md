# Redis en la Arquitectura de Autenticación

Estado actual: NO usamos Redis todavía. Esta guía deja listo el diseño para introducirlo sin sorpresas cuando se requiera escalado horizontal o persistencia de sesiones más allá del ciclo de vida del proceso.

---
## 1. Motivación
Problemas del store en memoria actual (`SessionStore`):
- Sesiones se pierden en un restart (deploy, crash, OOM).
- No soporta múltiples instancias (cada proceso tendría su propio mapa).
- No hay coordinación para *refresh token* simultáneo.
- No se puede propagar un logout global ni revocación inmediata entre nodos.
- Difícil añadir rate limiting, blacklists o métricas agregadas.

Redis aporta:
| Beneficio | Descripción |
|-----------|-------------|
| Centralización | Una sola fuente de verdad para sesiones y locks. |
| TTL nativo | Elimina necesidad de barrido manual; cada clave expira sola. |
| Concurrencia segura | `SET NX PX` para locks de refresh. |
| Pub/Sub | Broadcast de logout / invalidaciones. |
| Extensibilidad | Rate limiting, caching de JWKS, listas de revocados. |
| Rendimiento | Latencia sub‑ms en LAN / VPC. |

---
## 2. Casos de Uso Planeados
1. **Session Store**: Persistir `StoredSession` (access, refresh, expiraciones, claims).
2. **Refresh Lock**: Evitar múltiples refresh simultáneos de la misma sesión.
3. **JWKS Cache (opcional)**: Reducir roundtrips al IdP (validez 10–15m).
4. **Logout Broadcast (futuro)**: Invalidation cross‑node inmediata vía Pub/Sub.
5. **Rate Limiting (futuro)**: Limitar `/api/oidc/start` para mitigar abuso.
6. **Revoked Tracker (opcional)**: Marcar sesiones comprometidas tras reuse de refresh.

---
## 3. Diseño de Claves
Prefijo base sugerido: `neo:auth:`

| Clave | Formato | TTL | Contenido |
|-------|---------|-----|-----------|
| Sesión | `neo:auth:session:<sessionId>` | `expires_at - now` (seg) | JSON `StoredSession` |
| Refresh Lock | `neo:auth:lock:refresh:<sessionId>` | 10–15s | Valor dummy (corrId) |
| JWKS | `neo:auth:jwks:<kid>` | 900s | JWK/PEM serializado |
| Rate Bucket | `neo:auth:rl:<ip>` | ventana (p.e. 60s) | Contador |
| Revocada | `neo:auth:revoked:<sessionId>` | 5–10m | Marcador reutilización |
| Canal Logout | *(Pub/Sub)* `neo:auth:logout` | n/a | Mensajes `{sessionId}` |

### Ejemplo de `StoredSession` serializada
```json
{
  "sub": "user-123",
  "access_token": "at...",
  "id_token": "id...",
  "refresh_token": "rt...",
  "expires_at": 1737140000,
  "created_at": 1737136400,
  "claims": { "email": "user@dom.com", "email_verified": true },
  "rotations": 2,
  "absolute_expires_at": 1737165200
}
```

---
## 4. Estrategia de TTL y Expiraciones
- TTL clave sesión = `(expires_at - now)` en segundos.
- `absolute_expires_at` se evalúa en código (no siempre igual a TTL—evita extensión ilimitada por refresh). 
- En refresh exitoso: sobrescribir JSON completo y ajustar TTL.

---
## 5. Locks de Refresh
Patrón recomendado:
```
SET neo:auth:lock:refresh:<sessionId> <correlationId> NX PX 10000
```
Flujo:
1. Intento lock. Si OK → refrescar.
2. Si null → esperar (poll cada 50–100ms) hasta expiración o sesión actualizada.
3. Tras refresh: `DEL` lock (o se libera solo por PX).

---
## 6. Migración (Plan en Fases)
**Fase 0 - Preparación**
- Añadir dependencia (`ioredis` o `redis`).
- Variable `REDIS_URL` (+ password / TLS si aplica).

**Fase 1 - Adaptador**
- Crear `RedisSessionStore` con interfaz: `get(id)`, `set(id, session)`, `delete(id)`, `acquireRefreshLock`, `releaseRefreshLock`.
- Env flag `USE_REDIS_SESSIONS=true` para feature toggle.

**Fase 2 - Integración**
- En `ensureFreshSession()` usar adaptador cuando flag activo.
- Pruebas locales con Docker: `docker run -p 6379:6379 redis:7`.

**Fase 3 - Staging**
- Escalar a 2 réplicas, validar: login, refresh cercano a exp, logout.
- Verificar `TTL neo:auth:session:<id>` y logs de `refresh.success`.

**Fase 4 - Cutover**
- Activar flag en producción.
- Monitorear métricas (latencia Redis, misses, locks fallidos).

**Fase 5 - Limpieza**
- Mantener store in-memory solo para DEV o remover tras estabilización.

---
## 7. Seguridad
| Riesgo | Mitigación |
|--------|-----------|
| Acceso no autorizado | Redis protegido en red privada + AUTH/password + TLS. |
| Exfiltración tokens | Limitar campos; no guardar info sensible adicional. |
| Memory eviction | Dimensionar memoria y política `volatile-ttl`. |
| Replay refresh | Rotación y (opcional) marcar reuse → revocar sesión. |
| Locks huérfanos | TTL corto (PX) + refrescos idempotentes. |

### Config Redis recomendada (ejemplos)
```
maxmemory-policy volatile-ttl
appendonly no (o yes si requieres persistencia)
protected-mode yes
```

---
## 8. Observabilidad / Métricas
- `refresh.success.count`
- `refresh.failed.count`
- `session.get.miss.count`
- `redis.op.latency.ms` (p99)
- `locks.wait.count`
- `rotations.avg`

Log estructurado ya existente → correlacionar por `sessionId` y `correlationId`.

---
## 9. Futuras Extensiones
| Feature | Descripción |
|---------|-------------|
| Pub/Sub logout | Publicar `{sessionId}` para invalidar caches (si hubiera layer intermedio). |
| Rate limiting | INCR + TTL por IP en `neo:auth:rl:<ip>`. |
| Lista revocados | Claves cortas para detectar tokens reutilizados tras rotación. |
| JWKS cache | Guardar JWK por `kid` y reutilizar hasta 15m. |
| Distributed tracing | Adjuntar traceId en logs + almacenar último refresh metadata. |

---
## 10. Checklist Rápido (cuando decidamos activarlo)
- [ ] Añadir dependencia Redis.
- [ ] Crear adaptador sesiones.
- [ ] Feature flag `USE_REDIS_SESSIONS`.
- [ ] Integrar locks en refresh.
- [ ] Pruebas login / near-expire / forced refresh / logout.
- [ ] Validar TTL correcto en CLI (`TTL neo:auth:session:<id>`).
- [ ] Dashboards de métricas iniciales.
- [ ] Documentar rollback (desactivar flag).

---
## 11. Decisión Actual
Se pospone la adopción de Redis hasta que: 
1. Escalemos a múltiples réplicas, ó
2. Sea necesario retener sesiones tras despliegues continuos, ó
3. Requiramos rate limiting centralizado.

Mientras tanto, el store en memoria sigue siendo suficiente para ambiente single-instance.

---
## 12. Snippet Adaptador (Referencia rápida)
```ts
// redis-session-store.ts (referencia breve)
import { createClient } from 'redis';
import { StoredSession } from './session-store';

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();
const P = 'neo:auth:session:';

export async function getSession(id: string): Promise<StoredSession | undefined> {
  const raw = await client.get(P + id);
  if (!raw) return undefined; try { return JSON.parse(raw); } catch { return undefined; }
}
export async function setSession(id: string, s: StoredSession) {
  const ttl = s.expires_at - Math.floor(Date.now()/1000); if (ttl <= 0) return;
  await client.set(P + id, JSON.stringify(s), { EX: ttl });
}
export async function deleteSession(id: string) { await client.del(P + id); }
export async function acquireRefreshLock(id: string, ms=10000) { return (await client.set(`neo:auth:lock:refresh:${id}`, '1', { NX: true, PX: ms })) === 'OK'; }
export async function releaseRefreshLock(id: string) { await client.del(`neo:auth:lock:refresh:${id}`); }
```

---
## 13. Resumen Ejecutivo
Redis NO es necesario ahora para ambiente single-instance; la arquitectura ya está endurecida (sesión opaca, refresh controlado, logging). La documentación deja definido: claves, TTL, locks, plan de migración, seguridad y métricas. Cuando se active escalado horizontal o se busque resiliencia a reinicios, aplicar checklist y habilitar el adaptador.

---
Fin del documento.
