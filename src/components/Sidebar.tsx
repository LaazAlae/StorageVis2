import React, { useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { formatSize, formatNumber, CAT_COLORS } from '../utils/formatters';
import type { FolderNode } from '../utils/types';

export function Sidebar() {
  const tree = useFileStore((s) => s.tree);
  const dateMode = useFileStore((s) => s.dateMode);
  const setDateMode = useFileStore((s) => s.setDateMode);
  const hideDollar = useFileStore((s) => s.hideSystemFolders);
  const setHideDollar = useFileStore((s) => s.setHideSystemFolders);
  const hideEmpty = useFileStore((s) => s.hideEmptyFolders);
  const setHideEmpty = useFileStore((s) => s.setHideEmptyFolders);

  const stats = useMemo(() => {
    if (!tree) return { staleCount: 0, staleSize: 0, activeCount: 0, activeSize: 0, totalFiles: 0, totalSize: 0, totalIssues: 0, categoryCounts: {} as Record<string, number>, priorityCounts: {} as Record<string, number> };
    const STALE_YEARS = 2;
    const cutoff = Date.now() - STALE_YEARS * 365 * 24 * 60 * 60 * 1000;
    let staleCount = 0, staleSize = 0, activeCount = 0, activeSize = 0;
    const categoryCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    function walk(node: FolderNode) {
      for (const f of node.files) {
        if (f.ModifiedDate < cutoff) { staleCount++; staleSize += f.SizeBytes; }
        else { activeCount++; activeSize += f.SizeBytes; }
        const cat = f.FileCategory || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const prio = f.MigrationPriority || '4';
        priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;
      }
      for (const c of node.children) walk(c);
    }
    walk(tree);

    return {
      staleCount, staleSize, activeCount, activeSize,
      totalFiles: tree.recursiveFileCount, totalSize: tree.recursiveSizeBytes,
      totalIssues: tree.recursiveIssueCount, categoryCounts, priorityCounts,
    };
  }, [tree]);

  const cats = useMemo(() => {
    const total = Object.values(stats.categoryCounts).reduce((s, n) => s + n, 0);
    return Object.entries(stats.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name, count,
        pct: total > 0 ? count / total : 0,
        color: CAT_COLORS[name] || '#94a3b8',
      }));
  }, [stats.categoryCounts]);

  const prios = useMemo(() => {
    const labels: Record<string, { label: string; color: string }> = {
      '1': { label: 'P1 \u00b7 Migrate now', color: '#dc2626' },
      '2': { label: 'P2 \u00b7 Migrate (last yr)', color: '#0e7490' },
      '3': { label: 'P3 \u00b7 Review (2\u20133 yr)', color: '#b45309' },
      '4': { label: 'P4 \u00b7 Archive (>3 yr)', color: '#57534e' },
    };
    const total = Object.values(stats.priorityCounts).reduce((s, n) => s + n, 0);
    return Object.entries(stats.priorityCounts)
      .sort((a, b) => +a[0] - +b[0])
      .map(([k, count]) => ({
        ...(labels[k] || { label: `P${k}`, color: '#94a3b8' }),
        count,
        pct: total > 0 ? count / total : 0,
      }));
  }, [stats.priorityCounts]);

  if (!tree) return null;

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
            <div className="kpi-label">Active</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>{formatNumber(stats.activeCount)}</div>
            <div className="kpi-sub">{'\u2264'}2 yr {'\u00b7'} {formatSize(stats.activeSize)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Stale</div>
            <div className="kpi-value" style={{ color: '#b45309' }}>{formatNumber(stats.staleCount)}</div>
            <div className="kpi-sub">&gt;2 yr {'\u00b7'} {formatSize(stats.staleSize)}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Migration Risks</div>
        <div className="kpi" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca' }}>
          <div className="kpi-label" style={{ color: '#991b1b' }}>SharePoint Incompatible</div>
          <div className="kpi-value" style={{ color: '#b91c1c' }}>{formatNumber(stats.totalIssues)}</div>
          <div className="kpi-sub" style={{ color: '#dc2626' }}>{((stats.totalIssues / Math.max(stats.totalFiles, 1)) * 100).toFixed(1)}% of files</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Filters</div>
        <div className="filter-row">
          <label>Hide $ system folders</label>
          <button className={`toggle ${hideDollar ? 'on' : ''}`} onClick={() => setHideDollar(!hideDollar)} aria-label="Hide $ folders" />
        </div>
        <div className="filter-row">
          <label>Hide empty folders</label>
          <button className={`toggle ${hideEmpty ? 'on' : ''}`} onClick={() => setHideEmpty(!hideEmpty)} aria-label="Hide empty folders" />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontWeight: 500 }}>Date used for color & sort</div>
          <div className="segmented">
            <button className={dateMode === 'modified' ? 'active' : ''} onClick={() => setDateMode('modified')}>Modified</button>
            <button className={dateMode === 'created' ? 'active' : ''} onClick={() => setDateMode('created')}>Created</button>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Migration priority</div>
        {prios.map((p) => (
          <div key={p.label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, fontSize: 11.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                {p.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
                {formatNumber(p.count)}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-sunken)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.pct * 100}%`, background: p.color, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
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
