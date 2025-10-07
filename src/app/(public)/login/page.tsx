import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginClient from './ui-login-client';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('__Host-neo_session');
  if (session) {
    // Usuario ya autenticado: redirección temprana evita flash.
    redirect('/dashboard');
  }
  return <LoginClient />;
}
// Client logic lives in ./ui-login-client (client component). This file intentionally remains a Server Component
// to allow early redirect without bundling client code.