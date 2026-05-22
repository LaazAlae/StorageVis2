// OKLCh-based heatmap color — no external dependency
export function heatColor(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const k = Math.sqrt(t);
  const stops = [
    { L: 0.96, C: 0.015, H: 240 },
    { L: 0.88, C: 0.045, H: 195 },
    { L: 0.82, C: 0.085, H: 90 },
    { L: 0.72, C: 0.14, H: 50 },
    { L: 0.58, C: 0.18, H: 28 },
    { L: 0.46, C: 0.20, H: 22 },
  ];
  const seg = k * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const L = a.L + (b.L - a.L) * f;
  const C = a.C + (b.C - a.C) * f;
  let dH = b.H - a.H;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  const H = a.H + dH * f;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${((H + 360) % 360).toFixed(1)})`;
}

export function heatColorDark(t: number): string {
  t = Math.max(0, Math.min(1, t));
  const k = Math.sqrt(t);
  const stops = [
    { L: 0.86, C: 0.02, H: 240 },
    { L: 0.76, C: 0.055, H: 195 },
    { L: 0.68, C: 0.095, H: 80 },
    { L: 0.58, C: 0.15, H: 45 },
    { L: 0.46, C: 0.19, H: 26 },
    { L: 0.36, C: 0.20, H: 22 },
  ];
  const seg = k * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const L = a.L + (b.L - a.L) * f;
  const C = a.C + (b.C - a.C) * f;
  let dH = b.H - a.H;
  if (dH > 180) dH -= 360;
  if (dH < -180) dH += 360;
  const H = a.H + dH * f;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${((H + 360) % 360).toFixed(1)})`;
}

export function textOnHeat(t: number): string {
  return t > 0.78 ? '#fff' : '#1c1917';
}

let _maxCount = 1;
export function setMaxCount(n: number) { _maxCount = Math.max(n, 1); }
export function getMaxCount(): number { return _maxCount; }
export function heatT(fileCount: number): number { return _maxCount > 0 ? fileCount / _maxCount : 0; }
