import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';

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
    const name = searchParams.get('name');
    const phonetic = searchParams.get('phonetic') || 'true';
    const exact = searchParams.get('exact') || 'false';

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
    }

    // Llamar al microservicio de Adverse Media
    const microserviceParams = new URLSearchParams({
      name,
      phonetic,
      exact,
    });

    const response = await fetch(`http://localhost:8081/adverse-media/api/search?${microserviceParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Adverse Media search API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to search data from Adverse Media API' },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // El microservicio devuelve { success: true, data: [...], metadata: {...} }
    // Extraemos solo el array de datos para mantener compatibilidad
    if (responseData.success && Array.isArray(responseData.data)) {
      return NextResponse.json(responseData.data);
    } else {
      console.error('Unexpected API response format:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Adverse Media API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in Adverse Media search API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
