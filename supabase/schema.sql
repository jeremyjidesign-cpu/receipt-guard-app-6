-- Receipt Guard: run this whole file once in Supabase -> SQL Editor.

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  store_name text not null default 'Unknown store',
  purchase_date date not null default current_date,
  items jsonb not null default '[]'::jsonb,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'AUD',
  return_window_days integer not null default 30 check (return_window_days between 1 and 365),
  is_tax_deductible boolean not null default false,
  tax_reason text not null default '',
  status text not null default 'active' check (status in ('active','returned','kept')),
  image_path text,
  created_at timestamptz not null default now()
);

create index if not exists receipts_user_date_idx on public.receipts (user_id, purchase_date desc);

alter table public.receipts enable row level security;

create policy "receipts_select_own" on public.receipts for select using (auth.uid() = user_id);
create policy "receipts_insert_own" on public.receipts for insert with check (auth.uid() = user_id);
create policy "receipts_update_own" on public.receipts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "receipts_delete_own" on public.receipts for delete using (auth.uid() = user_id);

-- Private storage bucket; files live under <user_id>/<receipt_id>.<ext>
insert into storage.buckets (id, name, public, file_size_limit)
values ('receipts-images', 'receipts-images', false, 8388608)
on conflict (id) do nothing;

create policy "receipt_images_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'receipts-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "receipt_images_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "receipt_images_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'receipts-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "receipt_images_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'receipts-images' and (storage.foldername(name))[1] = auth.uid()::text);
