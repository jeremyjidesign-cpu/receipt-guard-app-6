import { daysLeft } from './dates';
export const remindersSupported = () => typeof Notification !== 'undefined';
export async function enableReminders() { return remindersSupported() ? Notification.requestPermission() : 'denied'; }
// Foreground reminders: fires when the app is opened. (Background push needs a push server; see README.)
export function notifyExpiring(receipts) {
  if (!remindersSupported() || Notification.permission !== 'granted') return;
  const day = new Date().toDateString();
  receipts.filter((r) => r.status === 'active').forEach((r) => {
    const n = daysLeft(r);
    if (n === null || n < 0 || n > 1) return;
    const k = `rg.notified.${r.id}.${day}`;
    if (localStorage.getItem(k)) return;
    localStorage.setItem(k, '1');
    new Notification('Return window closing', { body: `${r.store_name}: ${n === 0 ? 'expires today' : 'expires tomorrow'}`, icon: '/icons/icon-192.png' });
  });
}
