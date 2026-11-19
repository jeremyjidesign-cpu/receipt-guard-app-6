'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const I = (d) => (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>);
const TABS = [
  { href: '/dashboard', label: 'Home', icon: I('M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z') },
  { href: '/scan', label: 'Scan', icon: I('M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16') },
  { href: '/returns', label: 'Returns', icon: I('M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3') },
  { href: '/vault', label: 'Tax Vault', icon: I('M4 7h16v13H4zM9 7V4h6v3M12 12v4') },
];

export default function BottomNav() {
  const path = usePathname();
  if (['/', '/login', '/signup'].includes(path)) return null;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-card/95 backdrop-blur" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {TABS.map((t) => {
          const on = path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={on ? 'page' : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${on ? 'text-brand' : 'text-ink/60'}`}>
                {t.icon}{t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
