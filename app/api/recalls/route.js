import { NextResponse } from 'next/server';
import { loadRecalls, matchItem } from '@/lib/recalls';

export async function GET() {
  return NextResponse.json({ recalls: await loadRecalls() });
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const receipts = Array.isArray(body?.receipts) ? body.receipts.slice(0, 500) : [];
  const recalls = await loadRecalls();
  const matches = [];
  for (const r of receipts) {
    for (const item of (r.items || []).slice(0, 100)) {
      for (const rc of matchItem(item, recalls)) {
        matches.push({ receiptId: r.id, itemName: item.name, recallId: rc.id, title: rc.title, hazard: rc.hazard, url: rc.url, live: Boolean(rc.live) });
      }
    }
  }
  return NextResponse.json({ matches });
}
