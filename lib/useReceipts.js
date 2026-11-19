'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseEnabled } from './supabase/client';
import { getUser, listReceipts, updateReceipt, removeReceipt } from './store';

export function useReceipts() {
  const router = useRouter();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      if (supabaseEnabled && !(await getUser())) { router.replace('/login'); return; }
      setReceipts(await listReceipts());
      setError('');
    } catch (e) { setError(e.message || 'Could not load receipts'); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { refresh(); }, [refresh]);

  const patch = async (id, p) => {
    setReceipts((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
    try { await updateReceipt(id, p); } catch (e) { setError(e.message); refresh(); }
  };
  const remove = async (r) => {
    setReceipts((rs) => rs.filter((x) => x.id !== r.id));
    try { await removeReceipt(r); } catch (e) { setError(e.message); refresh(); }
  };
  return { receipts, loading, error, patch, remove, refresh, mode: supabaseEnabled ? 'cloud' : 'local' };
}

// Checks owned (not returned) items against /api/recalls. Returns { [receiptId]: match[] }.
export function useRecalls(receipts) {
  const [byReceipt, setByReceipt] = useState({});
  const payload = receipts.filter((r) => r.status !== 'returned').map((r) => ({ id: r.id, items: (r.items || []).map((i) => ({ name: i.name, brand: i.brand, category: i.category })) }));
  const key = JSON.stringify(payload);
  useEffect(() => {
    if (!payload.length) { setByReceipt({}); return; }
    let live = true;
    fetch('/api/recalls', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ receipts: payload }) })
      .then((r) => r.json()).then((d) => {
        if (!live) return;
        const map = {};
        (d.matches || []).forEach((m) => { (map[m.receiptId] ||= []).push(m); });
        setByReceipt(map);
      }).catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return byReceipt;
}
