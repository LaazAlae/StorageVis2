import React, { useMemo, useState } from 'react';
import type { FileRow, DateMode } from '../utils/types';
import { formatDateTime } from '../utils/formatters';

type SortKey = 'FileName' | 'Extension' | 'SizeMB' | 'date' | 'FileCategory' | 'MigrationPriority' | 'SharePointCompatibility';
type SortDir = 'asc' | 'desc';

interface Props {
  files: FileRow[];
  dateMode: DateMode;
}

export const FileList = React.memo(function FileList({ files, dateMode }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' || key === 'SizeMB' ? 'desc' : 'asc');
    }
  };

  const sorted = useMemo(() => {
    const arr = [...files];
    const dir = sortDir === 'asc' ? 1 : -1;

    arr.sort((a, b) => {
      let va: string | number;
      let vb: string | number;

      switch (sortKey) {
        case 'FileName':
          va = a.FileName.toLowerCase();
          vb = b.FileName.toLowerCase();
          break;
        case 'Extension':
          va = a.Extension.toLowerCase();
          vb = b.Extension.toLowerCase();
          break;
        case 'SizeMB':
          va = a.SizeBytes;
          vb = b.SizeBytes;
          break;
        case 'date':
          va = dateMode === 'modified' ? a.ModifiedDate : a.CreatedDate;
          vb = dateMode === 'modified' ? b.ModifiedDate : b.CreatedDate;
          break;
        case 'FileCategory':
          va = a.FileCategory.toLowerCase();
          vb = b.FileCategory.toLowerCase();
          break;
        case 'MigrationPriority':
          va = a.MigrationPriority;
          vb = b.MigrationPriority;
          break;
        case 'SharePointCompatibility':
          va = a.SharePointCompatibility;
          vb = b.SharePointCompatibility;
          break;
        default:
          return 0;
      }

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [files, sortKey, sortDir, dateMode]);

  if (files.length === 0) {
    return <p className="file-list-empty">No files in this folder (only subfolders)</p>;
  }

  const dateLabel = dateMode === 'modified' ? 'Modified' : 'Created';
  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div className="file-list-scroll" onWheel={(e) => e.stopPropagation()}>
      <table className="file-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('FileName')}>File Name{arrow('FileName')}</th>
            <th onClick={() => handleSort('Extension')}>Ext{arrow('Extension')}</th>
            <th onClick={() => handleSort('SizeMB')}>Size{arrow('SizeMB')}</th>
            <th onClick={() => handleSort('date')}>{dateLabel}{arrow('date')}</th>
            <th onClick={() => handleSort('FileCategory')}>Category{arrow('FileCategory')}</th>
            <th onClick={() => handleSort('MigrationPriority')}>Priority{arrow('MigrationPriority')}</th>
            <th onClick={() => handleSort('SharePointCompatibility')}>SP Compat{arrow('SharePointCompatibility')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => {
            const spIssue = f.SharePointCompatibility !== 'OK';
            const dcisIssue = f.DCISCompatibility !== 'OK';
            return (
              <tr key={i}>
                <td className="file-name-cell" title={f.FileName}>
                  {f.FileName.length > 40 ? f.FileName.slice(0, 38) + '...' : f.FileName}
                </td>
                <td>{f.Extension}</td>
                <td>{f.SizeMB < 0.01 ? '<0.01' : f.SizeMB.toFixed(2)} MB</td>
                <td>{formatDateTime(dateMode === 'modified' ? f.ModifiedDate : f.CreatedDate)}</td>
                <td>{f.FileCategory}</td>
                <td>{f.MigrationPriority}</td>
                <td className={spIssue ? 'sp-issue' : dcisIssue ? 'dcis-issue' : ''}>
                  {f.SharePointCompatibility}
                  {dcisIssue && <span className="dcis-tag" title={f.DCISCompatibility}> [{f.DCISCompatibility}]</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
