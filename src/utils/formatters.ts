export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return (v < 10 ? v.toFixed(1) : Math.round(v)) + ' ' + units[i];
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1) + 'K';
  if (n < 1_000_000) return Math.round(n / 1000) + 'K';
  return (n / 1_000_000).toFixed(1) + 'M';
}

export function formatDate(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return '-';
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp || timestamp <= 0) return '-';
  const d = new Date(timestamp);
  return d.toISOString().slice(0, 10);
}

export function timeAgo(timestamp: number): string {
  if (!timestamp) return '\u2014';
  const now = Date.now();
  const diff = now - timestamp;
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diff / day);
  if (days < 1) return 'today';
  if (days < 30) return days + 'd ago';
  if (days < 365) return Math.floor(days / 30) + 'mo ago';
  return (diff / (day * 365)).toFixed(1) + 'y ago';
}

export const CAT_COLORS: Record<string, string> = {
  Document: '#4f46e5',
  Spreadsheet: '#15803d',
  Presentation: '#dc2626',
  Image: '#8b5cf6',
  Video: '#0891b2',
  Email: '#0284c7',
  Shortcut: '#78716c',
  Executable: '#52525b',
  Archive: '#ca8a04',
  Database: '#be123c',
  Template: '#6b7280',
  MacroEnabled: '#92400e',
  Audio: '#ea580c',
  Code: '#0f172a',
  Other: '#a8a29e',
};
