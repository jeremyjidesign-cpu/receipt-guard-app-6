'use client';
import { supabase, supabaseEnabled } from './supabase/client';

const KEY = 'receiptguard.receipts.v1';
const readLocal = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const writeLocal = (list) => localStorage.setItem(KEY, JSON.stringify(list));
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

export async function getUser() {
  if (!supabaseEnabled) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function listReceipts() {
  if (!supabaseEnabled) return readLocal().sort((a, b) => (b.purchase_date || '').localeCompare(a.purchase_date || ''));
  const { data, error } = await supabase.from('receipts').select('*').order('purchase_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addReceipt(fields, imageDataUrl) {
  const id = newId();
  const isPdf = imageDataUrl?.startsWith('data:application/pdf');
  if (!supabaseEnabled) {
    const row = { ...fields, id, created_at: new Date().toISOString(), image_data: !isPdf && imageDataUrl && imageDataUrl.length < 450000 ? imageDataUrl : null };
    writeLocal([row, ...readLocal()]);
    return row;
  }
  const user = await getUser();
  if (!user) throw new Error('Sign in to save receipts.');
  let image_path = null;
  if (imageDataUrl) {
    const blob = await (await fetch(imageDataUrl)).blob();
    image_path = `${user.id}/${id}.${isPdf ? 'pdf' : 'jpg'}`;
    const { error: upErr } = await supabase.storage.from('receipts-images').upload(image_path, blob, { contentType: blob.type, upsert: false });
    if (upErr) throw upErr;
  }
  const { data, error } = await supabase.from('receipts').insert({ ...fields, id, user_id: user.id, image_path }).select().single();
  if (error) throw error;
  return data;
}

export async function updateReceipt(id, patch) {
  if (!supabaseEnabled) { writeLocal(readLocal().map((r) => (r.id === id ? { ...r, ...patch } : r))); return; }
  const { error } = await supabase.from('receipts').update(patch).eq('id', id);
  if (error) throw error;
}

export async function removeReceipt(r) {
  if (!supabaseEnabled) { writeLocal(readLocal().filter((x) => x.id !== r.id)); return; }
  if (r.image_path) await supabase.storage.from('receipts-images').remove([r.image_path]);
  const { error } = await supabase.from('receipts').delete().eq('id', r.id);
  if (error) throw error;
}

export async function signedImageUrl(r) {
  if (!supabaseEnabled) return r.image_data || null;
  if (!r.image_path) return null;
  const { data } = await supabase.storage.from('receipts-images').createSignedUrl(r.image_path, 3600);
  return data?.signedUrl || null;
}

export async function signOut() { if (supabaseEnabled) await supabase.auth.signOut(); }
