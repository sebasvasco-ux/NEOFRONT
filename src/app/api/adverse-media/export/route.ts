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

    // Verificar rol del usuario (debe ser ADMIN)
    const userInfoResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/oidc/me`, {
      headers: {
        'cookie': cookieHeader
      }
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json({ error: 'Failed to verify user role' }, { status: 403 });
    }

    const userInfo = await userInfoResponse.json();
    
    if (userInfo.profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 });
    }

    // Llamar al microservicio de Adverse Media
    const response = await fetch('http://localhost:8081/adverse-media/api/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Adverse Media export API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to export data from Adverse Media API' },
        { status: response.status }
      );
    }

    // Obtener la respuesta JSON del microservicio
    const responseData = await response.json();
    
    // El microservicio devuelve { success: true, data: [...], metadata: {...} }
    if (responseData.success && Array.isArray(responseData.data)) {
      // Convertir los datos a CSV
      const csvHeaders = [
        'id', 'nombre', 'alias', 'pais', 'delito', 'risk', 'titulo', 
        'summary', 'organizations', 'subject_key', 'url_noticia', 'created_at'
      ];
      
      const csvContent = [
        csvHeaders.join(','),
        ...responseData.data.map((record: any) => [
          record.id,
          `"${record.nombre}"`,
          `"${record.alias || ''}"`,
          record.pais || '',
          `"${record.delito}"`,
          record.risk || '',
          `"${record.titulo}"`,
          `"${record.summary || ''}"`,
          `"${record.organizations || ''}"`,
          record.subject_key || '',
          record.url_noticia || '',
          record.created_at || ''
        ].join(','))
      ].join('\n');
      
      // Crear blob
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      // Configurar headers para la descarga
      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="adverse-media-export-${new Date().toISOString().split('T')[0]}.csv"`);

      return new NextResponse(blob, {
        status: 200,
        headers,
      });
    } else {
      console.error('Unexpected API response format:', responseData);
      return NextResponse.json(
        { error: 'Invalid response format from Adverse Media API' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in Adverse Media export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
