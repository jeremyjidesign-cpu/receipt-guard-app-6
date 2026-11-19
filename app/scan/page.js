'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { prepareFile, drawToJpeg } from '@/lib/image';
import { addReceipt, getUser } from '@/lib/store';
import { supabaseEnabled } from '@/lib/supabase/client';
import { money } from '@/lib/dates';
import { CategoryIcon } from '@/components/Visuals';

const CORNERS = ['left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl', 'left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl', 'right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl'];

export default function Scan() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [shot, setShot] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const stopCam = () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCamOn(false); };
  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);
  useEffect(() => { if (camOn && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }, [camOn]);
  useEffect(() => { if (supabaseEnabled) getUser().then((u) => !u && router.replace('/login')); }, [router]);

  async function startCam() {
    setErr('');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false });
      setCamOn(true);
    } catch { setErr('Camera not available. Allow camera access, or upload a photo or PDF instead.'); }
  }
  function capture() {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    setShot({ dataUrl: drawToJpeg(v, v.videoWidth, v.videoHeight), mime: 'image/jpeg' });
    stopCam(); setDraft(null);
  }
  async function onFile(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setErr(''); setDraft(null); stopCam();
    try { setShot(await prepareFile(file)); } catch (x) { setErr(x.message); }
  }
  async function extract() {
    setBusy('Reading receipt…'); setErr('');
    try {
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image: shot.dataUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setDraft({ ...data, tax_reason: data.is_tax_deductible.reason, is_tax_deductible: data.is_tax_deductible.value });
    } catch (x) { setErr(x.message); } finally { setBusy(''); }
  }
  async function save() {
    setBusy('Saving…'); setErr('');
    try {
      const { store_name, purchase_date, items, total_amount, currency, return_window_days, is_tax_deductible, tax_reason } = draft;
      const row = await addReceipt({ store_name, purchase_date, items, total_amount, currency, return_window_days: Number(return_window_days), is_tax_deductible, tax_reason, status: 'active' }, shot.dataUrl);
      try { sessionStorage.setItem('rg.new', row.id); } catch {}
      router.push('/dashboard');
    } catch (x) { setErr(x.message || 'Could not save'); setBusy(''); }
  }
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">Scan a receipt</h1>
      {err && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-900">{err}</p>}

      {camOn && (
        <div className="fixed inset-0 z-50 bg-black" role="dialog" aria-label="Camera">
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-[66%] w-[78%] max-w-md">
              {CORNERS.map((c) => <span key={c} className={`absolute h-10 w-10 border-white ${c}`} />)}
              <span className="scanline absolute inset-x-3 h-0.5 bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />
            </div>
          </div>
          <p className="absolute left-1/2 top-[calc(env(safe-area-inset-top)+1rem)] w-[88%] max-w-sm -translate-x-1/2 rounded-lg bg-black/55 px-3 py-2 text-center text-sm font-semibold text-white">Fit the whole receipt inside the corners and hold steady</p>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-around pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            <button className="min-h-12 w-20 text-base font-semibold text-white" onClick={stopCam}>Cancel</button>
            <button aria-label="Take photo" onClick={capture} className="h-[72px] w-[72px] rounded-full border-4 border-white bg-white/25 active:bg-white/70" />
            <span className="w-20" aria-hidden="true" />
          </div>
        </div>
      )}

      {!camOn && !shot && (
        <div className="grid gap-3">
          <button className="btn" onClick={startCam}>Use camera</button>
          <label className="btn-quiet cursor-pointer">Upload photo or PDF<input type="file" accept="image/*,application/pdf" className="sr-only" onChange={onFile} /></label>
        </div>
      )}

      {shot && !draft && (
        <div>
          {shot.mime === 'application/pdf'
            ? <p className="slip">PDF ready to scan.</p>
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={shot.dataUrl} alt="Captured receipt" className="max-h-96 w-full rounded-xl object-contain ring-1 ring-ink/10" />}
          <div className="mt-3 flex gap-2">
            <button className="btn flex-1" disabled={!!busy} onClick={extract}>{busy || 'Read receipt'}</button>
            <button className="btn-quiet" disabled={!!busy} onClick={() => setShot(null)}>Retake</button>
          </div>
        </div>
      )}

      {draft && (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="slip space-y-3">
          <p className="text-sm text-ink/70">Check the details, then save.</p>
          <label className="block text-sm font-semibold">Store<input className="field mt-1" value={draft.store_name} onChange={set('store_name')} required /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">Purchase date<input className="field mt-1" type="date" value={draft.purchase_date} onChange={set('purchase_date')} required /></label>
            <label className="block text-sm font-semibold">Return window
              <select className="field mt-1" value={draft.return_window_days} onChange={set('return_window_days')}>
                {[...new Set([14, 30, 60, 90, Number(draft.return_window_days)])].sort((a, b) => a - b).map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-semibold">Total ({draft.currency})<input className="field mt-1" type="number" step="0.01" min="0" value={draft.total_amount} onChange={(e) => setDraft((d) => ({ ...d, total_amount: Number(e.target.value) }))} /></label>
          <ul className="perf space-y-1.5 pt-3 font-mono text-[13px]">
            {draft.items.map((i, k) => (
              <li key={k} className="flex items-baseline gap-2">
                <CategoryIcon category={i.category} className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-ink/50" />
                <span className="min-w-0 truncate">{i.quantity} &times; {i.brand ? `${i.brand} ` : ''}{i.name}</span>
                <span aria-hidden="true" className="min-w-3 flex-1 border-b border-dotted border-ink/30" />
                <span>{money(i.price, draft.currency)}</span>
              </li>
            ))}
          </ul>
          <label className="flex min-h-11 items-start gap-2 text-sm font-semibold">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[#0F6B57]" checked={draft.is_tax_deductible} onChange={set('is_tax_deductible')} />
            <span>Tax deductible{draft.tax_reason && <span className="block font-normal text-ink/70">{draft.tax_reason}</span>}</span>
          </label>
          <div className="flex gap-2">
            <button className="btn flex-1" disabled={!!busy}>{busy || 'Save receipt'}</button>
            <button type="button" className="btn-quiet" disabled={!!busy} onClick={() => { setDraft(null); setShot(null); }}>Discard</button>
          </div>
        </form>
      )}
    </>
  );
}
