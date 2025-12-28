import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/search',
    '/influencer',
    '/profile',
    '/dashboard',
    '/admin'
  ];

  // Define auth routes that logged-in users shouldn't access
  const authRoutes = ['/login', '/register'];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes, redirect to home
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated, verify they exist in our users table and are active
  if (session && isProtectedRoute) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, is_active')
        .eq('id', session.user.id)
        .single();

      // If user doesn't exist in our users table or is inactive, sign them out
      if (error || !user || !user.is_active) {
        await supabase.auth.signOut();
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set('error', 'access_denied');
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      // On error, redirect to login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('error', 'server_error');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};