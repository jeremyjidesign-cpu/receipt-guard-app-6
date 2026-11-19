'use client';
import { useState } from 'react';
import { daysLeft, badge, money } from '@/lib/dates';
import { signedImageUrl } from '@/lib/store';
import CountdownRing from './CountdownRing';
import Barcode from './Barcode';
import { StoreBadge, CategoryIcon } from './Visuals';

const WINDOWS = [14, 30, 60, 90];

export default function ReceiptCard({ r, onPatch, onRemove, recalls = [], isNew = false }) {
  const [img, setImg] = useState(null);
  const active = r.status === 'active';
  const returned = r.status === 'returned';

  return (
    <div className={`thermal-wrap ${isNew ? 'print-in' : ''}`}>
      <article className="thermal relative px-4 pt-4">
        <header className="flex items-start gap-3">
          <StoreBadge name={r.store_name} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold leading-tight">{r.store_name}</h3>
            <p className="font-mono text-xs text-ink/70">{r.purchase_date}</p>
            {active && <p className="mt-1 text-sm font-semibold">{badge(daysLeft(r)).label}</p>}
          </div>
          {active && <CountdownRing r={r} />}
        </header>
        {!active && <div className={`stamp ${returned ? 'stamp-returned' : 'stamp-kept'}`} aria-label={returned ? 'Returned' : 'Kept'}>{returned ? 'RETURNED' : 'KEPT'}</div>}

        {recalls.length > 0 && (
          <p role="alert" className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">
            Possible recall: {recalls[0].itemName}. <a className="underline" href={recalls[0].url} target="_blank" rel="noopener noreferrer">Verify</a>
          </p>
        )}

        <details className="perf mt-3 pt-2">
          <summary className="min-h-9 cursor-pointer text-sm font-semibold text-brand">{(r.items || []).length} items</summary>
          <ul className="mt-2 space-y-1.5 font-mono text-[13px]">
            {(r.items || []).map((i, k) => (
              <li key={k} className="flex items-baseline gap-2">
                <CategoryIcon category={i.category} className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-ink/50" />
                <span className="min-w-0 truncate">{i.quantity || 1} &times; {i.name}</span>
                <span aria-hidden="true" className="min-w-3 flex-1 border-b border-dotted border-ink/30" />
                <span>{money(i.price, r.currency)}</span>
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-2 flex items-baseline gap-2 border-t border-ink/20 pt-2 font-mono text-sm font-semibold">
          <span>TOTAL</span><span aria-hidden="true" className="flex-1 border-b border-dotted border-ink/30" /><span>{money(r.total_amount, r.currency)}</span>
        </p>
        {r.tax_reason && r.is_tax_deductible && <p className="mt-2 text-sm text-ink/70">Deductible: {r.tax_reason}</p>}
        <Barcode receipt={r} />

        <div className="perf mt-4 flex flex-wrap items-center gap-2 pt-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Window</span>
            <select className="field !min-h-10 !w-auto" value={r.return_window_days} onChange={(e) => onPatch(r.id, { return_window_days: Number(e.target.value) })}>
              {[...new Set([...WINDOWS, r.return_window_days])].sort((a, b) => a - b).map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </label>
          {active ? (
            <>
              <button className="btn-quiet" onClick={() => onPatch(r.id, { status: 'returned' })}>Mark returned</button>
              <button className="btn-quiet" onClick={() => onPatch(r.id, { status: 'kept' })}>Mark kept</button>
            </>
          ) : <button className="btn-quiet" onClick={() => onPatch(r.id, { status: 'active' })}>Reopen</button>}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="h-5 w-5 accent-[#0F6B57]" checked={!!r.is_tax_deductible} onChange={(e) => onPatch(r.id, { is_tax_deductible: e.target.checked })} />
            Tax deductible
          </label>
          <div className="flex gap-2">
            <button className="btn-quiet !min-h-10" onClick={async () => setImg(img ? null : (await signedImageUrl(r)) || 'none')}>{img ? 'Hide image' : 'Receipt image'}</button>
            <button className="btn-quiet !min-h-10 text-red-700" onClick={() => confirm('Delete this receipt?') && onRemove(r)}>Delete</button>
          </div>
        </div>
        {img === 'none' && <p className="mt-2 text-sm text-ink/70">No image stored for this receipt.</p>}
        {img && img !== 'none' && (img.includes('.pdf') || img.startsWith('data:application/pdf')
          ? <a className="mt-2 block text-sm font-semibold text-brand underline" href={img} target="_blank" rel="noopener noreferrer">Open PDF</a>
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={img} alt={`Receipt from ${r.store_name}`} className="mt-3 max-h-96 w-full rounded-lg object-contain ring-1 ring-ink/10" />)}
      </article>
    </div>
  );
}
