import React, { useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { formatSize, formatNumber, CAT_COLORS } from '../utils/formatters';
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
  const sliderMax = Math.max(1, Math.ceil(maxYears * 10) / 10);
  const sliderValue = activeCutoffDays === null
    ? sliderMax
    : Math.min(sliderMax, Math.max(0.5, activeCutoffDays / 365));

  const preview = useMemo(() => {
    if (!tree) return null;
    return filterTreeByModifiedAge(tree, activeCutoffDays, true);
  }, [tree, activeCutoffDays]);

  const stats = useMemo(() => {
    if (!tree) return {
      activeCount: 0,
      activeSize: 0,
      totalFiles: 0,
      totalSize: 0,
      categoryCounts: {} as Record<string, number>,
    };

    const twoYearsAgo = Date.now() - 2 * 365 * DAY_MS;
    let activeCount = 0;
    let activeSize = 0;
    const categoryCounts: Record<string, number> = {};

    for (const file of files) {
      if (file.ModifiedDate >= twoYearsAgo) {
        activeCount++;
        activeSize += file.SizeBytes;
      }
      const cat = file.FileCategory || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    return {
      activeCount,
      activeSize,
      totalFiles: tree.recursiveFileCount,
      totalSize: tree.recursiveSizeBytes,
      categoryCounts,
    };
  }, [tree, files]);

  const cats = useMemo(() => {
    const total = Object.values(stats.categoryCounts).reduce((s, n) => s + n, 0);
    return Object.entries(stats.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: total > 0 ? count / total : 0,
        color: CAT_COLORS[name] || '#94a3b8',
      }));
  }, [stats.categoryCounts]);

  if (!tree) return null;

  const includedFiles = preview?.recursiveFileCount ?? tree.recursiveFileCount;
  const includedSize = preview?.recursiveSizeBytes ?? tree.recursiveSizeBytes;
  const ignoredFiles = tree.recursiveFileCount - includedFiles;
  const cutoffYears = activeCutoffDays === null ? sliderMax : activeCutoffDays / 365;

  function onSliderChange(value: string) {
    const years = Number(value);
    const nearMax = Math.abs(years - sliderMax) < 0.05;
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
            <div className="kpi-label">Modified ≤2 yr</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>{formatNumber(stats.activeCount)}</div>
            <div className="kpi-sub">{formatSize(stats.activeSize)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Preview</div>
            <div className="kpi-value" style={{ color: activeCutoffDays === null ? undefined : '#4f46e5' }}>
              {formatNumber(includedFiles)}
            </div>
            <div className="kpi-sub">{activeCutoffDays === null ? 'all files' : `${formatNumber(ignoredFiles)} ignored`}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Filters</div>
        <div className="filter-row">
          <label>Hide $ system folders</label>
          <button className={`toggle ${hideDollar ? 'on' : ''}`} onClick={() => setHideDollar(!hideDollar)} aria-label="Hide $ folders" />
        </div>

        <div className="age-filter">
          <div className="age-filter-head">
            <span>Modified in past</span>
            <strong>{formatYears(cutoffYears, activeCutoffDays === null, maxYears)}</strong>
          </div>
          <input
            className="age-slider"
            type="range"
            min="0.5"
            max={sliderMax}
            step="0.5"
            value={sliderValue}
            onChange={(e) => onSliderChange(e.target.value)}
          />
          <div className="age-slider-scale">
            <span>&lt;1</span>
            <span>{maxYears > 10 ? '>10' : `${Math.ceil(maxYears)} yr`}</span>
          </div>
          <div className="preview-mini">
            <span>{formatNumber(includedFiles)} kept</span>
            <span>{formatSize(includedSize)}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">File categories</div>
        {cats.slice(0, 9).map((c) => (
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
  if (value < 1) return '<1 yr';
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} yr`;
}
