const MAX_EDGE = 1600;
export function drawToJpeg(source, w, h) {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  c.getContext('2d').drawImage(source, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
const readAsDataURL = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('Could not read file')); r.readAsDataURL(file); });

// Compresses images client-side; PDFs pass through (limit ~4 MB because of Vercel's request cap).
export async function prepareFile(file) {
  if (file.type === 'application/pdf') {
    if (file.size > 3.5 * 1024 * 1024) throw new Error('PDF is over 3.5 MB. Upload a smaller PDF or a photo of the receipt.');
    return { dataUrl: await readAsDataURL(file), mime: 'application/pdf' };
  }
  if (!file.type.startsWith('image/')) throw new Error('Choose an image or PDF file.');
  const bmp = await createImageBitmap(file);
  const dataUrl = drawToJpeg(bmp, bmp.width, bmp.height);
  bmp.close?.();
  return { dataUrl, mime: 'image/jpeg' };
}
