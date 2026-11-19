import { NextResponse } from 'next/server';
import { serverClient, serverSupabaseEnabled } from '@/lib/supabase/server';

export const maxDuration = 60;

const schema = {
  name: 'receipt',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['store_name', 'purchase_date', 'items', 'total_amount', 'currency', 'return_window_days', 'is_tax_deductible'],
    properties: {
      store_name: { type: 'string' },
      purchase_date: { type: 'string', description: 'YYYY-MM-DD' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'brand', 'category', 'price', 'quantity', 'possible_barcode'],
          properties: {
            name: { type: 'string' }, brand: { type: 'string' }, category: { type: 'string' },
            price: { type: 'number' }, quantity: { type: 'number' },
            possible_barcode: { type: ['string', 'null'], description: 'EAN/UPC digits printed on the receipt, else null' },
          },
        },
      },
      total_amount: { type: 'number' },
      currency: { type: 'string' },
      return_window_days: { type: 'integer' },
      is_tax_deductible: {
        type: 'object', additionalProperties: false, required: ['value', 'reason'],
        properties: { value: { type: 'boolean' }, reason: { type: 'string' } },
      },
    },
  },
};

const SYSTEM = (today) => `You extract data from shopping receipts (Australian by default). Today is ${today}.
- purchase_date: YYYY-MM-DD. Read dates as DD/MM/YYYY unless clearly otherwise. If unreadable use today's date.
- items: one entry per line item. brand: "" if unknown. category: short, e.g. "electronics", "groceries", "clothing", "stationery". possible_barcode: only digits actually printed, else null.
- currency: ISO code, default "AUD".
- return_window_days: use the number of days if the receipt states a return/exchange period, otherwise 30.
- is_tax_deductible: value=true only if the purchase looks work or business related (tools, stationery, work equipment, software, professional fees). reason: one short sentence. This is a suggestion, not tax advice.
Return only data that appears on the receipt; never invent items.`;

export async function POST(req) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY is not set on the server.' }, { status: 500 });

  if (serverSupabaseEnabled) {
    const sb = await serverClient();
    const { data } = await sb.auth.getUser();
    if (!data?.user) return NextResponse.json({ error: 'Sign in to scan receipts.' }, { status: 401 });
  }

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }); }
  const image = body?.image;
  if (typeof image !== 'string' || !/^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/.test(image)) {
    return NextResponse.json({ error: 'Send a JPEG, PNG, WebP or PDF as a base64 data URL.' }, { status: 400 });
  }
  if (image.length > 5_500_000) return NextResponse.json({ error: 'File is too large. Try a smaller photo.' }, { status: 413 });

  const isPdf = image.startsWith('data:application/pdf');
  const filePart = isPdf
    ? { type: 'file', file: { filename: 'receipt.pdf', file_data: image } }
    : { type: 'image_url', image_url: { url: image, detail: 'high' } };
  const today = new Date().toISOString().slice(0, 10);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'o4-mini',
        reasoning_effort: 'low',
        max_completion_tokens: 6000,
        response_format: { type: 'json_schema', json_schema: schema },
        messages: [
          { role: 'system', content: SYSTEM(today) },
          { role: 'user', content: [{ type: 'text', text: 'Extract this receipt.' }, filePart] },
        ],
      }),
      signal: AbortSignal.timeout(55000),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: json?.error?.message || 'OpenAI request failed.' }, { status: 502 });
    const msg = json.choices?.[0]?.message;
    if (msg?.refusal) return NextResponse.json({ error: 'The model could not read this receipt.' }, { status: 422 });
    const data = JSON.parse(msg?.content || '{}');
    data.return_window_days = Math.min(365, Math.max(1, Math.round(data.return_window_days || 30)));
    data.currency = (data.currency || 'AUD').toUpperCase().slice(0, 3);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.purchase_date || '')) data.purchase_date = today;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.name === 'TimeoutError' ? 'Scan timed out. Try again.' : 'Could not scan this receipt.' }, { status: 500 });
  }
}
