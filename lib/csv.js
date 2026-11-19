const esc = (v) => {
  let s = String(v ?? '');
  if (typeof v !== 'number' && /^[=+\-@\t\r]/.test(s)) s = "'" + s; // blocks spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function taxCsv(receipts) {
  const rows = [['Date', 'Store', 'Items', 'Total', 'Currency', 'Why it may be deductible', 'Receipt ID']];
  receipts.forEach((r) => rows.push([
    r.purchase_date, r.store_name,
    (r.items || []).map((i) => `${i.quantity || 1} x ${i.name}`).join('; '),
    Number(r.total_amount) || 0, r.currency || 'AUD', r.tax_reason || '', r.id,
  ]));
  return '\uFEFF' + rows.map((row) => row.map(esc).join(',')).join('\r\n');
}
export function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
