import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';
import { SESSION_COOKIE_NAME } from '@/lib/cookies';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const recordId = params.id;

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Llamar al microservicio de Adverse Media
    const response = await fetch(`http://localhost:8081/adverse-media/api/details/${recordId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Adverse Media details API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch details from Adverse Media API' },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // El microservicio devuelve { success: true, data: {...}, metadata: {...} }
    // Extraemos solo el objeto de datos para mantener compatibilidad
    if (responseData.success && responseData.data) {
      return NextResponse.json(responseData.data);
    } else {
      console.error('Unexpected API response format:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Adverse Media API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in Adverse Media details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
