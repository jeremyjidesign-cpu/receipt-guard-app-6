# Receipt Guard

Next.js (App Router) + Tailwind PWA that scans receipts with OpenAI `o4-mini` (Structured Outputs), tracks return windows, builds a tax-deduction CSV and flags possible product recalls. Supabase gives login, sync and private image storage; with no Supabase keys it runs on `localStorage`.

## Run locally
```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY at minimum
npm run dev                  # http://localhost:3000
```
Camera capture needs HTTPS or `localhost`. On a phone, test via your Vercel preview URL.

## Enable Supabase (optional)
1. Create a project, then paste all of `supabase/schema.sql` into **SQL Editor -> Run** (creates the `receipts` table, RLS policies and the private `receipts-images` bucket).
2. Put the project URL and anon key in `.env.local`.
3. Auth -> URL Configuration: add `http://localhost:3000/auth/callback` and your production `https://<your-app>/auth/callback` to Redirect URLs.

## Deploy to Vercel
Push to GitHub, import in Vercel, set `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `RECALLS_FEED_URL`), deploy. Then open the site on your phone and use Add to Home Screen.

## How it behaves
- **Scan:** images are resized to 1600px JPEG in the browser; PDFs pass through (max ~3.5 MB; Vercel caps request bodies at 4.5 MB). `/api/scan` requires a signed-in user when Supabase is configured.
- **Countdown colours:** green 15+ days, amber 2-14 days, red today/tomorrow, grey once closed.
- **Recalls:** `lib/recalls.js` ships *category-level sample alerts* (e.g. power banks, button batteries), not specific recalls. For real data, set `RECALLS_FEED_URL` to a JSON array of `{id,title,hazard,keywords[],brands[],url,date}`, which is merged in and cached for an hour. Always verify at productsafety.gov.au.
- **Reminders:** browser notifications fire when the app is opened. Background push needs a push service and is not included.
- **Tax:** deductible flags are AI suggestions, not tax advice.
