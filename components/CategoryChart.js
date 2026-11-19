import { CategoryIcon } from './Visuals';
import { money } from '@/lib/dates';

export default function CategoryChart({ receipts, currency = 'AUD' }) {
  const totals = {};
  receipts.forEach((r) => {
    const items = r.items || [];
    if (!items.length) { totals.other = (totals.other || 0) + Number(r.total_amount || 0); return; }
    items.forEach((i) => { const k = String(i.category || 'other').toLowerCase().trim() || 'other'; totals[k] = (totals[k] || 0) + (Number(i.price) || 0) * (Number(i.quantity) || 1); });
  });
  const rows = Object.entries(totals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!rows.length) return null;
  const max = rows[0][1];
  return (
    <section aria-label="Spending by category" className="slip mb-6">
      <h2 className="mb-3 font-bold">Where it went</h2>
      <ul className="space-y-2.5">
        {rows.map(([cat, v]) => (
          <li key={cat} className="grid grid-cols-[1.25rem_5.5rem_1fr_auto] items-center gap-2 text-sm">
            <CategoryIcon category={cat} className="h-5 w-5 text-brand" />
            <span className="truncate capitalize">{cat}</span>
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-2.5 w-full" aria-hidden="true">
              <rect width="100" height="10" rx="5" fill="rgb(var(--ink) / .1)" />
              <rect width={Math.max(4, (v / max) * 100)} height="10" rx="5" fill="rgb(var(--brand))" />
            </svg>
            <span className="font-mono text-xs">{money(v, currency)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
