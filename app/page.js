import Link from 'next/link';
import AuthButtons from '@/components/AuthButtons';
import SampleReceipt from '@/components/SampleReceipt';

const Icon = (d) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const FEATURES = [
  { title: 'Scan in seconds', body: 'Use your camera or upload a photo or PDF. Store, date, items and total are read for you to check.', icon: Icon('M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16') },
  { title: 'Return countdown', body: 'A colour-coded ring shows how long you have left. Set 14, 30, 60 or 90 days, then mark items returned or kept.', icon: Icon('M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3') },
  { title: 'Recall alerts', body: 'Your items are checked against product safety alert categories, with a clear warning when something matches.', icon: Icon('M12 3l9 16H3zM12 10v4M12 17h.01') },
  { title: 'Tax vault', body: 'Mark work purchases as deductible, then export a clean CSV when tax time comes around.', icon: Icon('M4 7h16v13H4zM9 7V4h6v3M12 12v4') },
];
const STEPS = [
  ['Snap it', 'Take a photo of the receipt the moment you buy.'],
  ['Check it', 'Confirm what we read, then save. Image and details stay in your account.'],
  ['Stay ahead', 'Watch the countdown, get warned about recalls, and export deductions later.'],
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">Receipt Guard</Link>
        <AuthButtons variant="header" />
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-2 md:pt-14">
          <div>
            <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight md:text-6xl">Stop losing money to lost receipts.</h1>
            <p className="mt-5 max-w-md text-lg text-ink/75">Snap a receipt and Receipt Guard counts down the return window, flags possible recalls and keeps your tax deductions ready.</p>
            <div className="mt-7"><AuthButtons variant="hero" /></div>
            <p className="mt-4 text-sm text-ink/60">Works on your phone like an app. No app store needed.</p>
          </div>
          <div className="rounded-[2rem] bg-brand p-6 md:p-8">
            <p className="mb-4 text-center text-xs font-semibold text-white/80">Example receipt</p>
            <div className="mx-auto max-w-sm rotate-2"><SampleReceipt /></div>
          </div>
        </section>

        <section aria-labelledby="features" className="mx-auto max-w-5xl px-4 py-12">
          <h2 id="features" className="text-3xl font-extrabold tracking-tight">Everything a receipt should do</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="slip">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-white">{f.icon}</span>
                <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-ink/75">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-12">
          <h2 id="how" className="text-3xl font-extrabold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="perf pt-4">
                <span className="font-mono text-sm font-semibold text-brand">0{i + 1}</span>
                <h3 className="mt-1 text-xl font-bold">{t}</h3>
                <p className="mt-1 text-ink/75">{b}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="rounded-[2rem] bg-brand p-8 text-white md:p-12">
            <h2 className="max-w-lg text-3xl font-extrabold tracking-tight md:text-4xl">Start with your next receipt.</h2>
            <p className="mt-2 max-w-md text-white/80">Create an account in under a minute and scan your first one.</p>
            <div className="mt-6 [&_.btn]:bg-white [&_.btn]:!text-[#0A4F40] [&_.btn-quiet]:border-white/40 [&_.btn-quiet]:bg-transparent [&_.btn-quiet]:!text-white"><AuthButtons variant="hero" /></div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-12 pt-6 text-sm text-ink/60">
        <p>Receipts are read by AI, so check the details before you save. Recall matches and tax flags are suggestions only: confirm recalls at productsafety.gov.au and speak to a tax adviser for deductions.</p>
      </footer>
    </div>
  );
}
