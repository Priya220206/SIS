import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase/config';

function preserveCookies(response: NextResponse, refreshedResponse: NextResponse) {
  for (const cookie of refreshedResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  for (const name of ['cache-control', 'expires', 'pragma']) {
    const value = refreshedResponse.headers.get(name);
    if (value) response.headers.set(name, value);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { url, key } = getSupabaseConfig();
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers ?? {})) {
          supabaseResponse.headers.set(name, value);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error) throw error;

  const isAuthPage = ['/login', '/signup'].includes(request.nextUrl.pathname);
  const isAuthenticated = Boolean(data?.claims);

  if (isAuthPage && isAuthenticated) {
    return preserveCookies(
      NextResponse.redirect(new URL('/dashboard', request.url)),
      supabaseResponse
    );
  }

  if (!isAuthPage && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return preserveCookies(NextResponse.redirect(loginUrl), supabaseResponse);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
