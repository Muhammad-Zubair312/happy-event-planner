import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    res.cookies.delete('user_role');
    return res;
  }

  if (!user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.delete('user_role');
    return redirectRes;
  }

  const role = (user.app_metadata?.role as string) ?? 'customer';

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  res.cookies.set('user_role', role, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60,
  });

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)',
  ],
};