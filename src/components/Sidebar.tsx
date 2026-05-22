import React, { useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { formatSize, formatNumber } from '../utils/formatters';
import { filterTreeByModifiedAge } from '../utils/importPreview';
import type { FileRow, FolderNode } from '../utils/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function Sidebar() {
  const tree = useFileStore((s) => s.tree);
  const hideDollar = useFileStore((s) => s.hideSystemFolders);
  const setHideDollar = useFileStore((s) => s.setHideSystemFolders);
  const activeCutoffDays = useFileStore((s) => s.activeCutoffDays);
  const setActiveCutoffDays = useFileStore((s) => s.setActiveCutoffDays);

  const files = useMemo(() => tree ? collectFiles(tree) : [], [tree]);
  const maxYears = useMemo(() => oldestModifiedAgeYears(files), [files]);
  const sliderMax = Math.max(1, Math.ceil(maxYears * 2) / 2);
  const sliderValue = activeCutoffDays === null
    ? sliderMax
    : Math.min(sliderMax, Math.max(1, activeCutoffDays / 365));

  const preview = useMemo(() => {
    if (!tree) return null;
    return filterTreeByModifiedAge(tree, activeCutoffDays, true);
  }, [tree, activeCutoffDays]);

  const previewFiles = useMemo(() => preview ? collectFiles(preview) : files, [preview, files]);

  const stats = useMemo(() => {
    if (!tree) return {
      activeCount: 0,
      activeSize: 0,
      totalFiles: 0,
      totalSize: 0,
      typeCounts: {} as Record<string, number>,
    };

    const twoYearsAgo = Date.now() - 2 * 365 * DAY_MS;
    let activeCount = 0;
    let activeSize = 0;
    const typeCounts: Record<string, number> = {};

    for (const file of files) {
      if (file.ModifiedDate >= twoYearsAgo) {
        activeCount++;
        activeSize += file.SizeBytes;
      }
    }

    for (const file of previewFiles) {
      const type = corporateFileType(file.Extension);
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    return {
      activeCount,
      activeSize,
      totalFiles: tree.recursiveFileCount,
      totalSize: tree.recursiveSizeBytes,
      typeCounts,
    };
  }, [tree, files, previewFiles]);

  const corporateTypes = useMemo(() => {
    const total = Object.values(stats.typeCounts).reduce((s, n) => s + n, 0);
    return Object.entries(stats.typeCounts)
      .sort(([aName, aCount], [bName, bCount]) => {
        if (aName === 'Other') return 1;
        if (bName === 'Other') return -1;
        return bCount - aCount;
      })
      .map(([name, count]) => ({
        name,
        count,
        pct: total > 0 ? count / total : 0,
        color: CORPORATE_TYPE_COLORS[name] || '#94a3b8',
      }));
  }, [stats.typeCounts]);

  if (!tree) return null;

  const includedFiles = preview?.recursiveFileCount ?? tree.recursiveFileCount;
  const includedSize = preview?.recursiveSizeBytes ?? tree.recursiveSizeBytes;
  const ignoredFiles = tree.recursiveFileCount - includedFiles;
  const ignoredSize = tree.recursiveSizeBytes - includedSize;
  const cutoffYears = activeCutoffDays === null ? sliderMax : activeCutoffDays / 365;

  function onSliderChange(value: string) {
    const years = Number(value);
    const nearMax = years >= sliderMax - 0.001;
    setActiveCutoffDays(nearMax ? null : Math.round(years * 365));
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Overview</div>
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">Files</div>
            <div className="kpi-value">{formatNumber(stats.totalFiles)}</div>
            <div className="kpi-sub">{tree.children.length} top-level dirs</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Size</div>
            <div className="kpi-value">{formatSize(stats.totalSize)}</div>
            <div className="kpi-sub">avg {formatSize(Math.round(stats.totalSize / Math.max(stats.totalFiles, 1)))}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">To be imported</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>{formatNumber(includedFiles)}</div>
            <div className="kpi-sub">{formatSize(includedSize)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Cold storage</div>
            <div className="kpi-value" style={{ color: '#78716c' }}>{formatNumber(ignoredFiles)}</div>
            <div className="kpi-sub">{formatSize(ignoredSize)}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Import scope</div>
        <div className="age-filter">
          <div className="age-pill">
            <div className="age-pill-top">
              <span>Import files modified within</span>
              <strong>{formatYears(cutoffYears, activeCutoffDays === null, maxYears)}</strong>
            </div>
            <input
              className="age-slider"
              type="range"
              min="1"
              max={sliderMax}
              step="0.5"
              value={sliderValue}
              onChange={(e) => onSliderChange(e.target.value)}
            />
          </div>
          <div className="age-slider-scale">
            <span>1 yr</span>
            <span>{maxYears > 10 ? '>10' : `${Math.ceil(maxYears)} yr`}</span>
          </div>
          <div className="preview-mini">
            <span>{formatNumber(includedFiles)} kept</span>
            <span>{formatSize(includedSize)}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">File types</div>
        {corporateTypes.map((c) => (
          <div key={c.name} className="cat-row">
            <span className="cat-swatch" style={{ background: c.color }} />
            <span className="cat-name">{c.name}</span>
            <span className="cat-count">{formatNumber(c.count)}</span>
            <div className="cat-bar-wrap">
              <div className="cat-bar-fill" style={{ width: `${c.pct * 100}%`, background: c.color, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-section sidebar-section--bottom">
        <div className="sidebar-label">Filters</div>
        <div className="filter-row">
          <label>Hide $ system folders</label>
          <button className={`toggle ${hideDollar ? 'on' : ''}`} onClick={() => setHideDollar(!hideDollar)} aria-label="Hide $ folders" />
        </div>
      </div>
    </aside>
  );
}

function collectFiles(node: FolderNode): FileRow[] {
  const files = [...node.files];
  for (const child of node.children) files.push(...collectFiles(child));
  return files;
}

function oldestModifiedAgeYears(files: FileRow[]): number {
  const oldest = files.reduce((min, file) => {
    if (!file.ModifiedDate) return min;
    return Math.min(min, file.ModifiedDate);
  }, Infinity);
  if (!Number.isFinite(oldest)) return 1;
  return Math.max(0.5, (Date.now() - oldest) / (365 * DAY_MS));
}

function formatYears(value: number, allFiles: boolean, maxYears: number): string {
  if (allFiles) return maxYears > 10 ? '>10 yr' : `${Math.ceil(maxYears)} yr`;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} yr`;
}

const CORPORATE_TYPE_COLORS: Record<string, string> = {
  PDF: '#dc2626',
  Word: '#2563eb',
  Excel: '#15803d',
  PowerPoint: '#ea580c',
  Outlook: '#0284c7',
  Access: '#be123c',
  OneNote: '#7c3aed',
  Images: '#8b5cf6',
  Archives: '#ca8a04',
  Shortcuts: '#78716c',
  Other: '#a8a29e',
};

function corporateFileType(extension: string): string {
  const ext = extension.replace(/^\./, '').toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'rtf'].includes(ext)) return 'Word';
  if (['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'].includes(ext)) return 'Excel';
  if (['ppt', 'pptx', 'pptm', 'pot', 'potx', 'potm', 'pps', 'ppsx'].includes(ext)) return 'PowerPoint';
  if (['msg', 'eml', 'pst', 'ost'].includes(ext)) return 'Outlook';
  if (['mdb', 'accdb', 'accde', 'accdt'].includes(ext)) return 'Access';
  if (['one', 'onetoc2'].includes(ext)) return 'OneNote';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'svg', 'heic', 'webp'].includes(ext)) return 'Images';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Archives';
  if (ext === 'lnk') return 'Shortcuts';
  return 'Other';
}
