import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server';

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  if (code) { const sb = await serverClient(); await sb.auth.exchangeCodeForSession(code); }
  return NextResponse.redirect(`${origin}/dashboard`);
}
