'use client';
import { useEffect, useState } from 'react';
import CountdownRing from './CountdownRing';
import Barcode from './Barcode';
import { StoreBadge, CategoryIcon } from './Visuals';
import { money } from '@/lib/dates';

const ITEMS = [
  { name: 'USB-C fast charger', category: 'electronics', price: 39.95, quantity: 1, possible_barcode: '9300675024235' },
  { name: 'HDMI cable 2m', category: 'electronics', price: 19, quantity: 1, possible_barcode: null },
  { name: 'Power bank 10000mAh', category: 'electronics', price: 59, quantity: 1, possible_barcode: null },
];

export default function SampleReceipt() {
  const [r, setR] = useState(null);
  useEffect(() => {
    const d = new Date(); d.setDate(d.getDate() - 22);
    const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    setR({ id: 'sample-0001', store_name: 'Harbour Electronics', purchase_date: iso, return_window_days: 30, currency: 'AUD', total_amount: 117.95, items: ITEMS, status: 'active' });
  }, []);
  if (!r) return <div className="h-[470px]" aria-hidden="true" />;
  return (
    <div className="thermal-wrap">
      <div className="thermal px-4 pt-4">
        <div className="flex items-start gap-3">
          <StoreBadge name={r.store_name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold leading-tight">{r.store_name}</p>
            <p className="font-mono text-xs text-ink/70">{r.purchase_date}</p>
            <p className="mt-1 text-sm font-semibold">8 days left</p>
          </div>
          <CountdownRing r={r} />
        </div>
        <p className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Possible recall: Power bank 10000mAh</p>
        <ul className="perf mt-3 space-y-1.5 pt-3 font-mono text-[13px]">
          {r.items.map((i) => (
            <li key={i.name} className="flex items-baseline gap-2">
              <CategoryIcon category={i.category} className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-ink/50" />
              <span className="min-w-0 truncate">1 &times; {i.name}</span>
              <span aria-hidden="true" className="min-w-3 flex-1 border-b border-dotted border-ink/30" />
              <span>{money(i.price)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex items-baseline gap-2 border-t border-ink/20 pt-2 font-mono text-sm font-semibold">
          <span>TOTAL</span><span aria-hidden="true" className="flex-1 border-b border-dotted border-ink/30" /><span>{money(r.total_amount)}</span>
        </p>
        <Barcode receipt={r} />
      </div>
    </div>
  );
}
