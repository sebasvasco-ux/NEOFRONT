import { tokenManager } from './token-manager';

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Usar el gateway de Spring Cloud Gateway directamente
    // El gateway está en localhost:8081 y redirige /adverse-media/api/* al microservicio
    this.baseUrl = '/adverse-media/api';
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Agregar Authorization header
    try {
      const token = await tokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('[ApiClient] Error getting access token:', error);
    }

    const config = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(url, config);

      // Si el token expiró, intentar refresh
      if (response.status === 401) {
        try {
          const newToken = await tokenManager.refreshTokens();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...config, headers });
          }
        } catch (refreshError) {
          console.error('[ApiClient] Token refresh failed:', refreshError);
          // Si el refresh falla, lanzar error específico
          throw new Error('Authentication failed. Please log in again.');
        }
      }

      // Manejar otros errores HTTP
      if (!response.ok) {
        const errorMessage = await this.getErrorMessage(response);
        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }

      return response;
    } catch (error) {
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[ApiClient] Network error:', error);
        throw new Error('Network connection failed. Please check your connection and try again.');
      }
      
      // Si ya es un error personalizado, relanzarlo
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        throw error;
      }

      // Error genérico
      console.error('[ApiClient] Request error:', error);
      throw new Error('Request failed. Please try again later.');
    }
  }

  private async getErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      // Intentar parsear como JSON
      try {
        const json = JSON.parse(text);
        return json.message || json.error || text || 'Unknown error';
      } catch {
        return text || 'Unknown error';
      }
    } catch {
      return 'Unknown error';
    }
  }
  
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Método para health check con manejo especial de errores
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.warn('[ApiClient] Health check failed:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();
