import { daysLeft } from '@/lib/dates';

const dot = (n) => (n <= 1 ? 'bg-red-600' : n <= 14 ? 'bg-amber-400' : 'bg-emerald-600');

export default function DeadlineTimeline({ receipts }) {
  const items = receipts.filter((r) => r.status === 'active').map((r) => ({ r, n: daysLeft(r) })).filter((x) => x.n !== null && x.n >= 0 && x.n <= 45).sort((a, b) => a.n - b.n);
  if (!items.length) return null;
  const label = ({ r, n }) => {
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    const [y, m, d] = r.purchase_date.split('-').map(Number);
    return new Date(y, m - 1, d + Number(r.return_window_days || 30)).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  return (
    <section aria-label="Upcoming return deadlines" className="mb-6">
      <h2 className="mb-1 font-bold">Next deadlines</h2>
      <div className="overflow-x-auto">
        <ol className="relative flex w-max min-w-full gap-5 pb-2 pt-3">
          <span aria-hidden="true" className="absolute inset-x-0 top-[18px] border-t-2 border-dashed border-ink/25" />
          {items.map((x) => (
            <li key={x.r.id} className="relative w-24 shrink-0">
              <span className={`relative block h-3 w-3 rounded-full ring-4 ring-paper ${dot(x.n)}`} />
              <p className="mt-2 text-xs font-bold">{label(x)}</p>
              <p className="truncate text-xs text-ink/70">{x.r.store_name}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
