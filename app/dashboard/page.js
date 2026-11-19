'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useReceipts, useRecalls } from '@/lib/useReceipts';
import { daysLeft, money } from '@/lib/dates';
import { notifyExpiring } from '@/lib/notify';
import { signOut } from '@/lib/store';
import ReceiptCard from '@/components/ReceiptCard';
import RecallBanner from '@/components/RecallBanner';
import DeadlineTimeline from '@/components/DeadlineTimeline';
import CategoryChart from '@/components/CategoryChart';
import { EmptyIllustration } from '@/components/Visuals';

export default function Home() {
  const { receipts, loading, error, patch, remove, mode } = useReceipts();
  const recalls = useRecalls(receipts);
  const [newId, setNewId] = useState(null);
  useEffect(() => { notifyExpiring(receipts); }, [receipts]);
  useEffect(() => {
    try { const id = sessionStorage.getItem('rg.new'); if (id) { setNewId(id); sessionStorage.removeItem('rg.new'); } } catch {}
  }, []);

  const stats = useMemo(() => {
    const open = receipts.filter((r) => r.status === 'active' && daysLeft(r) >= 0);
    return { open: open.length, soon: open.filter((r) => daysLeft(r) <= 7).length, atRisk: open.reduce((s, r) => s + Number(r.total_amount || 0), 0) };
  }, [receipts]);
  const allMatches = Object.values(recalls).flat();

  return (
    <>
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">Receipt Guard</h1>
        {mode === 'cloud' && <button className="text-sm font-semibold text-ink/60 underline" onClick={async () => { await signOut(); location.href = '/'; }}>Sign out</button>}
      </header>
      {mode === 'local' && <p className="mb-4 rounded-lg bg-card p-3 text-sm ring-1 ring-ink/10">Saving on this device only. Add Supabase keys to sync across phone and desktop.</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">{error}</p>}
      <RecallBanner matches={allMatches} />

      <section className="mb-6 rounded-xl bg-brand p-5 text-white">
        <p className="text-sm font-semibold text-white/80">Still returnable</p>
        <p className="text-4xl font-extrabold">{money(stats.atRisk)}</p>
        <p className="mt-1 text-sm">{stats.open} receipts open, {stats.soon} closing within a week</p>
      </section>

      {loading ? <p>Loading receipts&hellip;</p> : receipts.length === 0 ? (
        <section className="slip text-center">
          <EmptyIllustration />
          <h2 className="mt-2 text-lg font-bold">No receipts yet</h2>
          <p className="mt-1 text-ink/70">Snap a receipt and we will track the return window for you.</p>
          <Link href="/scan" className="btn mt-4">Scan a receipt</Link>
        </section>
      ) : (
        <>
          <DeadlineTimeline receipts={receipts} />
          <CategoryChart receipts={receipts} />
          <div className="space-y-5">
            {receipts.map((r) => <ReceiptCard key={r.id} r={r} onPatch={patch} onRemove={remove} recalls={recalls[r.id]} isNew={r.id === newId} />)}
          </div>
        </>
      )}
    </>
  );
}
