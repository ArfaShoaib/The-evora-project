import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

function transferCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options as Record<string, unknown>);
  });
}

/**
 * Decodes the JWT from admin_session cookie to get the user.
 * No network call — JWTs are self-contained and signed.
 */
function getAdminUser(request: NextRequest): { id: string; email: string } | null {
  const raw = request.cookies.get('admin_session')?.value;
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session?.access_token) return null;

    const payload = JSON.parse(
      Buffer.from(session.access_token.split('.')[1], 'base64url').toString()
    );

    if (!payload?.sub) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return { id: payload.sub, email: payload.email ?? '' };
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Regular user session (for storefront /account, /auth, etc.)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;
    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminLogin = pathname === '/admin/login';
    const isAuthRoute = pathname.startsWith('/auth');
    const isAccountRoute = pathname.startsWith('/account');

    // ── Admin routes: use isolated admin_session cookie ──────────────────────
    if (isAdminRoute && !isAdminLogin) {
      const adminUser = getAdminUser(request);
      if (!adminUser) {
        url.pathname = '/admin/login';
        return NextResponse.redirect(url);
      }
    }

    // Redirect logged-in admin away from login page
    if (isAdminLogin) {
      const adminUser = getAdminUser(request);
      if (adminUser) {
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
      }
    }

    // ── Storefront routes: use regular Supabase session ──────────────────────
    if (isAccountRoute && !user) {
      url.pathname = '/auth/login';
      const redirectResponse = NextResponse.redirect(url);
      transferCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (user && isAuthRoute && !pathname.startsWith('/auth/callback') && !pathname.startsWith('/auth/update-password') && !pathname.startsWith('/auth/verify-email')) {
      url.pathname = '/';
      const redirectResponse = NextResponse.redirect(url);
      transferCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  } catch {
    // Supabase not configured — continue without auth
  }

  return supabaseResponse;
}
