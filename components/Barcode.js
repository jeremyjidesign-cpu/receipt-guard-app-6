const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const P = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

function ean13(d) {
  let b = '101';
  for (let i = 0; i < 6; i++) b += (P[d[0]][i] === 'L' ? L : G)[d[i + 1]];
  b += '01010';
  for (let i = 7; i < 13; i++) b += R[d[i]];
  return b + '101';
}
// Decorative pattern seeded from the receipt id when no real barcode was printed.
function seeded(seed) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  let b = '101';
  for (let i = 0; i < 40; i++) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; b += (i % 2 === 0 ? '1' : '0').repeat(1 + (h % 3)); }
  return b + '101';
}

export default function Barcode({ receipt }) {
  const raw = (receipt.items || []).map((i) => String(i.possible_barcode || '').replace(/\D/g, '')).find((c) => c.length === 12 || c.length === 13);
  const code = raw && (raw.length === 12 ? '0' + raw : raw);
  const bits = code ? ean13([...code].map(Number)) : seeded(String(receipt.id));
  const bars = [];
  for (let i = 0; i < bits.length; ) {
    if (bits[i] === '1') { let j = i; while (bits[j] === '1') j++; bars.push(<rect key={i} x={i} y="0" width={j - i} height="40" />); i = j; } else i++;
  }
  return (
    <figure className="mt-3 text-center" aria-label={code ? `Barcode ${code}` : 'Receipt reference'}>
      <svg viewBox={`0 0 ${bits.length} 40`} preserveAspectRatio="none" className="mx-auto h-11 w-full max-w-[230px] fill-current text-ink/85" aria-hidden="true">{bars}</svg>
      <figcaption className="mt-1 font-mono text-[11px] tracking-[0.25em] text-ink/60">{code || String(receipt.id).slice(0, 8)}</figcaption>
    </figure>
  );
}
