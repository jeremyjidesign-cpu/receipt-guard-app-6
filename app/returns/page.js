'use client';
import { useEffect, useState } from 'react';
import { useReceipts, useRecalls } from '@/lib/useReceipts';
import { daysLeft } from '@/lib/dates';
import { enableReminders, remindersSupported } from '@/lib/notify';
import ReceiptCard from '@/components/ReceiptCard';

export default function Returns() {
  const { receipts, loading, error, patch, remove } = useReceipts();
  const recalls = useRecalls(receipts);
  const [perm, setPerm] = useState('default');
  useEffect(() => { if (remindersSupported()) setPerm(Notification.permission); }, []);

  const open = receipts.filter((r) => r.status === 'active').sort((a, b) => (daysLeft(a) ?? 9999) - (daysLeft(b) ?? 9999));
  const closed = receipts.filter((r) => r.status !== 'active');

  return (
    <>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Returns</h1>
      <p className="mb-4 text-ink/70">Closest deadlines first.</p>
      {remindersSupported() && perm === 'default' && (
        <button className="btn mb-4" onClick={async () => setPerm(await enableReminders())}>Remind me when a window is closing</button>
      )}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">{error}</p>}
      {loading ? <p>Loading&hellip;</p> : open.length === 0 ? <p className="slip">Nothing to return right now.</p> : (
        <div className="space-y-4">{open.map((r) => <ReceiptCard key={r.id} r={r} onPatch={patch} onRemove={remove} recalls={recalls[r.id]} />)}</div>
      )}
      {closed.length > 0 && (
        <details className="mt-8">
          <summary className="min-h-11 cursor-pointer font-bold">Returned or kept ({closed.length})</summary>
          <div className="mt-3 space-y-4">{closed.map((r) => <ReceiptCard key={r.id} r={r} onPatch={patch} onRemove={remove} recalls={recalls[r.id]} />)}</div>
        </details>
      )}
    </>
  );
}
