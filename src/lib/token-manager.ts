import { getSessionId } from './cookies';

export class TokenManager {
  private static instance: TokenManager;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async getAccessToken(): Promise<string | null> {
    try {
      // En el cliente, verificamos la autenticación llamando al endpoint /api/oidc/me
      const response = await fetch('/api/oidc/me');
      if (response.ok) {
        const data = await response.json();
        // Devolver el access_token real del servidor
        return data.access_token || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async refreshTokens(): Promise<string | null> {
    try {
      // En el cliente, el refresh se maneja automáticamente por el middleware
      // Simplemente verificamos que la sesión sigue activa y obtenemos el nuevo token
      const response = await fetch('/api/oidc/me');
      if (response.ok) {
        const data = await response.json();
        return data.access_token || null;
      }
      throw new Error('Session expired');
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  clearTokens(): void {
    // En el cliente, limpiamos las cookies redirigiendo al logout
    window.location.href = '/api/oidc/logout';
  }

  // Método para obtener información del usuario
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch('/api/oidc/me');
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
