const ICONS = [
  [/grocer|food|drink|snack|fruit|veg|meat|dairy|bakery|beverage/, 'M6 9h12l-1.2 9.5a1 1 0 01-1 .9H8.2a1 1 0 01-1-.9L6 9zM9 9V6a3 3 0 016 0v3'],
  [/electr|phone|computer|laptop|cable|charger|battery|tech|appliance|audio/, 'M4 5h16v11H4zM9 20h6M12 16v4'],
  [/cloth|apparel|shirt|shoe|fashion|wear/, 'M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 01-8 0z'],
  [/home|house|furnit|kitchen|garden|bedding|decor/, 'M3 11l9-7 9 7v9H3zM10 20v-6h4v6'],
  [/health|pharm|medic|beauty|vitamin|personal care/, 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z'],
  [/station|office|book|pen|paper|print|school/, 'M4 20l1-5L16 4l4 4L9 19zM14 6l4 4'],
  [/toy|kid|baby|game|child/, 'M5 12h14v8H5zM8 12V8h8v4M10 8V5h4v3'],
  [/tool|hardware|auto|car|diy/, 'M14 6a4 4 0 005 5l-9 9a2 2 0 01-3-3l9-9a4 4 0 00-2-2z'],
];
const TAG = 'M3 12V4h8l9 9-8 8zM7.5 8.5h.01';

export function CategoryIcon({ category = '', className = 'h-4 w-4' }) {
  const c = String(category).toLowerCase();
  const d = (ICONS.find(([re]) => re.test(c)) || [null, TAG])[1];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d={d} /></svg>
  );
}

export function StoreBadge({ name, size = 40 }) {
  const s = String(name || '?').trim();
  const initial = ([...s][0] || '?').toUpperCase();
  let h = 0;
  for (const ch of s.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-lg text-lg font-extrabold text-white" style={{ width: size, height: size, background: `hsl(${h} 45% 32%)` }}>{initial}</span>
  );
}

export function EmptyIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="mx-auto h-36 w-40 text-ink" fill="none" aria-hidden="true">
      <path d="M40 12h64a4 4 0 014 4v100l-8-6-8 6-8-6-8 6-8-6-8 6-8-6-8 6-4-3V16a4 4 0 014-4z" fill="rgb(var(--card))" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" />
      <path d="M52 34h40M52 48h28M52 62h36M52 76h24" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 94h40" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="112" cy="88" r="20" fill="rgb(var(--paper))" stroke="rgb(var(--brand))" strokeWidth="4" />
      <path d="M126 102l14 14" stroke="rgb(var(--brand))" strokeWidth="6" strokeLinecap="round" />
      <path d="M103 88l6 6 11-12" stroke="rgb(var(--brand))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
