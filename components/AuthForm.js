'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, supabaseEnabled } from '@/lib/supabase/client';

export default function AuthForm({ mode }) {
  const signup = mode === 'signup';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useLink, setUseLink] = useState(false);
  const [st, setSt] = useState({ busy: false, err: '', msg: '' });

  const shell = (children) => (
    <main className="mx-auto grid min-h-screen max-w-md content-center px-4 py-10">
      <Link href="/" className="mb-8 text-lg font-extrabold tracking-tight">&larr; Receipt Guard</Link>
      {children}
    </main>
  );

  if (!supabaseEnabled) return shell(
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">No account needed</h1>
      <p className="mt-2 text-ink/70">This copy runs without a database, so receipts stay on this device.</p>
      <Link href="/dashboard" className="btn mt-6">Open app</Link>
    </>
  );

  async function submit(e) {
    e.preventDefault();
    setSt({ busy: true, err: '', msg: '' });
    const redirectTo = `${location.origin}/auth/callback`;
    const res = useLink ? await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      : signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      : await supabase.auth.signInWithPassword({ email, password });
    if (res.error) return setSt({ busy: false, err: res.error.message, msg: '' });
    if (!useLink && res.data?.session) { router.push('/dashboard'); router.refresh(); return; }
    setSt({ busy: false, err: '', msg: useLink ? `We sent a sign-in link to ${email}.` : `Check ${email} to confirm your account, then come back and sign in.` });
  }

  return shell(
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{signup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-ink/70">{signup ? 'Keep every receipt in one place, on every device.' : 'Sign in to see your receipts and deadlines.'}</p>
      {st.msg ? <p role="status" className="slip mt-6">{st.msg}</p> : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block text-sm font-semibold">Email
            <input className="field mt-1" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {!useLink && (
            <label className="block text-sm font-semibold">Password
              <input className="field mt-1" type="password" required minLength={signup ? 8 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
              {signup && <span className="mt-1 block text-xs font-normal text-ink/60">At least 8 characters.</span>}
            </label>
          )}
          <button className="btn w-full" disabled={st.busy}>{st.busy ? 'Please wait…' : useLink ? 'Email me a link' : signup ? 'Create account' : 'Sign in'}</button>
          {st.err && <p role="alert" className="text-sm text-red-700">{st.err}</p>}
          {!signup && <button type="button" className="min-h-11 w-full text-sm font-semibold underline underline-offset-4" onClick={() => setUseLink(!useLink)}>{useLink ? 'Use a password instead' : 'Email me a sign-in link instead'}</button>}
        </form>
      )}
      <p className="mt-6 text-sm text-ink/70">
        {signup ? 'Already have an account? ' : 'New here? '}
        <Link href={signup ? '/login' : '/signup'} className="font-semibold text-brand underline underline-offset-4">{signup ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </>
  );
}
