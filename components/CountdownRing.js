import { daysLeft, badge } from '@/lib/dates';

export default function CountdownRing({ r }) {
  const n = daysLeft(r);
  const total = Math.max(1, Number(r.return_window_days) || 30);
  const closed = n === null || n < 0;
  const frac = closed ? 0 : Math.min(1, n / total);
  const color = closed ? 'rgb(var(--ink) / .3)' : n <= 1 ? '#DC2626' : n <= 14 ? '#F59E0B' : '#059669';
  const C = 2 * Math.PI * 26;
  return (
    <div className="relative h-[68px] w-[68px] shrink-0" role="img" aria-label={badge(n).label}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="26" fill="none" stroke="rgb(var(--ink) / .12)" strokeWidth="6" />
        <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
        <span className="text-xl font-extrabold">{closed ? '–' : n}</span>
        <span className="mt-0.5 text-[10px] font-semibold text-ink/60">{closed ? 'closed' : n === 1 ? 'day' : 'days'}</span>
      </div>
    </div>
  );
}
