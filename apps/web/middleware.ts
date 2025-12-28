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

  // Get authenticated user (validates with server instead of just reading cookies)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Define auth routes that logged-in users shouldn't access
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // 1. If NOT logged in (no user or user error), allow access to /login and /register
  if (!user || userError) {
    if (isAuthRoute || pathname === '/') {
      return NextResponse.next();
    }
    // For all other routes, redirect to login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If logged in, verify user exists in database and check for has_temp_password
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('has_temp_password')
      .eq('id', user.id)
      .single();

    // If user doesn't exist in database, sign them out and redirect to login
    if (error || !dbUser) {
      await supabase.auth.signOut();
      
      // Clear all Supabase-related cookies
      const cookiesToDelete = ['sb-access-token', 'sb-refresh-token', 'sb-auth-token'];
      cookiesToDelete.forEach(cookieName => {
        // Try to delete with different naming patterns Supabase might use
        res.cookies.delete(cookieName);
        res.cookies.delete(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);
      });
      
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // If user has temp password and NOT on setup-account page, redirect there
    if (dbUser && dbUser.has_temp_password && pathname !== '/setup-account') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/setup-account';
      return NextResponse.redirect(redirectUrl);
    }

    // If user is on auth routes (login/register) and logged in, redirect to home
    if (isAuthRoute) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    // Otherwise, allow access
    return res;
  } catch (error) {
    console.error('Error checking user status:', error);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};