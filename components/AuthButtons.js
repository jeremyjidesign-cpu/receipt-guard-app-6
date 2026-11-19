'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseEnabled } from '@/lib/supabase/client';
import { getUser } from '@/lib/store';

export default function AuthButtons({ variant = 'hero' }) {
  const [inApp, setInApp] = useState(!supabaseEnabled); // local mode needs no account
  useEffect(() => { if (supabaseEnabled) getUser().then((u) => setInApp(!!u)); }, []);
  const big = variant === 'hero';
  const size = big ? '!min-h-12 !px-6 !text-base' : '!min-h-10';
  if (inApp) return <Link href="/dashboard" className={`btn ${size}`}>Open app</Link>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/signup" className={`btn ${size}`}>Get started</Link>
      <Link href="/login" className={big ? `btn-quiet ${size}` : 'px-2 text-sm font-semibold underline-offset-4 hover:underline'}>Sign in</Link>
    </div>
  );
}
