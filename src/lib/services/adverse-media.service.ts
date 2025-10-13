import { apiClient } from '../api-client';

// Types para Adverse Media - Basados en la documentación del microservicio
export interface AdverseMediaRecord {
  // Campos del microservicio (documentación oficial)
  id: number;
  nombre?: string;
  alias?: string;
  pais?: string;
  delito?: string;
  riesgo?: number; // 1-4 según documentación
  titulo?: string;
  summary?: string;
  organizations?: string;
  subject_key?: string;
  url_noticia?: string;
  medio?: string;
  fecha_noticia?: string;
  status?: string;
  created_at?: string;
  implication?: string;
  medida?: string;
  analisis?: string;

  // Campos mapeados para compatibilidad con UI existente
  name: string; // mapeado de nombre
  dateOfBirth?: string; // no disponible en microservicio
  nationality?: string; // mapeado de pais
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // mapeado de riesgo (1-4)
  category: string; // mapeado de delito
  source: string; // mapeado de organizations o medio
  lastUpdated: string; // mapeado de created_at
  statusUI: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW'; // mapeado de status
}

export interface SearchParams {
  name: string;
  phonetic?: boolean;
  exact?: boolean;
  limit?: number;
}

export interface FilterOptions {
  riskLevels: string[];
  categories: string[];
  sources: string[];
  statuses: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    requested_by?: string;
    total_results?: number;
    search_query?: string;
    search_type?: string;
    phonetic_enabled?: boolean;
    limit?: number;
    all_fields_included?: boolean;
    columns_returned?: number;
    timestamp: string;
  };
}

class AdverseMediaService {
  // Transformar datos del microservicio al formato de la UI
  private transformApiData(record: any): AdverseMediaRecord {
    // Mapeo de riesgo numérico a niveles
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (record.riesgo >= 3) riskLevel = 'HIGH';
    else if (record.riesgo >= 2) riskLevel = 'MEDIUM';

    // Mapeo de status
    let statusUI: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' = 'ACTIVE';
    if (record.status === 'inactivo') statusUI = 'INACTIVE';
    else if (record.status === 'revision') statusUI = 'UNDER_REVIEW';

    return {
      id: record.id,
      name: record.nombre || 'Unknown',
      alias: record.alias,
      nationality: record.pais,
      dateOfBirth: undefined, // No disponible en microservicio
      riskLevel,
      category: record.delito || 'Unknown',
      source: record.organizations || record.medio || 'Unknown',
      lastUpdated: record.created_at || new Date().toISOString(),
      statusUI,
      
      // Campos originales del microservicio
      nombre: record.nombre,
      pais: record.pais,
      delito: record.delito,
      riesgo: record.riesgo,
      titulo: record.titulo,
      summary: record.summary,
      organizations: record.organizations,
      subject_key: record.subject_key,
      url_noticia: record.url_noticia,
      medio: record.medio,
      fecha_noticia: record.fecha_noticia,
      status: record.status,
      created_at: record.created_at,
      implication: record.implication,
      medida: record.medida,
      analisis: record.analisis,
    };
  }

  // Health check del microservicio
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Obtener datos de muestra - Endpoint /api/sample
  async getSampleData(limit: number = 50): Promise<AdverseMediaRecord[]> {
    try {
      const response = await apiClient.get(`/sample?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Sample data failed: ${response.status}`);
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(record => this.transformApiData(record));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sample data:', error);
      throw error;
    }
  }

  // Búsqueda estándar - Endpoint /api/search
  async searchByName(params: SearchParams): Promise<AdverseMediaRecord[]> {
    try {
      const queryParams = new URLSearchParams({
        name: params.name,
        phonetic: params.phonetic ? 'true' : 'false',
        exact: params.exact ? 'true' : 'false',
      });

      const response = await apiClient.get(`/search?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(record => this.transformApiData(record));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching by name:', error);
      throw error;
    }
  }

  // Búsqueda completa - Endpoint /api/search-full (con todos los campos)
  async searchFull(params: SearchParams): Promise<AdverseMediaRecord[]> {
    try {
      const queryParams = new URLSearchParams({
        name: params.name,
        phonetic: params.phonetic ? 'true' : 'false',
        exact: params.exact ? 'true' : 'false',
        limit: (params.limit || 100).toString(),
      });

      const response = await apiClient.get(`/search-full?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Full search failed: ${response.status}`);
      }

      const data: ApiResponse<any[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        return data.data.map(record => this.transformApiData(record));
      }
      
      return [];
    } catch (error) {
      console.error('Error in full search:', error);
      throw error;
    }
  }

  // Obtener detalles - Endpoint /api/details/{id}
  async getDetails(id: number): Promise<AdverseMediaRecord> {
    try {
      const response = await apiClient.get(`/details/${id}`);
      
      if (!response.ok) {
        throw new Error(`Details failed: ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      
      if (data.success && data.data) {
        return this.transformApiData(data.data);
      }
      
      throw new Error('No data found');
    } catch (error) {
      console.error('Error fetching details:', error);
      throw error;
    }
  }

  // Exportar todos los datos - Endpoint /api/all (solo ADMIN)
  async exportAll(): Promise<Blob> {
    try {
      const response = await apiClient.get('/all');
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting all data:', error);
      throw error;
    }
  }

  // Obtener opciones de filtros - Endpoint /api/filter-options
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await apiClient.get('/filter-options');
      
      if (!response.ok) {
        throw new Error(`Filter options failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw error;
    }
  }

  // Método para descargar el archivo exportado
  async downloadExport(): Promise<void> {
    try {
      const blob = await this.exportAll();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adverse-media-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }

  // Verificar permisos del usuario basado en la respuesta de la API
  async checkPermissions(): Promise<{
    canSearch: boolean;
    canViewDetails: boolean;
    canExport: boolean;
  }> {
    try {
      // Intentar obtener datos de muestra para verificar permisos básicos
      await this.getSampleData(1);
      
      // Intentar búsqueda para verificar permisos de búsqueda
      try {
        await this.searchByName({ name: 'test' });
        const canSearch = true;
        
        // Intentar detalles para verificar permisos avanzados
        try {
          await this.getDetails(1);
          const canViewDetails = true;
          
          // Intentar exportación para verificar permisos de admin
          try {
            await this.exportAll();
            return { canSearch: true, canViewDetails: true, canExport: true };
          } catch {
            return { canSearch: true, canViewDetails: true, canExport: false };
          }
        } catch {
          return { canSearch: true, canViewDetails: false, canExport: false };
        }
      } catch {
        return { canSearch: false, canViewDetails: false, canExport: false };
      }
    } catch {
      return { canSearch: false, canViewDetails: false, canExport: false };
    }
  }
}

export const adverseMediaService = new AdverseMediaService();
