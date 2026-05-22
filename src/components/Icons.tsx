import React from 'react';

interface FolderIconProps {
  body: string;
  tab: string;
  width?: number;
  height?: number;
  decorated?: boolean;
  selected?: boolean;
}

export function FolderIcon({ body, tab, width = 88, height = 70, decorated = true, selected = false }: FolderIconProps) {
  return (
    <svg
      className={decorated ? 'fnode-folder' : ''}
      width={width}
      height={height}
      viewBox="0 0 88 70"
      style={decorated ? { overflow: 'visible' } : { display: 'block' }}
    >
      <path
        d="M 6 8 Q 6 4, 10 4 L 30 4 Q 32 4, 33 6 L 36 12 L 78 12 Q 82 12, 82 16 L 82 22 L 6 22 Z"
        fill={tab}
        stroke={selected ? '#4f46e5' : 'none'}
        strokeWidth={selected ? 2.5 : 0}
        strokeLinejoin="round"
      />
      <path
        d="M 4 18 Q 4 14, 8 14 L 80 14 Q 84 14, 84 18 L 84 60 Q 84 64, 80 64 L 8 64 Q 4 64, 4 60 Z"
        fill={body}
        stroke={selected ? '#4f46e5' : 'none'}
        strokeWidth={selected ? 2.5 : 0}
        strokeLinejoin="round"
      />
      <rect x="4" y="14" width="80" height="2.5" fill="rgba(255,255,255,0.4)" />
      <rect x="4" y="58" width="80" height="6" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

interface FileIconProps {
  ext: string;
  size?: number;
}

export function fileTypeInfo(ext: string): { color: string; label: string } {
  const e = ext.replace(/^\./, '').toLowerCase();
  switch (e) {
    case 'doc': case 'docx': return { color: '#3b5fbf', label: 'DOC' };
    case 'docm': return { color: '#3b5fbf', label: 'DOCM' };
    case 'dotx': case 'dot': return { color: '#3b5fbf', label: 'DOT' };
    case 'xls': case 'xlsx': return { color: '#1f7a4d', label: 'XLS' };
    case 'xlsm': return { color: '#1f7a4d', label: 'XLSM' };
    case 'xltx': case 'xlt': return { color: '#1f7a4d', label: 'XLT' };
    case 'ppt': case 'pptx': return { color: '#c2410c', label: 'PPT' };
    case 'pptm': return { color: '#c2410c', label: 'PPTM' };
    case 'potx': case 'pot': return { color: '#c2410c', label: 'POT' };
    case 'msg': case 'eml': return { color: '#0369a1', label: 'EML' };
    case 'pst': case 'ost': return { color: '#0369a1', label: 'PST' };
    case 'one': return { color: '#6b21a8', label: 'ONE' };
    case 'pub': return { color: '#0f766e', label: 'PUB' };
    case 'vsd': case 'vsdx': return { color: '#4338ca', label: 'VSD' };
    case 'mdb': case 'accdb': return { color: '#9f1239', label: 'ACC' };
    case 'pdf': return { color: '#b91c1c', label: 'PDF' };
    case 'txt': return { color: '#52525b', label: 'TXT' };
    case 'rtf': return { color: '#475569', label: 'RTF' };
    case 'csv': return { color: '#15803d', label: 'CSV' };
    case 'log': return { color: '#71717a', label: 'LOG' };
    case 'md': return { color: '#1f2937', label: 'MD' };
    case 'jpg': case 'jpeg': return { color: '#7c3aed', label: 'JPG' };
    case 'png': return { color: '#7c3aed', label: 'PNG' };
    case 'gif': return { color: '#7c3aed', label: 'GIF' };
    case 'bmp': return { color: '#7c3aed', label: 'BMP' };
    case 'tif': case 'tiff': return { color: '#7c3aed', label: 'TIF' };
    case 'svg': return { color: '#a21caf', label: 'SVG' };
    case 'ico': return { color: '#7c3aed', label: 'ICO' };
    case 'ai': return { color: '#ea580c', label: 'AI' };
    case 'psd': return { color: '#1e40af', label: 'PSD' };
    case 'mp3': case 'wav': case 'wma': case 'aac': case 'flac':
      return { color: '#ea580c', label: e.toUpperCase() };
    case 'mp4': case 'mov': case 'avi': case 'wmv': case 'mkv':
      return { color: '#0e7490', label: e.toUpperCase() };
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
      return { color: '#a16207', label: e.toUpperCase() };
    case 'lnk': return { color: '#71717a', label: 'LNK' };
    case 'exe': case 'msi': return { color: '#3f3f46', label: e.toUpperCase() };
    case 'bat': case 'cmd': case 'ps1': case 'sh':
      return { color: '#27272a', label: e.toUpperCase() };
    case 'dll': return { color: '#52525b', label: 'DLL' };
    case 'js': return { color: '#a16207', label: 'JS' };
    case 'ts': case 'tsx': return { color: '#2563eb', label: e.toUpperCase() };
    case 'py': return { color: '#1e40af', label: 'PY' };
    case 'html': case 'htm': return { color: '#c2410c', label: 'HTML' };
    case 'css': return { color: '#0e7490', label: 'CSS' };
    case 'json': return { color: '#1f2937', label: 'JSON' };
    case 'xml': return { color: '#0d9488', label: 'XML' };
    case 'sql': return { color: '#1e3a8a', label: 'SQL' };
    default:
      return { color: '#78716c', label: (e || 'FILE').toUpperCase().slice(0, 4) };
  }
}

export function FileIcon({ ext, size = 38 }: FileIconProps) {
  const info = fileTypeInfo(ext);
  const w = size;
  const h = Math.round(size * 1.28);

  return (
    <svg width={w} height={h} viewBox="0 0 38 48" style={{ overflow: 'visible' }}>
      <path
        d="M 3 0 L 28 0 L 38 10 L 38 45 Q 38 48, 35 48 L 3 48 Q 0 48, 0 45 L 0 3 Q 0 0, 3 0 Z"
        fill="#fff" stroke="#e7e5e4" strokeWidth="0.75"
      />
      <path d="M 28 0 L 38 10 L 28 10 Z" fill="#f5f5f4" />
      <path d="M 28 0 L 38 10 L 28 10 Z" fill="none" stroke="#e7e5e4" strokeWidth="0.75" />
      <line x1="5" y1="18" x2="22" y2="18" stroke="#e7e5e4" strokeWidth="0.8" />
      <line x1="5" y1="22" x2="28" y2="22" stroke="#e7e5e4" strokeWidth="0.8" />
      <line x1="5" y1="26" x2="19" y2="26" stroke="#e7e5e4" strokeWidth="0.8" />
      <path d="M 0 45 L 0 34 L 38 34 L 38 45 Q 38 48, 35 48 L 3 48 Q 0 48, 0 45 Z" fill={info.color} />
      <text x="19" y="44" textAnchor="middle" fontSize="7.5" fontWeight="700"
        fontFamily="'JetBrains Mono', monospace" fill="#fff" letterSpacing="0.04em">
        {info.label}
      </text>
    </svg>
  );
}

export function topExts(files: { Extension: string }[], n = 4): string[] {
  const counts = new Map<string, number>();
  for (const f of files) {
    counts.set(f.Extension, (counts.get(f.Extension) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([e]) => e);
}

// Utility inline icons
export const Icon = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>),
  Chevron: (p: React.SVGProps<SVGSVGElement>) => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9" /></svg>),
  Folder: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" /></svg>),
  Plus: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Minus: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Fit: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9V5a2 2 0 0 1 2-2h4" /><path d="M21 9V5a2 2 0 0 0-2-2h-4" /><path d="M3 15v4a2 2 0 0 0 2 2h4" /><path d="M21 15v4a2 2 0 0 1-2 2h-4" /></svg>),
  Close: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Warn: (p: React.SVGProps<SVGSVGElement>) => (<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2 1 22h22L12 2zm0 6v6m0 2v2" /></svg>),
  Alert: (p: React.SVGProps<SVGSVGElement>) => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>),
  Check: (p: React.SVGProps<SVGSVGElement>) => (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>),
  Bars: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
  Pie: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>),
  Sliders: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg>),
  Download: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>),
  Maximize: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>),
  Copy: (p: React.SVGProps<SVGSVGElement>) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>),
};
