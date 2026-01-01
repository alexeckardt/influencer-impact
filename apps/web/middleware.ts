import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {

  let supabaseResponse = NextResponse.next({
    request: req,
  });
  
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
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Refresh the session to ensure cookies are up to date
  // This ensures the client and middleware stay in sync
  await supabase.auth.getSession();

  // Get authenticated user (validates with server instead of just reading cookies)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Define auth routes that logged-in users shouldn't access
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // 1. If NOT logged in (no user or user error), allow access to /login and /register
  if (!user || userError) {
    if (isAuthRoute || pathname === '/') {
      // Add header to indicate no auth in middleware
      supabaseResponse.headers.set('x-middleware-auth', 'none');
      return supabaseResponse;
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
      .select('has_temp_password, role')
      .eq('id', user.id)
      .single();

    // If user doesn't exist in database, sign them out and redirect to login
    if (error || !dbUser) {
      await supabase.auth.signOut();
      
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Add header to indicate authenticated in middleware
    supabaseResponse.headers.set('x-middleware-auth', 'authenticated');
    supabaseResponse.headers.set('x-user-id', user.id);

    // Check if user is trying to access admin routes
    if (pathname.startsWith('/admin')) {
      if (dbUser.role !== 'admin') {
        // Redirect non-admins to 404
        return NextResponse.rewrite(new URL('/404', req.url));
      }
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

    // Otherwise, allow access and ensure cookies are propagated
    return supabaseResponse;
  } catch (error) {
    console.error('Error checking user status:', error);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  // matcher: [
  //   /*
  //    * Match all request paths except for the ones starting with:
  //    * - api (API routes)
  //    * - _next/static (static files)
  //    * - _next/image (image optimization files)
  //    * - favicon.ico (favicon file)
  //    * - public folder
  //    */
  //   '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  // ],
  matcher: ["/((?!_next|.*\\..*).*)"], // run on all pages, skip next assets + files
};