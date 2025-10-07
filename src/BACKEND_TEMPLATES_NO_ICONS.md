# Backend Templates - Sin Iconos para OAuth2 Server

## 🎯 **Templates limpios y profesionales sin iconos emoji**

---

## 📝 **1. Login Template (Sin Iconos)**

```html
<!-- backend/src/main/resources/templates/login.html -->
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Spectra DC - Login</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 24px;
        }
        .logo h1 {
            color: #333;
            font-size: 28px;
            margin: 0;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.2s;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .login-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .login-btn:hover {
            transform: translateY(-2px);
        }
        .error-message {
            margin-top: 16px;
            padding: 12px;
            background: #fee;
            border-radius: 6px;
            color: #c00;
            text-align: center;
        }
        .success-message {
            margin-top: 16px;
            padding: 12px;
            background: #efe;
            border-radius: 6px;
            color: #080;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1><span style="color: #667eea;">Spectra</span><span style="color: #764ba2;">DC</span></h1>
            <p style="color: #666; margin: 8px 0 0 0;">Plataforma de Acceso Seguro</p>
        </div>
        
        <!-- Hidden OAuth2 parameters -->
        <input type="hidden" th:if="${param.client_id}" name="client_id" th:value="${param.client_id}" />
        <input type="hidden" th:if="${param.scope}" name="scope" th:value="${param.scope}" />
        <input type="hidden" th:if="${param.state}" name="state" th:value="${param.state}" />
        
        <form th:action="@{/login}" method="post">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required 
                       placeholder="Ingresa tu usuario" autocomplete="username">
            </div>
            
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required 
                       placeholder="Ingresa tu contraseña" autocomplete="current-password">
            </div>
            
            <button type="submit" class="login-btn">
                Iniciar Sesión
            </button>
        </form>
        
        <div th:if="${param.error}" class="error-message">
            Usuario o contraseña incorrectos
        </div>
        
        <div th:if="${param.logout}" class="success-message">
            Has cerrado sesión correctamente
        </div>
    </div>
</body>
</html>
```

---

## 📝 **2. Consent Template (Sin Iconos)**

```html
<!-- backend/src/main/resources/templates/oauth2-consent.html -->
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Spectra DC - Autorizar Aplicación</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .consent-container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 24px;
        }
        .logo h1 {
            color: #333;
            font-size: 28px;
            margin: 0;
        }
        .client-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }
        .permissions {
            margin: 20px 0;
        }
        .permission-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .permission-item:last-child {
            border-bottom: none;
        }
        .permission-bullet {
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            margin-right: 16px;
            flex-shrink: 0;
        }
        .buttons {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }
        .btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn-approve {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
        }
        .btn-deny {
            background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="consent-container">
        <div class="logo">
            <h1><span style="color: #667eea;">Spectra</span><span style="color: #764ba2;">DC</span></h1>
            <p style="color: #666; margin: 8px 0 0 0;">Autorizar Aplicación</p>
        </div>
        
        <div class="client-info">
            <strong th:text="${clientName}">NEO-FrontEnd</strong> solicita acceso a tu cuenta
        </div>
        
        <div class="permissions">
            <h3 style="margin: 0 0 16px 0;">Esta aplicación podrá:</h3>
            
            <div th:each="scope : ${requestedScopes}" class="permission-item">
                <div class="permission-bullet"></div>
                <div>
                    <strong th:if="${scope == 'openid'}">Acceso seguro a tu identidad</strong>
                    <strong th:if="${scope == 'profile'}">Ver tu información de perfil</strong>
                    <strong th:if="${scope == 'email'}">Acceder a tu email</strong>
                    <strong th:if="${scope == 'read:users'}">Ver otros usuarios</strong>
                    <strong th:unless="${scope == 'openid' or scope == 'profile' or scope == 'email' or scope == 'read:users'}" th:text="${scope}">Permiso</strong>
                </div>
            </div>
        </div>
        
        <form th:action="@{/oauth2/consent}" method="post">
            <!-- Hidden OAuth2 parameters -->
            <input type="hidden" name="client_id" th:value="${clientId}" />
            <input type="hidden" name="scope" th:value="${scope}" />
            <input type="hidden" name="state" th:value="${state}" />
            <input type="hidden" name="response_type" th:value="${responseType}" />
            <input type="hidden" name="redirect_uri" th:value="${redirectUri}" />
            <input type="hidden" name="code_challenge" th:value="${codeChallenge}" />
            <input type="hidden" name="code_challenge_method" th:value="${codeChallengeMethod}" />
            <input type="hidden" name="nonce" th:value="${nonce}" />
            
            <div class="buttons">
                <button type="submit" name="consent" value="true" class="btn btn-approve">
                    Permitir Acceso
                </button>
                <button type="submit" name="consent" value="false" class="btn btn-deny">
                    Cancelar
                </button>
            </div>
        </form>
    </div>
</body>
</html>
```

---

## 🎯 **Características de los Templates sin Iconos:**

### **✅ Diseño Limpio y Profesional:**
- **Sin emojis** - Solo texto y elementos CSS
- **Bullets CSS** en lugar de iconos SVG
- **Gradientes modernos** para botones y fondo
- **Tipografía clara** y legible

### **✅ Elementos Visuales Sutiles:**
- **Punto verde** (bullet) para indicar permisos
- **Bordes left** para destacar información
- **Sombras suaves** para profundidad
- **Transiciones suaves** en hover

### **✅ Compatibilidad Máxima:**
- **Funciona en todos los navegadores**
- **Sin dependencias de iconos externos**
- **Carga rápida** - solo CSS y HTML
- **Accessible** - semántico HTML

---

## 🚀 **Implementación:**

### **Paso 1: Copiar templates al backend:**
```bash
# Copiar login.html
cp src/BACKEND_TEMPLATES_NO_ICONS.md backend/src/main/resources/templates/login.html

# Copiar oauth2-consent.html  
cp src/BACKEND_TEMPLATES_NO_ICONS.md backend/src/main/resources/templates/oauth2-consent.html
```

### **Paso 2: Configurar SecurityConfig:**
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/oauth2/consent")
                .permitAll()
            )
            .oauth2AuthorizationServer(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .consentPage("/oauth2/consent")
                )
            );
        return http.build();
    }
}
```

### **Paso 3: Implementar OAuth2ConsentController:**
Usar el código del documento `CONSENT_CONTROLLER_IMPLEMENTATION.md`

---

## 🎯 **Resultado Final:**

**Flujo completo sin iconos:**
1. **Frontend** → Botón "Iniciar Sesión"
2. **Backend** → Login limpio y profesional
3. **Backend** → Consent claro sin iconos
4. **Frontend** → Usuario autenticado

**Diseño consistente** de principio a fin, sin emojis, solo CSS profesional.
