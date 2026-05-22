// ── Folder Icon (macOS-style) ────────────────────────────────
export function folderIconSVG(color: string, darkColor: string, size: number = 56): string {
  const w = size;
  const h = Math.round(size * 0.82);
  return `<svg width="${w}" height="${h}" viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4 C3 4 1 6 1 8 L1 10 L26 10 L22 4 Z" fill="${darkColor}"/>
    <rect x="1" y="8" width="62" height="42" rx="4" fill="${darkColor}"/>
    <rect x="0" y="14" width="64" height="38" rx="4" fill="${color}"/>
    <rect x="4" y="17" width="56" height="2" rx="1" fill="${darkColor}" opacity="0.15"/>
  </svg>`;
}

// ── File Type Icon ───────────────────────────────────────────
interface TypeInfo {
  color: string;
  label: string;
}

function getTypeInfo(ext: string): TypeInfo {
  switch (ext) {
    // Microsoft Office
    case 'doc': case 'docx': return { color: '#2B579A', label: 'DOC' };
    case 'xls': case 'xlsx': return { color: '#217346', label: 'XLS' };
    case 'ppt': case 'pptx': return { color: '#D24726', label: 'PPT' };
    case 'msg': case 'eml':  return { color: '#0078D4', label: 'MAIL' };
    case 'mdb': case 'accdb': return { color: '#A4373A', label: 'ACC' };
    case 'one':              return { color: '#7719AA', label: 'ONE' };
    case 'pub':              return { color: '#077568', label: 'PUB' };
    case 'vsd': case 'vsdx': return { color: '#3955A3', label: 'VSD' };
    case 'xlsm':             return { color: '#217346', label: 'XLSM' };
    case 'docm':             return { color: '#2B579A', label: 'DOCM' };
    case 'pptm':             return { color: '#D24726', label: 'PPTM' };
    case 'dot': case 'dotx': return { color: '#2B579A', label: 'TMPL' };
    case 'xlt': case 'xltx': return { color: '#217346', label: 'TMPL' };
    case 'pot': case 'potx': return { color: '#D24726', label: 'TMPL' };
    case 'pst': case 'ost':  return { color: '#0078D4', label: 'PST' };

    // Documents
    case 'pdf':              return { color: '#E2574C', label: 'PDF' };
    case 'txt':              return { color: '#607D8B', label: 'TXT' };
    case 'rtf':              return { color: '#5C6BC0', label: 'RTF' };
    case 'csv':              return { color: '#43A047', label: 'CSV' };
    case 'log':              return { color: '#78909C', label: 'LOG' };

    // Images
    case 'jpg': case 'jpeg': return { color: '#8E24AA', label: 'JPG' };
    case 'png':              return { color: '#8E24AA', label: 'PNG' };
    case 'gif':              return { color: '#8E24AA', label: 'GIF' };
    case 'bmp':              return { color: '#8E24AA', label: 'BMP' };
    case 'tif': case 'tiff': return { color: '#8E24AA', label: 'TIF' };
    case 'svg':              return { color: '#8E24AA', label: 'SVG' };
    case 'ico':              return { color: '#8E24AA', label: 'ICO' };

    // Audio
    case 'mp3':              return { color: '#FF6F00', label: 'MP3' };
    case 'wav':              return { color: '#FF6F00', label: 'WAV' };
    case 'wma':              return { color: '#FF6F00', label: 'WMA' };
    case 'aac':              return { color: '#FF6F00', label: 'AAC' };
    case 'flac':             return { color: '#FF6F00', label: 'FLAC' };

    // Video
    case 'mp4':              return { color: '#1565C0', label: 'MP4' };
    case 'avi':              return { color: '#1565C0', label: 'AVI' };
    case 'mov':              return { color: '#1565C0', label: 'MOV' };
    case 'wmv':              return { color: '#1565C0', label: 'WMV' };
    case 'mkv':              return { color: '#1565C0', label: 'MKV' };

    // Archives
    case 'zip':              return { color: '#F9A825', label: 'ZIP' };
    case 'rar':              return { color: '#F9A825', label: 'RAR' };
    case '7z':               return { color: '#F9A825', label: '7Z' };
    case 'tar':              return { color: '#F9A825', label: 'TAR' };
    case 'gz':               return { color: '#F9A825', label: 'GZ' };

    // Shortcuts & executables
    case 'lnk':              return { color: '#78909C', label: 'LNK' };
    case 'exe':              return { color: '#546E7A', label: 'EXE' };
    case 'msi':              return { color: '#546E7A', label: 'MSI' };
    case 'bat': case 'cmd':  return { color: '#37474F', label: 'CMD' };
    case 'ps1':              return { color: '#37474F', label: 'PS1' };
    case 'dll':              return { color: '#455A64', label: 'DLL' };

    // Code
    case 'js':               return { color: '#F7DF1E', label: 'JS' };
    case 'ts':               return { color: '#3178C6', label: 'TS' };
    case 'py':               return { color: '#3776AB', label: 'PY' };
    case 'html': case 'htm': return { color: '#E34F26', label: 'HTML' };
    case 'css':              return { color: '#1572B6', label: 'CSS' };
    case 'json':             return { color: '#000000', label: 'JSON' };
    case 'xml':              return { color: '#00897B', label: 'XML' };
    case 'sql':              return { color: '#336791', label: 'SQL' };

    default:
      return { color: '#9E9E9E', label: ext ? ext.toUpperCase().slice(0, 4) : 'FILE' };
  }
}

export function fileIconSVG(extension: string, size: number = 36): string {
  const ext = extension.replace(/^\./, '').toLowerCase();
  const { color, label } = getTypeInfo(ext);
  const w = size;
  const h = Math.round(size * 1.3);
  return `<svg width="${w}" height="${h}" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 0 H22 L32 10 V38 C32 40.2 30.2 42 28 42 H4 C1.8 42 0 40.2 0 38 V4 C0 1.8 1.8 0 4 0 Z" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
    <path d="M22 0 V10 H32 Z" fill="#f0f0f0"/>
    <line x1="5" y1="15" x2="20" y2="15" stroke="#e8e8e8" stroke-width="0.8"/>
    <line x1="5" y1="19" x2="25" y2="19" stroke="#e8e8e8" stroke-width="0.8"/>
    <line x1="5" y1="23" x2="17" y2="23" stroke="#e8e8e8" stroke-width="0.8"/>
    <path d="M0 29 H32 V38 C32 40.2 30.2 42 28 42 H4 C1.8 42 0 40.2 0 38 Z" fill="${color}"/>
    <text x="16" y="39" text-anchor="middle" fill="#fff" font-size="8" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${label}</text>
  </svg>`;
}

// Returns the top N most common extensions from a file list (for pile preview)
export function getTopExtensions(files: { Extension: string }[], n: number = 5): string[] {
  const counts = new Map<string, number>();
  for (const f of files) {
    const ext = f.Extension || '';
    counts.set(ext, (counts.get(ext) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([ext]) => ext);
}
