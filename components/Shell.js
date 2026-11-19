'use client';
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

const PUBLIC = ['/', '/login', '/signup'];

// Public pages render full-width; app pages get the phone-width column and bottom nav.
export default function Shell({ children }) {
  const path = usePathname();
  if (PUBLIC.includes(path)) return <>{children}</>;
  return (
    <>
      <main className="mx-auto min-h-screen max-w-xl px-4 pb-28 pt-6">{children}</main>
      <BottomNav />
    </>
  );
}
