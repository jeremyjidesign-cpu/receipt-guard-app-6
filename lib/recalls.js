// IMPORTANT: these are category-level SAMPLE alerts for demo and offline use, not specific recalls.
// For real data, set RECALLS_FEED_URL (see README) and always verify at https://www.productsafety.gov.au/recalls
const SRC = 'https://www.productsafety.gov.au/recalls';
export const BUILT_IN_RECALLS = [
  { id: 'cat-button-battery', title: 'Button and coin battery products', hazard: 'Swallowing risk for children; serious internal burns.', keywords: ['button battery', 'coin cell', 'cr2032', 'cr2025', 'lithium coin'], brands: [], url: SRC },
  { id: 'cat-magnets', title: 'High-powered magnet sets', hazard: 'Swallowed magnets can cause serious internal injury.', keywords: ['magnetic balls', 'magnet set', 'neodymium', 'magnetic cubes'], brands: [], url: SRC },
  { id: 'cat-inclined-sleeper', title: 'Inclined infant sleepers and rockers', hazard: 'Suffocation risk during unsupervised sleep.', keywords: ['inclined sleeper', 'infant rocker sleeper', 'baby sleeper'], brands: [], url: SRC },
  { id: 'cat-power-bank', title: 'Portable power banks and chargers', hazard: 'Battery overheating and fire risk.', keywords: ['power bank', 'portable charger', 'powerbank'], brands: [], url: SRC },
  { id: 'cat-hoverboard', title: 'Hoverboards and e-scooters', hazard: 'Lithium battery fire risk.', keywords: ['hoverboard', 'self-balancing scooter', 'e-scooter'], brands: [], url: SRC },
  { id: 'cat-water-beads', title: 'Water beads and gel beads', hazard: 'Ingestion can cause bowel blockage in children.', keywords: ['water beads', 'gel beads', 'orbeez'], brands: [], url: SRC },
  { id: 'cat-electric-blanket', title: 'Electric blankets and heat pads', hazard: 'Overheating and fire risk.', keywords: ['electric blanket', 'heated throw', 'heat pad'], brands: [], url: SRC },
  { id: 'cat-weighted-infant', title: 'Weighted infant sleepwear and blankets', hazard: 'Breathing and overheating risk for babies.', keywords: ['weighted sleep sack', 'weighted blanket infant', 'weighted swaddle'], brands: [], url: SRC },
];

export async function loadRecalls() {
  let live = [];
  const feed = process.env.RECALLS_FEED_URL;
  if (feed) {
    try {
      const res = await fetch(feed, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        live = (Array.isArray(data) ? data : []).map((x, i) => ({
          id: String(x.id ?? `live-${i}`), title: String(x.title ?? 'Recall'), hazard: String(x.hazard ?? ''),
          keywords: [].concat(x.keywords || []).map(String), brands: [].concat(x.brands || []).map(String),
          url: String(x.url || SRC), date: x.date, live: true,
        }));
      }
    } catch {}
  }
  return [...live, ...BUILT_IN_RECALLS];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (hay, term) => term && new RegExp(`(^|[^a-z0-9])${esc(term.toLowerCase())}([^a-z0-9]|$)`).test(hay);

export function matchItem(item, recalls) {
  const name = `${item.name || ''} ${item.category || ''}`.toLowerCase();
  const brand = `${item.brand || ''} ${item.name || ''}`.toLowerCase();
  return recalls.filter((r) => {
    const kw = r.keywords.some((k) => has(name, k));
    if (!r.brands.length) return kw;
    return r.brands.some((b) => has(brand, b)) && (!r.keywords.length || kw);
  });
}
