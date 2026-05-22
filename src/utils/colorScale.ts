import chroma from 'chroma-js';

let scale: chroma.Scale | null = null;

export function initColorScale(maxFiles: number) {
  const safeMax = Math.max(maxFiles, 1);
  scale = chroma
    .scale(['#44cc00', '#99dd00', '#dddd00', '#ff7700', '#cc0000'])
    .mode('oklch')
    .domain([0, safeMax * 0.1, safeMax * 0.3, safeMax * 0.6, safeMax]);
}

export function getFolderColor(fileCount: number): string {
  if (!scale) return '#44cc00';
  return scale(fileCount).hex();
}

export function getFolderColorDark(fileCount: number): string {
  const color = getFolderColor(fileCount);
  return chroma(color).darken(0.6).hex();
}

export function getTextColor(bgColor: string): string {
  return chroma.contrast(bgColor, '#ffffff') > 4.5 ? '#ffffff' : '#000000';
}
