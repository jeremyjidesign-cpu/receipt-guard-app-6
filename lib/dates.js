export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
export function daysLeft(r) {
  if (!r?.purchase_date) return null;
  const [y, m, d] = r.purchase_date.split('-').map(Number);
  const end = new Date(y, m - 1, d + Number(r.return_window_days || 30));
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((end - today) / 86400000);
}
// green: 15+ days, amber: 2-14 days, red: today or tomorrow, grey: expired
export function badge(n) {
  if (n === null) return { label: 'No date', cls: 'bg-slate-200 text-slate-700' };
  if (n < 0) return { label: 'Window closed', cls: 'bg-slate-200 text-slate-600' };
  if (n === 0) return { label: 'Expires today', cls: 'bg-red-600 text-white' };
  if (n === 1) return { label: 'Expires tomorrow', cls: 'bg-red-600 text-white' };
  if (n <= 14) return { label: `${n} days left`, cls: 'bg-amber-400 text-amber-950' };
  return { label: `${n} days left`, cls: 'bg-emerald-600 text-white' };
}
export function money(n, currency = 'AUD') {
  const v = Number(n) || 0;
  try { return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(v); } catch { return `${currency} ${v.toFixed(2)}`; }
}
