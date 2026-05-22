import React, { useState, useEffect, useMemo } from 'react';
import { useFileStore } from '../store/useFileStore';
import { formatSize, formatNumber, timeAgo, CAT_COLORS } from '../utils/formatters';
import { heatColor, heatColorDark, heatT } from '../utils/colorScale';
import { FolderIcon, FileIcon, Icon } from './Icons';
import { filterTreeByModifiedAge } from '../utils/importPreview';
import type { FolderNode, FileRow } from '../utils/types';

export function FileInspector() {
  const folder = useFileStore((s) => s.selectedFolder);
  const pileView = useFileStore((s) => s.pileView);
  const activeCutoffDays = useFileStore((s) => s.activeCutoffDays);
  const setSelectedFolder = useFileStore((s) => s.setSelectedFolder);

  const [view, setView] = useState<'list' | 'grid'>(pileView ? 'grid' : 'list');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'issues'>('all');

  useEffect(() => {
    setView(pileView ? 'grid' : 'list');
  }, [folder, pileView]);

  const previewFolder = useMemo(() => {
    if (!folder) return null;
    return filterTreeByModifiedAge(folder, activeCutoffDays, activeCutoffDays !== null);
  }, [folder, activeCutoffDays]);

  const files = previewFolder?.files || [];

  const filtered = useMemo(() => {
    if (filter === 'issues') return files.filter((f) => f.SharePointCompatibility !== 'OK' || f.DCISCompatibility !== 'OK');
    return files;
  }, [files, filter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case 'name': va = a.FileName.toLowerCase(); vb = b.FileName.toLowerCase(); break;
        case 'ext': va = a.Extension; vb = b.Extension; break;
        case 'size': va = a.SizeBytes; vb = b.SizeBytes; break;
        case 'date': va = a.ModifiedDate; vb = b.ModifiedDate; break;
        case 'cat': va = a.FileCategory; vb = b.FileCategory; break;
        case 'prio': va = a.MigrationPriority; vb = b.MigrationPriority; break;
        case 'sp': va = a.SharePointCompatibility; vb = b.SharePointCompatibility; break;
        default: return 0;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  if (!folder || !previewFolder) return null;

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'date' || key === 'size' ? 'desc' : 'asc'); }
  }

  const issueCount = files.filter((f) => f.SharePointCompatibility !== 'OK' || f.DCISCompatibility !== 'OK').length;
  const dateLabel = 'Modified';

  const t = heatT(previewFolder.recursiveFileCount);
  const body = heatColor(t);
  const tab = heatColorDark(t);

  function head(id: string, label: string) {
    return (
      <th onClick={() => handleSort(id)} className={sortKey === id ? 'sort' : ''}>
        {label}
        {sortKey === id && <span className="arrow">{sortDir === 'asc' ? '\u25b2' : '\u25bc'}</span>}
      </th>
    );
  }

  return (
    <div className="inspector">
      <div className="inspector-header">
        <div className="inspector-title">
          <div className="inspector-title-row">
            <div style={{ width: 22, height: 18, flexShrink: 0, lineHeight: 0 }}>
              <FolderIcon body={body} tab={tab} width={22} height={18} decorated={false} />
            </div>
            <span className="inspector-name">{previewFolder.name}</span>
            {previewFolder.recursiveIssueCount > 0 && (
              <span className="tagpill warn"><Icon.Warn />{formatNumber(previewFolder.recursiveIssueCount)} issues</span>
            )}
          </div>
          <div className="inspector-path">{folder.fullPath}</div>
        </div>
        <div className="inspector-stats">
          <div className="inspector-stat"><div className="label">Direct</div><div className="value">{formatNumber(files.length)}</div></div>
          <div className="inspector-stat"><div className="label">Recursive</div><div className="value">{formatNumber(previewFolder.recursiveFileCount)}</div></div>
          <div className="inspector-stat"><div className="label">Size</div><div className="value">{formatSize(previewFolder.recursiveSizeBytes)}</div></div>
          <div className="inspector-stat"><div className="label">Modified</div><div className="value">{timeAgo(previewFolder.lastMod)}</div></div>
        </div>
        <button className="icon-btn" onClick={() => setSelectedFolder(null)} title="Close inspector" style={{ flexShrink: 0 }}>
          <Icon.Close />
        </button>
      </div>

      <div className="inspector-tabs">
        <button className={`itab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
          <Icon.Bars /> List <span className="count">{formatNumber(files.length)}</span>
        </button>
        <button className={`itab ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>
          <Icon.Copy /> Pile <span className="count">{formatNumber(files.length)}</span>
        </button>
        {issueCount > 0 && (
          <button className={`itab ${filter === 'issues' ? 'active' : ''}`}
            onClick={() => setFilter(filter === 'issues' ? 'all' : 'issues')} style={{ marginLeft: 'auto' }}>
            <Icon.Alert /> Issues only <span className="count">{issueCount}</span>
          </button>
        )}
      </div>

      <div className="inspector-body" onWheel={(e) => e.stopPropagation()}>
        {files.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>
            This folder contains only subfolders — no direct files.
          </div>
        ) : view === 'list' ? (
          <table className="file-table">
            <colgroup>
              <col style={{ width: '32%' }} />
              <col style={{ width: 56 }} />
              <col style={{ width: 76 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 'auto' }} />
            </colgroup>
            <thead><tr>
              {head('name', 'File name')}
              {head('ext', 'Type')}
              {head('size', 'Size')}
              {head('date', dateLabel)}
              {head('cat', 'Category')}
              {head('prio', 'Priority')}
              {head('sp', 'Compatibility')}
            </tr></thead>
            <tbody>
              {sorted.map((f, i) => {
                const spIssue = f.SharePointCompatibility !== 'OK' && f.SharePointCompatibility !== '';
                const dcisIssue = f.DCISCompatibility !== 'OK' && f.DCISCompatibility !== '';
                const catColor = CAT_COLORS[f.FileCategory] || '#94a3b8';
                return (
                  <tr key={i}>
                    <td className="name-cell">
                      <FileIcon ext={f.Extension} size={20} />
                      <span className="name-text" title={f.FileName}>{f.FileName}</span>
                    </td>
                    <td className="mono dim">{f.Extension}</td>
                    <td className="mono">{formatSize(f.SizeBytes)}</td>
                    <td className="mono dim">{new Date(f.ModifiedDate).toISOString().slice(0, 10)}</td>
                    <td>
                      <span className="cat-tag"><span className="dot" style={{ background: catColor }} />{f.FileCategory}</span>
                    </td>
                    <td>
                      <span className={`prio-tag prio-${f.MigrationPriority}`}>P{f.MigrationPriority}</span>
                    </td>
                    <td>
                      {spIssue ? (
                        <span className="compat-issue" title={`SharePoint: ${f.SharePointCompatibility}`}><Icon.Alert /> {f.SharePointCompatibility}</span>
                      ) : dcisIssue ? (
                        <span className="compat-issue compat-dcis-only" title={`DCIS: ${f.DCISCompatibility}`}><Icon.Warn /> DCIS</span>
                      ) : (
                        <span className="compat-ok"><Icon.Check /> OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="file-grid">
            {sorted.slice(0, 200).map((f, i) => {
              const spIssue = f.SharePointCompatibility !== 'OK' && f.SharePointCompatibility !== '';
              const dcisIssue = f.DCISCompatibility !== 'OK' && f.DCISCompatibility !== '';
              const cls = spIssue ? 'issue' : dcisIssue ? 'issue-dcis' : '';
              return (
                <div key={i} className={`fcard ${cls}`}
                  style={{ animationDelay: `${Math.min(i, 60) * 12}ms` }}
                  title={`${f.FileName}\n${f.FullPath}\nP${f.MigrationPriority}`}>
                  <FileIcon ext={f.Extension} size={34} />
                  <span className="fcard-name">{f.FileName.length > 16 ? f.FileName.slice(0, 14) + '\u2026' : f.FileName}</span>
                  <span className="fcard-sub">{formatSize(f.SizeBytes)}</span>
                </div>
              );
            })}
            {sorted.length > 200 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-4)', fontSize: 12, padding: '12px 0' }}>
                Showing 200 of {formatNumber(sorted.length)} files — switch to list view to see all
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
