import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';

// Función para mapear el nivel de riesgo del microservicio al formato de la UI
function mapRiskLevel(risk?: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (!risk) return 'LOW';
  if (risk <= 2) return 'LOW';
  if (risk <= 3) return 'MEDIUM';
  return 'HIGH';
}

export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    
    if (!match) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const sessionId = decodeURIComponent(match[1]);
    const session = sessionStore.get(sessionId);
    
    if (!session || !session.access_token) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

    // Llamar al microservicio de Adverse Media
    const response = await fetch(`http://localhost:8081/adverse-media/api/sample?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Adverse Media API error:', response.status, response.statusText);
      console.warn('Fallback: Using demo data because microservice is unavailable');

      // Fallback a datos de demostración si el microservicio no está disponible
      const demoData = [
        {
          id: 1,
          name: "Carlos Rodriguez Martinez",
          alias: "El Gato",
          nationality: "MX",
          riskLevel: "HIGH" as const,
          category: "Financial Crime",
          source: "Interpol Red Notice",
          lastUpdated: "2024-01-15T10:30:00Z",
          status: "ACTIVE" as const,
          delito: "Lavado de dinero y fraude financiero",
          medida: "Orden de arresto internacional emitida. Congelamiento de activos bancarios.",
          analisis: "Individuo de alto riesgo vinculado a operaciones de lavado de dinero transfronterizas. Múltiples alias identificados en diferentes jurisdicciones.",
          summary: "Investigado por operaciones de lavado de dinero a través de empresas fantasma en múltiples países.",
          implication: "Alto riesgo de operaciones financieras ilícitas. Se recomienda bloqueo inmediato de transacciones.",
          titulo: "Líder de red de lavado de dinero internacional",
          organizations: "Interpol, FBI, UNODC",
          subject_key: "AM-2024-001-MX",
          url_noticia: "https://www.interpol.int/notice/001",
          nombre: "Carlos Rodriguez Martinez",
          pais: "MX",
          risk: 4,
          created_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          name: "Maria Gonzalez Lopez",
          alias: null,
          nationality: "ES",
          riskLevel: "MEDIUM" as const,
          category: "Sanctions",
          source: "OFAC List",
          lastUpdated: "2024-01-14T15:45:00Z",
          status: "ACTIVE" as const,
          delito: "Violación de sanciones internacionales",
          medida: "Inclusión en lista OFAC. Prohibición de transacciones con entidades estadounidenses.",
          analisis: "Persona designada por violaciones a sanciones internacionales. Comercio con entidades sancionadas.",
          summary: "Incluida en lista OFAC por comercio con entidades sancionadas.",
          implication: "Restricciones comerciales. Se debe verificar cumplimiento de sanciones antes de operar.",
          titulo: "Ejecutiva comercial sancionada por OFAC",
          organizations: "OFAC, Departamento del Tesoro de EE.UU.",
          subject_key: "AM-2024-002-ES",
          url_noticia: "https://www.treasury.gov/ofac",
          nombre: "Maria Gonzalez Lopez",
          pais: "ES",
          risk: 3,
          created_at: "2024-01-14T15:45:00Z"
        },
        {
          id: 3,
          name: "John Smith",
          alias: "JS",
          nationality: "US",
          riskLevel: "LOW" as const,
          category: "Regulatory",
          source: "SEC Enforcement",
          lastUpdated: "2024-01-13T09:20:00Z",
          status: "UNDER_REVIEW" as const,
          delito: "Violaciones regulatorias menores en reporting financiero",
          medida: "Multa administrativa. Supervisión regulatoria incrementada.",
          analisis: "Caso de violaciones menores a regulaciones SEC. Bajo riesgo de reincidencia.",
          summary: "Penalizado por SEC por reporte financiero inadecuado.",
          implication: "Bajo riesgo. Se recomienda monitoreo estándar de transacciones.",
          titulo: "CEO multado por SEC por irregularidades en reporting",
          organizations: "SEC, NYSE",
          subject_key: "AM-2024-003-US",
          url_noticia: "https://www.sec.gov/enforcement",
          nombre: "John Smith",
          pais: "US",
          risk: 2,
          created_at: "2024-01-13T09:20:00Z"
        }
      ];

      return NextResponse.json(demoData);
    }

    const responseData = await response.json();
    
    // El microservicio devuelve { success: true, data: [...], metadata: {...} }
    // Mapeamos los datos al formato que la UI espera
    if (responseData.success && Array.isArray(responseData.data)) {
      const mappedData = responseData.data.map((record: any) => ({
        id: record.id,
        name: record.nombre || 'Unknown',
        alias: record.alias || '',
        dateOfBirth: '', // No disponible en microservicio
        nationality: record.pais || '',
        riskLevel: mapRiskLevel(record.risk),
        category: record.delito || 'Unknown',
        source: record.organizations || 'Unknown',
        lastUpdated: record.created_at || new Date().toISOString(),
        status: 'ACTIVE', // Por defecto

        // Campos originales del microservicio
        nombre: record.nombre,
        pais: record.pais,
        delito: record.delito,
        risk: record.risk,
        titulo: record.titulo,
        summary: record.summary,
        organizations: record.organizations,
        subject_key: record.subject_key,
        url_noticia: record.url_noticia,
        created_at: record.created_at,
        implication: record.implication,
        medida: record.medida,
        analisis: record.analisis
      }));
      return NextResponse.json(mappedData);
    } else {
      console.error('Unexpected API response format:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Adverse Media API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in Adverse Media sample API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
