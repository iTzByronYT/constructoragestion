import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuración de rutas públicas
const publicRoutes = [
  '/',
  '/api/webhook/clerk',
  // Agrega aquí más rutas públicas si es necesario
];

// Crear un matcher de rutas
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => 
    path === route || path.startsWith(route + '/') || path === '/api/webhook/clerk'
  );
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Permitir el acceso a rutas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Para el resto de rutas, verificar autenticación
  const session = await auth();
  if (!session) {
    // Redirigir a la página de inicio de sesión si no hay sesión
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\..*|_next).*)',  // No coincidir con archivos estáticos
    '/',
    '/(api|trpc)(.*)'
  ],
};
