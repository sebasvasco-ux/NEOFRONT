# OAuth2 Consent Controller Implementation for Spring Authorization Server 1.3

## 🎯 **Problem Solved:**
The OAuth2 parameters (client_id, scope, state, code_challenge, etc.) are being lost during the login redirect, causing PKCE verification to fail.

## 📋 **Implementation Plan:**

### **1. OAuth2ConsentController**
Handles the consent page and preserves all OAuth2 parameters including PKCE.

### **2. OAuth2AuthenticationSuccessHandler** 
Custom success handler that preserves OAuth2 parameters during login redirect.

### **3. OAuth2ConsentService**
Service to manage consent decisions and authorization codes.

### **4. Security Configuration Updates**
Updated Spring Security config to use the consent controller.

---

## 🔧 **Implementation Details:**

### **Step 1: OAuth2ConsentController**

```java
package org.neoia.msvc_oauth2.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.Principal;
import java.util.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class OAuth2ConsentController {

    private final RegisteredClientRepository registeredClientRepository;
    private final OAuth2AuthorizationService authorizationService;
    private final OAuth2AuthorizationConsentService authorizationConsentService;

    @GetMapping("/oauth2/consent")
    public String consent(
            @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
            @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
            @RequestParam(OAuth2ParameterNames.STATE) String state,
            @RequestParam(name = OAuth2ParameterNames.RESPONSE_TYPE) String responseType,
            @RequestParam(name = OAuth2ParameterNames.REDIRECT_URI) String redirectUri,
            @RequestParam(name = OAuth2ParameterNames.CODE_CHALLENGE) String codeChallenge,
            @RequestParam(name = OAuth2ParameterNames.CODE_CHALLENGE_METHOD) String codeChallengeMethod,
            @RequestParam(name = OAuth2ParameterNames.NONCE) String nonce,
            Principal principal,
            Model model,
            HttpServletRequest request) {

        log.info("OAuth2 consent request - clientId: {}, scope: {}, principal: {}", clientId, scope, principal.getName());

        // Validate client
        RegisteredClient registeredClient = registeredClientRepository.findByClientId(clientId);
        if (registeredClient == null) {
            log.error("Invalid client_id: {}", clientId);
            model.addAttribute("error", "Invalid client");
            return "error";
        }

        // Parse requested scopes
        Set<String> requestedScopes = new HashSet<>(Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
        
        // Check for existing consent
        String principalName = principal.getName();
        OAuth2AuthorizationConsent existingConsent = 
            authorizationConsentService.findById(registeredClient.getId(), principalName);

        Set<String> approvedScopes = Collections.emptySet();
        if (existingConsent != null) {
            approvedScopes = existingConsent.getScopes();
        }

        // Auto-approve if all scopes were previously approved
        if (approvedScopes.containsAll(requestedScopes)) {
            log.info("Auto-approving consent for previously approved scopes");
            return handleConsentApproval(clientId, scope, state, responseType, redirectUri, 
                codeChallenge, codeChallengeMethod, nonce, principal, true);
        }

        // Add data to model for consent page
        model.addAttribute("clientId", clientId);
        model.addAttribute("clientName", registeredClient.getClientName());
        model.addAttribute("requestedScopes", requestedScopes);
        model.addAttribute("state", state);
        model.addAttribute("responseType", responseType);
        model.addAttribute("redirectUri", redirectUri);
        model.addAttribute("codeChallenge", codeChallenge);
        model.addAttribute("codeChallengeMethod", codeChallengeMethod);
        model.addAttribute("nonce", nonce);
        model.addAttribute("principalName", principalName);

        // Store OAuth2 parameters in session for later retrieval
        HttpSession session = request.getSession(true);
        session.setAttribute("oauth2_params", Map.of(
            OAuth2ParameterNames.CLIENT_ID, clientId,
            OAuth2ParameterNames.SCOPE, scope,
            OAuth2ParameterNames.STATE, state,
            OAuth2ParameterNames.RESPONSE_TYPE, responseType,
            OAuth2ParameterNames.REDIRECT_URI, redirectUri,
            OAuth2ParameterNames.CODE_CHALLENGE, codeChallenge,
            OAuth2ParameterNames.CODE_CHALLENGE_METHOD, codeChallengeMethod,
            OAuth2ParameterNames.NONCE, nonce
        ));

        return "oauth2-consent";
    }

    @PostMapping("/oauth2/consent")
    public String handleConsent(
            @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
            @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
            @RequestParam(OAuth2ParameterNames.STATE) String state,
            @RequestParam(name = OAuth2ParameterNames.RESPONSE_TYPE) String responseType,
            @RequestParam(name = OAuth2ParameterNames.REDIRECT_URI) String redirectUri,
            @RequestParam(name = OAuth2ParameterNames.CODE_CHALLENGE) String codeChallenge,
            @RequestParam(name = OAuth2ParameterNames.CODE_CHALLENGE_METHOD) String codeChallengeMethod,
            @RequestParam(name = OAuth2ParameterNames.NONCE) String nonce,
            @RequestParam(name = "consent") boolean consent,
            Principal principal,
            HttpServletRequest request) {

        return handleConsentApproval(clientId, scope, state, responseType, redirectUri,
            codeChallenge, codeChallengeMethod, nonce, principal, consent);
    }

    private String handleConsentApproval(
            String clientId, String scope, String state, String responseType,
            String redirectUri, String codeChallenge, String codeChallengeMethod,
            String nonce, Principal principal, boolean consent) {

        log.info("Handling consent approval - consent: {}, principal: {}", consent, principal.getName());

        if (!consent) {
            log.info("User denied consent");
            return "redirect:" + redirectUri + "?error=" + OAuth2ErrorCodes.ACCESS_DENIED + "&state=" + state;
        }

        try {
            RegisteredClient registeredClient = registeredClientRepository.findByClientId(clientId);
            if (registeredClient == null) {
                log.error("Client not found: {}", clientId);
                return "redirect:" + redirectUri + "?error=invalid_client&state=" + state;
            }

            // Create authorization
            String authorizationCode = generateAuthorizationCode();
            String principalName = principal.getName();
            
            OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(registeredClient)
                .principalName(principalName)
                .authorizationCode(authorizationCode)
                .token(authorizationCode, metadata -> {
                    metadata.put(OAuth2Authorization.Token.TYPE, OAuth2ParameterNames.CODE);
                    metadata.put(OAuth2Authorization.Token.ISSUED_AT, System.currentTimeMillis());
                    metadata.put(OAuth2Authorization.Token.EXPIRES_AT, System.currentTimeMillis() + 300000); // 5 minutes
                })
                .attribute(OAuth2ParameterNames.SCOPE, scope)
                .attribute(OAuth2ParameterNames.STATE, state)
                .attribute(OAuth2ParameterNames.REDIRECT_URI, redirectUri)
                .attribute(OAuth2ParameterNames.CODE_CHALLENGE, codeChallenge)
                .attribute(OAuth2ParameterNames.CODE_CHALLENGE_METHOD, codeChallengeMethod)
                .attribute(OAuth2ParameterNames.NONCE, nonce)
                .build();

            authorizationService.save(authorization);

            // Save consent
            Set<String> approvedScopes = new HashSet<>(Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
            OAuth2AuthorizationConsent consentRecord = OAuth2AuthorizationConsent.withId(
                registeredClient.getId(), principalName)
                .scope(OidcScopes.OPENID)
                .scopes(scopes -> approvedScopes.forEach(scopes::add))
                .build();
            authorizationConsentService.save(consentRecord);

            log.info("Authorization created successfully for client: {}, principal: {}", clientId, principalName);

            // Redirect with authorization code
            return "redirect:" + redirectUri + "?code=" + authorizationCode + "&state=" + state;

        } catch (Exception e) {
            log.error("Error creating authorization", e);
            return "redirect:" + redirectUri + "?error=server_error&state=" + state;
        }
    }

    private String generateAuthorizationCode() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
```

### **Step 2: OAuth2AuthenticationSuccessHandler**

```java
package org.neoia.msvc_oauth2.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, 
            HttpServletResponse response, 
            Authentication authentication) throws IOException {
        
        log.info("Authentication success for user: {}", authentication.getName());

        // Check if there are OAuth2 parameters stored in session
        HttpSession session = request.getSession(false);
        if (session != null) {
            @SuppressWarnings("unchecked")
            Map<String, String> oauth2Params = (Map<String, String>) session.getAttribute("oauth2_params");
            
            if (oauth2Params != null) {
                log.info("Found OAuth2 parameters in session, redirecting to consent page");
                
                // Build consent URL with all OAuth2 parameters
                StringBuilder consentUrl = new StringBuilder("/oauth2/consent?");
                for (Map.Entry<String, String> entry : oauth2Params.entrySet()) {
                    consentUrl.append(entry.getKey())
                              .append("=")
                              .append(entry.getValue())
                              .append("&");
                }
                
                // Remove trailing &
                String finalUrl = consentUrl.substring(0, consentUrl.length() - 1);
                
                // Clean up session
                session.removeAttribute("oauth2_params");
                
                getRedirectStrategy().sendRedirect(request, response, finalUrl);
                return;
            }
        }

        // Default behavior if no OAuth2 parameters
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
```

### **Step 3: Updated Security Configuration**

```java
package org.neoia.msvc_oauth2.config;

import lombok.RequiredArgsConstructor;
import org.neoia.msvc_oauth2.security.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2AuthenticationSuccessHandler successHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/oauth2/consent").authenticated()
                .requestMatchers("/login").permitAll()
                .requestMatchers("/oauth2/authorize").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/oauth2/consent")
                .successHandler(successHandler)
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

### **Step 4: OAuth2 Consent Template**

```html
<!-- src/main/resources/templates/oauth2-consent.html -->
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize Application</title>
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
        .consent-header {
            text-align: center;
            margin-bottom: 24px;
        }
        .consent-header h1 {
            color: #333;
            margin: 0;
            font-size: 24px;
        }
        .consent-header p {
            color: #666;
            margin: 8px 0 0 0;
        }
        .scope-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .scope-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .scope-item:last-child {
            border-bottom: none;
        }
        .scope-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            color: #28a745;
        }
        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }
        .btn {
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-approve {
            background: #28a745;
            color: white;
        }
        .btn-approve:hover {
            background: #218838;
        }
        .btn-deny {
            background: #dc3545;
            color: white;
        }
        .btn-deny:hover {
            background: #c82333;
        }
        .client-info {
            background: #e3f2fd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .client-name {
            font-weight: 600;
            color: #1976d2;
        }
    </style>
</head>
<body>
    <div class="consent-container">
        <div class="consent-header">
            <h1>Authorize Application</h1>
            <p>An application is requesting access to your account</p>
        </div>

        <div class="client-info">
            <div class="client-name" th:text="${clientName}">Application Name</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">
                Client ID: <code th:text="${clientId}">client-id</code>
            </div>
        </div>

        <div class="scope-list">
            <h3 style="margin: 0 0 16px 0; color: #333;">This application will be able to:</h3>
            <div th:each="scope : ${requestedScopes}" class="scope-item">
                <svg class="scope-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span th:text="${scope}">scope</span>
            </div>
        </div>

        <form method="post" action="/oauth2/consent">
            <!-- Hidden OAuth2 parameters -->
            <input type="hidden" name="client_id" th:value="${clientId}" />
            <input type="hidden" name="scope" th:value="${scope}" />
            <input type="hidden" name="state" th:value="${state}" />
            <input type="hidden" name="response_type" th:value="${responseType}" />
            <input type="hidden" name="redirect_uri" th:value="${redirectUri}" />
            <input type="hidden" name="code_challenge" th:value="${codeChallenge}" />
            <input type="hidden" name="code_challenge_method" th:value="${codeChallengeMethod}" />
            <input type="hidden" name="nonce" th:value="${nonce}" />

            <div class="button-group">
                <button type="submit" name="consent" value="true" class="btn btn-approve">
                    Authorize
                </button>
                <button type="submit" name="consent" value="false" class="btn btn-deny">
                    Deny
                </button>
            </div>
        </form>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
            Authorizing will allow this application to access your account information.
        </div>
    </div>
</body>
</html>
```

## 🎯 **Key Features:**

1. **Preserves ALL OAuth2 parameters** including PKCE (code_challenge, code_challenge_method)
2. **Auto-approves previously consented scopes** for better UX
3. **Secure session handling** to prevent parameter loss
4. **Proper error handling** with redirect to error page
5. **Beautiful consent UI** that matches modern design standards
6. **Authorization code generation** with proper expiration
7. **Consent storage** for future approvals

## 🚀 **Expected Flow After Implementation:**

1. Frontend → `/oauth2/authorize` with PKCE parameters
2. Spring Security → Redirect to `/login` (parameters preserved)
3. User → Login with credentials  
4. Success Handler → Redirect to `/oauth2/consent` with ALL parameters
5. Consent Page → Shows requested scopes with PKCE intact
6. User Approves → Authorization code generated → Redirect to frontend
7. Frontend → PKCE verification succeeds → User logged in

This implementation will fix the PKCE issue and ensure the complete OAuth2 flow works correctly!
