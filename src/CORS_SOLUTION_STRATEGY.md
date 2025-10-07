# 🔧 **Estrategia de Solución CORS - Flujo OAuth2 Directo**

## 🚨 **Problema Identificado:**

El error `OPTIONS 400` ocurre porque el frontend está intentando hacer peticiones POST al OAuth2 server desde un dominio diferente (localhost:3010 → localhost:9000), lo cual causa problemas de CORS.

## 🎯 **Solución Propuesta:**

### **Enfoque Actual (Problemático):**
```
Frontend (3010) → POST → OAuth2 Server (9000) ❌ CORS
```

### **Enfoque Correcto (Sin CORS):**
```
Frontend (3010) → GET → OAuth2 Server (9000) → Login Form → POST (mismo dominio) → Callback ✅
```

## 🏗️ **Arquitectura de la Solución:**

### **1. Frontend - Solo Redirección GET:**
- El frontend solo construye la URL de autorización
- Navega directamente al OAuth2 server con parámetros PKCE
- No hace peticiones POST/AJAX al OAuth2 server

### **2. OAuth2 Server - Manejo Completo:**
- Muestra formulario de login HTML simple
- Procesa el POST del formulario en el mismo dominio
- Redirige al frontend con el authorization code
- No hay problemas de CORS

### **3. Frontend - Callback:**
- Recibe el authorization code en el callback
- Intercambia el code por tokens (puede ser server-to-server)
- Establece la sesión

## 📋 **Implementación Requerida:**

### **Backend (OAuth2 Server):**

#### **1. Nuevo Controlador de Login:**
```java
@Controller
public class OAuth2LoginController {
    
    @GetMapping("/oauth2/authorize")
    public String showLoginForm(@RequestParam Map<String, String> params, Model model) {
        // Mostrar formulario de login con los parámetros OAuth2
        model.addAttribute("clientId", params.get("client_id"));
        model.addAttribute("redirectUri", params.get("redirect_uri"));
        model.addAttribute("state", params.get("state"));
        model.addAttribute("codeChallenge", params.get("code_challenge"));
        model.addAttribute("codeChallengeMethod", params.get("code_challenge_method"));
        model.addAttribute("scope", params.get("scope"));
        model.addAttribute("nonce", params.get("nonce"));
        
        return "oauth2-login"; // Plantilla HTML
    }
    
    @PostMapping("/oauth2/authorize")
    public String processLogin(
        @RequestParam String username,
        @RequestParam String password,
        @RequestParam Map<String, String> oauth2Params,
        RedirectAttributes redirectAttributes) {
        
        // Validar credenciales
        if (validateCredentials(username, password)) {
            // Generar authorization code
            String authCode = generateAuthorizationCode(oauth2Params);
            
            // Construir URL de redirect
            String redirectUrl = oauth2Params.get("redirect_uri") + 
                "?code=" + authCode + 
                "&state=" + oauth2Params.get("state");
            
            return "redirect:" + redirectUrl;
        } else {
            // Mostrar error de login
            redirectAttributes.addAttribute("error", "invalid_credentials");
            return "redirect:/oauth2/authorize?" + buildQueryString(oauth2Params);
        }
    }
}
```

#### **2. Plantilla HTML de Login:**
```html
<!-- templates/oauth2-login.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Spectra DC - OAuth2 Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #1e3c72, #2a5298); }
        .login-container { max-width: 400px; margin: 100px auto; padding: 40px; background: white; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .logo { text-align: center; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
        .btn { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        .error { color: red; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>Spectra DC</h1>
            <p>OAuth2 Authorization</p>
        </div>
        
        <div th:if="${error}" class="error">
            Credenciales inválidas. Por favor intenta nuevamente.
        </div>
        
        <form method="post" action="/oauth2/authorize">
            <!-- Parámetros OAuth2 ocultos -->
            <input type="hidden" name="client_id" th:value="${clientId}" />
            <input type="hidden" name="redirect_uri" th:value="${redirectUri}" />
            <input type="hidden" name="state" th:value="${state}" />
            <input type="hidden" name="code_challenge" th:value="${codeChallenge}" />
            <input type="hidden" name="code_challenge_method" th:value="${codeChallengeMethod}" />
            <input type="hidden" name="scope" th:value="${scope}" />
            <input type="hidden" name="nonce" th:value="${nonce}" />
            
            <div class="form-group">
                <label for="username">Usuario:</label>
                <input type="text" id="username" name="username" required />
            </div>
            
            <div class="form-group">
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required />
            </div>
            
            <button type="submit" class="btn">Iniciar Sesión</button>
        </form>
    </div>
</body>
</html>
```

### **Frontend (Next.js):**

#### **1. Login Component (Simplificado):**
```typescript
const login = async () => {
  try {
    // Generar PKCE parameters
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge();
    
    // Construir URL de autorización
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI,
      scope: process.env.NEXT_PUBLIC_OIDC_SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state,
      nonce: nonce
    });

    // Guardar PKCE data para el callback
    sessionStorage.setItem('oidc_state', state);
    sessionStorage.setItem('oidc_nonce', nonce);
    sessionStorage.setItem('oidc_code_verifier', codeVerifier);
    
    // Redirección directa - SIN CORS
    const authorizeUrl = `${process.env.NEXT_PUBLIC_OIDC_ISSUER}/oauth2/authorize?${params.toString()}`;
    window.location.href = authorizeUrl;
    
  } catch (error) {
    console.error('Login error:', error);
    setError('authentication_failed');
  }
};
```

## 🔄 **Flujo Completo Sin CORS:**

### **Paso 1: Inicio de Login**
```
Frontend (3010) → GET /oauth2/authorize?params → OAuth2 Server (9000)
```

### **Paso 2: Formulario de Login**
```
OAuth2 Server (9000) → HTML Login Form → Browser
```

### **Paso 3: Submit del Formulario**
```
Browser → POST /oauth2/authorize (mismo dominio) → OAuth2 Server (9000)
```

### **Paso 4: Callback**
```
OAuth2 Server (9000) → Redirect /auth/callback?code=... → Frontend (3010)
```

### **Paso 5: Token Exchange**
```
Frontend (3010) → POST /api/oidc/callback → Frontend Server (3010) → OAuth2 Server (9000)
```

## ✅ **Ventajas de este Enfoque:**

1. **Sin problemas CORS** - Todas las peticiones del usuario son al mismo dominio
2. **Seguridad PKCE** mantenido
3. **Experiencia de usuario fluida**
4. **Compatible con estándares OAuth2**
5. **Fácil de depurar**

## 🚀 **Implementación Inmediata:**

### **Para el equipo Backend:**
1. Crear `OAuth2LoginController` con el formulario de login
2. Crear plantilla HTML para el formulario
3. Configurar el procesamiento del POST
4. Probar el flujo completo

### **Para el equipo Frontend:**
1. El código actual ya está casi listo
2. Solo necesita asegurar que el callback maneje correctamente el code
3. Implementar el token exchange server-side si es necesario

## 🎯 **Resultado Esperado:**

Una vez implementado, el flujo de login será:
- **100% funcional** sin errores CORS
- **Seguro** con PKCE
- **Rápido** y responsivo
- **Estándar** OAuth2 compliant

Esta solución elimina completamente los problemas de CORS y proporciona una experiencia de usuario fluida.
