# TODO: Frontend Direct OAuth2 Solution

## 🎯 **Objetivo:**
Configurar el frontend para que hable DIRECTO con el OAuth2 server (9000) sin pasar por el gateway (8081).

## 📋 **Checklist de Implementación:**

### **Phase 1: Configuración Base**
- [x] Actualizar variables de entorno (.env.local)
- [ ] Crear configuración centralizada (config/auth.js)
- [x] Verificar configuración actual y eliminar referencias al gateway

### **Phase 2: Implementación OAuth2 Directo**
- [ ] Implementar función de login directo (utils/auth.js)
- [x] Actualizar endpoint /api/oidc/start para redirect directo
- [ ] Implementar callback handler para auth/callback
- [x] Implementar refresh token directo
- [x] Agregar detección de disponibilidad de OAuth2 server

### **Phase 3: Integración con Gateway**
- [ ] Configurar API calls para usar gateway
- [ ] Implementar manejo híbrido (OAuth2 directo + Gateway)
- [ ] Actualizar componentes existentes

### **Phase 4: Testing y Verificación**
- [x] Probar flujo de login completo
- [x] Verificar que redirige a OAuth2 server (9000)
- [ ] Verificar que APIs van a gateway (8081)
- [ ] Probar refresh de tokens
- [x] Probar manejo de errores

### **Phase 5: Documentación**
- [ ] Actualizar documentación de arquitectura
- [ ] Documentar flujo híbrido
- [x] Crear guía de troubleshooting

## 🔍 **Problema Actual IDENTIFICADO:**
- GET /login 200 → GET /api/oidc/start 307 → GET /login 200 (bucle)
- ❌ OAuth2 server (9000) NO está disponible: "Unable to connect to the remote server"
- ✅ Gateway (8081) SÍ está disponible: responde 404 (normal para root)
- **Causa**: El redirect falla porque el OAuth2 server no está corriendo

## 🚀 **Solución Propuesta:**
- OAuth2 Authentication: Frontend → OAuth2 Server (9000) [DIRECTO]
- Business APIs: Frontend → Gateway (8081) → Microservicios [THROUGH GATEWAY]

## 📊 **Configuración Final Esperada:**
```bash
# OAuth2 Directo
NEXT_PUBLIC_OIDC_ISSUER=http://localhost:9000
NEXT_PUBLIC_OIDC_CLIENT_ID=frontend-client
NEXT_PUBLIC_OIDC_REDIRECT_URI=http://localhost:3010/auth/callback
NEXT_PUBLIC_OIDC_SCOPES=openid profile email read:users

# APIs de negocio through gateway
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
