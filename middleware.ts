import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Verificamos si hay una sesión activa
  const { data: { session } } = await supabase.auth.getSession();

  // Verificamos si es una solicitud a la api
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Si no hay sesión y es una solicitud a la API, devolvemos 401
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'No autorizado' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};