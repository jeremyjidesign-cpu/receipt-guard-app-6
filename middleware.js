import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED = ['/dashboard', '/scan', '/returns', '/vault'];

export async function middleware(req) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser(); // also refreshes the session cookie
  const p = req.nextUrl.pathname;
  const go = (to) => { const u = req.nextUrl.clone(); u.pathname = to; u.search = ''; return NextResponse.redirect(u); };
  if (!user && PROTECTED.some((x) => p === x || p.startsWith(x + '/'))) return go('/login');
  if (user && (p === '/login' || p === '/signup')) return go('/dashboard');
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|icons|splash|manifest.json|sw.js|favicon.ico).*)'] };
