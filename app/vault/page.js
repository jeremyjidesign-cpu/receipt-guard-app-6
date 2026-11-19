'use client';
import { useMemo, useState } from 'react';
import { useReceipts, useRecalls } from '@/lib/useReceipts';
import { daysLeft, money, todayISO } from '@/lib/dates';
import { taxCsv, downloadText } from '@/lib/csv';
import ReceiptCard from '@/components/ReceiptCard';

const FILTERS = [['all', 'All receipts'], ['deductible', 'Tax deductible'], ['returnable', 'Returnable']];

export default function Vault() {
  const { receipts, loading, error, patch, remove } = useReceipts();
  const recalls = useRecalls(receipts);
  const [f, setF] = useState('deductible');

  const deductible = useMemo(() => receipts.filter((r) => r.is_tax_deductible), [receipts]);
  const shown = receipts.filter((r) => f === 'all' || (f === 'deductible' && r.is_tax_deductible) || (f === 'returnable' && r.status === 'active' && daysLeft(r) >= 0));
  const total = deductible.reduce((s, r) => s + Number(r.total_amount || 0), 0);

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">Tax Vault</h1>
      <section className="mb-5 rounded-xl bg-brand p-5 text-white">
        <p className="text-sm font-semibold text-white/80">Marked deductible</p>
        <p className="text-4xl font-extrabold">{money(total)}</p>
        <p className="mt-1 text-sm">{deductible.length} receipts. Suggestions only, check with your tax adviser.</p>
        <button className="btn-quiet mt-3" disabled={!deductible.length} onClick={() => downloadText(`tax-deductions-${todayISO()}.csv`, taxCsv(deductible))}>Export Tax CSV</button>
      </section>
      <div role="tablist" aria-label="Filter receipts" className="mb-4 grid grid-cols-3 gap-2">
        {FILTERS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${f === k ? 'bg-ink text-paper' : 'bg-card ring-1 ring-ink/20'}`}>{label}</button>
        ))}
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">{error}</p>}
      {loading ? <p>Loading&hellip;</p> : shown.length === 0 ? <p className="slip">No receipts in this view.</p> : (
        <div className="space-y-4">{shown.map((r) => <ReceiptCard key={r.id} r={r} onPatch={patch} onRemove={remove} recalls={recalls[r.id]} />)}</div>
      )}
    </>
  );
}
