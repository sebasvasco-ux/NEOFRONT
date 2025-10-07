# Frontend OAuth2.0 Integration Guide

## Overview
This guide explains how to integrate your frontend SPA (Single Page Application) with the NEOIA OAuth2.0 authentication system.

## Prerequisites
- Frontend running on `http://localhost:3010` (or `http://localhost:3002`)
- OAuth2 service running on `http://localhost:9000`
- Gateway running on `http://localhost:8081`

## OAuth2.0 Flow Options

### Option 1: Authorization Code with PKCE (Recommended for SPAs) ✅ PKCE ACTIVO
This is the most secure method for single-page applications. **PKCE is fully active and required** for the frontend-client.

#### PKCE Verification
The OAuth2 server confirms PKCE is active:
```json
"code_challenge_methods_supported":["S256"]
```

#### Complete PKCE Implementation

##### Step 1: Generate PKCE values and start flow
```javascript
// Generate PKCE values
const generatePKCE = () => {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier));
  return { codeVerifier, codeChallenge };
};

const generateRandomString = (length) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const base64UrlEncode = (str) => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return String.fromCharCode.apply(null, new Uint8Array(digest));
};

// Store PKCE values for later use
let pkceValues = null;

// Start OAuth2 flow with PKCE
const startOAuth2Flow = async (redirectUri = null) => {
  try {
    // Generate PKCE values
    pkceValues = await generatePKCE();
    
    // Store code_verifier in session storage for callback
    sessionStorage.setItem('pkce_code_verifier', pkceValues.codeVerifier);
    
    // Build authorization URL with PKCE parameters
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: 'frontend-client',
      redirect_uri: redirectUri || 'http://localhost:3010/auth/callback',
      scope: 'openid profile email read:users',
      state: generateRandomState(),
      code_challenge: pkceValues.codeChallenge,
      code_challenge_method: 'S256'
    });
    
    // Option 1: Use gateway OIDC start endpoint (recommended)
    const gatewayUrl = `http://localhost:8081/api/oidc/start?${params}`;
    
    // Option 2: Direct to OAuth2 server (alternative)
    // const directUrl = `http://localhost:9000/oauth2/authorize?${params}`;
    
    // Redirect to OAuth2 authorization endpoint
    window.location.href = gatewayUrl;
  } catch (error) {
    console.error('Error initiating OAuth2 flow:', error);
  }
};

const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
```

##### Step 2: Handle Callback with PKCE
Create a callback page at `/auth/callback`:

```javascript
// auth/callback.js
const handleOAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('OAuth2 error:', error);
    // Handle error (show error message, redirect to login, etc.)
    return;
  }
  
  if (code) {
    // Exchange authorization code for tokens with PKCE
    await exchangeCodeForTokens(code, state);
  } else {
    console.error('No authorization code received');
    // Handle error
  }
};

const exchangeCodeForTokens = async (code, state) => {
  try {
    // Retrieve code_verifier from session storage
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    
    if (!codeVerifier) {
      throw new Error('PKCE code verifier not found');
    }
    
    const response = await fetch('http://localhost:9000/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: 'frontend-client',
        redirect_uri: 'http://localhost:3010/auth/callback',
        code_verifier: codeVerifier // ✅ PKCE REQUIRED
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${errorData}`);
    }
    
    const tokens = await response.json();
    
    if (tokens.access_token) {
      // Store tokens securely
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      
      // Clean up PKCE values
      sessionStorage.removeItem('pkce_code_verifier');
      
      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
    } else {
      throw new Error('No access token received');
    }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    // Handle error - redirect to login with error message
    window.location.href = `/login?error=${encodeURIComponent(error.message)}`;
  }
};

// Call this when the callback page loads
handleOAuthCallback();
```

### Option 2: Direct Form Login (Alternative)
If you prefer a traditional login form:

```javascript
const loginWithCredentials = async (username, password) => {
  try {
    // First, get the login page to establish session
    const loginPageResponse = await fetch('http://localhost:8081/login', {
      method: 'GET',
      credentials: 'include'
    });
    
    // Extract CSRF token if needed
    const csrfToken = extractCsrfToken(await loginPageResponse.text());
    
    // Submit login form
    const response = await fetch('http://localhost:8081/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body: new URLSearchParams({
        username: username,
        password: password,
        _csrf: csrfToken // If CSRF protection is enabled
      })
    });
    
    if (response.redirected) {
      // Server will redirect to callback URL
      window.location.href = response.url;
    } else {
      // Handle login error
      const error = await response.text();
      console.error('Login failed:', error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## Token Usage

### Making Authenticated Requests
```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };
  
  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the original request
      return makeAuthenticatedRequest(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  }
  
  return response;
};
```

### Token Refresh
```javascript
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch('http://localhost:8081/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'frontend-client'
      })
    });
    
    if (response.ok) {
      const tokens = await response.json();
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  // Clear tokens and redirect to login
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return false;
};
```

## Configuration

### Environment Variables
```javascript
const config = {
  oauth2: {
    issuer: 'http://localhost:9000',
    clientId: 'frontend-client',
    redirectUri: 'http://localhost:3010/auth/callback',
    scopes: 'openid profile email read:users',
    gatewayUrl: 'http://localhost:8081'
  }
};
```

### Using OAuth2 Client Libraries
Instead of implementing the flow manually, you can use libraries like:

#### Using `oidc-client-ts`
```bash
npm install oidc-client-ts
```

```javascript
import { UserManager } from 'oidc-client-ts';

const userManager = new UserManager({
  authority: 'http://localhost:9000',
  client_id: 'frontend-client',
  redirect_uri: 'http://localhost:3010/auth/callback',
  response_type: 'code',
  scope: 'openid profile email read:users',
  automaticSilentRenew: true,
  silent_redirect_uri: 'http://localhost:3010/auth/silent-callback'
});

// Start login
const login = async () => {
  await userManager.signinRedirect();
};

// Handle callback
const handleCallback = async () => {
  const user = await userManager.signinRedirectCallback();
  console.log('User logged in:', user);
};

// Get current user
const getCurrentUser = async () => {
  const user = await userManager.getUser();
  return user;
};

// Logout
const logout = async () => {
  await userManager.signoutRedirect();
};
```

## Security Considerations

### 1. Token Storage
- Use `httpOnly` cookies if possible (requires backend configuration)
- If using localStorage, be aware of XSS risks
- Consider using session storage for sensitive tokens

### 2. PKCE Implementation
- Always use PKCE for SPAs
- Generate code verifier and challenge dynamically
- Store code verifier securely until token exchange

### 3. State Management
- Always use state parameter to prevent CSRF
- Validate state on callback
- Store state securely (session storage recommended)

### 4. Token Validation
- Validate JWT tokens on the client side if needed
- Check token expiration
- Implement proper token refresh logic

## Error Handling

### Common OAuth2 Errors
```javascript
const handleOAuthError = (error, errorDescription) => {
  switch (error) {
    case 'access_denied':
      // User denied access
      showMessage('Access denied. Please try again.');
      break;
    case 'invalid_scope':
      // Requested scope is not valid
      showMessage('Invalid permissions requested.');
      break;
    case 'server_error':
      // Server error occurred
      showMessage('Server error. Please try again later.');
      break;
    case 'temporarily_unavailable':
      // Service temporarily unavailable
      showMessage('Service temporarily unavailable. Please try again later.');
      break;
    default:
      showMessage(`Authentication error: ${errorDescription || error}`);
  }
};
```

## Testing

### Test URLs
```bash
# Test OIDC start endpoint
curl "http://localhost:8081/api/oidc/start?redirect_uri=http://localhost:3010/auth/callback"

# Test OAuth2 authorization directly
curl "http://localhost:9000/oauth2/authorize?response_type=code&client_id=frontend-client&redirect_uri=http://localhost:3010/auth/callback&scope=openid profile email"

# Test token endpoint (after getting authorization code)
curl -X POST "http://localhost:9000/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=YOUR_CODE&client_id=frontend-client&redirect_uri=http://localhost:3010/auth/callback"
```

## Support URLs

### OAuth2 Endpoints
- Authorization: `http://localhost:9000/oauth2/authorize`
- Token: `http://localhost:9000/oauth2/token`
- UserInfo: `http://localhost:9000/userinfo`
- JWKS: `http://localhost:9000/oauth2/jwks`
- OpenID Configuration: `http://localhost:9000/.well-known/openid-configuration`

### Gateway Endpoints
- OIDC Start: `http://localhost:8081/api/oidc/start`
- Token: `http://localhost:8081/auth/token`

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure gateway CORS is properly configured
2. **Redirect URI Mismatch**: Check that redirect URI is in allowed list
3. **Invalid Client**: Verify client_id is correct
4. **PKCE Required**: Ensure code_verifier is provided for SPA client

### Debug Tips
- Check browser network tab for redirect flow
- Verify OAuth2 server logs for errors
- Test endpoints with curl first
- Check that frontend URL matches registered redirect URIs

## Conclusion

The frontend integration is now ready. The backend OAuth2.0 service provides:
- ✅ Standard OAuth2.0 + OIDC endpoints
- ✅ PKCE support for SPAs
- ✅ Proper redirect handling
- ✅ Token refresh capabilities
- ✅ CORS configuration for frontend access

Choose the integration method that best fits your frontend architecture and security requirements.
