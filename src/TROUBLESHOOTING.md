# 🚨 Troubleshooting Guide - Frontend OAuth2

## 📋 **Problemas Comunes y Soluciones**

### 🔥 **Problema 1: Bucle de Redirect (GET /login 200 → GET /api/oidc/start 307 → GET /login 200)**

#### **Síntomas:**
- El usuario hace clic en "Login" pero vuelve a la página de login
- Los logs muestran: `GET /login 200 in 174ms` → `GET /api/oidc/start 307 in 93ms` → `GET /login 200 in 207ms`
- El navegador no redirige al OAuth2 server

#### **Causa Raíz:**
- ❌ OAuth2 server (port 9000) no está disponible
- ✅ Gateway (port 8081) sí está disponible

#### **Diagnóstico:**
```bash
# Verificar OAuth2 server
curl -I http://localhost:9000/oauth2/authorize
# Resultado esperado: 302 Found o 200 OK
# Si falla: "Unable to connect to the remote server"

# Verificar Gateway
curl -I http://localhost:8081
# Resultado esperado: 404 Not Found (normal para root)
```

#### **Solución:**
1. **Iniciar OAuth2 Server:**
   ```bash
   # Navegar al directorio del OAuth2 server
   cd /path/to/oauth2-server
   npm start
   # o
   docker run -p 9000:9000 oauth2-server-image
   ```

2. **Verificar Configuración:**
   ```bash
   # Revisar .env.local
   cat .env.local | grep OIDC
   # Debe mostrar:
   # NEXT_PUBLIC_OIDC_ISSUER=http://localhost:9000
   ```

3. **Probar Conectividad:**
   ```bash
   # Desde el frontend
   fetch('http://localhost:9000/.well-known/oauth-authorization-server')
   ```

---

### 🔥 **Problema 2: Error "OAuth2 Server Unavailable"**

#### **Síntomas:**
- Login muestra: "Servidor OAuth2 No Disponible"
- Mensaje: "El servidor de autenticación OAuth2 no está disponible"
- Código de error: 503

#### **Causa Raíz:**
- OAuth2 server no está corriendo en el puerto 9000
- Problemas de red o firewall
- Configuración incorrecta del servidor

#### **Solución:**
1. **Verificar que el servidor esté corriendo:**
   ```bash
   netstat -an | grep 9000
   # o
   lsof -i :9000
   ```

2. **Reiniciar el servidor OAuth2:**
   ```bash
   # Detener procesos existentes
   pkill -f "oauth2"
   # Iniciar servidor
   npm run dev:oauth2
   ```

3. **Verificar logs del servidor:**
   ```bash
   tail -f logs/oauth2-server.log
   ```

---

### 🔥 **Problema 3: PKCE Verification Failed**

#### **Síntomas:**
- Error durante el callback: "PKCE verification failed"
- El OAuth2 server rechaza el code_verifier
- Logs muestran: "invalid_code_verifier"

#### **Causa Raíz:**
- Code verifier no se está guardando correctamente en la cookie
- La cookie expira antes del callback
- Problemas con la codificación base64url

#### **Solución:**
1. **Verificar cookies en el browser:**
   ```javascript
   // En la consola del browser
   document.cookie
   // Buscar: __Host-oidc_pkce
   ```

2. **Revisar configuración de cookies:**
   ```typescript
   // En src/app/api/oidc/start/route.ts
   res.cookies.set('__Host-oidc_pkce', cookieValue, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     path: '/',
     maxAge: 300, // 5 minutos
     sameSite: 'lax'
   })
   ```

3. **Verificar encoding:**
   ```typescript
   // Asegurarse de usar base64url
   const cookieValue = Buffer.from(JSON.stringify(pkcePayload), 'utf8')
     .toString('base64url')
   ```

---

### 🔥 **Problema 4: Token Refresh Fallido**

#### **Síntomas:**
- Las APIs empiezan a fallar con 401 después de un tiempo
- Error: "Refresh token failed"
- Usuario es redirigido al login inesperadamente

#### **Causa Raíz:**
- Refresh token expiró o fue revocado
- El refresh token no se está guardando correctamente
- Problemas con el endpoint de refresh

#### **Solución:**
1. **Verificar que el refresh token se guarde:**
   ```javascript
   // En el callback
   if (tokens.refresh_token) {
     localStorage.setItem('refresh_token', tokens.refresh_token)
   }
   ```

2. **Probar manualmente el refresh:**
   ```bash
   curl -X POST http://localhost:9000/oauth2/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=refresh_token&refresh_token=TU_REFRESH_TOKEN&client_id=frontend-client"
   ```

3. **Verificar expiración del refresh token:**
   ```javascript
   // Revisar si tiene fecha de expiración
   const refreshToken = localStorage.getItem('refresh_token')
   const expiresAt = localStorage.getItem('refresh_token_expires_at')
   ```

---

### 🔥 **Problema 5: CORS Issues**

#### **Síntomas:**
- Error en browser: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Las llamadas al OAuth2 server fallan desde el frontend
- Las APIs del gateway funcionan pero las de OAuth2 no

#### **Causa Raíz:**
- El OAuth2 server no tiene configurado CORS correctamente
- El frontend está en un dominio diferente al OAuth2 server

#### **Solución:**
1. **Configurar CORS en el OAuth2 server:**
   ```javascript
   // Ejemplo en Express.js
   app.use(cors({
     origin: ['http://localhost:3010', 'http://localhost:3000'],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   }))
   ```

2. **Verificar preflight requests:**
   ```bash
   curl -X OPTIONS http://localhost:9000/oauth2/token \
     -H "Origin: http://localhost:3010" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

---

## 🔧 **Herramientas de Diagnóstico**

### **1. Verificar Conectividad:**
```bash
# OAuth2 Server
curl -v http://localhost:9000/.well-known/oauth-authorization-server

# Gateway
curl -v http://localhost:8081/health

# Frontend
curl -v http://localhost:3010/api/health
```

### **2. Revisar Logs:**
```bash
# Logs del frontend
npm run dev

# Logs del OAuth2 server (si está disponible)
tail -f /path/to/oauth2-server/logs/app.log

# Logs del gateway
tail -f /path/to/gateway/logs/app.log
```

### **3. Debug en Browser:**
```javascript
// Console del browser
console.log('Issuer:', process.env.NEXT_PUBLIC_OIDC_ISSUER)
console.log('Client ID:', process.env.NEXT_PUBLIC_OIDC_CLIENT_ID)
console.log('Redirect URI:', process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI)

// Verificar tokens
console.log('Access Token:', localStorage.getItem('access_token'))
console.log('Refresh Token:', localStorage.getItem('refresh_token'))
console.log('Expires At:', localStorage.getItem('token_expires_at'))
```

---

## 📊 **Flujo de Diagnóstico Recomendado**

### **Paso 1: Verificar Servicios**
```bash
# 1.1 Verificar OAuth2 server
curl -I http://localhost:9000/oauth2/authorize

# 1.2 Verificar Gateway
curl -I http://localhost:8081

# 1.3 Verificar Frontend
curl -I http://localhost:3010
```

### **Paso 2: Probar Flujo OAuth2**
```bash
# 2.1 Iniciar flujo manualmente
curl "http://localhost:3010/api/oidc/start"

# 2.2 Verificar respuesta
# Debe redirigir a: http://localhost:9000/oauth2/authorize?...
```

### **Paso 3: Verificar Configuración**
```bash
# 3.1 Revisar variables de entorno
cat .env.local | grep -E "(OIDC|API)"

# 3.2 Verificar que no haya conflictos
grep -r "localhost:8081" src/ --exclude-dir=node_modules
```

### **Paso 4: Probar Callback**
```bash
# 4.1 Simular callback con código falso
curl "http://localhost:3010/auth/callback?code=test&state=test"
```

---

## 🚨 **Errores Comunes y Sus Códigos**

| Código HTTP | Error | Solución |
|-------------|-------|----------|
| 307 | Redirect temporal | Normal, debe redirigir a OAuth2 |
| 401 | Unauthorized | Token expirado, hacer refresh |
| 403 | Forbidden | Scopes insuficientes |
| 404 | Not Found | Endpoint no existe |
| 500 | Internal Server | Error en el servidor |
| 503 | Service Unavailable | OAuth2 server no disponible |

---

## 📞 **Cuándo Contactar Soporte**

Contactar soporte si:

1. **El OAuth2 server está corriendo pero no responde**
2. **Los errores persisten después de reiniciar servicios**
3. **Hay errores de configuración que no se pueden resolver**
4. **Problemas de red o firewall**

**Información a proporcionar:**
- Logs completos del error
- Configuración de variables de entorno (sin secrets)
- Pasos reproducibles
- Versión del software
- Sistema operativo

---

## 🎯 **Prevención de Problemas**

### **1. Monitoreo:**
```bash
# Script para verificar servicios
#!/bin/bash
echo "Verificando servicios..."
curl -f http://localhost:9000/oauth2/authorize || echo "❌ OAuth2 server caído"
curl -f http://localhost:8081/health || echo "❌ Gateway caído"
curl -f http://localhost:3010/api/health || echo "❌ Frontend caído"
```

### **2. Health Checks:**
```javascript
// Agregar a cada servicio
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'oauth2-server',
    version: '1.0.0'
  })
})
```

### **3. Logs Estructurados:**
```typescript
// Usar logs estructurados
logAuth('start.success', { 
  sessionId, 
  client_id, 
  timestamp: Date.now() 
})
