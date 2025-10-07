# Arquitectura del Sistema de Autenticación - NEO FrontEnd

## Overview
Este documento describe la arquitectura completa del sistema de autenticación implementado en NEO FrontEnd, incluyendo componentes, flujos, seguridad y patrones de diseño.

## Arquitectura General

### Diagrama de Componentes
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
│                     (Next.js App Router)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   UI Components │  │   API Routes    │  │   Middleware    │  │
│  │                 │  │                 │  │                 │  │
│  │ • Login Page    │  │ • /api/oidc/    │  │ • Route Guard   │  │
│  │ • Dashboard     │  │ • /api/oidc/    │  │ • Public Paths  │  │
│  │ • Sidebar       │  │   start         │  │ • Session Check │  │
│  │ • Error Pages   │  │ • /api/oidc/    │  │                 │  │
│  │                 │  │   callback      │  │                 │  │
│  │                 │  │ • /api/oidc/    │  │                 │  │
│  │                 │  │   me            │  │                 │  │
│  │                 │  │ • /api/oidc/    │  │                 │  │
│  │                 │  │   logout        │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      BUSINESS LOGIC                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Auth Flow     │  │  Session Mgmt   │  │   Security      │  │
│  │                 │  │                 │  │                 │  │
│  │ • PKCE Gen      │  │ • Session Store │  │ • JWT Verify    │  │
│  │ • State Mgmt    │  │ • Refresh Logic │  │ • Token Val     │  │
│  │ • Token Exch    │  │ • Persistence   │  │ • CSRF Protect  │  │
│  │ • Error Handle  │  │ • Cleanup       │  │ • Cookie Sec    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Storage       │  │   Logging       │  │   Config        │  │
│  │                 │  │                 │  │                 │  │
│  │ • Session Store │  │ • Structured    │  │ • Env Vars      │  │
│  │ • Disk Cache    │  │ • JSON Format   │  │ • Validation    │  │
│  │ • Memory Map    │  │ • Correlation   │  │ • Type Safety   │  │
│  │                 │  │   IDs           │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Gateway       │  │  OAuth2 Server  │  │   UserInfo      │  │
│  │  (Port 8081)    │  │  (Port 9000)    │  │  Endpoint       │  │
│  │                 │  │                 │  │                 │  │
│  │ • OIDC Start    │  │ • Authorize     │  │ • Profile Data  │  │
│  │ • Token Exch    │  │ • Token         │  │ • Email/Name    │  │
│  │ • Refresh       │  │ • JWKS          │  │                 │  │
│  │ • CORS Proxy    │  │ • Discovery     │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Capas de Arquitectura

### 1. Capa de Presentación (UI Layer)

#### Componentes React
```typescript
// Estructura de Componentes
src/
├── app/
│   ├── (public)/
│   │   ├── login/
│   │   │   ├── page.tsx              // Server Component
│   │   │   └── ui-login-client.tsx   // Client Component
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx          // Callback Handler
│   └── (private)/
│       ├── layout.tsx                // Protected Layout
│       └── dashboard/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   └── sidebar.tsx               // Navigation + User Info
│   └── ui/                           // Reusable UI Components
```

#### Patrones de Diseño UI
- **Server Components**: Para renderizado inicial y redirects
- **Client Components**: Para interactividad y manejo de estado
- **Layout Patterns**: Layouts anidados para rutas públicas/privadas
- **Error Boundaries**: Manejo graceful de errores

### 2. Capa de API (API Layer)

#### Endpoints OIDC
```typescript
// API Routes Structure
src/app/api/oidc/
├── start/
│   └── route.ts          // Iniciar flujo OAuth2
├── callback/
│   └── route.ts          // Intercambio de código por tokens
├── me/
│   └── route.ts          // Verificar estado de autenticación
└── logout/
    └── route.ts          // Cerrar sesión
```

#### Patrones de API
- **RESTful Design**: Verbos HTTP estándar
- **Error Handling**: Códigos de estado consistentes
- **Security Headers**: CORS, CSP, etc.
- **Request Validation**: Validación estricta de parámetros

### 3. Capa de Negocio (Business Logic Layer)

#### Servicios de Autenticación
```typescript
// Core Services
src/lib/
├── auth/
│   ├── pkce.ts           // Generación PKCE
│   ├── state.ts          // Manejo de estado CSRF
│   └── flow.ts           // Orquestación del flujo
├── session/
│   ├── store.ts          // Almacenamiento de sesiones
│   ├── refresh.ts        // Lógica de refresh
│   └── validation.ts     // Validación de sesiones
├── security/
│   ├── jwt.ts            // Verificación JWT
│   ├── crypto.ts         // Utilidades criptográficas
│   └── cookies.ts        // Manejo seguro de cookies
└── logging/
    └── logger.ts         // Logging estructurado
```

#### Patrones de Negocio
- **Service Layer**: Separación de lógica de negocio
- **Repository Pattern**: Abstracción de almacenamiento
- **Strategy Pattern**: Diferentes estrategias de refresh
- **Observer Pattern**: Eventos de autenticación

### 4. Capa de Datos (Data Layer)

#### Session Store
```typescript
interface SessionStore {
  // Core Operations
  get(sessionId: string): StoredSession | undefined
  set(sessionId: string, session: StoredSession): void
  delete(sessionId: string): void
  has(sessionId: string): boolean
  
  // Refresh Management
  setRefreshLock(sessionId: string, promise: Promise<void>): void
  getRefreshLock(sessionId: string): Promise<void> | undefined
  clearRefreshLock(sessionId: string): void
  
  // Persistence
  persistToDisk(): Promise<void>
  loadFromDisk(): Promise<void>
  cleanup(): void
}
```

#### Patrones de Datos
- **In-Memory Storage**: Acceso rápido a sesiones activas
- **Disk Persistence**: Sobrevivencia a reinicios
- **Map-based Indexing**: Búsqueda O(1) de sesiones
- **Lazy Loading**: Carga bajo demanda

## Flujo de Autenticación Detallado

### 1. Diagrama de Secuencia
```
Usuario        Frontend        Gateway        OAuth2 Server
  │              │              │               │
  │ Login        │              │               │
  ├─────────────→│              │               │
  │              │ GET /api/oidc/start         │
  │              ├─────────────→│               │
  │              │              │ GET /oauth2/authorize
  │              │              ├─────────────→│
  │              │              │               │
  │              │              │ 302 + Location │
  │              │              │←─────────────│
  │              │ 302 + Location               │
  │              │←─────────────│               │
  │ 302 + Location                              │
  │←─────────────│              │               │
  │              │              │               │
  │ Redirect to  │              │               │
  │ OAuth2 Server│              │               │
  ├─────────────→│              │               │
  │              │              │               │
  │ Authenticate │              │               │
  │ (User Input) │              │               │
  │              │              │               │
  │              │              │ GET /auth/callback
  │              │              │←─────────────│
  │              │ GET /auth/callback           │
  │              │←─────────────│               │
  │              │              │               │
  │              │ GET /api/oidc/callback       │
  │              ├─────────────→│               │
  │              │              │ POST /oauth2/token
  │              │              ├─────────────→│
  │              │              │               │
  │              │              │ 200 + Tokens   │
  │              │              │←─────────────│
  │              │ 200 + Session                │
  │              │←─────────────│               │
  │ 200 + Dashboard                              │
  │←─────────────│              │               │
```

### 2. Estados del Sistema

#### Estados de Autenticación
```typescript
type AuthState = 
  | 'unauthenticated'    // No hay sesión
  | 'authenticating'     // Proceso de login en curso
  | 'authenticated'      // Sesión activa
  | 'refreshing'         // Refresh de token en curso
  | 'expired'           // Sesión expirada
  | 'error'             // Error en autenticación

interface AuthContext {
  state: AuthState
  user?: User
  session?: StoredSession
  error?: AuthError
  login(): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<void>
}
```

#### Máquina de Estados
```
┌─────────────────┐    login()     ┌─────────────────┐
│ unauthenticated │ ──────────────→│ authenticating  │
└─────────────────┘                └─────────────────┘
         ↑                                 │
         │ logout()                        │ success
         │                                 ▼
┌─────────────────┐    error()     ┌─────────────────┐
│      error      │←───────────────│ authenticated  │
└─────────────────┘                └─────────────────┘
         ↑                                 │
         │                                 │ refresh()
         │                                 ▼
┌─────────────────┐    expiry()    ┌─────────────────┐
│      expired    │←───────────────│   refreshing    │
└─────────────────┘                └─────────────────┘
```

## Security Architecture

### 1. Capas de Seguridad

#### Layer 1: Network Security
```typescript
// Headers de Seguridad
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'"
}
```

#### Layer 2: Application Security
```typescript
// Validación de Entrada
interface InputValidation {
  // PKCE Validation
  validatePKCE(codeVerifier: string): boolean
  validateState(state: string): boolean
  validateNonce(nonce: string): boolean
  
  // Token Validation
  validateJWT(token: string): Promise<JWTPayload>
  validateClaims(claims: JWTPayload): boolean
  
  // Session Validation
  validateSession(session: StoredSession): boolean
}
```

#### Layer 3: Data Security
```typescript
// Cifrado y Hashing
interface CryptoUtils {
  // PKCE
  generateCodeVerifier(): string
  generateCodeChallenge(verifier: string): string
  
  // State/Nonce
  generateSecureRandom(length: number): string
  
  // Cookie Security
  encryptCookieData(data: any): string
  decryptCookieData(encrypted: string): any
}
```

### 2. Threat Model

#### Amenazas Mitigadas
```typescript
interface ThreatMitigation {
  // XSS (Cross-Site Scripting)
  xss: {
    mitigation: 'HttpOnly cookies + CSP + Input sanitization'
    implementation: 'Cookies __Host- prefix + HttpOnly'
  }
  
  // CSRF (Cross-Site Request Forgery)
  csrf: {
    mitigation: 'State parameter + SameSite cookies'
    implementation: 'Random state validation'
  }
  
  // Token Injection
  tokenInjection: {
    mitigation: 'PKCE + Opaque session IDs'
    implementation: 'Code verifier + challenge flow'
  }
  
  // Session Hijacking
  sessionHijacking: {
    mitigation: 'Secure cookies + Session rotation'
    implementation: '__Host prefix + Refresh rotation'
  }
  
  // Replay Attacks
  replayAttacks: {
    mitigation: 'Nonce + Timestamp validation'
    implementation: 'JWT claims + PKCE one-time use'
  }
}
```

### 3. Compliance

#### Estándares de Seguridad
- **OAuth 2.0**: RFC 6749
- **OpenID Connect**: Core 1.0
- **PKCE**: RFC 7636
- **JWT**: RFC 7519
- **JWS**: RFC 7515
- **JWK**: RFC 7517

#### Best Practices
- ✅ Zero Trust Architecture
- ✅ Principle of Least Privilege
- ✅ Defense in Depth
- ✅ Secure by Default

## Performance Architecture

### 1. Optimización de Recursos

#### Session Management
```typescript
// Efficient Session Storage
class OptimizedSessionStore {
  private sessions = new Map<string, StoredSession>()
  private index = new Map<string, Set<string>>() // Secondary indexes
  
  // O(1) Operations
  get(sessionId: string): StoredSession | undefined {
    return this.sessions.get(sessionId)
  }
  
  // Memory Management
  cleanup(): void {
    const now = Date.now()
    for (const [id, session] of this.sessions) {
      if (session.absolute_expires_at < now) {
        this.delete(id)
      }
    }
  }
  
  // Persistence Strategy
  async persistToDisk(): Promise<void> {
    // Batch writes for performance
    const data = JSON.stringify(Array.from(this.sessions.entries()))
    await fs.writeFile('./sessions.json', data)
  }
}
```

#### Caching Strategy
```typescript
// Multi-level Caching
interface CacheManager {
  // L1: In-memory cache
  memoryCache: Map<string, any>
  
  // L2: Disk cache
  diskCache: Map<string, any>
  
  // L3: Remote cache (future Redis)
  remoteCache?: Map<string, any>
  
  get(key: string): Promise<any>
  set(key: string, value: any, ttl: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}
```

### 2. Monitoring y Observabilidad

#### Metrics Collection
```typescript
// Performance Metrics
interface AuthMetrics {
  // Authentication Metrics
  loginAttempts: Counter
  loginSuccessRate: Histogram
  loginLatency: Histogram
  
  // Session Metrics
  activeSessions: Gauge
  sessionDuration: Histogram
  refreshRate: Counter
  
  // Security Metrics
  failedAttempts: Counter
  suspiciousActivity: Counter
  tokenExpiry: Gauge
}
```

#### Health Checks
```typescript
// System Health
interface HealthCheck {
  // Database Connectivity
  database: Promise<HealthStatus>
  
  // External Services
  oauth2Server: Promise<HealthStatus>
  gateway: Promise<HealthStatus>
  
  // Internal Services
  sessionStore: Promise<HealthStatus>
  jwtVerifier: Promise<HealthStatus>
}
```

## Scalability Architecture

### 1. Horizontal Scaling

#### Stateless Design
```typescript
// Stateless Components
interface StatelessArchitecture {
  // API Routes: Sin estado
  apiRoutes: 'stateless'
  
  // Session Store: Externalizable
  sessionStore: 'externalizable to Redis'
  
  // JWT Verification: Sin estado
  jwtVerification: 'stateless'
  
  // Logging: Async y distribuido
  logging: 'async and distributed'
}
```

#### Load Balancing Strategy
```typescript
// Session Affinity
interface LoadBalancing {
  // Sticky Sessions (temporal)
  sessionAffinity: 'cookie-based'
  
  // Health Checks
  healthChecks: 'active/passive'
  
  // Failover
  failover: 'graceful degradation'
  
  // Circuit Breaker
  circuitBreaker: 'pattern implementation'
}
```

### 2. Vertical Scaling

#### Resource Management
```typescript
// Resource Optimization
interface ResourceManagement {
  // Memory Management
  memoryOptimization: {
    sessionCleanup: 'automatic'
    garbageCollection: 'optimized'
    bufferManagement: 'efficient'
  }
  
  // CPU Optimization
  cpuOptimization: {
    asyncOperations: 'non-blocking'
    batchProcessing: 'bulk operations'
    parallelProcessing: 'worker threads'
  }
  
  // I/O Optimization
  ioOptimization: {
    diskOperations: 'batched'
    networkCalls: 'pooled'
    caching: 'multi-level'
  }
}
```

## Deployment Architecture

### 1. Container Strategy

#### Docker Configuration
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3010
CMD ["npm", "start"]
```

#### Environment Configuration
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neo-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: neo-frontend
  template:
    metadata:
      labels:
        app: neo-frontend
    spec:
      containers:
      - name: frontend
        image: neo-frontend:latest
        ports:
        - containerPort: 3010
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_OIDC_ISSUER
          valueFrom:
            secretKeyRef:
              name: oidc-config
              key: issuer
```

### 2. CI/CD Pipeline

#### Build Process
```typescript
// Build Configuration
interface BuildConfiguration {
  // Type Checking
  typeCheck: 'strict TypeScript'
  
  // Linting
  linting: 'ESLint + Prettier'
  
  // Testing
  testing: {
    unit: 'Jest + React Testing Library'
    integration: 'Playwright'
    e2e: 'Cypress'
  }
  
  // Security Scanning
  security: {
    dependencies: 'Snyk'
    code: 'CodeQL'
    containers: 'Trivy'
  }
}
```

## Future Architecture

### 1. Microservices Evolution

#### Service Decomposition
```typescript
// Future Microservices
interface MicroservicesArchitecture {
  // Auth Service
  authService: {
    responsibility: 'Authentication & Authorization'
    technology: 'Node.js + Express'
    database: 'PostgreSQL + Redis'
  }
  
  // Session Service
  sessionService: {
    responsibility: 'Session Management'
    technology: 'Node.js + Fastify'
    database: 'Redis Cluster'
  }
  
  // User Service
  userService: {
    responsibility: 'User Profile Management'
    technology: 'Node.js + GraphQL'
    database: 'PostgreSQL'
  }
  
  // Audit Service
  auditService: {
    responsibility: 'Logging & Audit'
    technology: 'Node.js + Winston'
    database: 'Elasticsearch'
  }
}
```

### 2. Event-Driven Architecture

#### Event Sourcing
```typescript
// Event System
interface EventSystem {
  // Authentication Events
  authEvents: {
    UserLoggedIn: 'user.login.success'
    UserLoggedOut: 'user.logout.success'
    LoginFailed: 'user.login.failed'
    TokenRefreshed: 'token.refresh.success'
  }
  
  // Session Events
  sessionEvents: {
    SessionCreated: 'session.created'
    SessionExpired: 'session.expired'
    SessionRevoked: 'session.revoked'
  }
  
  // Security Events
  securityEvents: {
    SuspiciousActivity: 'security.suspicious'
    BruteForceDetected: 'security.brute-force'
    TokenLeak: 'security.token-leak'
  }
}
```

## Conclusiones

### Principios de Diseño
1. **Security First**: Seguridad en cada capa
2. **Performance Optimized**: Optimización continua
3. **Scalable by Design**: Arquitectura escalable
4. **Maintainable Code**: Código limpio y documentado
5. **User Experience Focused**: Experiencia fluida

### Trade-offs Considerados
- **Seguridad vs Performance**: Balance adecuado
- **Complejidad vs Mantenibilidad**: Arquitectura manejable
- **Innovación vs Estabilidad**: Tecnologías probadas
- **Costo vs Funcionalidad**: Solución rentable

### Próximos Pasos
1. **Redis Integration**: Para sesiones distribuidas
2. **Service Mesh**: Para comunicación segura
3. **Observability**: Monitoring avanzado
4. **Zero Trust**: Arquitectura zero-trust
5. **AI/ML**: Detección de anomalías

Esta arquitectura proporciona una base sólida, segura y escalable para el sistema de autenticación, preparada para evolucionar con las necesidades del negocio y las mejores prácticas de la industria.
