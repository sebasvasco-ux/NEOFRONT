import { tokenManager } from './token-manager';

class ApiClient {
    async request(endpoint: string, options: RequestInit = {}) {
        const url = `http://localhost:8081${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };
        
        // Agregar Authorization header
        const token = tokenManager.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers,
        };
        
        let response = await fetch(url, config);
        
        // Si el token expiró, intentar refresh
        if (response.status === 401) {
            try {
                const newToken = await tokenManager.refreshTokens();
                headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(url, { ...config, headers });
            } catch (error) {
                // Refresh falló, redirigir a login
                window.location.href = '/login';
                throw error;
            }
        }
        
        return response;
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
}

export const apiClient = new ApiClient();
